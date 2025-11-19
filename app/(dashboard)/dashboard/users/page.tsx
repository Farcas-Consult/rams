import { UsersPageClient } from "./components/users-page-client";
import {
  hasPermission,
  requireUserWithPermission,
} from "@/lib/server/authz";

export default async function UsersPage() {
  const user = await requireUserWithPermission("users:read");

  const canCreate = hasPermission(user, "users:create");
  const canUpdate = hasPermission(user, "users:update");
  const canDelete = hasPermission(user, "users:delete");

  // Resend invite depends on update permission since it flows through PATCH
  const canResend = canUpdate;

  return (
    <UsersPageClient
      canCreate={canCreate}
      canUpdate={canUpdate}
      canDelete={canDelete}
      canResend={canResend}
    />
  );
}

