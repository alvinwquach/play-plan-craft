import { relations } from "drizzle-orm";
import { lessonPlanTags } from "../table/lessonPlanTags";
import { tags } from "../table/tags";

// Tag relations: Defines how tags relate to lesson plans.
export const tagsRelations = relations(tags, ({ many }) => ({
  // Many-to-many: One tag can be linked to many lesson plans (via LessonPlanTag).
  lessonPlans: many(lessonPlanTags),
}));
