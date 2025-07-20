import { pgEnum } from "drizzle-orm/pg-core";

// UserRole enum: Defines permission/access levels for users.
export const userRoleEnum = pgEnum("UserRole", [
  "EDUCATOR", // Default role for educators
  "ADMIN", // Application administrators
  "ASSISTANT", // Assistants with limited rights
]);
