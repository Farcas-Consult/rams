import type { User } from "@/db/schema";

/**
 * User type inferred from the Drizzle schema
 */
export type { User };

/**
 * Transformed user type for table display
 * Can be extended with computed fields if needed
 */
export type TransformedUser = User;

