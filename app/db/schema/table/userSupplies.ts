import { pgTable, integer, index, serial } from "drizzle-orm/pg-core";
import { supplies } from "./supplies";
import { users } from "./users";

// UserSupply table: Join table for many-to-many relationship between User and Supply, tracking quantities.
export const userSupplies = pgTable(
  "UserSupply",
  {
    id: serial("id").primaryKey(), // Auto-incrementing integer ID
    userId: integer("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Foreign key to User, deletes if user is deleted
    supplyId: integer("supplyId")
      .notNull()
      .references(() => supplies.id, { onDelete: "cascade" }), // Foreign key to Supply, deletes if supply is deleted
    quantity: integer("quantity").notNull(), // Required quantity
  },
  (table) => [
    // Index on userId and supplyId for efficient queries
    index("user_supply_idx").on(table.userId, table.supplyId),
  ]
);
