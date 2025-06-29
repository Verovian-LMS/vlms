
import { supabase } from '@/integrations/supabase/client';
import { LectureContentType, CourseFormValues } from '@/types/course';

// Create a new course
export const createCourse = async (values: CourseFormValues) => {
  try {
    console.log("Starting course creation process...");
    
    // Get user ID from session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Authentication error:", sessionError);
      throw new Error(`Authentication error: ${sessionError.message}`);
    }
    
    const userId = sessionData.session?.user?.id;
    if (!userId) {
      console.error("User not authenticated");
      throw new Error("User not authenticated");
    }
    
    console.log("User authenticated with ID:", userId);
    
    // Check if the required storage buckets exist
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();
    
    if (bucketsError) {
      console.error("Error checking storage buckets:", bucketsError);
      throw new Error(`Error accessing storage: ${bucketsError.message}`);
    }
    
    const bucketNames = buckets.map(b => b.name);
    console.log("Available storage buckets:", bucketNames);
    
    const requiredBuckets = ['course-content', 'course-images', 'course-videos'];
    const missingBuckets = requiredBuckets.filter(name => !bucketNames.includes(name));
    
    if (missingBuckets.length > 0) {
      console.error("Missing required storage buckets:", missingBuckets);
      throw new Error(`Missing storage buckets: ${missingBuckets.join(', ')}. Please contact an administrator.`);
    }

    // Upload course image if provided
    let imageUrl = values.imagePreview;
    if (values.imageFile && !values.imagePreview?.startsWith('https://')) {
      console.log("Uploading course image");
      
      try {
        const fileExt = values.imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('course-images')
          .upload(filePath, values.imageFile);
        
        if (uploadError) {
          console.error("Error uploading course image:", uploadError);
          throw uploadError;
        }
        
        const { data: publicUrlData } = supabase.storage
          .from('course-images')
          .getPublicUrl(filePath);
        
        imageUrl = publicUrlData.publicUrl;
        console.log("Image uploaded successfully:", imageUrl);
      } catch (imageError) {
        console.error("Failed to upload image:", imageError);
        throw new Error(`Image upload failed: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
      }
    }

    // Create course record
    console.log("Creating course record in database");
    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .insert({
        title: values.title,
        description: values.description,
        long_description: values.longDescription,
        category: values.category,
        level: values.level,
        image_url: imageUrl,
        author_id: userId,
        status: 'draft'
      })
      .select()
      .single();

    if (courseError) {
      console.error("Error creating course record:", courseError);
      throw new Error(`Error creating course: ${courseError.message}`);
    }
    
    console.log("Course record created:", courseData);
    const courseId = courseData.id;
    
    // Create modules and lectures if provided
    if (values.modules && values.modules.length > 0) {
      console.log(`Creating ${values.modules.length} modules for course ${courseId}`);
      
      for (let moduleIndex = 0; moduleIndex < values.modules.length; moduleIndex++) {
        const module = values.modules[moduleIndex];
        
        // Create module
        const { data: moduleData, error: moduleError } = await supabase
          .from('modules')
          .insert({
            course_id: courseId,
            title: module.title,
            description: module.description || '',
            sequence_order: moduleIndex
          })
          .select()
          .single();
          
        if (moduleError) {
          console.error(`Error creating module ${moduleIndex}:`, moduleError);
          throw new Error(`Error creating module: ${moduleError.message}`);
        }
        
        console.log(`Created module ${moduleData.id} for course ${courseId}`);
        
        // Create lectures for this module
        if (module.lectures && module.lectures.length > 0) {
          console.log(`Creating ${module.lectures.length} lectures for module ${moduleData.id}`);
          
          for (let lectureIndex = 0; lectureIndex < module.lectures.length; lectureIndex++) {
            const lecture = module.lectures[lectureIndex];
            
            // Create lecture
            const { data: lectureData, error: lectureError } = await supabase
              .from('lectures')
              .insert({
                module_id: moduleData.id,
                title: lecture.title,
                description: lecture.description || '',
                video_url: lecture.videoUrl,
                pdf_url: lecture.pdfUrl,
                slides_url: lecture.slidesUrl,
                audio_url: lecture.audioUrl,
                document_url: lecture.documentUrl,
                interactive_url: lecture.interactiveUrl,
                downloadable_url: lecture.downloadableUrl,
                content_type: lecture.contentType || 'video',
                duration_minutes: lecture.duration,
                sequence_order: lectureIndex
              })
              .select();
              
            if (lectureError) {
              console.error(`Error creating lecture ${lectureIndex}:`, lectureError);
              throw new Error(`Error creating lecture: ${lectureError.message}`);
            }
            
            console.log(`Created lecture ${lectureData[0].id} for module ${moduleData.id}`);
          }
        }
      }
    }
    
    console.log("Course creation completed successfully!");
    return courseData;
  } catch (error) {
    console.error('Error in createCourse:', error);
    throw error;
  }
};

// Upload content file to storage
export const uploadContentFile = async (
  file: File,
  courseId: string,
  moduleId: string,
  lectureId: string,
  contentType: LectureContentType
): Promise<string> => {
  try {
    console.log(`Uploading ${contentType} file for lecture ${lectureId}...`);
    
    // Generate a unique file path
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${lectureId}.${fileExtension}`;
    const filePath = `courses/${moduleId}/${contentType}/${fileName}`;

    // Upload the file to storage
    const { data, error } = await supabase.storage
      .from('course-content')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      console.error(`Error uploading ${contentType} file:`, error);
      throw new Error(`Error uploading ${contentType}: ${error.message}`);
    }

    // Get the public URL for the file
    const { data: urlData } = supabase.storage
      .from('course-content')
      .getPublicUrl(filePath);
    
    console.log(`${contentType} file uploaded successfully:`, urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadContentFile:', error);
    throw error;
  }
};

// Other course-related actions
export const getCourseById = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        *,
        modules (
          id,
          title,
          description,
          sequence_order,
          lectures (
            id,
            title,
            description,
            video_url,
            pdf_url,
            slides_url,
            audio_url,
            document_url,
            interactive_url,
            downloadable_url,
            content_type,
            duration,
            sequence_order
          )
        )
      `)
      .eq('id', courseId)
      .single();

    if (error) {
      throw new Error(`Error fetching course: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getCourseById:', error);
    throw error;
  }
};
