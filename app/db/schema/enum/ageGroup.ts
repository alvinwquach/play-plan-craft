import { pgEnum } from "drizzle-orm/pg-core";

// AgeGroup enum: Represents educational stages for categorizing lessons, activities, and goals
export const ageGroup = pgEnum("AgeGroup", [
  "INFANT", // 0-12 months
  "TODDLER", // 1-3 years
  "PRESCHOOL", // 3-5 years
  "KINDERGARTEN", // 5-6 years
  "GRADE_1", // 6-7 years
  "GRADE_2", // 7-8 years
  "GRADE_3", // 8-9 years
  "GRADE_4", // 9-10 years
  "GRADE_5", // 10-11 years
  "GRADE_6", // 11-12 years
  "GRADE_7", // 12-13 years
  "GRADE_8", // 13-14 years
  "GRADE_9", // 14-15 years
  "GRADE_10", // 15-16 years
  "GRADE_11", // 16-17 years
  "GRADE_12", // 17-18 years
]);
