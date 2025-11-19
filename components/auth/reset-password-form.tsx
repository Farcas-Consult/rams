"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { IconLoader } from "@tabler/icons-react";

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
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const hasToken = Boolean(token);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("idle");
    setMessage("");

    if (!token) {
      setStatus("error");
      setMessage("The reset token is missing or invalid.");
      return;
    }

    if (password.length < 8) {
      setStatus("error");
      setMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setStatus("error");
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          newPassword: password,
          token,
        }),
      });

      const body = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(body?.message || "Unable to reset password.");
      }

      setStatus("success");
      setMessage("Password updated. You can now sign in with the new password.");
      setPassword("");
      setConfirmPassword("");
      setTimeout(() => router.push("/login"), 2000);
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
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
          {(tokenError || status !== "idle") && (
            <Alert
              variant={
                tokenError || status === "error" ? "destructive" : "default"
              }
              className="mb-4"
            >
              <AlertDescription>
                {tokenError ||
                  message ||
                  "We were unable to validate this reset link."}
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
                <Button disabled={loading} type="submit" className="w-full">
                  {loading ? (
                    <IconLoader className="animate-spin" stroke={2} />
                  ) : (
                    "Update password"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => router.push("/login")}
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
                onClick={() => router.push("/forgot-password")}
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

