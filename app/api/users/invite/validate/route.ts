import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";

import { db, schema } from "@/db";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { message: "Invitation token is required" },
      { status: 400 }
    );
  }

  const [user] = await db
    .select({
      id: schema.user.id,
      email: schema.user.email,
      name: schema.user.name,
      status: schema.user.status,
      invitationExpiresAt: schema.user.invitationExpiresAt,
    })
    .from(schema.user)
    .where(eq(schema.user.invitationToken, token))
    .limit(1);

  if (!user) {
    return NextResponse.json(
      { message: "Invitation not found" },
      { status: 404 }
    );
  }

  if (user.status !== "invited") {
    return NextResponse.json(
      { message: "Invitation already used" },
      { status: 409 }
    );
  }

  if (
    user.invitationExpiresAt &&
    user.invitationExpiresAt.getTime() < Date.now()
  ) {
    return NextResponse.json(
      { message: "Invitation has expired" },
      { status: 410 }
    );
  }

  return NextResponse.json({
    email: user.email,
    name: user.name,
  });
}

