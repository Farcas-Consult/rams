/**
 * API Client for communicating with the .NET API
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5001/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ data: T; headers: Headers }> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle empty responses (204 No Content)
      if (response.status === 204) {
        return { data: undefined as T, headers: response.headers };
      }

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const errorMessage =
          data.detail ||
          data.title ||
          data.message ||
          `Request failed with status ${response.status}`;
        throw new ApiError(errorMessage, response.status, data);
      }

      return { data: data as T, headers: response.headers };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      if (error instanceof Error) {
        throw new ApiError(
          `Network error: ${error.message}`,
          0,
          error
        );
      }
      throw new ApiError("Unknown error occurred", 0);
    }
  }

  async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    const result = await this.request<T>(url, { method: "GET" });
    return result.data;
  }

  async getWithHeaders<T>(
    endpoint: string,
    params?: Record<string, unknown>
  ): Promise<{ data: T; headers: Headers }> {
    let url = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    return this.request<T>(url, { method: "GET" });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
    return result.data;
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
    return result.data;
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    const result = await this.request<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
    return result.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const result = await this.request<T>(endpoint, { method: "DELETE" });
    return result.data;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

