import { pgTable, text, integer, index, serial } from "drizzle-orm/pg-core";
import { lessonPlans } from "./lessonPlans";
import { supplies } from "./supplies";

// LessonPlanSupply table: Join table for many-to-many relationship between LessonPlan and Supply.
export const lessonPlanSupplies = pgTable(
  "LessonPlanSupply",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    lessonPlanId: integer("lessonPlanId")
      .notNull()
      .references(() => lessonPlans.id, { onDelete: "cascade" }), // Foreign key to LessonPlan, deletes if lesson plan is deleted
    supplyId: integer("supplyId")
      .notNull()
      .references(() => supplies.id, { onDelete: "cascade" }), // Foreign key to Supply, deletes if supply is deleted
    quantity: integer("quantity").notNull(), // Required quantity
    note: text("note"), // Optional note, uses text for potentially lengthy comments
  },
  (table) => [
    // Index on lessonPlanId and supplyId for efficient queries
    index("lesson_plan_supply_idx").on(table.lessonPlanId, table.supplyId),
  ]
);
