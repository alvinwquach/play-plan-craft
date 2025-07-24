"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { schedules } from "@/app/db/schema/table/schedules";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { eq, and } from "drizzle-orm";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function rescheduleLessonPlan(
  lessonPlanId: string,
  scheduledDate: string
): Promise<{
  success: boolean;
  lessonPlan?: { id: string; scheduledDate: string };
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return { success: false, error: "Unauthorized" };
    }

    const parsedLessonPlanId = parseInt(lessonPlanId, 10);
    if (isNaN(parsedLessonPlanId)) {
      return { success: false, error: "Invalid lesson plan ID" };
    }

    if (!scheduledDate) {
      return { success: false, error: "Scheduled date is required" };
    }

    const lessonPlan = await db
      .select()
      .from(lessonPlans)
      .where(
        and(
          eq(lessonPlans.id, parsedLessonPlanId),
          eq(lessonPlans.created_by_id, user.id)
        )
      )
      .limit(1);

    if (!lessonPlan.length) {
      return {
        success: false,
        error: "Lesson plan not found or not authorized",
      };
    }

    const start = new Date(scheduledDate);
    if (isNaN(start.getTime())) {
      return { success: false, error: "Invalid date format" };
    }

    const duration = lessonPlan[0].duration || 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const existingSchedule = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.lessonPlanId, parsedLessonPlanId),
          eq(schedules.userId, user.id)
        )
      )
      .limit(1);

    if (existingSchedule.length) {
      await db
        .update(schedules)
        .set({
          date: start,
          startTime: start,
          endTime: end,
        })
        .where(
          and(
            eq(schedules.lessonPlanId, parsedLessonPlanId),
            eq(schedules.userId, user.id)
          )
        );
    }

    return {
      success: true,
      lessonPlan: {
        id: lessonPlanId,
        scheduledDate: start.toISOString(),
      },
    };
  } catch (error: unknown) {
    console.error("Error updating lesson plan schedule:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update lesson plan schedule",
    };
  }
}
