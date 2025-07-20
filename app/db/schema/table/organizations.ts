import { pgTable, serial, varchar } from "drizzle-orm/pg-core";

// Organization table: Represents a school or childcare center with associated users.
export const organizations = pgTable("Organization", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID
  name: varchar("name", { length: 100 }).notNull(), // Required name, limited to 100 characters for typical organization names (e.g., "Sunshine Daycare")
});
