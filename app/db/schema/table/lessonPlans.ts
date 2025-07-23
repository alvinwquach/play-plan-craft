import {
  pgTable,
  serial,
  varchar,
  text,
  jsonb,
  integer,
  timestamp,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import { ageGroup } from "../enum/ageGroup";
import { subject } from "../enum/subject";
import { theme } from "../enum/theme";
import { lessonStatus } from "../enum/lessonStatus";
import { curriculumEnum } from "../enum/curriculumEnum";
import { users } from "./users";
import {
  Source,
  Standard,
  DrdpDomain,
  Supply,
  AlternateActivityGroup,
} from "@/app/types/lessonPlan";

export const lessonPlans = pgTable(
  "lesson_plans",
  {
    id: serial("id").primaryKey(), // Auto-incrementing primary key ID
    title: varchar("title", { length: 255 }).notNull(), // Required lesson title, max 255 characters
    age_group: ageGroup("age_group").notNull(), // Required age group enum value
    subject: subject("subject").notNull(), // Required subject enum value
    theme: theme("theme"), // Optional theme enum value
    status: lessonStatus("status").default("DRAFT").notNull(), // Lesson status with default "DRAFT"
    created_at: timestamp("created_at").defaultNow().notNull(), // Timestamp of lesson creation
    created_by_id: uuid("created_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to users table
    curriculum: curriculumEnum("curriculum").notNull(), // Required curriculum enum value
    duration: integer("duration").notNull(), // Required lesson duration in minutes
    classroom_size: integer("classroom_size").notNull(), // Required expected classroom size
    learning_intention: text("learning_intention"), // Optional learning intention text
    success_criteria: jsonb("success_criteria")
      .notNull()
      .default([])
      .$type<string[]>(), // List of success criteria
    standards: jsonb("standards").notNull().default([]).$type<Standard[]>(), // List of education standards
    drdp_domains: jsonb("drdp_domains")
      .notNull()
      .default([])
      .$type<DrdpDomain[]>(), // List of DRDP domains
    source_metadata: jsonb("source_metadata")
      .notNull()
      .default([])
      .$type<Source[]>(), // Source metadata for citations
    citation_score: integer("citation_score").notNull(), // Citation score as integer
    alternate_activities: jsonb("alternate_activities")
      .notNull()
      .default([])
      .$type<AlternateActivityGroup[]>(), // Alternate activity groups
    supplies: jsonb("supplies").notNull().default([]).$type<Supply[]>(), // Supplies list
    tags: jsonb("tags").notNull().default([]).$type<string[]>(), // Tags for filtering
  },
  (table) => ({
    created_by_idx: index("lesson_plan_created_by_idx").on(table.created_by_id),
  })
);