import { relations } from "drizzle-orm";
import { lessonPlans } from "../table/lessonPlans";
import { reminders } from "../table/reminders";
import { supplies } from "../table/supplies";
import { users } from "../table/users";

// Reminder relations: Defines how reminders relate to users, lesson plans, and supplies.
export const remindersRelations = relations(reminders, ({ one }) => ({
  // Many-to-one: One reminder belongs to one user.
  user: one(users, {
    fields: [reminders.userId],
    references: [users.id],
  }),
  // Many-to-one: One reminder can optionally link to one lesson plan.
  lessonPlan: one(lessonPlans, {
    fields: [reminders.lessonPlanId],
    references: [lessonPlans.id],
  }),
  // Many-to-one: One reminder can optionally link to one supply.
  supply: one(supplies, {
    fields: [reminders.supplyId],
    references: [supplies.id],
  }),
}));
