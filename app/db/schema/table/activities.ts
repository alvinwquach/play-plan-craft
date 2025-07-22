import {
  pgTable,
  text,
  integer,
  index,
  serial,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core";
import { activityType } from "../enum/activityType";
import { lessonPlans } from "./lessonPlans";

// Activity table: Represents a single activity within a lesson plan.
export const activities = pgTable(
  "Activity",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID for the activity, serves as the unique identifier
    title: varchar("title", { length: 200 }).notNull(), // Required title, limited to 200 characters for descriptive activity titles
    description: text("description").notNull(), // Required description, uses text for potentially lengthy instructions
    activityType: activityType("activityType").notNull(), // Required activity type (e.g., "Lecture", "Discussion"), defined by the `activityType` enum
    durationMins: integer("durationMins").notNull(), // Required duration in minutes, specifying how long the activity will last
    lessonPlanId: integer("lessonPlanId") // Foreign key to the associated lesson plan
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Ensures cascading delete: when the related lesson plan is deleted, this activity will also be deleted
    source: jsonb("source").notNull().$type<Source>(), // Required field that holds JSON data for the activity's source (can store URLs, references, or other sources in structured format)
    engagementScore: integer("engagement_score").notNull(), // Required score representing the activity's engagement level (e.g., from 1 to 10)
    alignmentScore: integer("alignment_score").notNull(), // Required score representing how well the activity aligns with learning objectives (e.g., from 1 to 10)
    feasibilityScore: integer("feasibility_score").notNull(), // Required score representing how feasible the activity is to execute (e.g., from 1 to 10)
  },
  (table) => [
    // Index on lessonPlanId for efficient queries, especially when filtering activities by lesson plan
    index("activity_lesson_plan_idx").on(table.lessonPlanId),
  ]
);
