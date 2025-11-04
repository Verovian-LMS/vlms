
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import ModuleItem from '@/components/courses/ModuleItem';
import { CourseModule } from '@/types/course';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { apiClient } from '@/lib/api/client';

interface ModulesListProps {
  modules: CourseModule[];
  expandedModules: Record<string, boolean>;
  setExpandedModules: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadingVideo: Record<string, boolean>;
  setUploadingVideo: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  uploadStatuses: Record<string, { isUploading: boolean; progress: number; error?: string | null }>;
  updateModuleTitle: (moduleId: string, title: string) => void;
  removeModule: (moduleId: string) => void;
  updateLesson: (moduleId: string, lessonId: string, field: string, value: any) => void;
  addLesson: (moduleId: string) => void;
  removeLesson: (moduleId: string, lessonId: string) => void;
  uploadVideo: (file: File, moduleId: string, lessonId: string, onSuccess: any, onError?: any) => Promise<void>;
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
  updateLesson,
  addLesson,
  removeLesson,
  uploadVideo,
  addModule
}) => {
  const { handleError } = useErrorHandler();

  // Normalize frontend-generated IDs like "lesson-<uuid>" or "module-<uuid>" to pure UUIDs for backend
  const normalizeUuid = (id: string) => id.replace(/^(lesson|module|course)-/, '');
  
  const toggleModuleExpansion = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };
  
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lessonId: string) => {
    try {
      if (e.target.files?.[0]) {
        const file = e.target.files[0];
        console.log(`File selected for lesson ${lessonId}:`, file.name);
        
        setUploadingVideo(prev => ({ ...prev, [lessonId]: true }));
        
        uploadVideo(
          file,
          moduleId,
          lessonId,
          // Success callback
          async (lessonId: string, url: string, duration: string) => {
            console.log(`Upload success for ${lessonId}:`, { url, duration });
            updateLesson(moduleId, lessonId, 'videoUrl', url);
            // Convert duration "m:ss" string to total seconds
            const parseDurationToSeconds = (d: string): number => {
              if (!d) return 0;
              if (d.includes(':')) {
                const [mStr, sStr] = d.split(':');
                const m = parseInt(mStr, 10) || 0;
                const s = parseInt(sStr, 10) || 0;
                return m * 60 + s;
              }
              const n = parseInt(d, 10);
              return Number.isNaN(n) ? 0 : n;
            };
            const totalSeconds = parseDurationToSeconds(duration);
            updateLesson(moduleId, lessonId, 'duration', totalSeconds);

            // Immediately persist to backend so LessonPage sees video_url
            try {
              const resp = await apiClient.updateLesson(normalizeUuid(lessonId), {
                content_type: 'video',
                video_url: url,
                duration: totalSeconds,
              });
              if (resp.error) {
                throw new Error(resp.error);
              }
            } catch (persistErr) {
              // If update fails (e.g., lesson not yet created in backend), auto-create and retry
              try {
                const moduleCtx = modules.find(m => m.id === moduleId);
                const lessonCtx = moduleCtx?.lessons.find(l => l.id === lessonId);
                const lessonIndex = moduleCtx?.lessons.findIndex(l => l.id === lessonId) ?? 0;

                const createResp = await apiClient.createModuleLesson(normalizeUuid(moduleId), {
                  title: lessonCtx?.title || 'Untitled Lesson',
                  description: lessonCtx?.description || '',
                  sequence_order: lessonIndex,
                  content_type: 'video',
                  video_url: url,
                  duration: totalSeconds,
                });
                if (createResp.error) {
                  throw new Error(createResp.error);
                }

                const newLessonId = createResp.data?.id;
                if (newLessonId) {
                  updateLesson(moduleId, lessonId, 'id', newLessonId);
                  await apiClient.updateLesson(normalizeUuid(newLessonId), {
                    content_type: 'video',
                    video_url: url,
                    duration: totalSeconds,
                  });
                }
              } catch (autoCreateErr) {
                handleError(autoCreateErr, {
                  title: 'Failed to create lesson during upload',
                  source: 'ModulesList',
                  context: { moduleId, lessonId, url }
                });
              }
            }
            setUploadingVideo(prev => ({ ...prev, [lessonId]: false }));
          },
          // Error callback
          (lessonId: string, error: Error) => {
            console.error(`Upload error for ${lessonId}:`, error);
            handleError(error, {
              title: 'Video Upload Failed',
              source: 'ModulesList',
              context: { moduleId, lessonId }
            });
            setUploadingVideo(prev => ({ ...prev, [lessonId]: false }));
          }
        );
      }
      e.target.value = '';
    } catch (error) {
      handleError(error, {
        title: 'Video Upload Error',
        source: 'ModulesList',
        context: { moduleId, lessonId }
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
            updateLesson={(lessonId, field, value) => updateLesson(module.id, lessonId, field, value)}
            addLesson={() => addLesson(module.id)}
            removeLesson={(lessonId) => removeLesson(module.id, lessonId)}
            canRemoveModule={modules.length > 1}
            isExpanded={isExpanded}
            toggleExpanded={() => toggleModuleExpansion(module.id)}
            handleVideoUpload={(e) => handleVideoUpload(e, module.id, e.target.id.split('-').pop() || '')}
            uploadProgress={Object.fromEntries(
              Object.entries(uploadStatuses)
                .filter(([lessonId]) => module.lessons.some(l => l.id === lessonId))
                .map(([lessonId, status]) => [lessonId, status.progress])
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
