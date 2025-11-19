"use client";

import { useState } from "react";
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

import { useForgotPasswordMutation } from "@/app/auth/hooks/use-auth-mutations";

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const mutation = useForgotPasswordMutation();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    mutation.mutate({ email });
  }

  const hasStatus = mutation.isSuccess || mutation.isError;
  const message = (() => {
    if (mutation.isSuccess) {
      return (
        mutation.data ||
        "If this email exists in our system, check your inbox for a reset link."
      );
    }
    if (mutation.error instanceof Error) {
      return mutation.error.message;
    }
    return "";
  })();

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Forgot password</CardTitle>
          <CardDescription>
            Enter your email address and we&rsquo;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {hasStatus && (
            <Alert
              variant={mutation.isError ? "destructive" : "default"}
              className="mb-4"
            >
              <AlertDescription>
                {message ||
                  "If this email exists in our system, check your inbox for a reset link."}
              </AlertDescription>
            </Alert>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@example.com"
                value={email}
                onChange={(event) => {
                  if (mutation.isError) mutation.reset();
                  setEmail(event.target.value);
                }}
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
                  "Send reset link"
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
        </CardContent>
      </Card>
    </div>
  );
}

