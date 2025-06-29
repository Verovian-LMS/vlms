
import { User } from '@supabase/supabase-js';
import type { ToastAPI } from "@/types/ui";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCourseImageUpload } from './use-course-image-upload';
import { useCourseCreate } from './use-course-create';
import { useCourseUpdate } from './use-course-update';
import { useCourseDelete } from './use-course-delete';
import { useEnrollment } from './use-enrollment';

export function useCourseMutations(
  user: User | null,
  toastAPI?: ToastAPI
) {
  // Use provided toast API or default to hooks
  const hookToast = useToast();
  const { toast } = toastAPI || hookToast;

  // Safely initialize hooks with try/catch to prevent fatal errors
  const uploadCourseImage = (() => {
    try {
      // Only attempt to use hooks if user exists
      if (user) {
        const uploadHook = useCourseImageUpload(user);
        return uploadHook?.uploadCourseImage;
      }
      return null;
    } catch (err) {
      console.error("Error initializing useCourseImageUpload:", err);
      return null;
    }
  })();

  const createCourse = (() => {
    try {
      if (user) {
        return useCourseCreate(user);
      }
      return null;
    } catch (err) {
      console.error("Error initializing useCourseCreate:", err);
      return null;
    }
  })();

  const updateCourse = (() => {
    try {
      if (user) {
        return useCourseUpdate(user);
      }
      return null;
    } catch (err) {
      console.error("Error initializing useCourseUpdate:", err);
      return null;
    }
  })();

  const deleteCourse = (() => {
    try {
      if (user) {
        return useCourseDelete(user);
      }
      return null;
    } catch (err) {
      console.error("Error initializing useCourseDelete:", err);
      return null;
    }
  })();

  const { enrollInCourse, updateCourseProgress } = (() => {
    try {
      if (user) {
        const enrollmentHook = useEnrollment(user);
        return {
          enrollInCourse: enrollmentHook?.enrollInCourse,
          updateCourseProgress: enrollmentHook?.updateCourseProgress
        };
      }
      return { enrollInCourse: null, updateCourseProgress: null };
    } catch (err) {
      console.error("Error initializing useEnrollment:", err);
      return { enrollInCourse: null, updateCourseProgress: null };
    }
  })();

  return {
    uploadCourseImage,
    createCourse,
    updateCourse,
    deleteCourse,
    enrollInCourse,
    updateCourseProgress,
  };
}
