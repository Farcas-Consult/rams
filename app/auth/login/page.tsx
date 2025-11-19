import { redirect } from "next/navigation";

import { LoginForm } from "@/app/auth/components/login-form";

interface LoginPageProps {
  searchParams?: Promise<{ redirectTo?: string; invite?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = (await searchParams) ?? {};

  if (params.invite) {
    redirect(`/auth/accept-invite?token=${encodeURIComponent(params.invite)}`);
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm redirectTo={params.redirectTo} />
      </div>
    </div>
  );
}
