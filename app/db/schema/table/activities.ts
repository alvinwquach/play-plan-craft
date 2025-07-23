import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  index,
  jsonb,
} from "drizzle-orm/pg-core";
import { activityType } from "../enum/activityType";
import { lessonPlans } from "./lessonPlans";
import { Source } from "@/app/types/lessonPlan";

// Activity table: Represents a single activity within a lesson plan.
export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    title: varchar("title", { length: 255 }).notNull(), // Required title, max 255 characters
    description: text("description").notNull(), // Required description
    activity_type: activityType("activity_type").notNull(), // Required activity type from enum
    duration_mins: integer("duration_mins").notNull(), // Required duration in minutes
    lesson_plan_id: integer("lesson_plan_id")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to lesson plan
    source: jsonb("source").notNull().$type<Source>(), // Required JSONB field for activity source
    engagement_score: integer("engagement_score").notNull(), // Required engagement score
    alignment_score: integer("alignment_score").notNull(), // Required alignment score
    feasibility_score: integer("feasibility_score").notNull(), // Required feasibility score
  },
  (table) => ({
    lesson_plan_idx: index("activity_lesson_plan_idx").on(table.lesson_plan_id),
  })
);