
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import type { Course } from "@/types/course";
import { apiClient } from '@/lib/api/client';

type UpdateCourseVariables = {
  courseId: string;
  data: Partial<any>; // Using any for simplicity, but ideally would use a proper type
};

export function useCourseUpdate(user: any | null) {
  // Update an existing course
  const updateCourse = async ({ courseId, data }: UpdateCourseVariables): Promise<Course | null> => {
    try {
      // 1. Update course basic info
      const response = await apiClient.updateCourse(courseId, {
        title: data.title,
        description: data.description,
        long_description: data.longDescription,
        category: data.category,
        level: data.level,
        image_url: data.imagePreview,
      });

      if (response.error) {
        throw new Error(`Failed to update course: ${response.error}`);
      }

      // 2. Update modules (if changed)
      if (data.modules && Array.isArray(data.modules)) {
        for (const module of data.modules) {
          if (!module) continue; // Skip if module is null or undefined
          
          if (module.id && module.id.startsWith('new_')) {
            // Create new module
            const moduleResponse = await apiClient.createCourseModule(courseId, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: data.modules.indexOf(module),
            });
            if (moduleResponse.error) throw new Error(`Failed to create module: ${moduleResponse.error}`);
          } else if (module.id) {
            // Update existing module
            const moduleResponse = await apiClient.updateCourseModule(courseId, module.id, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: data.modules.indexOf(module),
            });
            if (moduleResponse.error) throw new Error(`Failed to update module: ${moduleResponse.error}`);
          }

          // Update lessons for this module if they exist
          if (module.lessons && Array.isArray(module.lessons)) {
            for (const lesson of module.lessons) {
              if (!lesson) continue; // Skip if lesson is null or undefined

              const commonPayload = {
                title: lesson.title || 'Untitled Lesson',
                description: lesson.description || '',
                video_url: lesson.videoUrl || '',
                pdf_url: lesson.pdfUrl || '',
                slides_url: lesson.slidesUrl || '',
                audio_url: lesson.audioUrl || '',
                document_url: lesson.documentUrl || '',
                interactive_url: lesson.interactiveUrl || '',
                downloadable_url: lesson.downloadableUrl || '',
                duration: lesson.duration || 0,
                notes: lesson.notes || '',
                sequence_order: module.lessons.indexOf(lesson),
                content_type: lesson.contentType || 'video',
              };

              if (lesson.id && lesson.id.startsWith('new_')) {
                // Create new lesson
                const createResponse = await apiClient.createModuleLesson(module.id, commonPayload);
                if (createResponse.error) throw new Error(`Failed to create lesson: ${createResponse.error}`);
              } else if (lesson.id) {
                // Update existing lesson
                const updateResponse = await apiClient.updateLesson(lesson.id, commonPayload);
                if (updateResponse.error) throw new Error(`Failed to update lesson: ${updateResponse.error}`);
              }
            }
          }
        }
      }

      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully!"
      });

      return response.data;

    } catch (error: any) {
      console.error("Error updating course:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update course",
        variant: "destructive"
      });
      throw error;
    }
  };

  return useMutation({
    mutationFn: updateCourse
  });
}
