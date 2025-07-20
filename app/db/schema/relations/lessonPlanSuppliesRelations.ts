import { relations } from "drizzle-orm";
import { lessonPlans } from "../table/lessonPlans";
import { lessonPlanSupplies } from "../table/lessonPlanSupplies";
import { supplies } from "../table/supplies";

// LessonPlanSupply relations: Defines relationships for the LessonPlanSupply join table.
export const lessonPlanSuppliesRelations = relations(
  lessonPlanSupplies,
  ({ one }) => ({
    // Many-to-one: One LessonPlanSupply record belongs to one LessonPlan.
    lessonPlan: one(lessonPlans, {
      fields: [lessonPlanSupplies.lessonPlanId],
      references: [lessonPlans.id],
    }),
    // Many-to-one: One LessonPlanSupply record belongs to one Supply.
    supply: one(supplies, {
      fields: [lessonPlanSupplies.supplyId],
      references: [supplies.id],
    }),
  })
);
