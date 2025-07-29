"use server";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq, and, inArray } from "drizzle-orm";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { users } from "@/app/db/schema/table/users";
import { organizations } from "@/app/db/schema/table/organizations";
import { LessonPlan, AlternateActivityGroup } from "@/app/types/lessonPlan";
import { createClient } from "@/utils/supabase/server";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

interface PostgresError extends Error {
  code?: string;
}

export async function getLessonPlans(): Promise<{
  success: boolean;
  lessonPlans?: LessonPlan[];
  userRole?: "EDUCATOR" | "ASSISTANT" | null;
  isOrganizationOwner?: boolean;
  error?: string;
}> {
  try {
    await pool.connect().then((client) => client.release());

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

    if (!userData?.organizationId) {
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

    const organizationUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.organizationId, userData.organizationId));

    const organizationUserIds = organizationUsers.map((u) => u.id);

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
        createdByName: users.name,
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
      .leftJoin(users, eq(lessonPlans.created_by_id, users.id))
      .where(inArray(lessonPlans.created_by_id, organizationUserIds));

    if (!userLessonPlans.length) {
      return {
        success: true,
        lessonPlans: [],
        userRole:
          userData.role === "EDUCATOR" || userData.role === "ASSISTANT"
            ? userData.role
            : null,
        isOrganizationOwner: !!organization,
        error: "No lesson plans found for organization",
      };
    }

    const lessonPlanIds = userLessonPlans.map((lp) => lp.id);
    const userSchedules = lessonPlanIds.length
      ? await db
          .select()
          .from(schedules)
          .where(
            and(
              inArray(schedules.userId, organizationUserIds),
              inArray(schedules.lessonPlanId, lessonPlanIds)
            )
          )
      : [];

    const lessonPlansWithSchedules: LessonPlan[] = userLessonPlans.map(
      (lp): LessonPlan => {
        const schedule = userSchedules.find((s) => s.lessonPlanId === lp.id);

        let alternateActivities: AlternateActivityGroup[] = [];

        if (lp.alternate_activities && Array.isArray(lp.alternate_activities)) {
          alternateActivities = lp.alternate_activities.map((group) => ({
            activityType: group.activityType,
            activities: (group.activities || []).filter(
              (a) => a && typeof a.id === "string" && a.id !== ""
            ),
          }));
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
          created_by_id: lp.created_by_id,
          createdByName: lp.createdByName ?? "",
          createdAt: lp.created_at,
        };
      }
    );

    return {
      success: true,
      lessonPlans: lessonPlansWithSchedules,
      userRole:
        userData.role === "EDUCATOR" || userData.role === "ASSISTANT"
          ? userData.role
          : null,
      isOrganizationOwner: !!organization,
    };
  } catch (error: unknown) {
    console.error("Error fetching lesson plans:", error);
    let errorMessage = "Failed to fetch lesson plans";
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