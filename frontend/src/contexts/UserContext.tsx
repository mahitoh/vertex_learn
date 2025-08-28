import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '@/lib/queryClient';

export type UserRole = 'student' | 'teacher' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profileImage?: string;
  studentId?: string;
  teacherId?: string;
  department?: string;
  class?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  isLoading: boolean;
  isStudent: boolean;
  isTeacher: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');
        const res = await fetch(`${baseUrl}/api/auth/me`, {
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.status === 401) {
          setUser(null);
          return;
        }
        const json = await res.json();
        const me = json?.data?.user as {
          user_id: number;
          email: string;
          role: 'admin' | 'student' | 'staff';
          first_name?: string;
          last_name?: string;
        } | undefined;
        if (me) {
          const mapped: User = {
            id: String(me.user_id),
            name: `${me.first_name ?? ''} ${me.last_name ?? ''}`.trim() || me.email,
            email: me.email,
            role: me.role === 'staff' ? 'teacher' : (me.role as User['role']),
          };
          setUser(mapped);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    loadMe();
  }, []);

  const isStudent = user?.role === 'student';
  const isTeacher = user?.role === 'teacher';
  const isAdmin = user?.role === 'admin';

  const login = async (email: string, password: string): Promise<User | null> => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const res = await apiRequest('POST', `${baseUrl}/api/auth/login`, { email, password });
    const json = await res.json();
    const token = json?.data?.token as string | undefined;
    if (token) localStorage.setItem('token', token);
    const me = json?.data?.user as {
      user_id: number;
      email: string;
      role: 'admin' | 'student' | 'staff';
      first_name?: string;
      last_name?: string;
    } | undefined;
    if (me) {
      const mapped: User = {
        id: String(me.user_id),
        name: `${me.first_name ?? ''} ${me.last_name ?? ''}`.trim() || me.email,
        email: me.email,
        role: me.role === 'staff' ? 'teacher' : (me.role as User['role']),
      };
      setUser(mapped);
      return mapped;
    }
    return null;
  };

  const logout = async () => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    await apiRequest('POST', `${baseUrl}/api/auth/logout`);
    setUser(null);
    localStorage.removeItem('token');
  };

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      isLoading,
      isStudent,
      isTeacher,
      isAdmin,
      login,
      logout
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