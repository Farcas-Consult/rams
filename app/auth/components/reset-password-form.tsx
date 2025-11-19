"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IconLoader } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { useResetPasswordMutation } from "@/app/auth/hooks/use-auth-mutations";

type ResetPasswordFormProps = React.ComponentProps<"div"> & {
  token?: string | null;
  tokenError?: string | null;
};

export function ResetPasswordForm({
  className,
  token,
  tokenError,
  ...props
}: ResetPasswordFormProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const hasToken = Boolean(token);
  const mutation = useResetPasswordMutation();
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (mutation.isSuccess) {
      setPassword("");
      setConfirmPassword("");
      const timeout = setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
      return () => clearTimeout(timeout);
    }
  }, [mutation.isSuccess, router]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!token) {
      setFormError("The reset token is missing or invalid.");
      return;
    }

    if (password.length < 8) {
      setFormError("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    mutation.mutate({ token, newPassword: password });
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Reset password</CardTitle>
          <CardDescription>
            {hasToken
              ? "Choose a new password for your account."
              : "The reset link is invalid or expired. Request a new one from the forgot password page."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(tokenError || formError || mutation.isError || mutation.isSuccess) && (
            <Alert
              variant={
                tokenError || formError || mutation.isError
                  ? "destructive"
                  : "default"
              }
              className="mb-4"
            >
              <AlertDescription>
                {tokenError ||
                  formError ||
                  (mutation.isError && mutation.error instanceof Error
                    ? mutation.error.message
                    : undefined) ||
                  (mutation.isSuccess
                    ? "Password updated. You can now sign in with the new password."
                    : "We were unable to validate this reset link.")}
              </AlertDescription>
            </Alert>
          )}

          {hasToken ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-3">
                <Label htmlFor="password">New password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="confirm-password">Confirm password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-3">
                <Button
                  disabled={mutation.isPending}
                  type="submit"
                  className="w-full"
                >
                  {mutation.isPending ? (
                    <IconLoader className="animate-spin" stroke={2} />
                  ) : (
                    "Update password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/auth/login")}
                >
                  Back to login
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Your reset link is missing or has expired. Request a new one to
                continue.
              </p>
              <Button
                variant="default"
                className="w-full"
                onClick={() => router.push("/auth/forgot-password")}
              >
                Request new link
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

