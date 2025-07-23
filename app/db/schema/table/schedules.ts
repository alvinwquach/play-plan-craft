import {
  pgTable,
  integer,
  timestamp,
  index,
  serial,
  uuid,
} from "drizzle-orm/pg-core";
import { lessonPlans } from "./lessonPlans";
import { users } from "./users";

// Schedule table: Represents scheduled lessons for users.
export const schedules = pgTable(
  "schedules",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to User, deletes if user is deleted
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
    date: timestamp("date").notNull(), // Required date
    startTime: timestamp("startTime").notNull(), // Required start time
    endTime: timestamp("endTime").notNull(), // Required end time
  },
  (table) => [
    // Index on userId and lessonPlanId for efficient queries
    index("schedule_idx").on(table.userId, table.lessonPlanId),
  ]
);