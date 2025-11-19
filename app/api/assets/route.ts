import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { and, asc, desc, ilike, or, sql, type SQL } from "drizzle-orm";

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

    if (search) {
      const likeValue = `%${search}%`;
      filters.push(
        or(
          ilike(asset.assetName, likeValue),
          ilike(asset.assetTag, likeValue),
          ilike(asset.serialNumber, likeValue),
          ilike(asset.description, likeValue)
        )
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
      assets: records.map(serializeAsset),
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
  try {
    const payload = await request.json();
    const parsed = createAssetSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid asset payload", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const now = new Date();
    const newAsset = {
      id: randomUUID(),
      plnt: parsed.data.plnt ?? null,
      equipment: parsed.data.equipment ?? parsed.data.assetTag ?? null,
      material: parsed.data.material ?? null,
      materialDescription: parsed.data.materialDescription ?? null,
      techIdentNo: parsed.data.techIdentNo ?? null,
      assetTag: parsed.data.assetTag ?? parsed.data.equipment ?? null,
      assetName: parsed.data.assetName,
      category: parsed.data.category ?? null,
      location: parsed.data.location ?? null,
      status: parsed.data.status,
      assignedTo: parsed.data.assignedTo ?? null,
      purchaseDate: parsed.data.purchaseDate ? new Date(parsed.data.purchaseDate) : null,
      purchasePrice: parsed.data.purchasePrice ?? parsed.data.acquistnValue ?? null,
      serialNumber: parsed.data.serialNumber ?? parsed.data.manufSerialNumber ?? null,
      manufacturer: parsed.data.manufacturer ?? null,
      model: parsed.data.model ?? null,
      description: parsed.data.description ?? parsed.data.materialDescription ?? null,
      manufSerialNumber: parsed.data.manufSerialNumber ?? null,
      sysStatus: parsed.data.sysStatus ?? null,
      userStatusRaw: parsed.data.userStatusRaw ?? null,
      sLoc: parsed.data.sLoc ?? null,
      pfUserAc: parsed.data.pfUserAc ?? null,
      pfUserAccountableDescription: parsed.data.pfUserAccountableDescription ?? null,
      pfPropMg: parsed.data.pfPropMg ?? null,
      pfPropMgmFocalPointDescription: parsed.data.pfPropMgmFocalPointDescription ?? null,
      functionalLoc: parsed.data.functionalLoc ?? null,
      functionalLocDescription: parsed.data.functionalLocDescription ?? null,
      aGrp: parsed.data.aGrp ?? null,
      busA: parsed.data.busA ?? null,
      objectType: parsed.data.objectType ?? null,
      costCtr: parsed.data.costCtr ?? null,
      acquistnValue: parsed.data.acquistnValue ?? null,
      comment: parsed.data.comment ?? null,
      origin: parsed.data.origin ?? "inventory",
      discoveryStatus: parsed.data.discoveryStatus ?? "catalogued",
      isDecommissioned:
        parsed.data.isDecommissioned ?? parsed.data.status === "Decommissioned",
      decommissionedAt:
        parsed.data.isDecommissioned || parsed.data.status === "Decommissioned"
          ? now
          : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(asset).values(newAsset);

    return NextResponse.json(serializeAsset(newAsset));
  } catch (error) {
    console.error("Failed to create asset", error);
    return NextResponse.json(
      { error: "Failed to create asset" },
      { status: 500 }
    );
  }
}


