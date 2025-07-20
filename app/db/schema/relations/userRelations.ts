import { relations } from "drizzle-orm";
import { lessonNotes } from "../table/lessonNotes";
import { lessonPlans } from "../table/lessonPlans";
import { organizations } from "../table/organizations";
import { reminders } from "../table/reminders";
import { schedules } from "../table/schedules";
import { users } from "../table/users";
import { userSupplies } from "../table/userSupplies";

// User relations: Defines how users relate to other entities.
export const usersRelations = relations(users, ({ one, many }) => ({
  // Many-to-one: One user belongs to one organization (optional).
  organization: one(organizations, {
    fields: [users.organizationId],
    references: [organizations.id],
  }),
  // One-to-many: One user can create many lesson plans.
  lessonPlans: many(lessonPlans),
  // One-to-many: One user can have many schedules.
  schedules: many(schedules),
  // One-to-many: One user can own many supplies (via UserSupply).
  suppliesOwned: many(userSupplies),
  // One-to-many: One user can create many reminders.
  reminders: many(reminders),
  // One-to-many: One user can author many lesson notes.
  lessonNotes: many(lessonNotes),
}));
