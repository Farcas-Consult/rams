import { ResetPasswordForm } from "@/app/auth/components/reset-password-form";

interface ResetPasswordPageProps {
  searchParams?: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm
          token={params.token}
          tokenError={params.error}
        />
      </div>
    </div>
  );
}

