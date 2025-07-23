import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";
import { ageGroup } from "../enum/ageGroup";

// DevelopmentGoal table: Represents developmental milestones or goals aligned with lessons.
export const developmentGoals = pgTable("development_goals", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID
  name: varchar("name", { length: 100 }).notNull(), // Required name, limited to 100 characters for concise goal names
  description: text("description").notNull(), // Required description, uses text for potentially lengthy details
  ageGroup: ageGroup("ageGroup").notNull(), // Required age group
});
