import { pgTable, text, serial, varchar } from "drizzle-orm/pg-core";

// Tag table: Represents tags for smart tagging and filtering of lesson plans.
export const tags = pgTable("Tag", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID
  name: varchar("name", { length: 50 }).unique().notNull(), // Unique name, limited to 50 characters for short, keyword-like tags
  description: text("description"), // Optional description, uses text for potentially lengthy explanations
});
