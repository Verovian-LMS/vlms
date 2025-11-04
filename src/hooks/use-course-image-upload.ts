
import { toast } from "@/components/ui/use-toast";
import { apiClient } from '@/lib/api/client';
import { User } from '@/context/FastApiAuthContext';

export function useCourseImageUpload(user: User | null) {
  // Upload a course image to storage and get the public URL
  const uploadCourseImage = async (imageFile: File): Promise<string | null> => {
    if (!imageFile) return null;

    try {
      console.log('Starting course image upload process...');
      // Use FastAPI upload endpoint via apiClient
      const response = await apiClient.uploadFile(imageFile, 'course-images');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Failed to upload course image');
      }

      // apiClient returns a relative file_path; build absolute URL
      const API_BASE_URL = 'http://localhost:8000';
      const publicUrl = `${API_BASE_URL}${response.data.url}`;

      console.log('Image uploaded successfully, URL:', publicUrl);

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
