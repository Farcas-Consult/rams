import { NextResponse } from "next/server";

import { db } from "@/db";
import { user } from "@/db/schema";

export async function GET() {
  const users = await db.select().from(user);
  return NextResponse.json(users);
}
