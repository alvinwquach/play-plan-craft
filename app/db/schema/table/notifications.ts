import {
  pgTable,
  serial,
  varchar,
  uuid,
  integer,
  timestamp,
  text,
  index,
} from "drizzle-orm/pg-core";
import { organizations } from "./organizations";
import { users } from "./users";

// Notifications table: Stores system messages such as assistant approval requests sent between users
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(), // Auto-incrementing unique identifier for each notification
    userId: uuid("userId")
      .references(() => users.id)
      .notNull(), // The recipient of the notification (typically an educator)
    senderId: uuid("senderId")
      .references(() => users.id)
      .notNull(), // The user who triggered the notification (typically an assistant)
    type: varchar("type", { length: 50 }).notNull(), // Notification type, e.g., "ASSISTANT_REQUEST"
    message: text("message").notNull(), // Message body shown in the notification
    status: varchar("status", { length: 20 }).default("PENDING").notNull(),
    // Current status of the notification — can be "PENDING", "APPROVED", or "REJECTED"
    organizationId: integer("organizationId")
      .references(() => organizations.id)
      .notNull(), // Foreign key to the organization associated with this notification
    createdAt: timestamp("createdAt").defaultNow().notNull(), // Timestamp when the notification was created
  },
  (table) => [
    // Index to optimize queries fetching notifications for a specific user
    index("notification_user_idx").on(table.userId),
  ]
);
