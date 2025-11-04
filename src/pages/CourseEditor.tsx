import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CourseFormValues, courseSchema } from "@/lib/validations/course";
import { apiClient } from "@/lib/api/client";
import { useCourseImageUpload } from "@/hooks/use-course-image-upload";
import { LessonUpload, CourseModule } from "@/types/course";
import { useAuth } from "@/context/FastApiAuthContext";
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
  const [invalidId, setInvalidId] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const { uploadCourseImage } = useCourseImageUpload(user);
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

  // Validate UUID helper
  const isValidUUID = (str?: string): boolean => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // Simple mock function for video uploads since we don't have actual implementation
  const uploadVideo = async (
    file: File,
    moduleId: string,
    lessonId: string,
    onSuccess: (lessonId: string, url: string, duration: string) => void,
    onError?: (lessonId: string, error: Error) => void
  ) => {
    try {
      // Set upload status
      setUploadStatuses(prev => ({
        ...prev,
        [lessonId]: { isUploading: true, progress: 0 }
      }));
      
      // Mock upload progress updates
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setUploadStatuses(prev => ({
          ...prev,
          [lessonId]: { 
            ...prev[lessonId],
            progress: progress 
          }
        }));
        
        if (progress >= 100) {
          clearInterval(interval);
          const mockUrl = `https://example.com/videos/${lessonId}.mp4`;
          const mockDuration = "120"; // 2 minutes in seconds
          
          setUploadStatuses(prev => ({
            ...prev,
            [lessonId]: { 
              isUploading: false,
              progress: 100
            }
          }));
          
          onSuccess(lessonId, mockUrl, mockDuration);
        }
      }, 500);
    } catch (error) {
      console.error("Error uploading video:", error);
      setUploadStatuses(prev => ({
        ...prev,
        [lessonId]: { 
          isUploading: false,
          progress: 0,
          error: (error as Error).message
        }
      }));
      
      if (onError) {
        onError(lessonId, error as Error);
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
        const { data, error } = await apiClient.getCourse(courseId);

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
            modules: [] // Placeholder; populated below
          });

          // Load modules and lessons for this course and populate the form
          try {
            const modulesResp = await apiClient.getCourseModules(courseId);
            const modulesData = modulesResp.data || [];

            const assembledModules: CourseModule[] = [];
            for (const m of modulesData) {
              // Fetch lessons for each module
              const lessonsResp = await apiClient.getModuleLessons(m.id);
              const lessonsData = lessonsResp.data || [];

              const mappedLessons: LessonUpload[] = (lessonsData || []).map((l: any) => ({
                id: l.id,
                title: l.title || "",
                description: l.description || "",
                contentType: (l.content_type || "video") as any,
                videoUrl: l.video_url || null,
                pdfUrl: l.pdf_url || null,
                slidesUrl: l.slides_url || null,
                audioUrl: l.audio_url || null,
                documentUrl: l.document_url || null,
                interactiveUrl: l.interactive_url || null,
                downloadableUrl: l.downloadable_url || null,
                duration: l.duration || 0,
                notes: l.notes || "",
                resources: []
              }));

              assembledModules.push({
                id: m.id,
                title: m.title || "",
                description: m.description || "",
                lessons: mappedLessons
              });
            }

            form.setValue('modules', assembledModules);

            // Expand the first module for visibility
            if (assembledModules.length > 0) {
              setModuleExpanded(prev => ({ ...prev, [assembledModules[0].id]: true }));
            }
          } catch (modErr) {
            console.warn('Failed to load modules/lessons for course editor:', modErr);
          }

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
      const imageUrl = await uploadCourseImage(file);
      if (imageUrl) {
        form.setValue("imagePreview", imageUrl);
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

  // Handle form submission: persist course, modules, and lessons (including URLs)
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
      // Normalize frontend-generated IDs like "lesson-<uuid>" or "module-<uuid>" to pure UUIDs for backend
      const normalizeId = (id: string) => (id || '').replace(/^(lesson|module|course)-/, '');
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        level: values.level,
        long_description: values.longDescription,
        image_url: values.imagePreview,
      };

      const { error } = await apiClient.updateCourse(courseId, payload);

      if (error) {
        console.error("Error updating course:", error);
        toast({
          title: "Course Update Failed",
          description: "Failed to update course. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Persist modules and lessons
      try {
        // Load existing modules from backend to compare
        const { data: existingModules, error: existingModulesError } = await apiClient.getCourseModules(courseId);
        if (existingModulesError) {
          throw new Error(`Failed to load existing modules: ${existingModulesError}`);
        }
        const existingModuleMap = new Map<string, any>();
        (existingModules || []).forEach((m: any) => existingModuleMap.set(normalizeId(m.id), m));

        // Delete modules removed in form
        const formModuleIds = new Set((values.modules || []).map((m: any) => normalizeId(m.id)));
        for (const m of existingModules || []) {
          const backendId = normalizeId(m.id);
          if (!formModuleIds.has(backendId)) {
            await apiClient.deleteCourseModule(courseId, backendId);
          }
        }

        // Upsert modules and their lessons
        for (let moduleIndex = 0; moduleIndex < (values.modules || []).length; moduleIndex++) {
          const module = values.modules[moduleIndex];
          let moduleId = normalizeId(module.id);

          if (existingModuleMap.has(moduleId)) {
            // Update module
            const resp = await apiClient.updateCourseModule(courseId, moduleId, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: moduleIndex,
            });
            if (resp.error) throw new Error(`Failed to update module: ${resp.error}`);
          } else {
            // Create module
            const resp = await apiClient.createCourseModule(courseId, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: moduleIndex,
            });
            if (resp.error) throw new Error(`Failed to create module: ${resp.error}`);
            moduleId = normalizeId(resp.data?.id || moduleId); // Use created ID if available
            // Persist the new backend module ID locally to prevent duplication on subsequent saves
            try {
              values.modules[moduleIndex].id = moduleId;
            } catch {}
          }

          // Handle lessons for this module
          const { data: existingLessons, error: lessonsLoadError } = await apiClient.getModuleLessons(moduleId);
          if (lessonsLoadError) {
            console.warn(`Failed to load lessons for module ${moduleId}:`, lessonsLoadError);
          }
          const existingLessonMap = new Map<string, any>();
          (existingLessons || []).forEach((l: any) => existingLessonMap.set(normalizeId(l.id), l));

          const formLessonIds = new Set((module.lessons || []).map((l: any) => normalizeId(l.id)));
          // Delete lessons removed in form
          for (const l of existingLessons || []) {
            const backendLessonId = normalizeId(l.id);
            if (!formLessonIds.has(backendLessonId)) {
              await apiClient.deleteLesson(backendLessonId);
            }
          }

          // Upsert lessons
          for (let lessonIndex = 0; lessonIndex < (module.lessons || []).length; lessonIndex++) {
            const lesson = module.lessons[lessonIndex];
            const payloadLesson = {
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
              sequence_order: lessonIndex,
              content_type: lesson.contentType || 'video',
            };

            const normalizedLessonId = normalizeId(lesson.id);
            if (existingLessonMap.has(normalizedLessonId)) {
              const updateResp = await apiClient.updateLesson(normalizedLessonId, payloadLesson);
              if (updateResp.error) throw new Error(`Failed to update lesson: ${updateResp.error}`);
            } else {
              const createResp = await apiClient.createModuleLesson(moduleId, payloadLesson);
              if (createResp.error) throw new Error(`Failed to create lesson: ${createResp.error}`);
              // Persist created backend lesson ID locally to prevent duplication
              try {
                const createdLessonId = normalizeId(createResp.data?.id || normalizedLessonId);
                values.modules[moduleIndex].lessons[lessonIndex].id = createdLessonId;
              } catch {}
            }
          }
        }
      } catch (persistErr) {
        console.error('Error persisting modules/lessons:', persistErr);
        toast({
          title: 'Content Save Failed',
          description: persistErr instanceof Error ? persistErr.message : 'Failed to save modules and lessons',
          variant: 'destructive'
        });
        // Continue to navigation without crashing the page
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

  if (invalidId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2 font-nunito">Invalid Course URL</h1>
          <p className="text-gray-600 mb-4 font-exo2">
            The course ID in the address bar appears invalid. Please navigate using the Courses page or your dashboard.
          </p>
          <div className="flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/courses')}>Go to Courses</Button>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Temporary debug banner to make state visible while investigating blank screen */}
      <Alert className="mb-4">
        <AlertDescription>
          Editing course: <span className="font-semibold">{course?.title || '(loading or unset)'}</span> · ID: {courseId}
        </AlertDescription>
      </Alert>
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
