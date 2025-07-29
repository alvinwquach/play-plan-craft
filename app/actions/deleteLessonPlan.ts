"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { notifications } from "@/app/db/schema/table/notifications";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

export async function deleteLessonPlan(lessonPlanId: number): Promise<{
  success: boolean;
  error?: { message: string; code: string };
  requestSent?: boolean;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return {
        success: false,
        error: { message: "Unauthorized: No user found", code: "401" },
      };
    }

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      return {
        success: false,
        error: { message: "Invalid user ID format", code: "400" },
      };
    }

    const [userData] = await db
      .select({
        organizationId: users.organizationId,
        role: users.role,
        name: users.name,
      })
      .from(users)
      .where(eq(users.id, user.id))
      .limit(1);

    if (!userData || !userData.organizationId) {
      return {
        success: false,
        error: {
          message: "User is not associated with an organization",
          code: "403",
        },
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

    if (!organization) {
      return {
        success: false,
        error: { message: "Organization not found", code: "403" },
      };
    }

    if (!organization.user_id) {
      return {
        success: false,
        error: { message: "Organization has no owner", code: "400" },
      };
    }

    const [lessonPlan] = await db
      .select({
        id: lessonPlans.id,
        title: lessonPlans.title,
        created_by_id: lessonPlans.created_by_id,
      })
      .from(lessonPlans)
      .where(eq(lessonPlans.id, lessonPlanId))
      .limit(1);

    if (!lessonPlan) {
      return {
        success: false,
        error: { message: "Lesson plan not found", code: "404" },
      };
    }

    const isOrganizationOwner = organization.user_id === user.id;

    if (!isOrganizationOwner) {
      if (userData.role !== "EDUCATOR" && userData.role !== "ADMIN") {
        return {
          success: false,
          error: {
            message: "Only educators or admins can request deletion",
            code: "403",
          },
        };
      }

      const [ownerData] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, organization.user_id))
        .limit(1);

      if (!ownerData) {
        return {
          success: false,
          error: { message: "Organization owner not found", code: "404" },
        };
      }

      await db.insert(notifications).values({
        userId: ownerData.id,
        senderId: user.id,
        type: "LESSON_DELETION_REQUEST",
        message: `${
          userData.name || "User"
        } has requested to delete the lesson plan: "${lessonPlan.title}" (ID: ${
          lessonPlan.id
        })`,
        organizationId: userData.organizationId,
        status: "PENDING",
        createdAt: new Date(),
      });

      revalidatePath("/notifications");
      return { success: true, requestSent: true };
    }

    await db.delete(schedules).where(eq(schedules.lessonPlanId, lessonPlanId));
    await db.delete(lessonPlans).where(eq(lessonPlans.id, lessonPlanId));

    revalidatePath("/calendar", "page");
    return { success: true, requestSent: false };
  } catch (error: unknown) {
    console.error("Error deleting lesson plan:", error);
    let errorMessage = "Failed to delete lesson plan";
    let errorCode = "500";
    if (error instanceof Error) {
      errorMessage = error.message;
      const pgError = error as PostgresError;
      if (pgError.code === "ENOTFOUND") {
        errorMessage = "Database connection failed: Unable to resolve hostname";
        errorCode = "503";
      } else if (pgError.code === "ETIMEDOUT") {
        errorMessage = "Database connection timed out";
        errorCode = "503";
      }
    }
    return {
      success: false,
      error: { message: errorMessage, code: errorCode },
    };
  }
}