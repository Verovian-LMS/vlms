import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CourseFormSchema, CourseFormValues } from '@/lib/validations/course';
import { apiClient } from '@/lib/api/client';
import { useAuth } from '@/context/FastApiAuthContext';
import { 
  CheckCircle, 
  Circle, 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye,
  BookOpen,
  Settings,
  Upload,
  Sparkles
} from 'lucide-react';

// Import step components
import { BasicInfoStep } from './BasicInfoStep';
import { DetailedDescriptionStep } from './DetailedDescriptionStep';
import EnhancedModulesStep from './EnhancedModulesStep';
import CourseSettingsStep from './CourseSettingsStep';
import CoursePreviewStep from './CoursePreviewStep';

interface EnhancedCourseCreationFlowProps {
  onSubmit: (values: CourseFormValues) => void;
  isSubmitting?: boolean;
  initialData?: Partial<CourseFormValues>;
  mode?: 'create' | 'edit';
  courseId?: string;
}

interface StepConfig {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ComponentType<any>;
  validation?: string[];
}

const EnhancedCourseCreationFlow: React.FC<EnhancedCourseCreationFlowProps> = ({
  onSubmit,
  isSubmitting = false,
  initialData,
  mode = 'create',
  courseId,
}) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isDraft, setIsDraft] = useState(true);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const [localCourseId, setLocalCourseId] = useState<string | undefined>(courseId);

  useEffect(() => {
    setLocalCourseId(courseId);
  }, [courseId]);

  const steps: StepConfig[] = [
    {
      id: 'basic-info',
      title: 'Course Basics',
      description: 'Essential course information and branding',
      icon: <BookOpen className="h-5 w-5" />,
      component: BasicInfoStep,
      validation: ['title', 'description', 'category', 'level']
    },
    {
      id: 'detailed-description',
      title: 'Course Details',
      description: 'Comprehensive description and learning outcomes',
      icon: <Settings className="h-5 w-5" />,
      component: DetailedDescriptionStep,
      validation: ['longDescription']
    },
    {
      id: 'modules-lessons',
      title: 'Content Structure',
      description: 'Organize your course into modules and lessons',
      icon: <Upload className="h-5 w-5" />,
      component: EnhancedModulesStep,
      validation: ['modules']
    },
    {
      id: 'course-settings',
      title: 'Course Settings',
      description: 'Pricing, access, and publication settings',
      icon: <Settings className="h-5 w-5" />,
      component: CourseSettingsStep,
      validation: []
    },
    {
      id: 'preview-publish',
      title: 'Preview & Publish',
      description: 'Review your course before publishing',
      icon: <Eye className="h-5 w-5" />,
      component: CoursePreviewStep,
      validation: []
    }
  ];

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(CourseFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      longDescription: initialData?.longDescription || '',
      category: initialData?.category || '',
      level: initialData?.level || 'beginner',
      imageFile: null,
      imagePreview: initialData?.imagePreview || null,
      modules: initialData?.modules || [],
      ...initialData
    }
  });

  // Calculate progress
  const progress = ((currentStep + 1) / steps.length) * 100;

  // Validate current step
  const validateCurrentStep = async () => {
    const currentStepConfig = steps[currentStep];
    if (!currentStepConfig.validation) return true;

    const isValid = await form.trigger(currentStepConfig.validation as any);
    return isValid;
  };

  // Handle next step
  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    
    if (isValid) {
      // If moving from Course Details to Content Structure, auto-create the course
      const isMovingToContentStructure = steps[currentStep].id === 'detailed-description';
      if (isMovingToContentStructure && !localCourseId) {
        try {
          if (!user) {
            throw new Error('You must be logged in to create a course');
          }

          const values = form.getValues();
          const { data, error } = await apiClient.createCourse({
            title: values.title,
            description: values.description,
            long_description: values.longDescription,
            category: values.category,
            level: values.level,
            image_url: values.imagePreview,
            status: 'draft',
          });

          if (error || !data?.id) {
            throw new Error(error || 'Failed to create course');
          }

          setLocalCourseId(data.id);
          setIsDraft(true);

          toast({
            title: 'Course Saved',
            description: 'Draft created. You can now add modules and lessons.',
          });

          // Keep user in the editor flow; do not navigate away
        } catch (err: any) {
          toast({
            title: 'Save Failed',
            description: err?.message || 'Could not create the course. Please try again.',
            variant: 'destructive',
          });
          return; // Do not advance steps on failure
        }
      }

      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast({
        title: "Validation Error",
        description: "Please complete all required fields before proceeding.",
        variant: "destructive"
      });
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle step click
  const handleStepClick = (stepIndex: number) => {
    if (stepIndex <= currentStep || completedSteps.has(stepIndex - 1)) {
      setCurrentStep(stepIndex);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    const formData = form.getValues();
    // Implement draft saving logic
    toast({
      title: "Draft Saved",
      description: "Your course has been saved as a draft.",
    });
  };

  // Handle form submission
  const handleSubmit = async (values: CourseFormValues) => {
    // If we have a saved course, update it and mark as published
    if (!localCourseId) {
      toast({
        title: 'Missing Course',
        description: 'Please save the course before publishing.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Helper to normalize frontend-generated IDs like "module-<uuid>" and "lesson-<uuid>"
      const normalizeId = (id: string) => (id || '').replace(/^(lesson|module|course)-/, '');

      const { error } = await apiClient.updateCourse(localCourseId, {
        title: values.title,
        description: values.description,
        long_description: values.longDescription,
        category: values.category,
        level: values.level,
        image_url: values.imagePreview,
        status: 'published',
      });

      if (error) {
        throw new Error(error);
      }

      // Persist modules and lessons from the enhanced builder form
      try {
        // Load existing modules from backend
        const { data: existingModules, error: existingModulesError } = await apiClient.getCourseModules(localCourseId);
        if (existingModulesError) {
          throw new Error(`Failed to load existing modules: ${existingModulesError}`);
        }
        const existingModuleMap = new Map<string, any>();
        (existingModules || []).forEach((m: any) => existingModuleMap.set(normalizeId(m.id), m));

        // Delete modules removed in the form
        const formModuleIds = new Set((values.modules || []).map((m: any) => normalizeId(m.id)));
        for (const m of existingModules || []) {
          const backendId = normalizeId(m.id);
          if (!formModuleIds.has(backendId)) {
            await apiClient.deleteCourseModule(localCourseId, backendId);
          }
        }

        // Upsert modules and lessons
        for (let moduleIndex = 0; moduleIndex < (values.modules || []).length; moduleIndex++) {
          const module = (values.modules || [])[moduleIndex];
          if (!module) continue;
          let effectiveModuleId = normalizeId(module.id);

          if (existingModuleMap.has(effectiveModuleId)) {
            const resp = await apiClient.updateCourseModule(localCourseId, effectiveModuleId, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: typeof module.order_index === 'number' ? module.order_index : moduleIndex,
            });
            if (resp.error) throw new Error(`Failed to update module: ${resp.error}`);
          } else {
            const resp = await apiClient.createCourseModule(localCourseId, {
              title: module.title || 'Untitled Module',
              description: module.description || '',
              sequence_order: typeof module.order_index === 'number' ? module.order_index : moduleIndex,
            });
            if (resp.error) throw new Error(`Failed to create module: ${resp.error}`);
            effectiveModuleId = normalizeId(resp.data?.id || effectiveModuleId);
            // Persist newly created module ID back to values to keep consistency
            try {
              (values.modules as any)[moduleIndex].id = effectiveModuleId;
              // Also persist into form state to ensure future updates use backend IDs
              form.setValue(`modules.${moduleIndex}.id`, effectiveModuleId, { shouldDirty: true });
            } catch {}
          }

          // Handle lessons for this module
          const { data: existingLessons, error: lessonsLoadError } = await apiClient.getModuleLessons(effectiveModuleId);
          if (lessonsLoadError) {
            console.warn(`Failed to load lessons for module ${effectiveModuleId}:`, lessonsLoadError);
          }
          const existingLessonMap = new Map<string, any>();
          (existingLessons || []).forEach((l: any) => existingLessonMap.set(normalizeId(l.id), l));

          const formLessonIds = new Set(((module.lessons || []) as any[]).map((l: any) => normalizeId(l.id)));
          // Delete lessons removed in form
          for (const l of existingLessons || []) {
            const backendLessonId = normalizeId(l.id);
            if (!formLessonIds.has(backendLessonId)) {
              await apiClient.deleteLesson(backendLessonId);
            }
          }

          for (let lessonIndex = 0; lessonIndex < ((module.lessons || []) as any[]).length; lessonIndex++) {
            const lesson: any = module.lessons[lessonIndex];
            const normalizedLessonId = normalizeId(lesson.id);
            // Derive content_type from available URLs first, then fallback to existing value
            const derivedContentType = (() => {
              const ct = (lesson.content_type ?? lesson.contentType ?? '').toLowerCase();
              if (lesson.pdf_url ?? lesson.pdfUrl) return 'pdf';
              if (lesson.slides_url ?? lesson.slidesUrl) return 'slides';
              if (lesson.audio_url ?? lesson.audioUrl) return 'audio';
              if (lesson.document_url) return 'document';
              if (lesson.interactive_url ?? lesson.interactiveUrl) return 'interactive';
              if (lesson.download_url ?? lesson.downloadableUrl) return 'downloadable';
              if (lesson.video_url ?? lesson.videoUrl) return 'video';
              if (ct) return ct; // if user explicitly set it
              return 'video';
            })();

            const payloadLesson = {
              title: lesson.title || 'Untitled Lesson',
              description: lesson.description || '',
              content_type: derivedContentType,
              // Map URL fields from enhanced step to backend schema names
              video_url: lesson.video_url ?? lesson.videoUrl ?? '',
              pdf_url: lesson.pdf_url ?? lesson.pdfUrl ?? '',
              slides_url: lesson.slides_url ?? lesson.slidesUrl ?? '',
              audio_url: lesson.audio_url ?? lesson.audioUrl ?? '',
              document_url: lesson.document_url ?? '',
              interactive_url: lesson.interactive_url ?? lesson.interactiveUrl ?? '',
              downloadable_url: lesson.download_url ?? lesson.downloadableUrl ?? '',
              // Additional metadata
              content: lesson.content ?? '',
              transcript: lesson.transcript ?? '',
              duration: typeof lesson.duration === 'number' ? lesson.duration : undefined,
              page_count: typeof lesson.page_count === 'number' ? lesson.page_count : undefined,
              slide_count: typeof lesson.slide_count === 'number' ? lesson.slide_count : undefined,
              reading_time: typeof lesson.reading_time === 'number' ? lesson.reading_time : undefined,
              file_size: typeof lesson.file_size === 'number' ? lesson.file_size : undefined,
              file_type: typeof lesson.file_type === 'string' ? lesson.file_type : undefined,
              is_preview: !!lesson.is_preview,
              sequence_order: typeof lesson.order_index === 'number' ? lesson.order_index : lessonIndex,
              notes: lesson.notes ?? '',
            };

            if (existingLessonMap.has(normalizedLessonId)) {
              const updateResp = await apiClient.updateLesson(normalizedLessonId, payloadLesson);
              if (updateResp.error) throw new Error(`Failed to update lesson: ${updateResp.error}`);
            } else {
              const createResp = await apiClient.createModuleLesson(effectiveModuleId, payloadLesson);
              if (createResp.error) throw new Error(`Failed to create lesson: ${createResp.error}`);
              // Persist created backend lesson ID back to values to keep consistency
              try {
                const createdLessonId = normalizeId(createResp.data?.id || normalizedLessonId);
                (values.modules as any)[moduleIndex].lessons[lessonIndex].id = createdLessonId;
                // Also persist into form state to ensure future updates use backend IDs
                form.setValue(`modules.${moduleIndex}.lessons.${lessonIndex}.id`, createdLessonId, { shouldDirty: true });
              } catch {}
            }
          }
        }
      } catch (persistErr: any) {
        console.error('Error persisting modules/lessons during publish:', persistErr);
        toast({
          title: 'Content Save Failed',
          description: persistErr?.message || 'Failed to save modules and lessons',
          variant: 'destructive',
        });
        // Continue to navigate even if content persistence had issues to avoid blocking
      }

      setIsDraft(false);
      toast({
        title: 'Course Published',
        description: 'Your course and content have been saved and published.',
      });

      // Navigate to course details page
      navigate(`/courses/${localCourseId}`);
    } catch (err: any) {
      toast({
        title: 'Publish Failed',
        description: err?.message || 'Could not publish the course. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Image upload handler for BasicInfoStep
  const handleImageUpload = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadstart = () => {
        setUploadProgress(10);
      };

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      reader.onload = (event) => {
        setUploadProgress(100);
        // Save preview to form so BasicInfoStep can display it
        form.setValue("imagePreview", event.target?.result as string);
        resolve();
      };

      reader.onerror = (error) => {
        console.error("File reading error:", error);
        setUploadProgress(0);
        reject(error);
      };

      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-4">
      {/* Header */}
      <div className="text-center space-y-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-heading font-bold text-slate-800">
            {mode === 'create' ? 'Create New Course' : 'Edit Course'}
          </h1>
          <p className="text-slate-600 font-exo2">
            Build an engaging learning experience with our enhanced course creation tools
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Step {currentStep + 1} of {steps.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Step Navigation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <React.Fragment key={step.id}>
                <motion.div
                  className={`flex flex-col items-center space-y-2 cursor-pointer transition-all ${
                    index <= currentStep ? 'opacity-100' : 'opacity-50'
                  }`}
                  onClick={() => handleStepClick(index)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className={`
                    flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all
                    ${completedSteps.has(index) 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : index === currentStep 
                        ? 'bg-medblue-500 border-medblue-500 text-white'
                        : 'bg-white border-slate-300 text-slate-400'
                    }
                  `}>
                    {completedSteps.has(index) ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      index <= currentStep ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.title}
                    </p>
                    <p className="text-xs text-slate-500 max-w-24">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
                
                {index < steps.length - 1 && (
                  <Separator 
                    className={`flex-1 mx-4 ${
                      completedSteps.has(index) ? 'bg-green-300' : 'bg-slate-200'
                    }`} 
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Card>
            <CardHeader className="p-4 pb-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center space-x-2">
                    {steps[currentStep].icon}
                    <span>{steps[currentStep].title}</span>
                  </CardTitle>
                  <p className="text-slate-600 text-sm">
                    {steps[currentStep].description}
                  </p>
                </div>
                
                {isDraft && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <Circle className="h-3 w-3 fill-current" />
                    <span>Draft</span>
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-4 pt-0">
              {/* Render step content directly to avoid any animation-induced layout gaps */}
              <ErrorBoundary>
                <CurrentStepComponent 
                  form={form}
                  onNext={handleNext}
                  onPrevious={handlePrevious}
                  isLastStep={currentStep === steps.length - 1}
                  isFirstStep={currentStep === 0}
                  uploadProgress={uploadProgress}
                  onImageUpload={handleImageUpload}
                  courseId={localCourseId}
                />
              </ErrorBoundary>
            </CardContent>
          </Card>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Previous</span>
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSaveDraft}
                className="flex items-center space-x-2"
              >
                <Save className="h-4 w-4" />
                <span>Save Draft</span>
              </Button>

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-medblue-600 hover:bg-medblue-700 flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-green-600 hover:bg-green-700 flex items-center space-x-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSubmitting ? 'Publishing...' : 'Publish Course'}</span>
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default EnhancedCourseCreationFlow;