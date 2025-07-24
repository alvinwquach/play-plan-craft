"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { eq, and } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function deleteLessonPlan(lessonPlanId: number) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    if (isNaN(lessonPlanId)) {
      return { success: false, error: "Invalid lesson plan ID" };
    }

    const existing = await db
      .select()
      .from(lessonPlans)
      .where(
        and(
          eq(lessonPlans.id, lessonPlanId),
          eq(lessonPlans.created_by_id, user.id)
        )
      )
      .limit(1);

    if (!existing.length) {
      return {
        success: false,
        error: "Lesson plan not found or not authorized",
      };
    }

    await db
      .delete(schedules)
      .where(
        and(
          eq(schedules.lessonPlanId, lessonPlanId),
          eq(schedules.userId, user.id)
        )
      );

    await db
      .delete(lessonPlans)
      .where(
        and(
          eq(lessonPlans.id, lessonPlanId),
          eq(lessonPlans.created_by_id, user.id)
        )
      );

    return { success: true };
  } catch (error: unknown) {
    console.error("Error deleting lesson plan:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete lesson plan",
    };
  }
}
