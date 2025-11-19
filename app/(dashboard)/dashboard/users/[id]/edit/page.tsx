import { requireUserWithPermission } from "@/lib/server/authz";
import { EditUserPageClient } from "../../components/edit-user-page-client";

interface EditUserPageProps {
  params: { id: string };
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  await requireUserWithPermission("users:update");

  return <EditUserPageClient userId={params.id} />;
}

