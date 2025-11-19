"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAssets,
  getAssetStats,
  getDecommissionStats,
} from "../services/asset-service";
import { AssetQuery } from "../schemas/asset-schemas";

export const useAssets = (query: AssetQuery) => {
  return useQuery({
    queryKey: ["assets", query],
    queryFn: () => getAssets(query),
  });
};

export const useAssetStats = () => {
  return useQuery({
    queryKey: ["asset-stats"],
    queryFn: getAssetStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDecommissionStats = () => {
  return useQuery({
    queryKey: ["decommission-stats"],
    queryFn: getDecommissionStats,
    staleTime: 1000 * 60 * 5,
  });
};

export const useDecommissionedAssets = (query: AssetQuery) => {
  return useAssets({
    ...query,
    status: "Decommissioned",
  });
};
