
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import { apiClient } from '@/lib/api/client';

export function useEnrollment(user: any | null) {
  // Handle course enrollment
  const enrollInCourse = useMutation({
    mutationFn: async (courseId: string): Promise<boolean> => {
      if (!user) {
        throw new Error("You must be logged in to enroll in a course");
      }

      try {
        // Enroll in course using FastAPI client
        const response = await apiClient.enrollInCourse(courseId);

        if (response.error) {
          // Check if already enrolled
          if (response.error.includes("already enrolled")) {
            toast({
              title: "Already Enrolled",
              description: "You are already enrolled in this course",
            });
            return true;
          }
          throw new Error(`Failed to enroll: ${response.error}`);
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

  // Update course progress - placeholder for now
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
        // TODO: Implement progress update endpoint in FastAPI backend
        console.log("Progress update not yet implemented in FastAPI backend", {
          courseId,
          progress,
          completed
        });
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
