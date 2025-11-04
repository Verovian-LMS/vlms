
import { useToast } from "@/hooks/use-toast";
import { ProfileType } from './useAuthState';
import { apiLogin, apiRegister, apiMe, setAccessToken } from "@/integrations/api/client";

export const useAuthMethods = (setProfile: (profile: ProfileType | null) => void) => {
  const { toast } = useToast();

  // Fetch profile from FastAPI
  const fetchProfile = async (): Promise<ProfileType | null> => {
    try {
      const profile = await apiMe();
      return profile as unknown as ProfileType;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const token = await apiLogin({ email, password });
      setAccessToken(token.access_token);
      const profileData = await fetchProfile();
      setProfile(profileData);
    } catch (error: any) {
      console.error("Login error:", error.message);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Signup function
  const signup = async (email: string, password: string, role: 'student' | 'creator') => {
    const name = email.split('@')[0];
    const token = await apiRegister({ name, email, password });
    setAccessToken(token.access_token);
    const profileData = await fetchProfile();
    setProfile(profileData);
  };

  // Logout function
  const logout = async () => {
    try {
      setAccessToken(null);
      setProfile(null);
    } catch (error: any) {
      console.error("Logout error:", error.message);
      toast({
        title: "Logout failed",
        description: error.message || "There was an error signing out.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Update profile function
  const updateProfile = async (_updates: Partial<ProfileType>) => {
    // Not implemented in backend yet; no-op to comply with constitution
    const current = await fetchProfile();
    setProfile(current);
  };

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};

export default useAuthMethods;
