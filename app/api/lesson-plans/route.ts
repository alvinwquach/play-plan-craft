import { LessonPlan } from "@/app/types/lessonPlan";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { InferSelectModel } from "drizzle-orm";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { eq, inArray, and } from "drizzle-orm";

type LessonPlanDB = InferSelectModel<typeof lessonPlans>;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function GET() {
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

    const userLessonPlans = await db
      .select()
      .from(lessonPlans)
      .where(eq(lessonPlans.created_by_id, user.id));

    const lessonPlanIds = userLessonPlans.map((lp) => lp.id);
    const userSchedules = lessonPlanIds.length
      ? await db
          .select()
          .from(schedules)
          .where(
            and(
              eq(schedules.userId, user.id),
              inArray(schedules.lessonPlanId, lessonPlanIds)
            )
          )
      : [];

    const lessonPlansWithSchedules: LessonPlan[] = userLessonPlans.map(
      (lp: LessonPlanDB) => {
        const schedule = userSchedules.find((s) => s.lessonPlanId === lp.id);
        const alternateActivities: Record<string, any[]> =
          lp.alternate_activities && Array.isArray(lp.alternate_activities)
            ? lp.alternate_activities.reduce((acc, group: any) => {
                if (group.groupName && Array.isArray(group.activities)) {
                  acc[group.groupName] = group.activities;
                }
                return acc;
              }, {} as Record<string, any[]>)
            : {};

        return {
          id: lp.id.toString(),
          title: lp.title,
          gradeLevel: lp.age_group,
          subject: lp.subject,
          theme: lp.theme ?? null,
          status: lp.status,
          duration: lp.duration,
          classroomSize: lp.classroom_size,
          curriculum: lp.curriculum,
          learningIntention: lp.learning_intention ?? "",
          successCriteria: lp.success_criteria ?? [],
          activities: [],
          alternateActivities,
          supplies: lp.supplies ?? [],
          tags: lp.tags ?? [],
          developmentGoals: [],
          drdpDomains: lp.drdp_domains ?? [],
          standards: lp.standards ?? [],
          sourceMetadata: lp.source_metadata ?? [],
          citationScore: lp.citation_score,
          scheduledDate: schedule
            ? schedule.startTime.toISOString()
            : undefined,
        };
      }
    );

    return NextResponse.json({
      success: true,
      lessonPlans: lessonPlansWithSchedules,
    });
  } catch (error: unknown) {
    console.error("Error fetching lesson plans:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch lesson plans",
      },
      { status: 500 }
    );
  }
}