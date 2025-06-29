
// Add new content types
export type LectureContentType = 'video' | 'pdf' | 'slides' | 'document' | 'audio' | 'interactive' | 'downloadable';

// Updated lecture type to include new content types
export interface LectureUpload {
  id: string;
  title: string;
  description?: string;
  contentType?: LectureContentType;
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
  resources?: LectureResource[];
}

export interface LectureResource {
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
    lectures: LectureUpload[];
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
  lectures?: number;
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
  lectures?: number;
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

// Ensure we have a proper type for the createNewLecture function in ModuleUtils.ts
export const createNewModule = (): CourseModule => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    lectures: []
  };
};

export const createNewLecture = (): LectureUpload => {
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
      module.lectures.length > 0 && 
      module.lectures.every(lecture => lecture.title.trim() !== '')
    );
};
