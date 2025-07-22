import { pgEnum } from "drizzle-orm/pg-core";

// Curriculum enum: Defines the curriculum type (US or AUS)
export const curriculumEnum = pgEnum("Curriculum", ["US", "AUS"]);
