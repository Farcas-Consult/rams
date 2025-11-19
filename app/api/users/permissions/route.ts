import { NextRequest, NextResponse } from "next/server";

import {
  PERMISSION_GROUPS,
  ROLE_DEFAULT_PERMISSIONS,
  USER_ROLES,
  USER_STATUSES,
} from "@/lib/permissions";
import { requireUserWithPermission } from "@/lib/server/authz";
import { handleApiError } from "@/lib/server/errors";

export async function GET(request: NextRequest) {
  try {
    await requireUserWithPermission("users:read", request.headers);

    return NextResponse.json({
      roles: USER_ROLES,
      statuses: USER_STATUSES,
      groups: PERMISSION_GROUPS,
      defaults: ROLE_DEFAULT_PERMISSIONS,
    });
  } catch (error) {
    return handleApiError(error);
  }
}


