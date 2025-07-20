import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  serial,
} from "drizzle-orm/pg-core";
import { lessonPlans } from "./lessonPlans";
import { users } from "./users";

// LessonNote table: Represents post-lesson reflections or notes by educators.
export const lessonNotes = pgTable(
  "LessonNote",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to User, deletes if user is deleted
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
    note: text("note").notNull(), // Required note, uses text for potentially lengthy reflections
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp, defaults to current time
  },
  (table) => [
    // Index on userId and lessonPlanId for efficient queries
    index("lesson_note_idx").on(table.userId, table.lessonPlanId),
  ]
);
