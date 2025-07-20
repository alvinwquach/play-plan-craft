import { relations } from "drizzle-orm";
import { lessonPlans } from "../table/lessonPlans";
import { lessonPlanTags } from "../table/lessonPlanTags";
import { tags } from "../table/tags";

// LessonPlanTag relations: Defines relationships for the LessonPlanTag join table.
export const lessonPlanTagsRelations = relations(lessonPlanTags, ({ one }) => ({
  // Many-to-one: One LessonPlanTag record belongs to one LessonPlan.
  lessonPlan: one(lessonPlans, {
    fields: [lessonPlanTags.lessonPlanId],
    references: [lessonPlans.id],
  }),
  // Many-to-one: One LessonPlanTag record belongs to one Tag.
  tag: one(tags, {
    fields: [lessonPlanTags.tagId],
    references: [tags.id],
  }),
}));
