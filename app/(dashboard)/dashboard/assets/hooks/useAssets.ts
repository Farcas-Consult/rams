"use client";

import { useState, useEffect } from "react";
import { getAssets, getAssetStats } from "../services/asset-service";
import { AssetQuery, PaginatedAssetResponse } from "../schemas/asset-schemas";

/**
 * Hook to fetch paginated list of assets
 * TODO: Upgrade to @tanstack/react-query when backend is ready
 */
export const useAssets = (query: AssetQuery) => {
  const [data, setData] = useState<PaginatedAssetResponse | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchAssets = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getAssets(query);
        if (!cancelled) {
          setData(result);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to fetch assets"));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchAssets();

    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(query)]);

  return { data, isLoading, error };
};

/**
 * Hook to fetch asset statistics/KPIs
 */
export const useAssetStats = () => {
  const [data, setData] = useState<any>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await getAssetStats();
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

