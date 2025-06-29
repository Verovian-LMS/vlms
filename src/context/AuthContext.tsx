
import React, { createContext, useContext } from 'react';
import useAuthState, { ProfileType } from '@/hooks/useAuthState';
import useAuthMethods from '@/hooks/useAuthMethods';
import { Session, User } from '@supabase/supabase-js';

// Define the auth context type
type AuthContextType = {
  user: User | null;
  profile: ProfileType | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, role: 'student' | 'creator') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<ProfileType>) => Promise<void>;
};

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, session, isAuthenticated, isLoading, setProfile } = useAuthState();
  const { login, signup, logout, updateProfile } = useAuthMethods(setProfile);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
    </div>;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
