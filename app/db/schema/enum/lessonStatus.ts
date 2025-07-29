import { pgEnum } from "drizzle-orm/pg-core";

// LessonStatus enum: Represents the lifecycle status of lesson plans.
export const lessonStatus = pgEnum("LessonStatus", [
  "DRAFT", // Being edited or developed
  "PUBLISHED", // Ready for use and sharing
  "ARCHIVED", // No longer active or in use
  "PENDING_DELETION", // Pending deletion
]);
