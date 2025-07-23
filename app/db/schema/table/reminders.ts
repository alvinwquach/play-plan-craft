import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  index,
  serial,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { lessonPlans } from "./lessonPlans";
import { supplies } from "./supplies";
import { users } from "./users";

// Reminder table: Represents user-created task reminders with optional context.
export const reminders = pgTable(
  "reminders",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to User, deletes if user is deleted
    title: varchar("title", { length: 200 }).notNull(), // Required title, limited to 200 characters for concise reminder titles
    description: text("description"), // Optional description, uses text for potentially lengthy details
    dueDate: timestamp("dueDate").notNull(), // Required due date
    completed: boolean("completed").default(false).notNull(), // Completion status with default value
    lessonPlanId: integer("lessonPlanId").references(() => lessonPlans.id, {
      onDelete: "set null",
    }), // Optional foreign key to LessonPlan, sets to null if lesson plan is deleted
    supplyId: integer("supplyId").references(() => supplies.id, {
      onDelete: "set null",
    }), // Optional foreign key to Supply, sets to null if supply is deleted
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp, defaults to current time
  },
  (table) => [
    // Index on userId for efficient queries
    index("reminder_idx").on(table.userId),
  ]
);