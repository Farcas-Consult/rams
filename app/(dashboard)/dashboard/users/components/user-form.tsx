"use client";

import * as React from "react";
import { useForm, type Resolver } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type Permission,
  type PermissionCatalog,
  type UserResponse,
  type UserRole,
  type UserStatus,
  type UpdateUserInput,
} from "../schemas/user-schemas";
import {
  useCreateUser,
  useUpdateUser,
} from "../hooks/useUserMutations";
import { IconLoader, IconRefresh } from "@tabler/icons-react";
import { usePermissionCatalog } from "../hooks/useUsers";

interface UserFormProps {
  mode: "create" | "edit";
  initialData?: UserResponse;
}

export function UserForm({ mode, initialData }: UserFormProps) {
  const router = useRouter();
  const { mutateAsync: createUser, isPending: isCreating } = useCreateUser();
  const { mutateAsync: updateUser, isPending: isUpdating } = useUpdateUser();
  const { data: permissionCatalog, isLoading: isLoadingCatalog } =
    usePermissionCatalog();
  const [permissionsTouched, setPermissionsTouched] = React.useState(false);

  const isPending = isCreating || isUpdating;

  type FormValues = CreateUserInput | UpdateUserInput;
  const formSchema = (mode === "create"
    ? createUserSchema
    : updateUserSchema) as z.AnyZodObject;
  const resolver = zodResolver(formSchema) as unknown as Resolver<FormValues>;

  const form = useForm<FormValues>({
    resolver,
    defaultValues:
      mode === "edit" && initialData
        ? {
            id: initialData.id,
            name: initialData.name || "",
            email: initialData.email || "",
            role: initialData.role,
            permissions: initialData.permissions,
            status: initialData.status,
          }
        : {
            email: "",
            name: "",
            role: "user",
            permissions: permissionCatalog?.defaults?.user ?? [],
            sendInvite: true,
          },
  });

  const role = form.watch("role") as UserRole;

  React.useEffect(() => {
    if (mode === "edit") return;
    if (!permissionCatalog) return;
    if (permissionsTouched) return;

    const defaults = permissionCatalog.defaults?.[role] ?? [];
    form.setValue("permissions", defaults);
  }, [permissionCatalog, role, permissionsTouched, mode, form]);

  async function onSubmit(data: z.infer<typeof formSchema>) {
    try {
      if (mode === "create") {
        await createUser({
          ...(data as CreateUserInput),
          permissions:
            (data as CreateUserInput).permissions || [],
        });
        router.push("/dashboard/users");
        router.refresh();
      } else {
        const payload = { ...(data as UpdateUserInput) };
        if (!payload.id && initialData) {
          payload.id = initialData.id;
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
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <CardTitle>
              {mode === "create" ? "Invite a User" : "Edit User"}
            </CardTitle>
            <CardDescription className="space-y-1">
              <p>
                {mode === "create"
                  ? "Send an invitation via email, assign a role, and choose the permissions they should start with."
                  : "Update profile, permissions, or resend an invite if the user has not joined yet."}
              </p>
              {mode === "edit" && initialData && (
                <p className="text-xs text-muted-foreground">
                  Status:{" "}
                  {initialData.status
                    ?.charAt(0)
                    .toUpperCase()}
                  {initialData.status.slice(1)}
                  {initialData.invitedAt && (
                    <>
                      {" · Invited "}
                      {new Date(initialData.invitedAt).toLocaleString()}
                    </>
                  )}
                  {initialData.invitationExpiresAt && (
                    <>
                      {" · Expires "}
                      {new Date(
                        initialData.invitationExpiresAt
                      ).toLocaleString()}
                    </>
                  )}
                </p>
              )}
            </CardDescription>
          </div>
          {mode === "edit" && initialData && initialData.status === "invited" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isPending}
              onClick={async () => {
                if (!initialData?.id) return;
                await updateUser({ id: initialData.id, resendInvite: true });
                router.refresh();
              }}
            >
              {isPending ? (
                <>
                  <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                  Resending...
                </>
              ) : (
                <>
                  <IconRefresh className="mr-2 h-4 w-4" />
                  Resend Invite
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            id="user-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
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
                    This address receives the invitation and is used for login.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                    Display name for the dashboard and notifications.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (mode === "create") {
                          setPermissionsTouched(false);
                        }
                      }}
                      disabled={isLoadingCatalog}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {getRoleOptions(permissionCatalog).map((roleOption) => (
                          <SelectItem key={roleOption} value={roleOption}>
                            {roleOption.charAt(0).toUpperCase() +
                              roleOption.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    Roles bundle a default set of permissions. Adjust them below if needed.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {mode === "edit" ? (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusOptions(permissionCatalog).map(
                            (statusOption) => (
                              <SelectItem key={statusOption} value={statusOption}>
                                {statusOption.charAt(0).toUpperCase() +
                                  statusOption.slice(1)}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Control access for this user.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="sendInvite"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) =>
                          field.onChange(Boolean(checked))
                        }
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Send invitation email</FormLabel>
                      <FormDescription>
                        Sends a sign-in link so the user can set their password.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="permissions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Permissions</FormLabel>
                  <div className="space-y-4 rounded-lg border p-4">
                    {renderPermissionGroups(
                      permissionCatalog,
                      field.value as Permission[] | undefined,
                      (permission) => {
                        setPermissionsTouched(true);
                        const current = new Set(field.value ?? []);
                        if (current.has(permission)) {
                          current.delete(permission);
                        } else {
                          current.add(permission);
                        }
                        field.onChange(Array.from(current));
                      }
                    )}
                  </div>
                  <FormDescription>
                    Granular access controls layered on top of the role.
                  </FormDescription>
                  <FormMessage />
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

function getRoleOptions(
  catalog?: PermissionCatalog
): UserRole[] {
  if (catalog?.roles?.length) {
    return catalog.roles as UserRole[];
  }
  return ["superadmin", "admin", "user"];
}

function getStatusOptions(
  catalog?: PermissionCatalog
): UserStatus[] {
  if (catalog?.statuses?.length) {
    return catalog.statuses as UserStatus[];
  }
  return ["active", "inactive", "suspended", "invited"];
}

function renderPermissionGroups(
  catalog: PermissionCatalog | undefined,
  selected: Permission[] = [],
  onToggle: (permission: Permission) => void
) {
  if (!catalog) {
    return <p className="text-sm text-muted-foreground">Loading permissions…</p>;
  }

  return catalog.groups.map((group) => (
    <div key={group.id} className="space-y-2">
      <p className="text-sm font-semibold">{group.label}</p>
      <div className="flex flex-wrap gap-3">
        {group.permissions.map((permission) => {
          const checked = selected.includes(permission.key as Permission);
          return (
            <label
              key={permission.key}
              className={cn(
                "inline-flex cursor-pointer items-start gap-2 rounded-md border px-3 py-2 text-sm",
                checked && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() =>
                  onToggle(permission.key as Permission)
                }
              />
              <span>
                <span className="font-medium">{permission.label}</span>
                {permission.description && (
                  <p className="text-xs text-muted-foreground">
                    {permission.description}
                  </p>
                )}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  ));
}

