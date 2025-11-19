import { user } from "@src/generated/prisma/client";

/**
 * User type based on Prisma schema
 */
export type User = user;

/**
 * Transformed user type for table display
 * Can be extended with computed fields if needed
 */
export type TransformedUser = User;

