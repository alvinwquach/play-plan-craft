"use server";

import { createClient } from "@/utils/supabase/server";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { eq, inArray, and } from "drizzle-orm";
import {
  LessonPlan,
  Activity,
  AlternateActivityGroup,
} from "@/app/types/lessonPlan";
import { InferSelectModel } from "drizzle-orm";

type LessonPlanDB = InferSelectModel<typeof lessonPlans>;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const db = drizzle(pool);

export async function getLessonPlans(): Promise<{
  success: boolean;
  lessonPlans?: LessonPlan[];
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

    const userLessonPlans = await db
      .select({
        id: lessonPlans.id,
        title: lessonPlans.title,
        age_group: lessonPlans.age_group,
        subject: lessonPlans.subject,
        theme: lessonPlans.theme,
        status: lessonPlans.status,
        created_at: lessonPlans.created_at,
        created_by_id: lessonPlans.created_by_id,
        curriculum: lessonPlans.curriculum,
        duration: lessonPlans.duration,
        classroom_size: lessonPlans.classroom_size,
        learning_intention: lessonPlans.learning_intention,
        success_criteria: lessonPlans.success_criteria,
        standards: lessonPlans.standards,
        drdp_domains: lessonPlans.drdp_domains,
        source_metadata: lessonPlans.source_metadata,
        citation_score: lessonPlans.citation_score,
        alternate_activities: lessonPlans.alternate_activities,
        supplies: lessonPlans.supplies,
        tags: lessonPlans.tags,
      })
      .from(lessonPlans)
      .where(eq(lessonPlans.created_by_id, user.id));

    if (!userLessonPlans.length) {
      return {
        success: true,
        lessonPlans: [],
        error: "No lesson plans found for user",
      };
    }

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

        let alternateActivities: Record<string, Activity[]> = {};
        try {
          alternateActivities =
            lp.alternate_activities &&
            typeof lp.alternate_activities === "object"
              ? (lp.alternate_activities as AlternateActivityGroup[]).reduce(
                  (acc, group) => {
                    if (group.groupName && Array.isArray(group.activities)) {
                      acc[group.groupName] = group.activities;
                    }
                    return acc;
                  },
                  {} as Record<string, Activity[]>
                )
              : {};
        } catch (e) {
          console.warn(
            `Invalid alternate_activities format for lesson plan ${lp.id}:`,
            e
          );
        }

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

    return { success: true, lessonPlans: lessonPlansWithSchedules };
  } catch (error: unknown) {
    console.error("Error fetching lesson plans:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? `${error.message} | Stack: ${error.stack}`
          : "Failed to fetch lesson plans",
    };
  } finally {
    await pool.end();
  }
}