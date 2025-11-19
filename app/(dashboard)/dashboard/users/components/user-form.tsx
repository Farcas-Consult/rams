"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { createUserSchema, updateUserSchema, CreateUserInput, UpdateUserInput } from "../schemas/user-schemas";
import { useCreateUser, useUpdateUser } from "../hooks/useUserMutations";
import { IconLoader } from "@tabler/icons-react";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: UpdateUserInput;
  userId?: string;
}

export function UserForm({ mode, initialData, userId }: UserFormProps) {
  const router = useRouter();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const isPending = isCreating || isUpdating;

  const formSchema = mode === "create" ? createUserSchema : updateUserSchema;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues:
      mode === "edit" && initialData
        ? {
            id: userId || initialData.id,
            name: initialData.name || "",
            email: initialData.email || "",
            password: "",
            emailVerified: initialData.emailVerified ?? false,
          }
        : {
            name: "",
            email: "",
            password: "",
            emailVerified: false,
          },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (mode === "create") {
        await createUser(data as CreateUserInput);
        router.push("/dashboard/users");
        router.refresh();
      } else {
        const payload = { ...data } as UpdateUserInput;
        if (!payload.password) {
          delete payload.password;
        }
        await updateUser(payload);
        router.push("/dashboard/users");
        router.refresh();
      }
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Form submission error:", error);
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === "create" ? "Create New User" : "Edit User"}</CardTitle>
        <CardDescription>
          {mode === "create"
            ? "Add a new user to the system. Fill in the required information below."
            : "Update user information. Modify the fields below and save your changes."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form id="user-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {mode === "edit" && (
              <FormField
                control={form.control}
                name="id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      User ID cannot be changed.
                    </FormDescription>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="John Doe"
                      autoComplete="name"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the user's full name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="john.doe@example.com"
                      autoComplete="email"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter a valid email address for the user.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "create" ? (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Enter a secure password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormDescription>
                      Password must be at least 8 characters long.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Leave blank to keep current password"
                        autoComplete="new-password"
                      />
                    </FormControl>
                    <FormDescription>
                      Leave blank to keep the existing password.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="emailVerified"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Email Verified</FormLabel>
                    <FormDescription>
                      Check this box if the user's email has been verified.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          form="user-form"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <IconLoader className="mr-2 h-4 w-4 animate-spin" />
              {mode === "create" ? "Creating..." : "Updating..."}
            </>
          ) : (
            mode === "create" ? "Create User" : "Save Changes"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}

