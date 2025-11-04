
// Add new content types
export type LessonContentType = 'video' | 'pdf' | 'slides' | 'document' | 'audio' | 'interactive' | 'downloadable';

// Updated lesson type to include new content types
export interface LessonUpload {
  id: string;
  title: string;
  description?: string;
  contentType?: LessonContentType;
  videoUrl?: string | null;
  pdfUrl?: string | null;
  slidesUrl?: string | null;
  audioUrl?: string | null;
  documentUrl?: string | null;
  interactiveUrl?: string | null;
  downloadableUrl?: string | null;
  duration?: number;
  notes?: string;
  uploadProgress?: number;
  uploadError?: string | null;
  resources?: LessonResource[];
}

export interface LessonResource {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number; // in bytes
  isDownloadable: boolean;
}

export interface CourseModule {
    id: string;
    title: string;
    description: string;
    lessons: LessonUpload[];
}

// Add missing types that were causing errors
export interface RequirementItem {
  id: string;
  text: string;
}

export interface LearningPointItem {
  id: string;
  text: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  long_description?: string;
  image_url?: string;
  status: 'draft' | 'published' | 'archived';
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  author_id: string;
  created_at: string;
  updated_at: string;
  modules?: number;
  lessons?: number;
}

export interface CourseType {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published' | 'archived';
  image_url?: string;
  author_id?: string;
  created_at?: string;
  updated_at?: string;
  category?: string;
  level?: string;
  modules?: number;
  lessons?: number;
  rating?: number;   // Add this line to fix the error
  reviews?: number;  // Add this for completeness
  author?: {
    name: string;
    avatar?: string;
  };
}

// Update CourseFormState to match CourseFormValues
export interface CourseFormState {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  imageFile?: File | null;
  imagePreview?: string | null;
  modules: CourseModule[];
  requirements?: RequirementItem[];
  learningPoints?: LearningPointItem[];
  uploadStatuses?: Record<string, {
    isUploading: boolean;
    progress: number;
    error?: string | null;
  }>;
}

// CourseFormValues must have all required properties declared as non-optional
export type CourseFormValues = {
  title: string;
  description: string;
  longDescription: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  imageFile?: File | null;
  imagePreview?: string | null;
  modules: CourseModule[];
  requirements?: RequirementItem[];
  learningPoints?: LearningPointItem[];
  uploadStatuses?: Record<string, {
    isUploading: boolean;
    progress: number;
    error?: string | null;
  }>;
};

// Ensure we have a proper type for the createNewLesson function in ModuleUtils.ts
export const createNewModule = (): CourseModule => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    lessons: []
  };
};

export const createNewLesson = (): LessonUpload => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    contentType: "video",
    videoUrl: null,
    duration: 0,
    notes: "",
    resources: []
  };
};

export const validateModules = (modules: CourseModule[]): boolean => {
  return modules.length > 0 && 
    modules.every(module => 
      module.title.trim() !== '' && 
      module.lessons.length > 0 && 
      module.lessons.every(lesson => lesson.title.trim() !== '')
    );
};
