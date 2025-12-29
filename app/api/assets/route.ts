import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, asc, desc, ilike, or, sql, eq, not, type SQL } from "drizzle-orm";

import { db } from "@/db";
import { asset, undiscoveredAsset } from "@/db/schema";
import {
  assetQuerySchema,
  createAssetSchema,
} from "@/app/(dashboard)/dashboard/assets/schemas/asset-schemas";
import { serializeAsset, serializeUndiscoveredAsset } from "./utils";

const sortableColumns = {
  assetName: asset.assetName,
  category: asset.category,
  status: asset.status,
  location: asset.location,
  purchaseDate: asset.purchaseDate,
  createdAt: asset.createdAt,
  updatedAt: asset.updatedAt,
} as const;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObject = {
      page: Number(searchParams.get("page") ?? "1"),
      pageSize: Number(searchParams.get("pageSize") ?? "10"),
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      location: searchParams.get("location") ?? undefined,
      sortBy: (searchParams.get("sortBy") as any) ?? undefined,
      sortOrder: (searchParams.get("sortOrder") as any) ?? "desc",
    };

    const parsedQuery = assetQuerySchema.safeParse(queryObject);
    if (!parsedQuery.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: parsedQuery.error.format() },
        { status: 400 }
      );
    }

    const { page, pageSize, search, category, status, location, sortBy, sortOrder } =
      parsedQuery.data;

    const filters: SQL<unknown>[] = [];

    // Exclude decommissioned assets unless explicitly filtering for them
    if (status !== "Decommissioned") {
      filters.push(eq(asset.isDecommissioned, false));
    }

    if (search) {
      const likeValue = `%${search}%`;
      filters.push(
        or(
          ilike(asset.assetName, likeValue),
          ilike(asset.assetTag, likeValue),
          ilike(asset.serialNumber, likeValue),
          ilike(asset.description, likeValue)
        )!
      );
    }

    if (category) {
      filters.push(ilike(asset.category, category));
    }

    if (status) {
      filters.push(ilike(asset.status, status as any));
    }

    if (location) {
      filters.push(ilike(asset.location, location));
    }

    const whereClause = filters.length
      ? filters.length === 1
        ? filters[0]
        : and(...filters)
      : undefined;

    const totalQuery = db.select({ count: sql<number>`count(*)` }).from(asset);
    const dataQuery = db.select().from(asset);

    const [totalResult, records] = await Promise.all([
      (whereClause ? totalQuery.where(whereClause) : totalQuery),
      (whereClause ? dataQuery.where(whereClause) : dataQuery)
        .orderBy(
          sortBy
            ? sortOrder === "asc"
              ? asc(sortableColumns[sortBy])
              : desc(sortableColumns[sortBy])
            : desc(asset.createdAt)
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize),
    ]);

    const total = Number(totalResult[0]?.count ?? 0);

    const undiscoveredRows = await db.select().from(undiscoveredAsset);
    const undiscoveredResponses = undiscoveredRows.map(serializeUndiscoveredAsset);

    return NextResponse.json({
      assets: records.map((row) => serializeAsset(row)),
      undiscoveredAssets: undiscoveredResponses,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    console.error("Failed to fetch assets", error);
    return NextResponse.json(
      { error: "Failed to fetch assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: "Manual asset creation is disabled",
      message: "Assets can only be created through Excel import. Please use the /api/assets/import endpoint to import assets from an Excel file.",
    },
    { status: 403 }
  );
}


