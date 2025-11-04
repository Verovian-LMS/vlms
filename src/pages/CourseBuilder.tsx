
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/FastApiAuthContext";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { CourseModulesStep } from "@/components/courses/course-form/CourseModulesStep";
import { Button } from "@/components/ui/button";
import { useVideoUpload } from "@/hooks/use-video-upload";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CourseFormSchema, CourseFormValues } from "@/lib/validations/course";
import { Loader2, AlertCircle } from "lucide-react";
import type { Course } from "@/types/course";

const CourseBuilder = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [moduleExpanded, setModuleExpanded] = useState<Record<string, boolean>>({});
  const [uploadingVideo, setUploadingVideo] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [formInitialized, setFormInitialized] = useState<boolean>(false);

  // Initialize form with empty defaults
  const methods = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      category: "",
      level: "beginner",
      modules: []
    }
  });

  // Debug logging
  useEffect(() => {
    const subscription = methods.watch((value) => {
      console.log("Form values changed:", value.modules);
    });
    return () => subscription.unsubscribe();
  }, [methods]);

  // Initialize video upload hook
  const videoUploadHook = useVideoUpload();
  const uploadVideo = videoUploadHook?.uploadVideo;
  const uploadStatuses = videoUploadHook?.uploadStatuses || {};

  // Load course data
  useEffect(() => {
    const loadCourseData = async () => {
      if (!courseId || !user) return;

      try {
        setIsLoading(true);
        
        // Get course data via FastAPI
        const { data: courseData, error: courseError } = await apiClient.getCourse(courseId);
        if (courseError) {
          throw new Error(`Failed to load course: ${courseError}`);
        }
        if (!courseData) {
          throw new Error("Course not found");
        }

        // Ensure user is the course author
        if (courseData.author_id !== user.id) {
          throw new Error("You don't have permission to edit this course");
        }
        
        setCourse(courseData);
        console.log("Loaded course data:", courseData);
        
        // Update form with course data
        methods.setValue("title", courseData.title || "");
        methods.setValue("description", courseData.description || "");
        methods.setValue("longDescription", courseData.long_description || "");
        methods.setValue("category", courseData.category || "");
        methods.setValue("level", courseData.level?.toLowerCase() || "beginner");
        methods.setValue("imagePreview", courseData.image_url || "");
        
        // Get modules via FastAPI
        const { data: modulesData, error: modulesError } = await apiClient.getCourseModules(courseId);
        if (modulesError) {
          throw new Error(`Failed to load modules: ${modulesError}`);
        }
        
        console.log("Loaded modules:", modulesData);
        
        // Initialize expanded state for all modules
        const expandedState: Record<string, boolean> = {};
        
        // Initialize empty modules array
        const formattedModules = [];
        
        // Process each module
        for (const module of modulesData || []) {
          // Get lessons for this module via FastAPI
          const { data: lessonsData, error: lessonsError } = await apiClient.getModuleLessons(module.id);
          if (lessonsError) {
            console.error(`Failed to load lessons for module ${module.id}:`, lessonsError);
          }
          console.log(`Loaded lessons for module ${module.id}:`, lessonsData);
          
          // Format lessons
          const lessons = (lessonsData || []).map((lesson: any) => ({
            id: lesson.id,
            title: lesson.title || "",
            description: lesson.description || "",
            videoUrl: lesson.video_url || null,
            pdfUrl: lesson.pdf_url || null,
            slidesUrl: lesson.slides_url || null,
            audioUrl: lesson.audio_url || null,
            documentUrl: lesson.document_url || null,
            interactiveUrl: lesson.interactive_url || null,
            downloadableUrl: lesson.downloadable_url || null,
            duration: lesson.duration || lesson.duration_minutes || 0,
            notes: lesson.notes || ""
          }));
          
          // If no lessons, add a default one
          if (lessons.length === 0) {
            lessons.push({
              id: crypto.randomUUID(),
              title: "Lesson 1",
              description: "",
              videoUrl: null,
              duration: 0,
              notes: ""
            });
          }
          
          // Format the module
          formattedModules.push({
            id: module.id,
            title: module.title || "",
            description: module.description || "",
            lessons
          });
          
          // Set module as expanded by default
          expandedState[module.id] = true;
        }
        
        // If no modules, add a default one
        if (formattedModules.length === 0) {
          const defaultModuleId = crypto.randomUUID();
          formattedModules.push({
            id: defaultModuleId,
            title: "Module 1",
            description: "",
            lessons: [{
              id: crypto.randomUUID(),
              title: "Lesson 1",
              description: "",
              videoUrl: null,
              duration: 0,
              notes: ""
            }]
          });
          expandedState[defaultModuleId] = true;
        }
        
        // Update the form with modules
        methods.setValue("modules", formattedModules);
        console.log("Setting modules in form:", formattedModules);
        
        setModuleExpanded(expandedState);
        setFormInitialized(true);
      } catch (error) {
        console.error("Error loading course data:", error);
        setError(error instanceof Error ? error.message : "Failed to load course data");
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load course data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadCourseData();
  }, [courseId, user, methods, toast]);

  // Save course modules and lessons
  const handleSaveCourse = async () => {
    if (!courseId || !user) return;
    
    try {
      setIsSaving(true);
      // Normalize frontend-generated IDs like "lesson-<uuid>" or "module-<uuid>" to pure UUIDs for backend
      const normalizeId = (id: string) => (id || '').replace(/^(lesson|module|course)-/, '');
      
      const formData = methods.getValues();
      console.log("Saving course modules:", formData.modules);
      
      // Check if any videos are still uploading
      const anyUploading = Object.values(uploadStatuses || {}).some(status => 
        status && typeof status === 'object' && status.isUploading
      );
      
      if (anyUploading) {
        toast({
          title: "Videos Still Uploading",
          description: "Please wait for all videos to finish uploading before saving the course.",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Validate that all modules have titles and lessons
      const modulesValid = formData.modules.every(module => 
        module && module.title && module.title.trim() !== '' && 
        module.lessons && module.lessons.every(lesson => 
          lesson && lesson.title && lesson.title.trim() !== ''
        )
      );
      
      if (!modulesValid) {
        toast({
          title: "Validation Error",
          description: "All modules and lessons must have titles",
          variant: "destructive"
        });
        setIsSaving(false);
        return;
      }
      
      // Fetch existing modules
      const { data: existingModules, error: existingModulesError } = await apiClient.getCourseModules(courseId);
      if (existingModulesError) {
        throw new Error(`Failed to load existing modules: ${existingModulesError}`);
      }

      // Map existing modules by backend UUID
      const existingModuleMap = new Map<string, any>();
      (existingModules || []).forEach((m: any) => existingModuleMap.set(normalizeId(m.id), m));

      // Determine deleted modules
      // Compare using normalized IDs to avoid duplicating modules on save
      const formModuleIds = new Set(formData.modules.map((m: any) => normalizeId(m.id)));
      for (const m of existingModules || []) {
        const backendId = normalizeId(m.id);
        if (!formModuleIds.has(backendId)) {
          await apiClient.deleteCourseModule(courseId, backendId);
        }
      }

      // Upsert modules and their lessons
      for (let moduleIndex = 0; moduleIndex < formData.modules.length; moduleIndex++) {
        const module = formData.modules[moduleIndex];
        let moduleId = normalizeId(module.id);

        if (existingModuleMap.has(moduleId)) {
          // Update module
          const resp = await apiClient.updateCourseModule(courseId, moduleId, {
            title: module.title,
            description: module.description || '',
            sequence_order: moduleIndex,
          });
          if (resp.error) throw new Error(`Failed to update module: ${resp.error}`);
        } else {
          // Create module
          const resp = await apiClient.createCourseModule(courseId, {
            title: module.title,
            description: module.description || '',
            sequence_order: moduleIndex,
          });
          if (resp.error) throw new Error(`Failed to create module: ${resp.error}`);
          moduleId = normalizeId(resp.data?.id || moduleId); // Use created ID if available
          // Persist the new backend ID back into form data to prevent future duplication
          try {
            formData.modules[moduleIndex].id = moduleId;
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
          const payload = {
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
            const updateResp = await apiClient.updateLesson(normalizedLessonId, payload);
            if (updateResp.error) throw new Error(`Failed to update lesson: ${updateResp.error}`);
          } else {
            const createResp = await apiClient.createModuleLesson(moduleId, payload);
            if (createResp.error) throw new Error(`Failed to create lesson: ${createResp.error}`);
            // Persist the new backend lesson ID to prevent future duplication
            try {
              const createdId = normalizeId(createResp.data?.id || normalizedLessonId);
              formData.modules[moduleIndex].lessons[lessonIndex].id = createdId;
            } catch {}
          }
        }
      }
      // Persist updated IDs into the form state to keep future saves consistent
      try {
        methods.setValue('modules', formData.modules);
      } catch {}
      
      // Update course status to published
      const { error: updateError } = await apiClient.updateCourse(courseId, { status: 'published' });
      if (updateError) {
        throw new Error(`Failed to update course status: ${updateError}`);
      }
      
      console.log(`Updated course ${courseId} status to published`);
      
      toast({
        title: "Course Updated Successfully",
        description: "Your course content has been saved and published."
      });
      
      // Navigate to the course details page
      navigate(`/courses/${courseId}`);
      
    } catch (error) {
      console.error("Error saving course:", error);
      toast({
        title: "Error Saving Course",
        description: error instanceof Error ? error.message : "An error occurred while saving your course",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <main className="flex-grow py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-slate-600">Loading course data...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <main className="flex-grow py-12 px-4">
          <div className="mx-auto max-w-5xl">
            <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                <h3 className="text-red-800 font-semibold">Error</h3>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
              <div className="mt-3">
                <Button onClick={() => navigate('/course-upload')}>
                  Return to Course Upload
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <ErrorBoundary>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-5xl"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">
                Course Builder: {course?.title}
              </h1>
              <p className="text-slate-600 font-exo2">
                Add modules and lessons to your course. Complete all content before publishing.
              </p>
              
              {formInitialized ? (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-800 text-sm">Form initialized with course data. You can now edit modules and lessons.</p>
                </div>
              ) : (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-800 text-sm">Loading course data into form...</p>
                </div>
              )}
            </div>
            
            <FormProvider {...methods}>
              <form className="space-y-8">
                <ErrorBoundary>
                  <CourseModulesStep 
                    form={methods}
                    moduleExpanded={moduleExpanded}
                    setModuleExpanded={setModuleExpanded}
                    uploadingVideo={uploadingVideo}
                    setUploadingVideo={setUploadingVideo}
                    uploadVideo={uploadVideo}
                    uploadStatuses={uploadStatuses}
                  />
                </ErrorBoundary>
                
                <div className="flex justify-between mt-6">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => navigate(`/courses/${courseId}`)}
                  >
                    Cancel
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleSaveCourse}
                    disabled={isSaving}
                    className="bg-medblue-600 hover:bg-medblue-700 text-white"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving Course...
                      </>
                    ) : (
                      "Save and Publish Course"
                    )}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </motion.div>
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseBuilder;
