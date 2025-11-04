
import { Dispatch, SetStateAction } from 'react';
import { useToast } from './use-toast';
import { CourseType } from '@/types/course';
import { apiClient } from '@/lib/api/client';

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
      const response = await apiClient.getCourses();
      
      if (response.error) {
        throw new Error(response.error);
      }

      const coursesData = response.data || [];

      // Transform the data to match CourseType structure (use lesson_count)
      const transformedData: CourseType[] = coursesData.map(course => ({
        id: course.id,
        title: course.title,
        description: course.description,
        status: (course.status as "draft" | "published" | "archived") || "draft",
        image_url: course.image_url,
        modules: course.module_count || 0,
        lessons: course.lesson_count || 0,
        author_id: course.author_id,
        created_at: course.created_at,
        updated_at: course.updated_at,
        category: course.category,
        author: course.author ? {
          name: course.author.name,
          avatar: course.author.avatar
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

  // Fetch a single course by ID with module and lesson details
  const fetchCourse = async (courseId: string) => {
    setIsLoading(true);
    
    try {
      if (!courseId) {
        throw new Error("Invalid course ID");
      }
      
      const response = await apiClient.getCourse(courseId);
      
      if (response.error) {
        throw new Error(response.error);
      }

      const data = response.data;
      
      if (!data) {
        throw new Error("Course not found");
      }

      // Transform to match CourseType (use lesson_count)
      const transformedData: CourseType = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: (data.status as "draft" | "published" | "archived") || "draft",
        image_url: data.image_url,
        modules: data.module_count || 0,
        lessons: data.lesson_count || 0,
        author_id: data.author_id,
        created_at: data.created_at,
        updated_at: data.updated_at,
        category: data.category,
        author: data.author ? {
          name: data.author.name,
          avatar: data.author.avatar
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
      const response = await apiClient.getCourseProgress(courseId);
      return response.data?.progress || 0;
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
