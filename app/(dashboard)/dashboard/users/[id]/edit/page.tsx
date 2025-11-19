import { requireUserWithPermission } from "@/lib/server/authz";
import { EditUserPageClient } from "../../components/edit-user-page-client";

interface EditUserPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const { id } = await params;
  await requireUserWithPermission("users:update");

  return <EditUserPageClient userId={id} />;
}

