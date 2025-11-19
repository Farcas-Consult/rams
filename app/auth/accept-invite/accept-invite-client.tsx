"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IconLoader3 } from "@tabler/icons-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";

type InviteDetails = {
  email: string;
  name?: string | null;
};

interface AcceptInviteClientProps {
  token: string | null;
}

export function AcceptInviteClient({ token }: AcceptInviteClientProps) {
  const router = useRouter();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isValidForm = useMemo(() => {
    return (
      password.length >= 8 &&
      confirmPassword.length >= 8 &&
      password === confirmPassword &&
      (!invite?.name ? name.trim().length > 0 : true)
    );
  }, [password, confirmPassword, name, invite]);

  useEffect(() => {
    if (!token) {
      setError("Invitation token is missing.");
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    async function loadInvite(currentToken: string) {
      try {
        const response = await fetch(
          `/api/users/invite/validate?token=${encodeURIComponent(currentToken)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          const body = await response.json().catch(() => ({}));
          throw new Error(body?.message || "Failed to validate invitation");
        }

        const data = (await response.json()) as InviteDetails;
        setInvite(data);
        setName(data.name ?? "");
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;
        setError(
          err instanceof Error ? err.message : "Unable to load invitation"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadInvite(token);
    return () => controller.abort();
  }, [token]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token || !isValidForm) return;

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/invite/accept", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
          name: name || undefined,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || "Failed to accept invitation");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/auth/login");
      }, 1500);
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : "Failed to accept invitation"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Accept Invitation</CardTitle>
            <CardDescription>
              {isLoading
                ? "Loading invitation details…"
                : invite
                ? `Complete setup for ${invite.email}.`
                : "Unable to load invitation."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-4">
                <AlertDescription>
                  Invitation accepted! Redirecting to login…
                </AlertDescription>
              </Alert>
            )}

            {!error && !isLoading && invite && (
              <form
                id="accept-invite-form"
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={invite.email} disabled />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    required={!invite.name}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Create a secure password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(event.target.value)
                    }
                    minLength={8}
                    required
                  />
                  {password &&
                    confirmPassword &&
                    password !== confirmPassword && (
                      <p className="text-sm text-destructive">
                        Passwords do not match.
                      </p>
                    )}
                </div>

                {submitError && (
                  <Alert variant="destructive">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}
              </form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button
              type="submit"
              form="accept-invite-form"
              className="w-full"
              disabled={
                isLoading || !invite || !isValidForm || isSubmitting || !!error
              }
            >
              {isSubmitting ? (
                <>
                  <IconLoader3 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account…
                </>
              ) : (
                "Set password and continue"
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
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

