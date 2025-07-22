import { pgEnum } from "drizzle-orm/pg-core";

// DrdpDomainCode enum: Defines DRDP domain codes for preschool (US curriculum)
export const drdpDomainCode = pgEnum("DrdpDomainCode", [
  "ATL-REG",
  "SED",
  "LLD",
  "COG",
  "PD-HLTH",
]);
