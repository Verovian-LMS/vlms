
import { apiClient } from '@/lib/api-client';
import { CourseFormValues } from '@/types/course';

// Create a new course
export const createCourse = async (values: CourseFormValues) => {
  try {
    console.log("Starting course creation process with FastAPI...");
    
    // Upload image if provided
    let imageUrl = null;
    if (values.imageFile) {
      const formData = new FormData();
      formData.append('file', values.imageFile);
      
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
      const token = localStorage.getItem('auth_token');
      const imageUploadResponse = await fetch(`${API_BASE_URL}/api/v1/files/upload/course-image`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload course image');
      }
      
      const imageData = await imageUploadResponse.json();
      imageUrl = `${API_BASE_URL}${imageData.file_path}`;
      console.log("Image uploaded successfully:", imageUrl);
    } else if (values.imagePreview && values.imagePreview.startsWith('data:')) {
      // Handle base64 image data if needed
      console.log("Base64 image detected, will need server-side processing");
      // For now, we'll skip this and rely on the backend to handle it
    }
    
    // Create course in FastAPI backend
    const courseResponse = await apiClient.post('/api/v1/courses/', {
      title: values.title,
      description: values.description,
      long_description: values.longDescription,
      category: values.category,
      level: values.level,
      image_url: imageUrl,
      status: 'draft'
    });
    
    // apiClient.post returns parsed JSON directly (no { data, error } wrapper)
    const courseData = courseResponse as any;
    if (!courseData || !courseData.id) {
      throw new Error('Failed to create course: no course data returned');
    }
    console.log("Course record created:", courseData);
    
    // Create modules and lessons if provided
    if (values.modules && values.modules.length > 0) {
      console.log(`Creating ${values.modules.length} modules for course ${courseData.id}`);
      
      for (let moduleIndex = 0; moduleIndex < values.modules.length; moduleIndex++) {
        const module = values.modules[moduleIndex];
        
        // Create module
        const moduleResponse = await apiClient.post(`/api/v1/courses/${courseData.id}/modules`, {
          title: module.title,
          description: module.description || '',
          sequence_order: moduleIndex
        });
        
        // moduleResponse is the module JSON
        const moduleData = moduleResponse as any;
        console.log(`Created module ${moduleData.id} for course ${courseData.id}`);
        
        // Create lessons for this module (use new lessons shape only)
        const lessons = (module as any).lessons || [];
        if (lessons && lessons.length > 0) {
          console.log(`Creating ${lessons.length} lessons for module ${moduleData.id}`);
          
          for (let lessonIndex = 0; lessonIndex < lessons.length; lessonIndex++) {
            const lesson = lessons[lessonIndex];
            
            // Create lesson
            const lessonResponse = await apiClient.post(`/api/v1/courses/modules/${moduleData.id}/lessons`, {
              title: lesson.title,
              description: lesson.description || '',
              video_url: (lesson as any).videoUrl || lesson.video_url,
              pdf_url: (lesson as any).pdfUrl || lesson.pdf_url,
              slides_url: (lesson as any).slidesUrl || lesson.slides_url,
              audio_url: (lesson as any).audioUrl || lesson.audio_url,
              document_url: (lesson as any).documentUrl || lesson.document_url,
              interactive_url: (lesson as any).interactiveUrl || lesson.interactive_url,
              downloadable_url: (lesson as any).downloadableUrl || (lesson as any).download_url || lesson.downloadable_url,
              content_type: (lesson as any).contentType || lesson.content_type || 'video',
              duration: lesson.duration,
              sequence_order: lessonIndex
            });
            
            console.log(`Created lesson for module ${moduleData.id}`);
          }
        }
      }
    }
    
    console.log("Course creation completed successfully!");
    return { success: true, course: courseData };
  } catch (error) {
    console.error('Error in createCourse:', error);
    return { success: false, error: (error as Error)?.message || 'Unknown error' };
  }
};

// Get all courses
export const getAllCourses = async () => {
  try {
    const response = await apiClient.get('/api/v1/courses/');
    return response.data;
  } catch (error) {
    console.error('Error in getAllCourses:', error);
    throw error;
  }
};

// Get course by ID
export const getCourseById = async (courseId: string) => {
  try {
    const response = await apiClient.get(`/api/v1/courses/${courseId}`);
    return response.data;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    throw error;
  }
};

// Update course
export const updateCourse = async (courseId: string, values: Partial<CourseFormValues>) => {
  try {
    // Handle image upload if there's a new image
    let imageUrl = undefined;
    if (values.imageFile) {
      const formData = new FormData();
      formData.append('file', values.imageFile);
      
      const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/+$/, '');
      const token = localStorage.getItem('auth_token');
      const imageUploadResponse = await fetch(`${API_BASE_URL}/api/v1/files/upload/course-image`, {
        method: 'POST',
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      
      if (!imageUploadResponse.ok) {
        throw new Error('Failed to upload course image');
      }
      
      const imageData = await imageUploadResponse.json();
      imageUrl = `${API_BASE_URL}${imageData.file_path}`;
    }
    
    // Update course data
    const updateData: any = {
      title: values.title,
      description: values.description,
      long_description: values.longDescription,
      category: values.category,
      level: values.level
    };
    
    // Only include image_url if we have a new one
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }
    
    const response = await apiClient.put(`/api/v1/courses/${courseId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error in updateCourse:', error);
    throw error;
  }
};

// Delete course
export const deleteCourse = async (courseId: string) => {
  try {
    await apiClient.delete(`/api/v1/courses/${courseId}`);
    return true;
  } catch (error) {
    console.error('Error in deleteCourse:', error);
    throw error;
  }
};
