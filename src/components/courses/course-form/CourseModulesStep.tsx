
import React, { useState, useEffect } from 'react';
import { FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Plus, AlertCircle } from "lucide-react";
import { Accordion } from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from "uuid";
import ModulesList from '../modules/ModulesList';
import { useToast } from "@/hooks/use-toast";
import type { CourseModule } from "@/types/course";

interface CourseModulesStepProps {
  form: any;
  moduleExpanded: Record<string, boolean>;
  setModuleExpanded: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadingVideo: Record<string, boolean>;
  setUploadingVideo: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadVideo: (
    file: File,
    moduleId: string,
    lectureId: string, 
    onSuccess: (lectureId: string, url: string, duration: string) => void,
    onError?: (lectureId: string, error: Error) => void
  ) => Promise<void>;
  uploadStatuses: Record<string, { isUploading: boolean; progress: number; error?: string | null }>;
  storageReady?: boolean;
}

export const CourseModulesStep: React.FC<CourseModulesStepProps> = ({
  form,
  moduleExpanded,
  setModuleExpanded,
  uploadingVideo,
  setUploadingVideo,
  uploadVideo,
  uploadStatuses,
  storageReady = true
}) => {
  const { toast } = useToast();
  const [anyUploadInProgress, setAnyUploadInProgress] = useState<boolean>(false);

  // Watch for uploads in progress
  useEffect(() => {
    const uploading = Object.values(uploadingVideo).some(isUploading => isUploading);
    setAnyUploadInProgress(uploading);
  }, [uploadingVideo]);

  // Get module values
  const modules = form.watch('modules') || [];

  // Add a new module
  const addModule = () => {
    const newModuleId = uuidv4();
    const newLectureId = uuidv4();
    
    const newModule = {
      id: newModuleId,
      title: `Module ${modules.length + 1}`,
      description: '',
      lectures: [
        {
          id: newLectureId,
          title: 'Lecture 1',
          description: '',
          videoUrl: null,
          duration: 0,
          notes: ''
        }
      ]
    };
    
    const updatedModules = [...modules, newModule];
    form.setValue('modules', updatedModules);
    
    // Expand the newly added module
    setModuleExpanded(prev => ({ ...prev, [newModuleId]: true }));
    
    toast({
      title: "Module added",
      description: "New module has been added to your course.",
    });
  };

  // Remove a module
  const removeModule = (moduleId: string) => {
    const updatedModules = modules.filter((module: CourseModule) => module.id !== moduleId);
    form.setValue('modules', updatedModules);
    
    // Remove this module from the expanded state
    const { [moduleId]: _, ...rest } = moduleExpanded;
    setModuleExpanded(rest);
    
    toast({
      title: "Module removed",
      description: "Module has been removed from your course.",
    });
  };

  // Update module title
  const updateModuleTitle = (moduleId: string, title: string) => {
    const updatedModules = modules.map((module: CourseModule) => {
      if (module.id === moduleId) {
        return { ...module, title };
      }
      return module;
    });
    
    form.setValue('modules', updatedModules);
  };

  // Add a lecture to a module
  const addLecture = (moduleId: string) => {
    const updatedModules = modules.map((module: CourseModule) => {
      if (module.id === moduleId) {
        const lectures = module.lectures || [];
        return {
          ...module,
          lectures: [
            ...lectures,
            {
              id: uuidv4(),
              title: `Lecture ${lectures.length + 1}`,
              description: '',
              videoUrl: null,
              duration: 0,
              notes: ''
            }
          ]
        };
      }
      return module;
    });
    
    form.setValue('modules', updatedModules);
    
    toast({
      title: "Lecture added",
      description: "New lecture has been added to the module.",
    });
  };

  // Remove a lecture from a module
  const removeLecture = (moduleId: string, lectureId: string) => {
    const updatedModules = modules.map((module: CourseModule) => {
      if (module.id === moduleId) {
        return {
          ...module,
          lectures: module.lectures.filter(lecture => lecture.id !== lectureId)
        };
      }
      return module;
    });
    
    form.setValue('modules', updatedModules);
    
    toast({
      title: "Lecture removed",
      description: "Lecture has been removed from the module.",
    });
  };

  // Update a lecture field
  const updateLecture = (moduleId: string, lectureId: string, field: string, value: any) => {
    // Special case for module description
    if (lectureId === "module_description" && field === "description") {
      const updatedModules = modules.map((module: CourseModule) => {
        if (module.id === moduleId) {
          return { ...module, description: value };
        }
        return module;
      });
      form.setValue('modules', updatedModules);
      return;
    }
    
    const updatedModules = modules.map((module: CourseModule) => {
      if (module.id === moduleId) {
        return {
          ...module,
          lectures: module.lectures.map(lecture => {
            if (lecture.id === lectureId) {
              return { ...lecture, [field]: value };
            }
            return lecture;
          })
        };
      }
      return module;
    });
    
    form.setValue('modules', updatedModules);
  };

  // Initialize with default module if none exists
  useEffect(() => {
    if (!modules || modules.length === 0) {
      const newModuleId = uuidv4();
      const newLectureId = uuidv4();
      
      form.setValue('modules', [{
        id: newModuleId,
        title: 'Module 1',
        description: '',
        lectures: [
          {
            id: newLectureId,
            title: 'Lecture 1',
            description: '',
            videoUrl: null,
            duration: 0,
            notes: ''
          }
        ]
      }]);
      
      // Expand the first module by default
      setModuleExpanded({ [newModuleId]: true });
    }
  }, [form, modules, setModuleExpanded]);

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg border border-gray-200">
      <div>
        <h2 className="text-xl font-semibold mb-1">Course Content</h2>
        <p className="text-sm text-gray-500 mb-4">
          Organize your course into modules and lectures. Upload videos for each lecture.
        </p>
        
        {!storageReady && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Storage buckets for video uploads are not accessible. You can structure your course now, but video uploads may not work until this is resolved.
            </AlertDescription>
          </Alert>
        )}
        
        {anyUploadInProgress && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Video upload in progress. Please wait for uploads to complete before saving the course.
            </AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-6">
        <FormLabel htmlFor="modules">Modules & Lectures</FormLabel>
        
        {modules.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border-2 border-dashed border-gray-200">
            <p className="text-gray-500 mb-4">Your course doesn't have any modules yet</p>
            <Button onClick={addModule}>
              <Plus className="w-4 h-4 mr-2" /> Add First Module
            </Button>
          </div>
        ) : (
          <ModulesList
            modules={modules}
            expandedModules={moduleExpanded}
            setExpandedModules={setModuleExpanded}
            uploadingVideo={uploadingVideo}
            setUploadingVideo={setUploadingVideo}
            uploadStatuses={uploadStatuses}
            updateModuleTitle={updateModuleTitle}
            removeModule={removeModule}
            updateLecture={updateLecture}
            addLecture={addLecture}
            removeLecture={removeLecture}
            uploadVideo={uploadVideo}
            addModule={addModule}
          />
        )}
      </div>
    </div>
  );
};
