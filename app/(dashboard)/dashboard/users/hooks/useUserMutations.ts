"use client";

import { useState } from "react";
import {
  createUser,
  updateUser,
  deleteUser,
} from "../services/user-service";
import {
  CreateUserInput,
  UpdateUserInput,
} from "../schemas/user-schemas";
import { toast } from "sonner";

/**
 * Hook to create a new user
 * TODO: Upgrade to @tanstack/react-query when backend is ready
 */
export const useCreateUser = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: CreateUserInput) => {
    setIsPending(true);
    try {
      const result = await createUser(data);
      toast.success("User created successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create user";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

/**
 * Hook to update an existing user
 */
export const useUpdateUser = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (data: UpdateUserInput) => {
    setIsPending(true);
    try {
      const result = await updateUser(data);
      toast.success("User updated successfully");
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update user";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = () => {
  const [isPending, setIsPending] = useState(false);

  const mutate = async (id: string) => {
    setIsPending(true);
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete user";
      toast.error(message);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  return { mutate, isPending };
};
