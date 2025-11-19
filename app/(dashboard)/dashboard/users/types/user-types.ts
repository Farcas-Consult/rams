import { z } from "zod";
import { userResponseSchema } from "../schemas/user-schemas";

export type TransformedUser = z.infer<typeof userResponseSchema>;

