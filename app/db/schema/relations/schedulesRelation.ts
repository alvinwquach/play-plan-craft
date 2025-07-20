import { relations } from "drizzle-orm";
import { lessonPlans } from "../table/lessonPlans";
import { schedules } from "../table/schedules";
import { users } from "../table/users";

// Schedule relations: Defines how schedules relate to users and lesson plans.
export const schedulesRelations = relations(schedules, ({ one }) => ({
  // Many-to-one: One schedule belongs to one user.
  user: one(users, {
    fields: [schedules.userId],
    references: [users.id],
  }),
  // Many-to-one: One schedule belongs to one lesson plan.
  lessonPlan: one(lessonPlans, {
    fields: [schedules.lessonPlanId],
    references: [lessonPlans.id],
  }),
}));
