
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ProfileType } from './useAuthState';

export const useAuthMethods = (setProfile: (profile: ProfileType | null) => void) => {
  const { toast } = useToast();

  // Fetch user profile from the database
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      return data as ProfileType;
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      return null;
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        const profileData = await fetchProfile(data.user.id);
        setProfile(profileData);
      }
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
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role // Store role in auth metadata
        }
      }
    });

    if (error) throw error;

    // Create profile with role
    await supabase
      .from('profiles')
      .upsert({
        id: data.user?.id,
        role
      });
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
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
  const updateProfile = async (updates: Partial<ProfileType>) => {
    try {
      // Fix: Use getUser() to get the current user data
      const { data, error: userError } = await supabase.auth.getUser();
      
      if (userError || !data.user) {
        throw new Error("User must be logged in to update profile");
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', data.user.id);

      if (error) {
        throw error;
      }

      // Update local state by fetching the updated profile
      const updatedProfile = await fetchProfile(data.user.id);
      setProfile(updatedProfile);

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    } catch (error: any) {
      console.error("Profile update error:", error.message);
      toast({
        title: "Update failed",
        description: error.message || "There was an error updating your profile.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    login,
    signup,
    logout,
    updateProfile
  };
};

export default useAuthMethods;
