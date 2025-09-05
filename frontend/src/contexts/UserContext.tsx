import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, tokenManager, User as ApiUser } from '../services/api';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  studentId?: string;
  employeeId?: string;
  department?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  hireDate?: string;
  salary?: number;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: any) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate initials from name for profile image
  const generateInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  // Generate a profile image URL based on initials
  const generateProfileImage = (name: string): string => {
    const initials = generateInitials(name);
    // Using UI Avatars service to generate profile images with initials
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=ec4899&color=ffffff&size=100&font-size=0.6`;
  };

  // Convert API user to local user format
  const convertApiUser = (apiUser: ApiUser): User => ({
    id: apiUser.id,
    name: apiUser.name,
    email: apiUser.email,
    role: apiUser.role.name as UserRole,
    profileImage: generateProfileImage(apiUser.name),
    studentId: apiUser.employeeId, // Use employeeId as studentId for students
    employeeId: apiUser.employeeId,
    department: apiUser.department,
    phone: apiUser.phone,
    address: apiUser.address,
    dateOfBirth: apiUser.dateOfBirth,
    hireDate: apiUser.hireDate,
    salary: apiUser.salary,
  });

  // Load user from token on app start
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = tokenManager.getAccessToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        // Check if token is expired
        if (tokenManager.isTokenExpired(token)) {
          const refreshToken = tokenManager.getRefreshToken();
          if (refreshToken && !tokenManager.isTokenExpired(refreshToken)) {
            try {
              const response = await authApi.refreshToken(refreshToken);
              tokenManager.setTokens(response.accessToken, refreshToken);
              setUser(convertApiUser(response.user));
            } catch (error) {
              tokenManager.clearTokens();
            }
          } else {
            tokenManager.clearTokens();
          }
          setIsLoading(false);
          return;
        }

        // Get current user
        const response = await authApi.getCurrentUser();
        setUser(convertApiUser(response.user));
      } catch (error) {
        console.error('Failed to load user:', error);
        tokenManager.clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login(email, password);
      tokenManager.setTokens(response.accessToken, response.refreshToken);
      setUser(convertApiUser(response.user));
    } catch (error) {
      throw error; // Re-throw to handle in component
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      tokenManager.clearTokens();
      setUser(null);
    }
  };

  const register = async (data: any) => {
    try {
      const response = await authApi.register(data);
      // Don't auto-login after registration since user needs validation
      return response;
    } catch (error) {
      throw error; // Re-throw to handle in component
    }
  };

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isLoading,
      isStudent,
      isTeacher,
      isAdmin,
      login,
      logout,
      register,
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}