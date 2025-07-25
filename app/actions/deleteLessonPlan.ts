"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { eq, and } from "drizzle-orm";
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

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(user.id)) {
      return { success: false, error: "Invalid user ID format" };
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
      .select()
      .from(organizations)
      .where(
        and(
          eq(organizations.id, userData.organizationId),
          eq(organizations.user_id, user.id)
        )
      )
      .limit(1);

    if (!organization) {
      return {
        success: false,
        error: "Only the organization owner can delete lesson plans",
      };
    }

    const [lessonPlan] = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.id, lessonPlanId))
      .limit(1);

    if (!lessonPlan) {
      return { success: false, error: "Lesson plan not found" };
    }

    if (lessonPlan.created_by_id !== user.id) {
      return {
        success: false,
        error: "Only the creator of the lesson plan can delete it",
      };
    }

    await db.delete(schedules).where(eq(schedules.lessonPlanId, lessonPlanId));
    await db.delete(lessonPlans).where(eq(lessonPlans.id, lessonPlanId));

    revalidatePath("/calendar", "page");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting lesson plan:", error);
    let errorMessage = "Failed to delete lesson plan";
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