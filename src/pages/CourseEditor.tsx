import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CourseFormValues, courseSchema } from "@/lib/validations/course";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Progress } from "@/components/ui/progress";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Import form steps
import BasicInfoStep from "@/components/courses/course-form/BasicInfoStep";
import DetailedDescriptionStep from "@/components/courses/course-form/DetailedDescriptionStep";
import { CourseModulesStep } from "@/components/courses/course-form/CourseModulesStep";

const CourseEditor = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const [moduleExpanded, setModuleExpanded] = useState<Record<string, boolean>>({});
  const [uploadingVideo, setUploadingVideo] = useState<Record<string, boolean>>({});
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, { 
    isUploading: boolean; progress: number; error?: string | null 
  }>>({});

  // Form methods using react-hook-form
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      level: "beginner", // Use a valid level from the enum
      imagePreview: "",
      longDescription: "",
      modules: []
    },
    mode: "onChange"
  });

  // Simple mock function for video uploads since we don't have actual implementation
  const uploadVideo = async (
    file: File,
    moduleId: string,
    lectureId: string,
    onSuccess: (lectureId: string, url: string, duration: string) => void,
    onError?: (lectureId: string, error: Error) => void
  ) => {
    try {
      // Set upload status
      setUploadStatuses(prev => ({
        ...prev,
        [lectureId]: { isUploading: true, progress: 0 }
      }));
      
      // Mock upload progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadStatuses(prev => ({
          ...prev,
          [lectureId]: { 
            ...prev[lectureId],
            progress: progress 
          }
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
          const mockUrl = `https://example.com/videos/${lectureId}.mp4`;
          const mockDuration = "120"; // 2 minutes in seconds
          
          setUploadStatuses(prev => ({
            ...prev,
            [lectureId]: { 
              isUploading: false,
              progress: 100
            }
          }));
          
          onSuccess(lectureId, mockUrl, mockDuration);
        }
      }, 500);
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatuses(prev => ({
        ...prev,
        [lectureId]: { 
          isUploading: false,
          progress: 0,
          error: (error as Error).message
        }
      }));
      
      if (onError) {
        onError(lectureId, error as Error);
      }
    }
  };

  // Fetch course data on component mount
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) {
        console.error("Course ID is missing.");
        toast({
          title: "Missing Course ID",
          description: "The course ID is missing. Please check the URL.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('id', courseId)
          .single();

        if (error) {
          console.error("Error fetching course:", error);
          toast({
            title: "Error",
            description: "Failed to load course data. Please try again.",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          // Update form default values with fetched data
          form.reset({
            title: data.title || "",
            description: data.description || "",
            category: data.category || "",
            level: (data.level as "beginner" | "intermediate" | "advanced" | "expert") || "beginner",
            imagePreview: data.image_url || "",
            longDescription: data.long_description || "",
            modules: [] // Modules will be handled separately
          });
          setCourse(data as unknown as CourseFormValues);
        } else {
          toast({
            title: "Course Not Found",
            description: "The course with the given ID was not found.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error during course data fetch:", error);
        toast({
          title: "Unexpected Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, form, toast]);

  // Handle image upload
  const handleImageUpload = async (file: File) => {
    if (!courseId) {
      toast({
        title: "Missing Course ID",
        description: "The course ID is missing. Please check the URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploadProgress(0);
      const fileName = `course-image-${courseId}-${Date.now()}`;
      const { data, error } = await supabase.storage
        .from('course-images')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Image Upload Failed",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Get public URL
      const { data: imageData } = supabase.storage
        .from('course-images')
        .getPublicUrl(data.path);

      if (imageData && imageData.publicUrl) {
        form.setValue("imagePreview", imageData.publicUrl);
        toast({
          title: "Image Uploaded",
          description: "Course image uploaded successfully.",
        });
      }
    } catch (error) {
      console.error("Error during image upload:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during image upload. Please try again.",
      });
    } finally {
      setUploadProgress(100);
    }
  };

  // Handle form submission
  const onSubmit = async (values: CourseFormValues) => {
    if (!courseId) {
      toast({
        title: "Missing Course ID",
        description: "The course ID is missing. Please check the URL.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('courses')
        .update({
          ...values,
          image_url: values.imagePreview,
          author_id: user?.id
        })
        .eq('id', courseId);

      if (error) {
        console.error("Error updating course:", error);
        toast({
          title: "Course Update Failed",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Course Updated",
        description: "Course updated successfully.",
      });
      navigate(`/courses/${courseId}`);
    } catch (error) {
      console.error("Error during course update:", error);
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred during course update. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
          <p className="mt-4">Loading course data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Edit Course</h1>
      <Separator className="mb-6" />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold font-heading">Basic Information</h2>
            <BasicInfoStep 
              form={form} 
              onImageUpload={handleImageUpload}
              uploadProgress={uploadProgress}
            />
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading">Detailed Description</h2>
            <DetailedDescriptionStep form={form} />
          </section>

          <section>
            <h2 className="text-2xl font-bold font-heading">Course Modules</h2>
            <CourseModulesStep
              form={form}
              moduleExpanded={moduleExpanded}
              setModuleExpanded={setModuleExpanded}
              uploadingVideo={uploadingVideo}
              setUploadingVideo={setUploadingVideo}
              uploadVideo={uploadVideo}
              uploadStatuses={uploadStatuses}
            />
          </section>

          <ErrorBoundary>
            <Button type="submit" size="lg" disabled={!form.formState.isValid || isLoading}>
              {isLoading ? "Updating..." : "Update Course"}
            </Button>
          </ErrorBoundary>
        </form>
      </FormProvider>
    </div>
  );
};

export default CourseEditor;
