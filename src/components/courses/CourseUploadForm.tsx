import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { 
  CourseFormValues,
  courseFormSchema,
  courseCategories,
  courseLevels
} from "@/lib/validations/course";
import { Progress } from "@/components/ui/progress";
import { useMutation } from "@tanstack/react-query";
import { createCourse } from "@/lib/actions/course.actions";
import { useNavigate } from "react-router-dom";
import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProgressSteps } from "@/components/courses/ProgressSteps";
import { BasicInfoStep } from './course-form/BasicInfoStep';
import { DetailedDescriptionStep } from './course-form/DetailedDescriptionStep';
import { CourseModulesStep } from './course-form/CourseModulesStep';

interface CourseUploadFormProps {
  storageReady?: boolean;
}

const CourseUploadForm: React.FC<CourseUploadFormProps> = ({ 
  storageReady = true
}) => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(1);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [moduleExpanded, setModuleExpanded] = useState<Record<string, boolean>>({});
  const [uploadingVideo, setUploadingVideo] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: "",
      description: "",
      longDescription: "",
      category: courseCategories[0],
      level: courseLevels[0].toLowerCase() as "beginner" | "intermediate" | "advanced" | "expert",
      imageFile: null,
      imagePreview: null,
      modules: []
    },
    mode: "onChange",
  });

  const { mutate: createNewCourse, isPending: isCreating } = useMutation({
    mutationFn: async (values: CourseFormValues) => {
      setError(null);
      console.log("Creating course with data:", values);
      
      // Directly pass the values since they already match CourseFormValues type
      return createCourse(values);
    },
    onSuccess: (data) => {
      console.log("Course created successfully:", data);
      toast({
        title: "Course created!",
        description: "You've successfully created a new course.",
      });
      navigate("/dashboard");
    },
    onError: (error: Error) => {
      console.error("Error creating course:", error);
      setError(error.message || "Failed to create course. Please try again.");
      toast({
        title: "Something went wrong!",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

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

  // Simple mock function for video uploads since we don't have actual implementation
  const uploadVideo = async (
    file: File,
    moduleId: string,
    lectureId: string,
    onSuccess: (lectureId: string, url: string, duration: string) => void,
    onError?: (lectureId: string, error: Error) => void
  ) => {
    try {
      // Mock upload process
      console.log(`Uploading video for lecture ${lectureId} in module ${moduleId}`);
      
      // Here we'd normally have actual upload logic
      // For now, just create a mock URL and simulate a delay
      setTimeout(() => {
        const mockUrl = `https://example.com/videos/${lectureId}.mp4`;
        const mockDuration = "120"; // 2 minutes in seconds
        
        onSuccess(lectureId, mockUrl, mockDuration);
      }, 2000);
    } catch (error) {
      console.error("Error uploading video:", error);
      if (onError) {
        onError(lectureId, error as Error);
      }
    }
  };

  const onSubmit = (values: CourseFormValues) => {
    console.log("Form submitted with values:", values);
    createNewCourse(values);
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Check if basic info is valid
      form.trigger(['title', 'description', 'category', 'level']);
      
      if (!form.formState.errors.title && 
          !form.formState.errors.description && 
          !form.formState.errors.category && 
          !form.formState.errors.level) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    
    if (currentStep === 2) {
      // Check if detailed description is valid
      form.trigger(['longDescription']);
      
      if (!form.formState.errors.longDescription) {
        setCurrentStep(currentStep + 1);
      }
      return;
    }
    
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {!storageReady && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Storage Not Ready</AlertTitle>
            <AlertDescription>
              Video uploads might not work because the required storage buckets couldn't be accessed.
              You can still create a course, but you may need to add videos later.
            </AlertDescription>
          </Alert>
        )}
        
        <ProgressSteps step={currentStep} />
        
        <div className="space-y-6">
          {currentStep === 1 && (
            <BasicInfoStep 
              form={form} 
              onImageUpload={handleImageUpload}
              uploadProgress={uploadProgress}
            />
          )}
          
          {currentStep === 2 && (
            <DetailedDescriptionStep form={form} />
          )}
          
          {currentStep === 3 && (
            <CourseModulesStep 
              form={form} 
              moduleExpanded={moduleExpanded}
              setModuleExpanded={setModuleExpanded}
              uploadingVideo={uploadingVideo}
              setUploadingVideo={setUploadingVideo}
              uploadVideo={uploadVideo}
              uploadStatuses={{}}
              storageReady={storageReady}
            />
          )}
        </div>

        <div className="flex justify-between mt-8">
          {currentStep > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="flex items-center"
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
          ) : (
            <div></div>
          )}
          
          {currentStep < 3 ? (
            <Button 
              type="button" 
              onClick={nextStep}
              className="bg-medblue-600 hover:bg-medblue-700 flex items-center"
            >
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button 
              type="submit" 
              disabled={isCreating} 
              className="bg-medblue-600 hover:bg-medblue-700"
            >
              {isCreating ? "Creating..." : "Create Course"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

export default CourseUploadForm;
