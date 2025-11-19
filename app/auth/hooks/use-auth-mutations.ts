import { useMutation } from "@tanstack/react-query";

import { authClient } from "@/lib/auth-client";

type LoginPayload = {
  email: string;
  password: string;
};

type ForgotPasswordPayload = {
  email: string;
};

type ResetPasswordPayload = {
  token: string;
  newPassword: string;
};

async function assertResponse(response: Response) {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(body?.message || "Request failed");
  }
  return body;
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: async ({ email, password }: LoginPayload) => {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
        rememberMe: false,
      });

      if (result.error) {
        throw new Error(result.error.message);
      }

      return result.data;
    },
  });
}

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async ({ email }: ForgotPasswordPayload) => {
      const response = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        }),
      });

      const body = await assertResponse(response);
      return (
        body?.message ||
        "If this email exists in our system, check your inbox for a reset link."
      );
    },
  });
}

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async ({ token, newPassword }: ResetPasswordPayload) => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });

      await assertResponse(response);
      return true;
    },
  });
}
