import { relations } from "drizzle-orm";
import { lessonNotes } from "../table/lessonNotes";
import { lessonPlans } from "../table/lessonPlans";
import { users } from "../table/users";

// LessonNote relations: Defines how lesson notes relate to users and lesson plans.
export const lessonNotesRelations = relations(lessonNotes, ({ one }) => ({
  // Many-to-one: One lesson note belongs to one user.
  user: one(users, {
    fields: [lessonNotes.userId],
    references: [users.id],
  }),
  // Many-to-one: One lesson note belongs to one lesson plan.
  lessonPlan: one(lessonPlans, {
    fields: [lessonNotes.lessonPlanId],
    references: [lessonPlans.id],
  }),
}));
