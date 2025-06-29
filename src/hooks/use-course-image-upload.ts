
import { supabase, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { toast } from "@/components/ui/use-toast";
import { User } from '@supabase/supabase-js';

export function useCourseImageUpload(user: User | null) {
  // Upload a course image to storage and get the public URL
  const uploadCourseImage = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      console.log('Starting course image upload process...');

      // Get User Auth Token
      let token: string | null = null;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        if (!session?.access_token) throw new Error("User not authenticated or session expired.");
        token = session.access_token;
      } catch (error: any) {
        console.error("Authentication Error:", error);
        toast({ title: 'Authentication Error', description: error.message || 'Could not get user session for upload.', variant: 'destructive' });
        return null;
      }

      // Create a unique file path for the image
      const fileExt = imageFile.name.split('.').pop();
      const filePath = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      console.log(`Uploading image to path: ${filePath}`);

      // Upload the image to the course-images bucket with proper headers
      const { error: uploadError } = await supabase.storage
        .from('course-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false,
          headers: {
            authorization: `Bearer ${token}`,
            apikey: SUPABASE_PUBLISHABLE_KEY,
            'x-upsert': 'true',
          }
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error(`Error uploading image: ${uploadError.message}`);
      }

      // Get the public URL for the uploaded image
      const { data: { publicUrl } } = supabase.storage
        .from('course-images')
        .getPublicUrl(filePath);

      console.log('Image uploaded successfully, public URL:', publicUrl);

      return publicUrl;
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: 'Image Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { uploadCourseImage };
}
