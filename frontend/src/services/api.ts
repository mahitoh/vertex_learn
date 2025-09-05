const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types
export interface User {
  id: string;
  name: string;
  email: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  salary?: number;
  role: {
    id: number;
    name: string;
    description: string;
  };
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organization?: string;
  department?: string;
  employeeId?: string;
  roleId?: number;
}

export interface PendingUser {
  id: string;
  name: string;
  email: string;
  employee_id?: string;
  department?: string;
  phone?: string;
  validation_status: 'pending' | 'approved' | 'rejected';
  validated_by?: string;
  validated_at?: string;
  created_at: string;
  role_name: string;
  role_description?: string;
}

// API Error class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to make API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // Add auth token if available
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || data.message || 'An error occurred',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Network or other errors
    throw new ApiError(
      'Network error or server unavailable',
      0,
      { originalError: error }
    );
  }
}

// Auth API functions
export const authApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(data: RegisterData): Promise<{ message: string; user: User }> {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCurrentUser(): Promise<{ user: User }> {
    return apiRequest('/auth/me');
  },

  async refreshToken(refreshToken: string): Promise<{ accessToken: string; user: User }> {
    return apiRequest('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  async logout(): Promise<{ message: string }> {
    return apiRequest('/auth/logout', {
      method: 'POST',
    });
  },
};

// Admin API functions
export const adminApi = {
  async getPendingUsers(): Promise<{ users: PendingUser[]; total: number }> {
    return apiRequest('/admin/pending-users');
  },

  async getAllUsers(params?: {
    page?: number;
    limit?: number;
    status?: string;
    role?: string;
  }): Promise<{
    users: PendingUser[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.role) searchParams.append('role', params.role);

    const query = searchParams.toString();
    return apiRequest(`/admin/users${query ? `?${query}` : ''}`);
  },

  async validateUser(
    userId: string,
    status: 'approved' | 'rejected',
    reason?: string
  ): Promise<{ message: string; user: any }> {
    return apiRequest(`/admin/users/${userId}/validate`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async getValidationStats(): Promise<{
    pending: number;
    approved: number;
    rejected: number;
  }> {
    return apiRequest('/admin/validation-stats');
  },
};

// Token management
export const tokenManager = {
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  },

  clearTokens(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  },
};