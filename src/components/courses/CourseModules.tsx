
import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import ModulesList from './modules/ModulesList';
import ModuleActions from './modules/ModuleActions';
import { AlertCircle } from 'lucide-react';
import { useVideoUpload } from '@/hooks/use-video-upload';
import { CourseModule, LectureContentType } from '@/types/course';
import { createNewModule, createNewLecture, validateModules } from './modules/ModuleUtils';

interface CourseModulesProps {
  modules: CourseModule[];
  onModulesChange: (modules: CourseModule[]) => void;
  isStep3Valid: boolean;
  isUploading: boolean;
  onSubmit: () => void;
  setStep: (step: number) => void;
  storageReady: boolean;
}

export const CourseModules: React.FC<CourseModulesProps> = ({
  modules,
  onModulesChange,
  isStep3Valid,
  isUploading: isSubmitting,
  onSubmit,
  setStep,
  storageReady
}) => {
  const { uploadVideo, uploadStatuses } = useVideoUpload();
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [uploadingVideo, setUploadingVideo] = useState<Record<string, boolean>>({});
  
  // Update lecture data within a module
  const updateLecture = useCallback((
    moduleId: string,
    lectureId: string,
    field: string,
    value: any
  ) => {
    onModulesChange(modules.map(module => {
      if (module.id === moduleId) {
        return {
          ...module,
          lectures: module.lectures.map(lecture =>
            lecture.id === lectureId ? { ...lecture, [field]: value } : lecture
          )
        };
      }
      return module;
    }));
  }, [modules, onModulesChange]);

  const updateModuleTitle = useCallback((moduleId: string, title: string) => {
    onModulesChange(modules.map(m =>
      m.id === moduleId ? { ...m, title } : m
    ));
  }, [modules, onModulesChange]);
  
  const removeModule = useCallback((moduleId: string) => {
    onModulesChange(modules.filter(m => m.id !== moduleId));
  }, [modules, onModulesChange]);

  const addModule = useCallback(() => {
    const newModule = createNewModule();
    onModulesChange([...modules, newModule]);
    setExpandedModules(prev => ({ ...prev, [newModule.id]: true }));
  }, [modules, onModulesChange]);

  const addLecture = useCallback((moduleId: string) => {
    const newLecture = createNewLecture();
    onModulesChange(modules.map(m =>
      m.id === moduleId ? { ...m, lectures: [...m.lectures, newLecture] } : m
    ));
  }, [modules, onModulesChange]);

  const removeLecture = useCallback((moduleId: string, lectureId: string) => {
    onModulesChange(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lectures: m.lectures.filter(l => l.id !== lectureId) };
      }
      return m;
    }));
  }, [modules, onModulesChange]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6"
    >
      <h2 className="text-xl font-bold font-nunito-sans mb-4">Course Modules & Lectures</h2>
      <p className="text-sm text-slate-600 mb-6">
        Organize your course content into modules and lectures. Upload videos for each lecture.
      </p>

      {!storageReady && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 text-yellow-800 mr-2 flex-shrink-0" />
            <div>
              <p className="font-bold text-yellow-800">Storage Not Ready</p>
              <p className="text-sm text-yellow-700">
                Video uploads are disabled because the connection to the "course-videos" storage bucket could not be established. 
                Please ensure the bucket exists and is accessible.
              </p>
            </div>
          </div>
        </div>
      )}

      <ModulesList
        modules={modules}
        expandedModules={expandedModules}
        setExpandedModules={setExpandedModules}
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
      
      <ModuleActions
        modules={modules}
        isStep3Valid={isStep3Valid}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onBack={() => setStep(2)}
        uploadStatuses={uploadStatuses}
      />
    </motion.div>
  );
};

export default CourseModules;
