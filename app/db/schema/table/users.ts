import {
  pgTable,
  text,
  integer,
  timestamp,
  index,
  varchar,
  uuid,
} from "drizzle-orm/pg-core";
import { userRoleEnum } from "../enum/userRole";

// User table: Represents educators, admins, or assistants who create lesson plans, schedules, etc.
export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey(), // Matches auth.users UUID
    email: varchar("email", { length: 254 }).unique().notNull(), // Unique email, required, limited to 254 characters per RFC 5321
    password: text("password"), // Nullable for Google OAuth users (no password)
    name: varchar("name", { length: 100 }).notNull(), // Required name, limited to 100 characters for typical user names
    image: text("image"), // User image from Google
    ole: userRoleEnum("role").default("EDUCATOR").notNull(), // User role with default value
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Creation timestamp, defaults to current time
    organizationId: integer("organizationId"), // Optional foreign key to Organization, nullable
  },
  (table) => [
    // Index on organizationId to optimize queries involving this relationship
    index("user_organization_idx").on(table.organizationId),
  ]
);