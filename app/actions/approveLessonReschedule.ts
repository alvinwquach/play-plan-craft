"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { notifications } from "@/app/db/schema/table/notifications";
import { eq, and, inArray, or, lte, gt, lt, gte, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { LessonPlan } from "@/app/types/lessonPlan";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

export async function approveLessonReschedule(
  notificationId: number,
  approve: boolean
): Promise<{
  success: boolean;
  lessonPlan?: LessonPlan;
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized: No user found" };
    }

    const [userData] = await db
      .select({
        organizationId: users.organizationId,
        role: users.role,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData || !userData.organizationId) {
      return {
        success: false,
        error: "User is not associated with an organization",
      };
    }

    const [organization] = await db
      .select({
        id: organizations.id,
        user_id: organizations.user_id,
      })
      .from(organizations)
      .where(eq(organizations.id, userData.organizationId))
      .limit(1);

    if (!organization || organization.user_id !== user.id) {
      return {
        success: false,
        error:
          "Only the organization owner can approve or deny lesson plan rescheduling",
      };
    }

    const [notification] = await db
      .select({
        message: notifications.message,
        senderId: notifications.senderId,
        status: notifications.status,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.id, notificationId),
          eq(notifications.type, "LESSON_RESCHEDULE_REQUEST"),
          eq(notifications.status, "PENDING")
        )
      )
      .limit(1);

    if (!notification) {
      return {
        success: false,
        error: "Notification not found or already processed",
      };
    }

    const lessonPlanIdMatch = notification.message.match(/ID: (\d+)/);
    const scheduledDateMatch = notification.message.match(/to (.+?)\./);
    if (!lessonPlanIdMatch || !scheduledDateMatch) {
      return {
        success: false,
        error: "Invalid notification message format",
      };
    }
    const lessonPlanId = parseInt(lessonPlanIdMatch[1]);
    const scheduledDate = scheduledDateMatch[1];

    const [lessonPlan] = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.id, lessonPlanId))
      .limit(1);

    if (!lessonPlan) {
      return { success: false, error: "Lesson plan not found" };
    }

    const [createdByUser] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        image: users.image,
        organizationId: users.organizationId,
        pendingApproval: users.pendingApproval,
      })
      .from(users)
      .where(eq(users.id, lessonPlan.created_by_id))
      .limit(1);

    if (!createdByUser) {
      return {
        success: false,
        error: "Creator of the lesson plan not found",
      };
    }

    let updatedLesson: LessonPlan | undefined;

    if (approve) {
      const organizationUsers = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.organizationId, userData.organizationId));

      const organizationUserIds = organizationUsers.map((u) => u.id);

      const start = new Date(scheduledDate);
      const end = new Date(start.getTime() + lessonPlan.duration * 60 * 1000);

      const [existingSchedule] = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.lessonPlanId, lessonPlanId),
            eq(schedules.userId, notification.senderId)
          )
        )
        .limit(1);

      const timeConflicts = await db
        .select()
        .from(schedules)
        .where(
          and(
            inArray(schedules.userId, organizationUserIds),
            or(
              and(
                lte(schedules.startTime, start),
                gt(schedules.endTime, start)
              ),
              and(lt(schedules.startTime, end), gte(schedules.endTime, end)),
              and(gte(schedules.startTime, start), lte(schedules.endTime, end))
            ),
            existingSchedule ? ne(schedules.id, existingSchedule.id) : undefined
          )
        );

      if (timeConflicts.length > 0) {
        await db
          .update(notifications)
          .set({
            status: "REJECTED",
          })
          .where(eq(notifications.id, notificationId));

        await db.insert(notifications).values({
          userId: notification.senderId,
          senderId: user.id,
          type: "LESSON_RESCHEDULE_RESPONSE",
          message: `Your request to reschedule lesson plan "${
            lessonPlan.title
          }" (ID: ${lessonPlanId}) to ${start.toLocaleString()} was rejected due to a scheduling conflict.`,
          organizationId: userData.organizationId!,
          status: "RESOLVED",
        });

        return {
          success: false,
          error: "Schedule conflict detected; request rejected.",
        };
      }

      if (existingSchedule) {
        await db
          .update(schedules)
          .set({
            date: start,
            startTime: start,
            endTime: end,
          })
          .where(eq(schedules.id, existingSchedule.id));
      } else {
        await db.insert(schedules).values({
          userId: notification.senderId,
          lessonPlanId: lessonPlanId,
          date: start,
          startTime: start,
          endTime: end,
        });
      }

      updatedLesson = {
        id: lessonPlan.id.toString(),
        title: lessonPlan.title,
        gradeLevel: lessonPlan.age_group,
        subject: lessonPlan.subject,
        theme: lessonPlan.theme ?? null,
        status: lessonPlan.status,
        duration: lessonPlan.duration,
        classroomSize: lessonPlan.classroom_size,
        curriculum: lessonPlan.curriculum,
        learningIntention: lessonPlan.learning_intention ?? "",
        successCriteria: lessonPlan.success_criteria ?? [],
        activities: [], 
        alternateActivities: lessonPlan.alternate_activities ?? [],
        supplies: lessonPlan.supplies ?? [],
        tags: lessonPlan.tags ?? [],
        developmentGoals: [],
        drdpDomains: lessonPlan.drdp_domains ?? [],
        standards: lessonPlan.standards ?? [],
        sourceMetadata: lessonPlan.source_metadata ?? [],
        citationScore: lessonPlan.citation_score,
        scheduledDate: start.toISOString(),
        created_by_id: lessonPlan.created_by_id,
        createdAt: lessonPlan.created_at,
        createdByName: createdByUser.name ?? "Unknown",
      };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(notifications)
        .set({
          status: approve ? "APPROVED" : "REJECTED",
        })
        .where(eq(notifications.id, notificationId));

      await tx.insert(notifications).values({
        userId: notification.senderId,
        senderId: user.id,
        type: "LESSON_RESCHEDULE_RESPONSE",
        message: `Your request to reschedule lesson plan "${
          lessonPlan.title
        }" (ID: ${lessonPlanId}) to ${new Date(
          scheduledDate
        ).toLocaleString()} was ${
          approve ? "approved" : "rejected"
        } by the organization owner.`,
        organizationId: userData.organizationId!,
        status: "RESOLVED",
      });
    });

    revalidatePath("/calendar");
    revalidatePath("/pending-approval");

    return approve
      ? { success: true, lessonPlan: updatedLesson! }
      : { success: true };
  } catch (error: unknown) {
    console.error("Error processing lesson reschedule approval:", error);
    let errorMessage = "Failed to process lesson reschedule approval";
    if (error instanceof Error) {
      errorMessage = error.message;
      const pgError = error as PostgresError;
      if (pgError.code === "ENOTFOUND") {
        errorMessage = `Database connection failed: Unable to resolve hostname`;
      } else if (pgError.code === "ETIMEDOUT") {
        errorMessage = `Database connection timed out`;
      }
    }
    return { success: false, error: errorMessage };
  }
}