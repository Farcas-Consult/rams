import {
  CreateUserInput,
  PaginatedUserResponse,
  PermissionCatalog,
  UpdateUserInput,
  UserQuery,
  UserResponse,
  UserStats,
  paginatedUserResponseSchema,
  permissionCatalogSchema,
  userResponseSchema,
  userStatsSchema,
} from "../schemas/user-schemas";

const API_BASE_URL = "/api/users";

export async function getUsers(
  query: UserQuery
): Promise<PaginatedUserResponse> {
  const searchParams = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.set(key, String(value));
  });

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `${API_BASE_URL}?${queryString}`
    : API_BASE_URL;

  const response = await fetch(endpoint, {
    method: "GET",
  });

  const payload = await parseJson(response);
  return paginatedUserResponseSchema.parse(payload);
}

export async function getUserById(
  id: string
): Promise<UserResponse | null> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "GET",
  });

  if (response.status === 404) {
    return null;
  }

  const payload = await parseJson(response);
  return userResponseSchema.parse(payload);
}

export async function createUser(
  data: CreateUserInput
): Promise<UserResponse> {
  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await parseJson(response);
  return userResponseSchema.parse(payload);
}

export async function updateUser(
  data: UpdateUserInput
): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/${data.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await parseJson(response);
  return userResponseSchema.parse(payload);
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    await parseJson(response); // throws with message
  }
}

export async function getUserStats(): Promise<UserStats> {
  const response = await fetch(`${API_BASE_URL}/stats`, {
    method: "GET",
  });

  const payload = await parseJson(response);
  return userStatsSchema.parse(payload);
}

export async function getPermissionCatalog(): Promise<PermissionCatalog> {
  const response = await fetch(`${API_BASE_URL}/permissions`, {
    method: "GET",
  });

  const payload = await parseJson(response);
  return permissionCatalogSchema.parse(payload);
}

async function parseJson(response: Response) {
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data && "message" in data
        ? (data as { message: string }).message
        : "Request failed";
    throw new Error(message);
  }

  return data;
}


