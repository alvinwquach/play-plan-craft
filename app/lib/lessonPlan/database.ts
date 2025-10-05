import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { lessonPlans } from "@/app/db/schema/table/lessonPlans";
import { schedules } from "@/app/db/schema/table/schedules";
import { activities } from "@/app/db/schema/table/activities";
import { users } from "@/app/db/schema/table/users";
import {
  InferSelectModel,
  InferInsertModel,
  eq,
  and,
  or,
  lt,
  lte,
  gt,
  gte,
  inArray,
  desc,
  sql,
} from "drizzle-orm";
import { LessonPlan } from "@/app/types/lessonPlan";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
export const db = drizzle(pool);

export type LessonPlanDB = InferSelectModel<typeof lessonPlans>;
export type LessonPlanInsert = InferInsertModel<typeof lessonPlans>;

export async function findSimilarLessons(
  embedding: number[],
  gradeLevel: string,
  subject: string,
  userId: string,
  threshold: number = 0.7,
  limit: number = 5
) {
  try {
    const embeddingStr = `[${embedding.join(",")}]`;
    const similarLessons = await db.execute(
      sql`
      SELECT
        lp.id,
        lp.title,
        lp.created_at,
        lp.learning_intention,
        lp.success_criteria,
        1 - (lp.embedding <=> ${embeddingStr}::vector) as similarity
      FROM lesson_plans lp
      WHERE lp.age_group = ${gradeLevel}
        AND lp.subject = ${subject}
        AND lp.created_by_id = ${userId}
        AND lp.embedding IS NOT NULL
        AND 1 - (lp.embedding <=> ${embeddingStr}::vector) > ${threshold}
      ORDER BY lp.embedding <=> ${embeddingStr}::vector
      LIMIT ${limit}
      `
    );

    return similarLessons.rows.map((row: any) => ({
      id: row.id,
      title: row.title,
      created_at: row.created_at,
      learning_intention: row.learning_intention,
      success_criteria: row.success_criteria,
      similarity: parseFloat(row.similarity),
      activities: [],
    }));
  } catch (error) {
    console.error("Error finding similar lessons:", error);
    return [];
  }
}

export async function getRecentLessons(
  gradeLevel: string,
  subject: string,
  userId: string,
  limit: number = 5
) {
  const recentLessons = await db
    .select({
      id: lessonPlans.id,
      title: lessonPlans.title,
      created_at: lessonPlans.created_at,
      learning_intention: lessonPlans.learning_intention,
      success_criteria: lessonPlans.success_criteria,
      activityTitle: activities.title,
      activityType: activities.activity_type,
    })
    .from(lessonPlans)
    .leftJoin(activities, eq(activities.lesson_plan_id, lessonPlans.id))
    .where(
      and(
        eq(lessonPlans.age_group, gradeLevel as any),
        eq(lessonPlans.subject, subject as any),
        eq(lessonPlans.created_by_id, userId)
      )
    )
    .orderBy(desc(lessonPlans.created_at))
    .limit(limit);

  const lessonsMap = new Map();
  recentLessons.forEach((row) => {
    if (!lessonsMap.has(row.id)) {
      lessonsMap.set(row.id, {
        id: row.id,
        title: row.title,
        created_at: row.created_at,
        learning_intention: row.learning_intention,
        success_criteria: row.success_criteria,
        activities: [],
      });
    }
    if (row.activityTitle) {
      lessonsMap.get(row.id).activities.push({
        title: row.activityTitle,
        type: row.activityType,
      });
    }
  });

  return Array.from(lessonsMap.values());
}

export async function insertLessonPlan(
  lessonPlan: LessonPlan,
  embedding: number[],
  normalizedTheme: string | null
): Promise<LessonPlanDB> {
  const newLessonPlans = await db
    .insert(lessonPlans)
    .values([
      {
        title: lessonPlan.title,
        age_group: lessonPlan.gradeLevel,
        subject: lessonPlan.subject,
        theme: normalizedTheme,
        embedding: embedding as any,
        created_at: new Date(),
        createdAt: lessonPlan?.createdAt?.toISOString(),
        created_by_id: lessonPlan.created_by_id,
        curriculum: lessonPlan.curriculum,
        duration: lessonPlan.duration,
        classroom_size: lessonPlan.classroomSize,
        learning_intention: lessonPlan.learningIntention,
        success_criteria: lessonPlan.successCriteria,
        standards: lessonPlan.standards,
        drdp_domains: lessonPlan.drdpDomains,
        source_metadata: lessonPlan.sourceMetadata,
        citation_score: lessonPlan.citationScore,
        alternate_activities: lessonPlan.alternateActivities,
        supplies: lessonPlan.supplies,
        tags: lessonPlan.tags,
      } as LessonPlanInsert,
    ])
    .returning();

  if (!newLessonPlans.length) {
    throw new Error("Failed to insert lesson plan into database");
  }

  return newLessonPlans[0];
}

export async function createSchedule(
  scheduledDate: string,
  lessonPlanId: number,
  duration: number,
  userId: string
): Promise<void> {
  const start = new Date(scheduledDate);
  const end = new Date(start.getTime() + duration * 60 * 1000);

  console.log("Parsed start date:", start);
  console.log("Parsed end date:", end);
  console.log("Duration:", duration, "minutes");

  const [userData] = await db
    .select({ organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!userData || !userData.organizationId) {
    throw new Error("User is not associated with an organization");
  }

  const organizationUsers = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.organizationId, userData.organizationId));

  const organizationUserIds = organizationUsers.map((u) => u.id);

  const conflictingSchedules = await db
    .select()
    .from(schedules)
    .where(
      and(
        inArray(schedules.userId, organizationUserIds),
        or(
          eq(schedules.date, start),
          and(lte(schedules.startTime, start), gt(schedules.endTime, start)),
          and(lt(schedules.startTime, end), gte(schedules.endTime, end)),
          and(gte(schedules.startTime, start), lte(schedules.endTime, end))
        )
      )
    );

  if (conflictingSchedules.length > 0) {
    throw new Error(
      `Schedule conflict detected: A lesson is already scheduled between ${start.toLocaleTimeString()} and ${end.toLocaleTimeString()} on ${start.toLocaleDateString()} by another organization member.`
    );
  }

  await db.insert(schedules).values({
    userId: userId,
    lessonPlanId: lessonPlanId,
    date: start,
    startTime: start,
    endTime: end,
  });

  console.log("Schedule created successfully");
}
