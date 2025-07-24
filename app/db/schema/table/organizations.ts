import { pgTable, serial, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./users";

// Organization table: Represents a school or childcare center with associated users.
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID
  name: varchar("name", { length: 100 }).notNull(), // Required name, limited to 100 characters for typical organization names (e.g., "Sunshine Daycare")
  user_id: uuid("user_id").references(() => users.id), // Foreign key to User, deletes if user is deleted
});
