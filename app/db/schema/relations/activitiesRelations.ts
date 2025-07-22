import { relations } from "drizzle-orm";
import { activities } from "../table/activities";
import { lessonPlans } from "../table/lessonPlans";

// Activity relations: Defines how activities relate to lesson plans.
export const activitiesRelations = relations(activities, ({ one }) => ({
  // Many-to-one: One activity belongs to one lesson plan.
  lessonPlan: one(lessonPlans, {
    fields: [activities.lessonPlanId],
    references: [lessonPlans.id],
  }),
}));