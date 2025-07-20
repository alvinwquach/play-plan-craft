import { pgTable, timestamp, serial, varchar } from "drizzle-orm/pg-core";
import { supplyStatus } from "../enum/supplyStatus";

// Supply table: Represents reusable materials or items used in lessons.
export const supplies = pgTable("Supply", {
  id: serial("id").primaryKey(), // Auto-incrementing integer ID
  name: varchar("name", { length: 100 }).notNull(), // Required name, limited to 100 characters for typical supply names (e.g., "Crayons")
  unit: varchar("unit", { length: 50 }).notNull(), // Required unit (e.g., "box", "piece"), limited to 50 characters for short units
  status: supplyStatus("status").default("AVAILABLE").notNull(), // Supply status with default value
  createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp, defaults to current time
});
