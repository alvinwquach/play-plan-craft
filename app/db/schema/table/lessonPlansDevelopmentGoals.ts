import { pgTable, integer, index, primaryKey } from "drizzle-orm/pg-core";
import { developmentGoals } from "./developmentGoals";
import { lessonPlans } from "./lessonPlans";

// LessonPlanDevelopmentGoal table: Join table for many-to-many relationship between LessonPlan and DevelopmentGoal.
export const lessonPlansDevelopmentGoals = pgTable(
  "LessonPlanDevelopmentGoal",
  {
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
    developmentGoalId: integer("developmentGoalId")
      .notNull()
      .references(() => developmentGoals.id, { onDelete: "cascade" }), // Foreign key to DevelopmentGoal, deletes if goal is deleted
  },
  (table) => [
    // Composite primary key for the join table
    primaryKey({ columns: [table.lessonPlanId, table.developmentGoalId] }),
    // Index for efficient queries
    index("lesson_plan_development_goal_idx").on(
      table.lessonPlanId,
      table.developmentGoalId
    ),
  ]
);
