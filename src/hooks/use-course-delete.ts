
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from '@/lib/api/client';

export function useCourseDelete(user: any | null) {
  // Delete a course and all its related content
  const deleteCourse = async (courseId: string): Promise<void> => {
    try {
      // Delete the course using FastAPI client
      const response = await apiClient.deleteCourse(courseId);

      if (response.error) {
        throw new Error(`Failed to delete course: ${response.error}`);
      }

      toast({
        title: "Course Deleted",
        description: "Your course has been deleted successfully!"
      });

    } catch (error: any) {
      console.error("Error deleting course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive"
      });
      throw error;
    }
  };

  return useMutation<void, Error, string>({
    mutationFn: deleteCourse
  });
}
