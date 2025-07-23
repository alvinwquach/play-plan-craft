import { pgTable, integer, index, serial } from "drizzle-orm/pg-core";
import { lessonPlans } from "./lessonPlans";
import { tags } from "./tags";

// LessonPlanTag table: Join table for many-to-many relationship between LessonPlan and Tag.
export const lessonPlanTags = pgTable(
  "lesson_plan_tags",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
    tagId: integer("tagId")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }), // Foreign key to Tag, deletes if tag is deleted
  },
  (table) => [
    // Index on lessonPlanId and tagId for efficient queries
    index("lesson_plan_tag_idx").on(table.lessonPlanId, table.tagId),
  ]
);