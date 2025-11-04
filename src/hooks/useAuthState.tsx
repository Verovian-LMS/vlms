
import { useState, useEffect } from 'react';
import { apiMe, getAccessToken } from "@/integrations/api/client";

// Define the user profile type
export type ProfileType = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  specialty?: string;
  bio?: string;
};

export const useAuthState = () => {
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [session, setSession] = useState<{ accessToken: string } | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch user profile from the backend
  const fetchProfile = async () => {
    try {
      const data = await apiMe();
      return data as unknown as ProfileType;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Initialize auth state from stored token
  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      setProfile(null);
      setUser(null);
      setSession(null);
      return;
    }

    setSession({ accessToken: token });
    setIsAuthenticated(true);
    fetchProfile().then(profileData => {
      setProfile(profileData);
      setUser(profileData ? { id: profileData.id, email: profileData.email ?? null } : null);
      setIsLoading(false);
    }).catch(() => {
      setIsAuthenticated(false);
      setIsLoading(false);
      setProfile(null);
      setUser(null);
      setSession(null);
    });
  }, []);

  return {
    user,
    profile,
    session,
    isAuthenticated,
    isLoading,
    setProfile
  };
};

export default useAuthState;
