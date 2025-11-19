import { hasPermission, requireUserWithPermission } from "@/lib/server/authz";
import { UserDetailPageClient } from "../components/user-detail-page-client";

interface UserDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { id } = await params;
  const user = await requireUserWithPermission("users:read");
  const canUpdate = hasPermission(user, "users:update");
  const canDelete = hasPermission(user, "users:delete");

  return (
    <UserDetailPageClient
      userId={id}
      canUpdate={canUpdate}
      canDelete={canDelete}
    />
  );
}
