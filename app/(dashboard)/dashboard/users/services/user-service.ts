import {
  CreateUserInput,
  UpdateUserInput,
  UserQuery,
  PaginatedUserResponse,
  UserResponse,
} from "../schemas/user-schemas";

/**
 * User Service
 * 
 * This service handles all API calls related to users.
 * Currently returns dummy data - will be integrated with backend when database is ready.
 */

const API_BASE_URL = "/api/users"; // Will be used when backend is ready

/**
 * Generate dummy users for development
 */
const generateDummyUsers = (count: number = 10): UserResponse[] => {
  const names = [
    "John Doe", "Jane Smith", "Bob Johnson", "Alice Williams",
    "Charlie Brown", "Diana Prince", "Eve Adams", "Frank Miller",
    "Grace Lee", "Henry Wilson", "Ivy Chen", "Jack Taylor",
  ];

  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length] || `User ${i + 1}`;
    const email = `${name.toLowerCase().replace(/\s+/g, ".")}@example.com`;
    const createdAt = new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000);
    const updatedAt = new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);

    return {
      id: `user-${i + 1}`,
      name,
      email,
      emailVerified: Math.random() > 0.3, // 70% verified
      image: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}` : null,
      createdAt,
      updatedAt,
    };
  });
};

/**
 * Get all users with pagination and filters
 */
export const getUsers = async (
  query: UserQuery
): Promise<PaginatedUserResponse> => {
  // TODO: Replace with actual API call when backend is ready
  // const response = await fetch(`${API_BASE_URL}?${new URLSearchParams(query as any)}`);
  // return response.json();

  // Dummy implementation
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

  const allUsers = generateDummyUsers(50);
  const { page, pageSize, search, emailVerified, sortBy, sortOrder } = query;

  let filteredUsers = [...allUsers];

  // Apply search filter
  if (search) {
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
    );
  }

  // Apply email verified filter
  if (emailVerified !== undefined) {
    filteredUsers = filteredUsers.filter(
      (user) => user.emailVerified === emailVerified
    );
  }

  // Apply sorting
  if (sortBy) {
    filteredUsers.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "createdAt" || sortBy === "updatedAt") {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else {
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }

  // Apply pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  return {
    users: paginatedUsers,
    total: filteredUsers.length,
    page,
    pageSize,
    totalPages: Math.ceil(filteredUsers.length / pageSize),
  };
};

/**
 * Get a single user by ID
 */
export const getUserById = async (id: string): Promise<UserResponse | null> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/${id}`);
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const allUsers = generateDummyUsers(50);
  return allUsers.find((user) => user.id === id) || null;
};

/**
 * Create a new user
 */
export const createUser = async (
  data: CreateUserInput
): Promise<UserResponse> => {
  // TODO: Replace with actual API call
  // const response = await fetch(API_BASE_URL, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 500));

  const newUser: UserResponse = {
    id: `user-${Date.now()}`,
    name: data.name,
    email: data.email,
    emailVerified: data.emailVerified ?? false,
    image: data.image ?? null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return newUser;
};

/**
 * Update an existing user
 */
export const updateUser = async (
  data: UpdateUserInput
): Promise<UserResponse> => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/${data.id}`, {
  //   method: "PATCH",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data),
  // });
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 500));

  const existingUser = generateDummyUsers(1)[0];
  return {
    ...existingUser,
    ...data,
    id: data.id,
    updatedAt: new Date(),
  };
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (id: string): Promise<void> => {
  // TODO: Replace with actual API call
  // await fetch(`${API_BASE_URL}/${id}`, { method: "DELETE" });

  await new Promise((resolve) => setTimeout(resolve, 500));
};

/**
 * Get user statistics/KPIs
 */
export const getUserStats = async () => {
  // TODO: Replace with actual API call
  // const response = await fetch(`${API_BASE_URL}/stats`);
  // return response.json();

  await new Promise((resolve) => setTimeout(resolve, 300));

  const allUsers = generateDummyUsers(50);
  const verifiedCount = allUsers.filter((u) => u.emailVerified).length;
  const unverifiedCount = allUsers.length - verifiedCount;
  const newThisMonth = allUsers.filter((u) => {
    const created = new Date(u.createdAt);
    const now = new Date();
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    totalUsers: allUsers.length,
    verifiedUsers: verifiedCount,
    unverifiedUsers: unverifiedCount,
    newThisMonth,
    growthRate: 12.5, // Dummy percentage
  };
};

