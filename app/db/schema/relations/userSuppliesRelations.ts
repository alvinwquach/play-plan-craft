import { relations } from "drizzle-orm";
import { supplies } from "../table/supplies";
import { users } from "../table/users";
import { userSupplies } from "../table/userSupplies";

// UserSupply relations: Defines relationships for the UserSupply join table.
export const userSuppliesRelations = relations(userSupplies, ({ one }) => ({
  // Many-to-one: One UserSupply record belongs to one User.
  user: one(users, {
    fields: [userSupplies.userId],
    references: [users.id],
  }),
  // Many-to-one: One UserSupply record belongs to one Supply.
  supply: one(supplies, {
    fields: [userSupplies.supplyId],
    references: [supplies.id],
  }),
}));
