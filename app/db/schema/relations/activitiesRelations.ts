import { relations } from "drizzle-orm";
import { activities } from "../table/activities";
import { lessonPlans } from "../table/lessonPlans";
import { developmentGoals } from "../table/developmentGoals";
import { lessonPlansDevelopmentGoals } from "../table/lessonPlansDevelopmentGoals";

// Activity relations: Defines how activities relate to lesson plans and development goals.
export const activitiesRelations = relations(activities, ({ one, many }) => ({
  // Many-to-one: One activity belongs to one lesson plan.
  lessonPlan: one(lessonPlans, {
    fields: [activities.lessonPlanId],
    references: [lessonPlans.id],
  }),
  // Many-to-many: One activity is linked to one or more development goals via lesson plan.
  developmentGoals: many(developmentGoals, {
    fields: [lessonPlansDevelopmentGoals.developmentGoalId],
    references: [developmentGoals.id],
    where: (lessonPlansDevelopmentGoals) =>
      lessonPlansDevelopmentGoals.lessonPlanId.equals(activities.lessonPlanId),
  }),
}));
