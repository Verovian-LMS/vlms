
import { Dispatch, SetStateAction } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { CourseType } from '@/types/course';

export function useCoursesQuery(
  setCourses: Dispatch<SetStateAction<CourseType[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<Error | null>>
) {
  const { toast } = useToast();

  // Fetch all published courses
  const fetchCourses = async () => {
    setIsLoading(true);
    
    try {
      // First get courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          status,
          image_url,
          category,
          author_id,
          created_at,
          updated_at,
          profiles:author_id(name, avatar)
        `)
        .order('created_at', { ascending: false });
      
      if (coursesError) {
        throw coursesError;
      }

      // Safely handle coursesData being null
      if (!coursesData) {
        setCourses([]);
        return;
      }

      // For each course, safely get module and lecture counts
      const coursesWithCounts = await Promise.all(
        coursesData.map(async (course) => {
          try {
            // Count modules
            const { data: modules, error: moduleError } = await supabase
              .from('modules')
              .select('id')
              .eq('course_id', course.id);

            if (moduleError) {
              console.error('Error fetching module count:', moduleError);
              return {
                ...course,
                moduleCount: 0,
                lectureCount: 0
              };
            }

            const moduleCount = modules ? modules.length : 0;
            
            // Count lectures using a single query with IN operator if we have modules
            let lectureCount = 0;
            
            if (moduleCount > 0) {
              const moduleIds = modules.map(m => m.id);
              
              const { data: lectures, error: lectureError } = await supabase
                .from('lectures')
                .select('id')
                .in('module_id', moduleIds);
                
              if (lectureError) {
                console.error('Error fetching lecture count:', lectureError);
              } else {
                lectureCount = lectures ? lectures.length : 0;
              }
            }

            return {
              ...course,
              moduleCount: moduleCount,
              lectureCount: lectureCount
            };
          } catch (error) {
            console.error(`Error processing course ${course.id}:`, error);
            return {
              ...course,
              moduleCount: 0,
              lectureCount: 0
            };
          }
        })
      );

      // Transform the data to match CourseType structure
      const transformedData: CourseType[] = coursesWithCounts.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        status: (course.status as "draft" | "published" | "archived") || "draft",
        image_url: course.image_url,
        modules: course.moduleCount || 0,
        lectures: course.lectureCount || 0,
        author_id: course.author_id,
        created_at: course.created_at,
        updated_at: course.updated_at,
        category: course.category,
        author: course.profiles ? {
          name: course.profiles.name,
          avatar: course.profiles.avatar
        } : undefined
      }));

      setCourses(transformedData);
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      setError(error);
      toast({
        title: 'Error fetching courses',
        description: error.message || 'Failed to load courses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single course by ID with module and lecture details
  const fetchCourse = async (courseId: string) => {
    setIsLoading(true);
    
    try {
      if (!courseId) {
        throw new Error("Invalid course ID");
      }
      
      // First get course
      const { data, error } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          description,
          status,
          image_url,
          category,
          author_id,
          created_at,
          updated_at,
          profiles:author_id(name, avatar)
        `)
        .eq('id', courseId)
        .single();
      
      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error("Course not found");
      }

      // Count modules
      const { data: modules, error: moduleError } = await supabase
        .from('modules')
        .select('id')
        .eq('course_id', data.id);

      if (moduleError) {
        console.error('Error fetching modules:', moduleError);
      }

      const moduleCount = modules ? modules.length : 0;
      
      // Count lectures if we have modules
      let lectureCount = 0;
      
      if (moduleCount > 0) {
        const moduleIds = modules.map(m => m.id);
        
        const { data: lectures, error: lectureError } = await supabase
          .from('lectures')
          .select('id')
          .in('module_id', moduleIds);
          
        if (lectureError) {
          console.error('Error fetching lectures:', lectureError);
        } else {
          lectureCount = lectures ? lectures.length : 0;
        }
      }

      // Transform to match CourseType
      const transformedData: CourseType = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: (data.status as "draft" | "published" | "archived") || "draft",
        image_url: data.image_url,
        modules: moduleCount,
        lectures: lectureCount,
        author_id: data.author_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        category: data.category,
        author: data.profiles ? {
          name: data.profiles.name,
          avatar: data.profiles.avatar
        } : undefined
      };

      return transformedData;
    } catch (error: any) {
      console.error('Error fetching course:', error);
      toast({
        title: 'Error fetching course',
        description: error.message || 'Failed to load course details',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch user's course progress
  const fetchCourseProgress = async (courseId: string, userId: string | undefined) => {
    if (!userId || !courseId) return 0;
    
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('progress')
        .eq('user_id', userId)
        .eq('course_id', courseId)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching course progress:', error);
        return 0;
      }

      return data?.progress || 0;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      return 0;
    }
  };

  return {
    fetchCourses,
    fetchCourse,
    fetchCourseProgress,
  };
}
