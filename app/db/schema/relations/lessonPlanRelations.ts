import { relations } from "drizzle-orm";
import { activities } from "../table/activities";
import { lessonNotes } from "../table/lessonNotes";
import { lessonPlans } from "../table/lessonPlans";
import { lessonPlansDevelopmentGoals } from "../table/lessonPlansDevelopmentGoals";
import { lessonPlanSupplies } from "../table/lessonPlanSupplies";
import { lessonPlanTags } from "../table/lessonPlanTags";
import { reminders } from "../table/reminders";
import { schedules } from "../table/schedules";
import { users } from "../table/users";

// LessonPlan relations: Defines how lesson plans relate to other entities.
export const lessonPlansRelations = relations(lessonPlans, ({ one, many }) => ({
  // Many-to-one: One lesson plan is created by one user.
  createdBy: one(users, {
    fields: [lessonPlans.createdById],
    references: [users.id],
  }),
  // One-to-many: One lesson plan contains many activities.
  activities: many(activities),
  // Many-to-many: One lesson plan can use many supplies (via LessonPlanSupply).
  supplies: many(lessonPlanSupplies),
  // One-to-many: One lesson plan can have many schedules.
  schedules: many(schedules),
  // Many-to-many: One lesson plan can have many tags (via LessonPlanTag).
  tags: many(lessonPlanTags),
  // Many-to-many: One lesson plan can target many developmental goals (via LessonPlanDevelopmentGoal).
  developmentGoals: many(lessonPlansDevelopmentGoals),
  // One-to-many: One lesson plan can have many lesson notes.
  lessonNotes: many(lessonNotes),
  // One-to-many: One lesson plan can have many reminders.
  reminders: many(reminders),
}));
