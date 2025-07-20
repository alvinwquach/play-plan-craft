import {
  pgTable,
  text,
  integer,
  index,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { activityType } from "../enum/activityType";
import { lessonPlans } from "./lessonPlans";

// Activity table: Represents a single activity within a lesson plan.
export const activities = pgTable(
  "Activity",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    title: varchar("title", { length: 200 }).notNull(), // Required title, limited to 200 characters for descriptive activity titles
    description: text("description").notNull(), // Required description, uses text for potentially lengthy instructions
    activityType: activityType("activityType").notNull(), // Required activity type
    durationMins: integer("durationMins").notNull(), // Required duration in minutes
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
  },
  (table) => [
    // Index on lessonPlanId for efficient queries
    index("activity_lesson_plan_idx").on(table.lessonPlanId),
  ]
);
