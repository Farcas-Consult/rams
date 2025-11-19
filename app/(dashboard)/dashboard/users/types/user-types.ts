<<<<<<< HEAD
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
=======
import { z } from "zod";
import { userResponseSchema } from "../schemas/user-schemas";

export type TransformedUser = z.infer<typeof userResponseSchema>;
>>>>>>> 13d1d71d806384f545a2605aa59a8214b624dd3c

