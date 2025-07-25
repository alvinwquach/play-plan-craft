"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { notifications } from "@/app/db/schema/table/notifications";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

export async function approveLessonDeletion(
  notificationId: number,
  approve: boolean
): Promise<{
  success: boolean;
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
          "Only the organization owner can approve or deny lesson plan deletion",
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
          eq(notifications.type, "LESSON_DELETION_REQUEST"),
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
    if (!lessonPlanIdMatch) {
      return {
        success: false,
        error: "Invalid notification message format",
      };
    }
    const lessonPlanId = parseInt(lessonPlanIdMatch[1]);

    const [lessonPlan] = await db
      .select({
        id: lessonPlans.id,
        title: lessonPlans.title,
      })
      .from(lessonPlans)
      .where(eq(lessonPlans.id, lessonPlanId))
      .limit(1);

    if (!lessonPlan) {
      return { success: false, error: "Lesson plan not found" };
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
        type: "LESSON_DELETION_RESPONSE",
        message: `Your request to delete lesson plan "${
          lessonPlan.title
        }" (ID: ${lessonPlanId}) was ${
          approve ? "approved" : "rejected"
        } by the organization owner.`,
        organizationId: userData.organizationId!,
        status: "RESOLVED",
      });

      if (approve) {
        await tx
          .delete(schedules)
          .where(eq(schedules.lessonPlanId, lessonPlanId));
        await tx.delete(lessonPlans).where(eq(lessonPlans.id, lessonPlanId));
      }
    });

    revalidatePath("/calendar");
    revalidatePath("/pending-approval");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error processing lesson deletion approval:", error);
    let errorMessage = "Failed to process lesson deletion approval";
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
