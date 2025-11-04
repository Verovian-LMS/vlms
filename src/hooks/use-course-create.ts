
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import type { CourseFormState, Course } from "@/types/course";
import { apiClient } from '@/lib/api/client';

export function useCourseCreate(user: any | null) {
  // Create a new course with basic info only (no modules)
  const createCourse = async (courseData: CourseFormState): Promise<Course | null> => {
    console.log("Creating course with basic data:", courseData);

    try {
      if (!user) {
        throw new Error("You must be logged in to create a course");
      }
      
      // 1. Create the course with basic information
      const response = await apiClient.createCourse({
        title: courseData.title,
        description: courseData.description || '',
        long_description: courseData.longDescription || '',
        status: 'draft', // Start as draft until modules are added
        image_url: courseData.imagePreview || null,
        category: courseData.category,
        level: courseData.level.toLowerCase(),
      });

      if (response.error) {
        console.error("Error creating course:", response.error);
        throw new Error(`Failed to create course: ${response.error}`);
      }

      const courseResponse = response.data;
      console.log("Course created successfully:", courseResponse);
      
      // Return the course without creating modules in this phase
      toast({
        title: "Course Created Successfully",
        description: "Your course has been created. Now you can add modules and lessons."
      });

      return courseResponse;

    } catch (error: any) {
      console.error("Error in course creation:", error);
      toast({
        title: "Course Creation Failed",
        description: error.message || "Failed to create course. Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return useMutation<Course | null, Error, CourseFormState>({
    mutationFn: createCourse
  });
}
