
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ModuleItem from '@/components/courses/ModuleItem';
import { CourseModule } from '@/types/course';
import { useErrorHandler } from '@/hooks/use-error-handler';

interface ModulesListProps {
  modules: CourseModule[];
  expandedModules: Record<string, boolean>;
  setExpandedModules: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadingVideo: Record<string, boolean>;
  setUploadingVideo: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadStatuses: Record<string, { isUploading: boolean; progress: number; error?: string | null }>;
  updateModuleTitle: (moduleId: string, title: string) => void;
  removeModule: (moduleId: string) => void;
  updateLecture: (moduleId: string, lectureId: string, field: string, value: any) => void;
  addLecture: (moduleId: string) => void;
  removeLecture: (moduleId: string, lectureId: string) => void;
  uploadVideo: (file: File, moduleId: string, lectureId: string, onSuccess: any, onError?: any) => Promise<void>;
  addModule: () => void;
}

const ModulesList: React.FC<ModulesListProps> = ({
  modules,
  expandedModules,
  setExpandedModules,
  uploadingVideo,
  setUploadingVideo,
  uploadStatuses,
  updateModuleTitle,
  removeModule,
  updateLecture,
  addLecture,
  removeLecture,
  uploadVideo,
  addModule
}) => {
  const { handleError } = useErrorHandler();
  
  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lectureId: string) => {
    try {
      if (e.target.files?.[0]) {
        const file = e.target.files[0];
        console.log(`File selected for lecture ${lectureId}:`, file.name);
        
        setUploadingVideo(prev => ({ ...prev, [lectureId]: true }));
        
        uploadVideo(
          file,
          moduleId,
          lectureId,
          // Success callback
          (lectureId: string, url: string, duration: string) => {
            console.log(`Upload success for ${lectureId}:`, { url, duration });
            updateLecture(moduleId, lectureId, 'videoUrl', url);
            updateLecture(moduleId, lectureId, 'duration', parseInt(duration));
            setUploadingVideo(prev => ({ ...prev, [lectureId]: false }));
          },
          // Error callback
          (lectureId: string, error: Error) => {
            console.error(`Upload error for ${lectureId}:`, error);
            handleError(error, {
              title: 'Video Upload Failed',
              source: 'ModulesList',
              context: { moduleId, lectureId }
            });
            setUploadingVideo(prev => ({ ...prev, [lectureId]: false }));
          }
        );
      }
      e.target.value = '';
    } catch (error) {
      handleError(error, {
        title: 'Video Upload Error',
        source: 'ModulesList',
        context: { moduleId, lectureId }
      });
    }
  };

  return (
    <div className="space-y-6">
      {modules.map((module, moduleIndex) => {
        const isExpanded = expandedModules[module.id] ?? moduleIndex === 0;
        return (
          <ModuleItem
            key={module.id}
            module={module}
            moduleIndex={moduleIndex}
            updateModuleTitle={updateModuleTitle}
            removeModule={removeModule}
            updateLecture={(lectureId, field, value) => updateLecture(module.id, lectureId, field, value)}
            addLecture={() => addLecture(module.id)}
            removeLecture={(lectureId) => removeLecture(module.id, lectureId)}
            canRemoveModule={modules.length > 1}
            isExpanded={isExpanded}
            toggleExpanded={() => toggleModuleExpansion(module.id)}
            handleVideoUpload={(e) => handleVideoUpload(e, module.id, e.target.id.split('-').pop() || '')}
            uploadProgress={Object.fromEntries(
              Object.entries(uploadStatuses)
                .filter(([lectureId]) => module.lectures.some(l => l.id === lectureId))
                .map(([lectureId, status]) => [lectureId, status.progress])
            )}
            isUploading={uploadingVideo}
          />
        );
      })}
      
      <Button variant="outline" onClick={addModule} className="mt-4">
        <Plus className="w-4 h-4 mr-2" /> Add Module
      </Button>
    </div>
  );
};

export default ModulesList;
