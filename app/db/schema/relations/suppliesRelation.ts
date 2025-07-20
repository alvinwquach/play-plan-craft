import { relations } from "drizzle-orm";
import { lessonPlanSupplies } from "../table/lessonPlanSupplies";
import { reminders } from "../table/reminders";
import { supplies } from "../table/supplies";
import { userSupplies } from "../table/userSupplies";

// Supply relations: Defines how supplies relate to other entities.
export const suppliesRelations = relations(supplies, ({ many }) => ({
  // Many-to-many: One supply can be linked to many lesson plans (via LessonPlanSupply).
  lessonLinks: many(lessonPlanSupplies),
  // Many-to-many: One supply can be owned by many users (via UserSupply).
  users: many(userSupplies),
  // One-to-many: One supply can have many reminders.
  reminders: many(reminders),
}));
