import { relations } from "drizzle-orm";
import { organizations } from "../table/organizations";
import { users } from "../table/users";

// Organization relations: Defines how organizations relate to users.
export const organizationsRelations = relations(organizations, ({ many }) => ({
  // One-to-many: One organization can have many users.
  users: many(users),
}));
