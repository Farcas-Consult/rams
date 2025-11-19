"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getPermissionCatalog,
  getUserStats,
  getUsers,
} from "../services/user-service";
import { UserQuery } from "../schemas/user-schemas";

export const useUsers = (query: UserQuery) => {
  return useQuery({
    queryKey: ["users", query],
    queryFn: () => getUsers(query),
  });
};

export const useUserStats = () => {
  return useQuery({
    queryKey: ["user-stats"],
    queryFn: getUserStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const usePermissionCatalog = () => {
  return useQuery({
    queryKey: ["user-permission-catalog"],
    queryFn: getPermissionCatalog,
    staleTime: Infinity,
  });
};
