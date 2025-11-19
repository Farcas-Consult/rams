import { z } from "zod";

import {
  PERMISSION_KEYS,
  USER_ROLES,
  USER_STATUSES,
  type PermissionKey,
} from "@/lib/permissions";

const permissionEnum = z.enum(
  PERMISSION_KEYS as unknown as [PermissionKey, ...PermissionKey[]]
);
const userStatusEnum = z.enum(USER_STATUSES);
const userRoleEnum = z.enum(USER_ROLES);

/**
 * Schema for creating/inviting a user
 */
export const createUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  role: userRoleEnum.default("user"),
  permissions: z
    .array(permissionEnum)
    .max(PERMISSION_KEYS.length)
    .optional(),
  status: userStatusEnum.default("invited").optional(),
  sendInvite: z.boolean().default(true).optional(),
});

/**
 * Schema for updating an existing user
 */
export const updateUserSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Invalid email address").optional(),
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name is too long")
    .optional(),
  role: userRoleEnum.optional(),
  permissions: z
    .array(permissionEnum)
    .max(PERMISSION_KEYS.length)
    .optional(),
  status: userStatusEnum.optional(),
  resendInvite: z.boolean().optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .optional(),
});

/**
 * Schema for user query/filter parameters
 */
export const userQuerySchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  emailVerified: z.boolean().optional(),
  status: userStatusEnum.optional(),
  role: userRoleEnum.optional(),
  sortBy: z
    .enum(["name", "email", "createdAt", "updatedAt", "role", "status"])
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

/**
 * Schema for user response from API
 */
export const userResponseSchema = z.object({
  id: z.string(),
  username: z.string(),
  name: z.string(),
  email: z.string(),
  emailVerified: z.boolean().default(false),
  status: userStatusEnum,
  role: userRoleEnum,
  permissions: z.array(permissionEnum),
  image: z.string().nullable(),
  invitedAt: z.date().or(z.string()).nullable(),
  invitationToken: z.string().nullable(),
  invitationExpiresAt: z.date().or(z.string()).nullable(),
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

export const userStatsSchema = z.object({
  totalUsers: z.number().int().nonnegative(),
  activeUsers: z.number().int().nonnegative(),
  inactiveUsers: z.number().int().nonnegative(),
  suspendedUsers: z.number().int().nonnegative(),
  invitedUsers: z.number().int().nonnegative(),
  superAdmins: z.number().int().nonnegative(),
  admins: z.number().int().nonnegative(),
  newThisMonth: z.number().int().nonnegative(),
  growthRate: z.number(),
  activeRatio: z.number(),
});

const permissionDefinitionSchema = z.object({
  key: permissionEnum,
  label: z.string(),
  description: z.string().optional(),
});

export const permissionCatalogSchema = z.object({
  roles: z.array(userRoleEnum),
  statuses: z.array(userStatusEnum),
  groups: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      permissions: z.array(permissionDefinitionSchema),
    })
  ),
  defaults: z.record(userRoleEnum, z.array(permissionEnum)),
});

// Type exports
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserQuery = z.infer<typeof userQuerySchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type PaginatedUserResponse = z.infer<typeof paginatedUserResponseSchema>;
export type UserStatus = z.infer<typeof userStatusEnum>;
export type UserRole = z.infer<typeof userRoleEnum>;
export type Permission = PermissionKey;
export type UserStats = z.infer<typeof userStatsSchema>;
export type PermissionCatalog = z.infer<typeof permissionCatalogSchema>;

