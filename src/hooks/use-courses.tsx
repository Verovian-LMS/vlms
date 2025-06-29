
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from './use-toast';
import { useCoursesQuery } from './use-courses-query';
import { useCourseMutations } from './use-course-mutations';
import { CourseType } from '@/types/course';

// Define the correct ToastAPI interface to match what's expected by useCourseMutations
interface ToastAPI {
  toast: (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => void;
}

export function useCourses() {
  const [courses, setCourses] = useState<CourseType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Create the toast wrapper that matches the expected interface
  const toastAPI: ToastAPI = {
    toast: ({ title, description, variant }) => {
      toast({
        title,
        description,
        variant,
      });
    },
  };
  
  // Import query functions
  const { 
    fetchCourses: queryFetchCourses,
    fetchCourse: queryFetchCourse,
    fetchCourseProgress,
  } = useCoursesQuery(setCourses, setIsLoading, setError);
  
  // Import mutation functions
  const {
    uploadCourseImage,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    updateCourseProgress,
  } = useCourseMutations(user, toastAPI);

  // Load courses on initial mount
  useEffect(() => {
    queryFetchCourses();
  }, []);

  return {
    courses,
    isLoading,
    error,
    fetchCourses: queryFetchCourses,
    fetchCourse: queryFetchCourse,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    fetchCourseProgress,
    updateCourseProgress,
    uploadCourseImage,
  };
}
