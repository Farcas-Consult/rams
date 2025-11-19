import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(message: string, public status: number = 500) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(message, 404);
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(message, 400);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validation failed",
        issues: error.issues,
      },
      { status: 422 }
    );
  }

  console.error("[api] Unexpected error", error);
  return NextResponse.json(
    { message: "Internal server error" },
    { status: 500 }
  );
}


