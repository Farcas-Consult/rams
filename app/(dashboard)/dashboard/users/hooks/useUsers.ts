"use client";

import { useState, useEffect } from "react";
import { getUsers, getUserStats } from "../services/user-service";
import { UserQuery, PaginatedUserResponse } from "../schemas/user-schemas";

/**
 * Hook to fetch paginated list of users
 * TODO: Upgrade to @tanstack/react-query when backend is ready
 * 
 * To upgrade:
 * 1. Install: npm install @tanstack/react-query
 * 2. Set up QueryClientProvider in app/layout.tsx
 * 3. Replace useState/useEffect with useQuery
 */
export const useUsers = (query: UserQuery) => {
  const [data, setData] = useState<PaginatedUserResponse | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchUsers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUsers(query);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch users"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchUsers();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(query)]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch user statistics/KPIs
 */
export const useUserStats = () => {
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getUserStats();
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch stats"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchStats();
  }, []);

  return { data, isLoading, error };
};
