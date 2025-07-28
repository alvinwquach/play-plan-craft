"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schedules } from "@/app/db/schema/table/schedules";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { notifications } from "@/app/db/schema/table/notifications";
import { eq, and, inArray, or, lte, gt, lt, gte, ne } from "drizzle-orm";
import { LessonPlan } from "@/app/types/lessonPlan";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

export async function rescheduleLessonPlan(
  lessonPlanId: string,
  scheduledDate: string
): Promise<{
  success: boolean;
  lessonPlan?: LessonPlan;
  error?: string;
  requestSent?: boolean;
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      return { success: false, error: "Invalid user ID format" };
    }

    const [lessonPlan] = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.id, Number(lessonPlanId)))
      .limit(1);

    if (!lessonPlan) {
      return { success: false, error: "Lesson plan not found" };
    }

    const [userData] = await db
      .select({ organizationId: users.organizationId })
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
      .select()
      .from(organizations)
      .where(eq(organizations.id, userData.organizationId))
      .limit(1);

    if (
      !organization ||
      !organization.user_id ||
      organization.user_id !== user.id
    ) {
      if (!organization?.user_id) {
        return { success: false, error: "Organization owner not found" };
      }

      const start = new Date(scheduledDate);
      await db.insert(notifications).values({
        userId: organization.user_id,
        senderId: user.id,
        type: "LESSON_RESCHEDULE_REQUEST",
        message: `User ${user.id} requested to reschedule lesson plan "${
          lessonPlan.title
        }" (ID: ${lessonPlanId}) to ${start.toLocaleString()}.`,
        organizationId: userData.organizationId,
        status: "PENDING",
      });

      return {
        success: false,
        requestSent: true,
        error:
          "Reschedule request sent to the organization owner for approval.",
      };
    }

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
          eq(schedules.lessonPlanId, Number(lessonPlanId)),
          eq(schedules.userId, user.id)
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
            and(lte(schedules.startTime, start), gt(schedules.endTime, start)),
            and(lt(schedules.startTime, end), gte(schedules.endTime, end)),
            and(gte(schedules.startTime, start), lte(schedules.endTime, end))
          ),
          existingSchedule ? ne(schedules.id, existingSchedule.id) : undefined
        )
      );

    if (timeConflicts.length > 0) {
      return {
        success: false,
        error: `Schedule conflict detected: A lesson is already scheduled between ${start.toLocaleTimeString()} and ${end.toLocaleTimeString()} on ${start.toLocaleDateString()} by another organization member.`,
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
        userId: user.id,
        lessonPlanId: Number(lessonPlanId),
        date: start,
        startTime: start,
        endTime: end,
      });
    }

    revalidatePath("/calendar", "page");

    const updatedLesson: LessonPlan = {
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
      createdByName: "",
    };

    return { success: true, lessonPlan: updatedLesson };
  } catch (error: unknown) {
    console.error("Error rescheduling lesson plan:", error);
    let errorMessage = "Failed to reschedule lesson plan";
    if (error instanceof Error) {
      errorMessage = error.message;
      const pgError = error as PostgresError;
      if (pgError.code === "ENOTFOUND") {
        errorMessage = `Database connection failed: Unable to resolve hostname`;
      } else if (pgError.code === "ETIMEDOUT") {
        errorMessage = "Database connection timed out";
      }
    }
    return { success: false, error: errorMessage };
  }
}