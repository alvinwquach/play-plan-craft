import { pgEnum } from "drizzle-orm/pg-core";

// Subject enum: Defines focus areas or subjects for lesson plans.
export const subject = pgEnum("Subject", [
  "SENSORY_DEVELOPMENT",
  "FINE_MOTOR_SKILLS",
  "LANGUAGE_DEVELOPMENT",
  "LITERACY",
  "MATH",
  "SCIENCE",
  "SOCIAL_STUDIES",
  "FOREIGN_LANGUAGES",
  "ART",
  "MUSIC",
  "DRAMA",
  "DANCE",
  "PHYSICAL_EDUCATION",
  "HEALTH_AND_WELLNESS",
  "SOCIAL_EMOTIONAL",
  "CHARACTER_EDUCATION",
  "COMMUNITY_SERVICE",
  "COMPUTER_SCIENCE",
  "TECHNOLOGY",
  "ENGINEERING",
  "BUSINESS",
  "ECONOMICS",
  "PHILOSOPHY",
]);
