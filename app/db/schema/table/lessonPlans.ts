import {
  pgTable,
  integer,
  timestamp,
  index,
  serial,
  varchar,
} from "drizzle-orm/pg-core";
import { ageGroup } from "../enum/ageGroup";
import { lessonStatus } from "../enum/lessonStatus";
import { subject } from "../enum/subject";
import { theme } from "../enum/theme";
import { users } from "./users";

export const lessonPlans = pgTable(
  "LessonPlan",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    title: varchar("title", { length: 200 }).notNull(), // Required title, limited to 200 characters for descriptive lesson titles
    ageGroup: ageGroup("ageGroup").notNull(), // Required age group
    subject: subject("subject").notNull(), // Required subject
    theme: theme("theme"), // Optional theme, nullable
    status: lessonStatus("status").default("DRAFT").notNull(), // Status with default value
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp, defaults to current time
    createdById: integer("createdById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to User, deletes if user is deleted
  },
  (table) => [
    // Index on createdById for efficient queries
    index("lesson_plan_created_by_idx").on(table.createdById),
  ]
);
