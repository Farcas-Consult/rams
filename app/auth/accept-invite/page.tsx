import { AcceptInviteClient } from "./accept-invite-client";

interface AcceptInvitePageProps {
  searchParams?: { token?: string };
}

export default function AcceptInvitePage({
  searchParams,
}: AcceptInvitePageProps) {
  const token = searchParams?.token ?? null;

  return <AcceptInviteClient token={token} />;
}

