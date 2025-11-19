export const USER_ROLES = ["superadmin", "admin", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = [
  "invited",
  "active",
  "inactive",
  "suspended",
] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export const PERMISSION_KEYS = [
  "dashboard:view",
  "kpis:view",
  "users:create",
  "users:read",
  "users:update",
  "users:delete",
  "assets:create",
  "assets:read",
  "assets:update",
  "assets:delete",
  "live-feed:read",
  "live-feed:update",
  "decommissioning:read",
  "decommissioning:update",
  "reports:read",
  "reports:export",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

type PermissionDefinitionConfig = {
  key: PermissionKey;
  label: string;
  description?: string;
};

type PermissionGroupDefinition = {
  id: string;
  label: string;
  permissions: readonly PermissionDefinitionConfig[];
};

export const PERMISSION_GROUPS = [
  {
    id: "dashboard",
    label: "Dashboard & KPIs",
    permissions: [
      {
        key: "dashboard:view",
        label: "View dashboard shell",
        description: "Access the dashboard landing experience.",
      },
      {
        key: "kpis:view",
        label: "View KPI widgets",
        description: "See KPI and metric cards.",
      },
    ],
  },
  {
    id: "users",
    label: "Users",
    permissions: [
      {
        key: "users:create",
        label: "Invite users",
        description: "Create invitations and assign roles.",
      },
      {
        key: "users:read",
        label: "View user directory",
        description: "Browse users and their profiles.",
      },
      {
        key: "users:update",
        label: "Update users",
        description: "Change profile info, roles, or status.",
      },
      {
        key: "users:delete",
        label: "Delete users",
        description: "Remove users and their sessions.",
      },
    ],
  },
  {
    id: "assets",
    label: "Assets",
    permissions: [
      {
        key: "assets:create",
        label: "Create assets",
        description: "Register new assets in RAMS.",
      },
      {
        key: "assets:read",
        label: "View assets",
        description: "Lists and detail pages.",
      },
      {
        key: "assets:update",
        label: "Update assets",
        description: "Edit metadata and ownership.",
      },
      {
        key: "assets:delete",
        label: "Archive/delete assets",
        description: "Decommission or remove assets.",
      },
    ],
  },
  {
    id: "live-feed",
    label: "Live Feed",
    permissions: [
      {
        key: "live-feed:read",
        label: "View live feeds",
        description: "See live sensor/activity feeds.",
      },
      {
        key: "live-feed:update",
        label: "Acknowledge/live feed actions",
        description: "Acknowledge alerts and take actions.",
      },
    ],
  },
  {
    id: "decommissioning",
    label: "Decommissioning",
    permissions: [
      {
        key: "decommissioning:read",
        label: "View decommissioning queue",
        description: "Access pipeline of decommissioning tasks.",
      },
      {
        key: "decommissioning:update",
        label: "Update decommissioning cases",
        description: "Advance, approve, or reject cases.",
      },
    ],
  },
  {
    id: "reports",
    label: "Reports",
    permissions: [
      {
        key: "reports:read",
        label: "View reports",
        description: "View curated analytics and reports.",
      },
      {
        key: "reports:export",
        label: "Export/download reports",
        description: "Generate CSV/PDF exports.",
      },
    ],
  },
] as const satisfies readonly PermissionGroupDefinition[];

export type PermissionGroup = (typeof PERMISSION_GROUPS)[number];
export type PermissionDefinition = PermissionDefinitionConfig;

export const PERMISSION_DEFINITIONS = PERMISSION_GROUPS.reduce<
  PermissionDefinition[]
>((acc, group) => acc.concat(group.permissions), []);

const LIMITED_USER_PERMISSIONS: PermissionKey[] = [
  "dashboard:view",
  "kpis:view",
  "users:read",
  "assets:read",
  "live-feed:read",
  "decommissioning:read",
  "reports:read",
];

export const ROLE_DEFAULT_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  superadmin: [...PERMISSION_KEYS],
  admin: [...PERMISSION_KEYS],
  user: LIMITED_USER_PERMISSIONS,
};

export function getDefaultPermissionsForRole(role: UserRole): PermissionKey[] {
  return ROLE_DEFAULT_PERMISSIONS[role] ?? [];
}

export function hasPermission(
  user: { role: UserRole; permissions: PermissionKey[] },
  permission: PermissionKey
) {
  if (user.role === "superadmin") return true;
  return user.permissions.includes(permission);
}


