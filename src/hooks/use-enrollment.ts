
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export function useEnrollment(user: User | null) {
  // Handle course enrollment
  const enrollInCourse = useMutation({
    mutationFn: async (courseId: string): Promise<boolean> => {
      if (!user) {
        throw new Error("You must be logged in to enroll in a course");
      }

      try {
        // Check if already enrolled
        const { data: existingEnrollment, error: checkError } = await supabase
          .from('enrollments')
          .select('id')
          .eq('user_id', user.id)
          .eq('course_id', courseId)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking enrollment:", checkError);
          throw checkError;
        }

        if (existingEnrollment) {
          console.log("User already enrolled in this course:", existingEnrollment);
          toast({
            title: "Already Enrolled",
            description: "You are already enrolled in this course",
          });
          return true; // Return true since user is already enrolled
        }

        // Create new enrollment
        const { error: enrollError } = await supabase
          .from('enrollments')
          .insert({
            user_id: user.id,
            course_id: courseId,
            enrollment_date: new Date().toISOString().split('T')[0],
            progress: 0,
            completion_status: 'not_started',
            last_accessed: new Date().toISOString().split('T')[0]
          });

        if (enrollError) {
          console.error("Error enrolling in course:", enrollError);
          throw enrollError;
        }

        toast({
          title: "Enrolled Successfully",
          description: "You have been enrolled in the course",
        });

        return true;
      } catch (error: any) {
        console.error("Error enrolling in course:", error);
        toast({
          title: "Enrollment Failed",
          description: error.message || "Failed to enroll in course",
          variant: "destructive"
        });
        return false;
      }
    }
  });

  // Update course progress
  const updateCourseProgress = useMutation({
    mutationFn: async ({ 
      courseId, 
      progress, 
      completed = false 
    }: { 
      courseId: string; 
      progress: number; 
      completed?: boolean; 
    }): Promise<boolean> => {
      if (!user) {
        throw new Error("You must be logged in to update progress");
      }

      try {
        const { error } = await supabase
          .from('enrollments')
          .update({
            progress,
            completion_status: completed ? 'completed' : 'in_progress',
            completion_date: completed ? new Date().toISOString().split('T')[0] : null,
            last_accessed: new Date().toISOString().split('T')[0]
          })
          .eq('user_id', user.id)
          .eq('course_id', courseId);

        if (error) throw error;
        return true;
      } catch (error: any) {
        console.error("Error updating course progress:", error);
        return false;
      }
    }
  });

  return {
    enrollInCourse,
    updateCourseProgress
  };
}
