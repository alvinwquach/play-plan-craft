import {
  Standard,
  DrdpDomain,
  Supply,
  AlternateActivityGroup,
} from "@/app/types/lessonPlan";
import {
  pgTable,
  integer,
  timestamp,
  index,
  serial,
  varchar,
  jsonb,
  text,
} from "drizzle-orm/pg-core";
import { Source } from "graphql";
import { ageGroup } from "../enum/ageGroup";
import { curriculumEnum } from "../enum/curriculumEnum";
import { lessonStatus } from "../enum/lessonStatus";
import { subject } from "../enum/subject";
import { theme } from "../enum/theme";
import { users } from "./users";

export const lessonPlans = pgTable(
  "LessonPlan",
  {
    id: serial("id").primaryKey(), // Auto-incrementing primary key ID
    title: varchar("title", { length: 200 }).notNull(), // Required lesson title, max 200 characters
    ageGroup: ageGroup("ageGroup").notNull(), // Required age group enum value
    subject: subject("subject").notNull(), // Required subject enum value
    theme: theme("theme"), // Optional theme enum value
    status: lessonStatus("status").default("DRAFT").notNull(), // Lesson status with default of "DRAFT"
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Timestamp of lesson creation, defaults to now
    createdById: integer("createdById")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users table, cascades on delete
    curriculum: curriculumEnum("curriculum").notNull(), // Required curriculum enum value
    duration: integer("duration").notNull(), // Required lesson duration in minutes
    classroomSize: integer("classroom_size").notNull(), // Required expected classroom size
    learningIntention: text("learning_intention"), // Optional learning intention text
    successCriteria: jsonb("success_criteria")
      .notNull()
      .default([])
      .$type<string[]>(), // List of success criteria (strings), defaults to empty array
    standards: jsonb("standards").notNull().default([]).$type<Standard[]>(), // List of education standards (custom type), defaults to empty array
    drdpDomains: jsonb("drdp_domains")
      .notNull()
      .default([])
      .$type<DrdpDomain[]>(), // List of DRDP domains (custom type), defaults to empty array
    sourceMetadata: jsonb("source_metadata")
      .notNull()
      .default([])
      .$type<Source[]>(), // Source metadata for citations (GraphQL type), defaults to empty array
    citationScore: integer("citation_score").notNull(), // Citation score as integer, required
    alternateActivities: jsonb("alternate_activities")
      .notNull()
      .default([])
      .$type<AlternateActivityGroup[]>(), // Alternate activity groups (custom type), defaults to empty array
    supplies: jsonb("supplies").notNull().default([]).$type<Supply[]>(), // Supplies list (custom type), defaults to empty array
    tags: jsonb("tags").notNull().default([]).$type<string[]>(), // Tags for filtering or categorization, defaults to empty array
  },
  (table) => [
    // Index on createdById for efficient queries
    index("lesson_plan_created_by_idx").on(table.createdById),
  ]
);
