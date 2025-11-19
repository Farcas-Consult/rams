import { z } from "zod";

/**
 * Schema for creating a new user
 */
export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  emailVerified: z.boolean().default(false),
});

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").max(255, "Name is too long").optional(),
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
  emailVerified: z.boolean().optional(),
});

/**
 * Schema for user query/filter parameters
 */
export const userQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  emailVerified: z.boolean().optional(),
  sortBy: z.enum(["name", "email", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for user response from API
 */
export const userResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  image: z.string().nullable(),
  createdAt: z.date().or(z.string()),
  updatedAt: z.date().or(z.string()),
});

/**
 * Schema for paginated user response
 */
export const paginatedUserResponseSchema = z.object({
  users: z.array(userResponseSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  totalPages: z.number().int().nonnegative(),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type PaginatedUserResponse = z.infer<typeof paginatedUserResponseSchema>;

