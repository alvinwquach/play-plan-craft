import { NextResponse } from "next/server";
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

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await context.params;
    const lessonPlanId = parseInt(id, 10);
    if (isNaN(lessonPlanId)) {
      return NextResponse.json(
        { success: false, error: "Invalid lesson plan ID" },
        { status: 400 }
      );
    }

    const { scheduledDate } = await request.json();
    if (!scheduledDate) {
      return NextResponse.json(
        { success: false, error: "Scheduled date is required" },
        { status: 400 }
      );
    }

    const lessonPlan = await db
      .select()
      .from(lessonPlans)
      .where(
        and(
          eq(lessonPlans.id, lessonPlanId),
          eq(lessonPlans.created_by_id, user.id)
        )
      )
      .limit(1);

    if (!lessonPlan.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Lesson plan not found or not authorized",
        },
        { status: 404 }
      );
    }

    const start = new Date(scheduledDate);
    if (isNaN(start.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    const duration = lessonPlan[0].duration || 60;
    const end = new Date(start.getTime() + duration * 60 * 1000);

    const existingSchedule = await db
      .select()
      .from(schedules)
      .where(
        and(
          eq(schedules.lessonPlanId, lessonPlanId),
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
            eq(schedules.lessonPlanId, lessonPlanId),
            eq(schedules.userId, user.id)
          )
        );
    }
    return NextResponse.json({
      success: true,
      lessonPlan: {
        id: lessonPlanId.toString(),
        scheduledDate: start.toISOString(),
      },
    });
  } catch (error: unknown) {
    console.error("Error updating lesson plan schedule:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to update lesson plan schedule",
      },
      { status: 500 }
    );
  }
}
