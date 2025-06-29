
import { useState } from "react";
import type {
  CourseFormState,
  RequirementItem,
  LearningPointItem,
  CourseModule,
  LectureUpload
} from '@/types/course';
import { CourseFormValues } from "@/lib/validations/course";

export const useCourseForm = () => {
  // Form state - updated to match CourseFormValues from validation schema
  const [formState, setFormState] = useState<CourseFormValues>({
    title: '',
    description: '',
    longDescription: '',
    level: 'beginner',
    category: '',
    imageFile: undefined,
    imagePreview: '',
    modules: []
  });

  // Validation functions
  const isStep1Valid = () => {
    const validLevels = ['beginner', 'intermediate', 'advanced', 'expert'];
    return formState.title.trim() !== '' && 
           formState.description.trim() !== '' && 
           validLevels.includes(formState.level) && 
           formState.category.trim() !== '';
  };

  const isStep2Valid = () => {
    return formState.longDescription?.length > 20;
  };

  const isStep3Valid = () => {
    return formState.modules.length > 0 && 
           formState.modules.every(module => 
             module.title.trim() !== '' && 
             module.lectures.length > 0 && 
             module.lectures.every(lecture => lecture.title.trim() !== '')
           );
  };

  // ==================== STATE UPDATERS ==================== //
  // General updater for any field
  const updateFormState = (updates: Partial<CourseFormValues>) => {
    setFormState(prev => ({ ...prev, ...updates }));
  };

  // Specific updaters for better autocompletion
  const updateTitle = (title: string) => updateFormState({ title });
  const updateDescription = (description: string) => updateFormState({ description });
  const updateLongDescription = (longDescription: string) => updateFormState({ longDescription });
  const updateLevel = (level: 'beginner' | 'intermediate' | 'advanced' | 'expert') => updateFormState({ level });
  const updateCategory = (category: string) => updateFormState({ category });

  // For file uploads
  const updateImage = (file: File | null, previewUrl: string) => 
    updateFormState({ imageFile: file, imagePreview: previewUrl });

  // For modules (nested updates)
  const updateModules = (newModules: CourseFormValues['modules']) => 
    updateFormState({ modules: newModules });

  return {
    formState,
    isStep1Valid,
    isStep2Valid,
    isStep3Valid,
    updateTitle,
    updateDescription,
    updateLongDescription,
    updateLevel,
    updateCategory,
    updateImage,
    updateModules
  };
};
