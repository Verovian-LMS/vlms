import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '@/lib/api/client';

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: 'student' | 'instructor' | 'admin';
}

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: 'student' | 'creator';
  bio?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: { access_token: string } | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'student' | 'creator') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
}

const FastApiAuthContext = createContext<AuthContextType | undefined>(undefined);

export function FastApiAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<{ access_token: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user && !!session;

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        apiClient.setToken(token);
        setSession({ access_token: token });
        
        // Try to get current user
        const { data: userData, error } = await apiClient.getCurrentUser();
        if (userData && !error) {
          setUser(userData);
          // Create a basic profile from user data
          setProfile({
            id: userData.id,
            user_id: userData.id,
            name: userData.name || userData.email,
            role: userData.role || 'student',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } else {
          // Token is invalid, clear it
          apiClient.clearToken();
          setSession(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.login(email, password);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setUser(data.user);
        setSession({ access_token: data.access_token });
        // Create a basic profile from user data
        setProfile({
          id: data.user.id,
          user_id: data.user.id,
          name: data.user.name || data.user.email,
          role: data.user.role || 'student',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: 'student' | 'creator'): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await apiClient.register(email, password, name, role);
      
      if (error) {
        throw new Error(error);
      }

      if (data) {
        setUser({ ...data.user, name, role });
        setSession({ access_token: data.access_token });
        // Use the profile data returned from the backend
        setProfile({
          id: data.user.id,
          user_id: data.user.id,
          name: data.user.name || name,
          role: data.user.role || role,
          bio: data.user.bio,
          avatar_url: data.user.avatar,
          created_at: data.user.created_at,
          updated_at: data.user.updated_at,
        });
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setProfile(null);
      setSession(null);
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>): Promise<void> => {
    if (!profile) return;
    
    try {
      // For now, just update locally since we don't have the backend endpoint yet
      setProfile({ ...profile, ...updates, updated_at: new Date().toISOString() });
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return (
    <FastApiAuthContext.Provider value={value}>
      {children}
    </FastApiAuthContext.Provider>
  );
}

export function useFastApiAuth() {
  const context = useContext(FastApiAuthContext);
  if (context === undefined) {
    throw new Error('useFastApiAuth must be used within a FastApiAuthProvider');
  }
  return context;
}

// Alias for compatibility with existing components
export const useAuth = useFastApiAuth;

export default FastApiAuthContext;