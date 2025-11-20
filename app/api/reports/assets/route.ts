import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import { asset } from "@/db/schema";

export async function GET() {
  try {
    // Fetch all assets (excluding decommissioned unless needed)
    // For reports, we might want all assets, so we'll fetch all
    const assets = await db
      .select()
      .from(asset)
      .where(eq(asset.isDecommissioned, false));

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("Failed to fetch assets for reports", error);
    return NextResponse.json(
      { error: "Failed to fetch assets for reports" },
      { status: 500 }
    );
  }
}

