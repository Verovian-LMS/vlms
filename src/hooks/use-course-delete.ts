
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useCourseDelete(user: User | null) {
  // Delete a course and all its related content
  const deleteCourse = async (courseId: string): Promise<void> => {
    try {
      // Due to cascade delete setup in Supabase, deleting the course
      // will automatically delete related modules and lectures
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

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
