import { ResetPasswordForm } from "@/app/auth/components/reset-password-form";

interface ResetPasswordPageProps {
  searchParams?: { token?: string; error?: string };
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordForm
          token={searchParams?.token}
          tokenError={searchParams?.error}
        />
      </div>
    </div>
  );
}

