import { NextResponse } from "next/server";
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

export async function DELETE(context: { params: Promise<{ id: string }> }) {
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

    return NextResponse.json({
      success: true,
      message: "Lesson plan deleted successfully",
    });
  } catch (error: unknown) {
    console.error("Error deleting lesson plan:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete lesson plan",
      },
      { status: 500 }
    );
  }
}