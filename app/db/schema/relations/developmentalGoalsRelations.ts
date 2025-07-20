import { relations } from "drizzle-orm";
import { developmentGoals } from "../table/developmentGoals";
import { lessonPlansDevelopmentGoals } from "../table/lessonPlansDevelopmentGoals";

// DevelopmentGoal relations: Defines how developmental goals relate to lesson plans.
export const developmentGoalsRelations = relations(
  developmentGoals,
  ({ many }) => ({
    // Many-to-many: One developmental goal can be targeted by many lesson plans (via LessonPlanDevelopmentGoal).
    lessonPlans: many(lessonPlansDevelopmentGoals),
  })
);
