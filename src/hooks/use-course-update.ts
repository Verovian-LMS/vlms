
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";
import type { Course } from "@/types/course";

type UpdateCourseVariables = {
  courseId: string;
  data: Partial<any>; // Using any for simplicity, but ideally would use a proper type
};

export function useCourseUpdate(user: User | null) {
  // Update an existing course
  const updateCourse = async ({ courseId, data }: UpdateCourseVariables): Promise<Course | null> => {
    try {
      // 1. Update course basic info
      const { data: response, error } = await supabase
        .from('courses')
        .update({
          title: data.title,
          description: data.description,
          long_description: data.longDescription,
          category: data.category,
          level: data.level,
          image_url: data.imagePreview,
          updated_at: new Date().toISOString()
        })
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw error;

      // 2. Update modules (if changed)
      if (data.modules && Array.isArray(data.modules)) {
        for (const module of data.modules) {
          if (!module) continue; // Skip if module is null or undefined
          
          if (module.id && module.id.startsWith('new_')) {
            // Create new module
            const { error: moduleError } = await supabase
              .from('modules')
              .insert({
                course_id: courseId,
                title: module.title || 'Untitled Module',
                description: module.description || '',
                sequence_order: data.modules.indexOf(module),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
            if (moduleError) throw moduleError;
          } else if (module.id) {
            // Update existing module
            const { error: moduleError } = await supabase
              .from('modules')
              .update({
                title: module.title || 'Untitled Module',
                description: module.description || '',
                sequence_order: data.modules.indexOf(module),
                updated_at: new Date().toISOString()
              })
              .eq('id', module.id);
            if (moduleError) throw moduleError;
          }

          // Update lectures for this module if they exist
          if (module.lectures && Array.isArray(module.lectures)) {
            for (const lecture of module.lectures) {
              if (!lecture) continue; // Skip if lecture is null or undefined
              
              if (lecture.id && lecture.id.startsWith('new_')) {
                // Create new lecture
                const { error: lectureError } = await supabase
                  .from('lectures')
                  .insert({
                    module_id: module.id,
                    title: lecture.title || 'Untitled Lecture',
                    description: lecture.description || '',
                    video_url: lecture.videoUrl || '',
                    duration_minutes: lecture.duration || 0,
                    duration: lecture.duration || 0, // Add the duration field as well
                    notes: lecture.notes || '', // Ensure notes field is populated
                    sequence_order: module.lectures.indexOf(lecture),
                    content_type: 'video',
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });
                if (lectureError) throw lectureError;
              } else if (lecture.id) {
                // Update existing lecture
                const { error: lectureError } = await supabase
                  .from('lectures')
                  .update({
                    title: lecture.title || 'Untitled Lecture',
                    description: lecture.description || '',
                    video_url: lecture.videoUrl || '',
                    duration_minutes: lecture.duration || 0,
                    duration: lecture.duration || 0, // Update both duration fields
                    notes: lecture.notes || '', // Ensure notes field is populated
                    sequence_order: module.lectures.indexOf(lecture),
                    updated_at: new Date().toISOString()
                  })
                  .eq('id', lecture.id);
                if (lectureError) throw lectureError;
              }
            }
          }
        }
      }

      toast({
        title: "Course Updated",
        description: "Your course has been updated successfully!"
      });

      return response;

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
