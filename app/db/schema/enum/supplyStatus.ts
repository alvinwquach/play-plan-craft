import { pgEnum } from "drizzle-orm/pg-core";

// SupplyStatus enum: Tracks inventory state for supplies.
export const supplyStatus = pgEnum("SupplyStatus", [
  "AVAILABLE", // Fully stocked and ready to use
  "LOW", // Supply is running low
  "OUT_OF_STOCK", // Supply exhausted and needs restocking
]);
