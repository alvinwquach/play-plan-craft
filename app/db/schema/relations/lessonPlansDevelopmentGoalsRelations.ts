import { relations } from "drizzle-orm";
import { developmentGoals } from "../table/developmentGoals";
import { lessonPlans } from "../table/lessonPlans";
import { lessonPlansDevelopmentGoals } from "../table/lessonPlansDevelopmentGoals";

// LessonPlanDevelopmentGoal relations: Defines relationships for the LessonPlanDevelopmentGoal join table.
export const lessonPlansDevelopmentGoalsRelations = relations(
  lessonPlansDevelopmentGoals,
  ({ one }) => ({
    // Many-to-one: One LessonPlanDevelopmentGoal record belongs to one LessonPlan.
    lessonPlan: one(lessonPlans, {
      fields: [lessonPlansDevelopmentGoals.lessonPlanId],
      references: [lessonPlans.id],
    }),
    // Many-to-one: One LessonPlanDevelopmentGoal record belongs to one DevelopmentGoal.
    developmentGoal: one(developmentGoals, {
      fields: [lessonPlansDevelopmentGoals.developmentGoalId],
      references: [developmentGoals.id],
    }),
  })
);
