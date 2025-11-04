
import { CourseModule, LessonUpload, LessonContentType } from '@/types/course';

export const createNewModule = (): CourseModule => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    lessons: []
  };
};

export const createNewLesson = (contentType: LessonContentType = 'video'): LessonUpload => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    contentType: contentType,
    videoUrl: null,
    pdfUrl: null,
    slidesUrl: null,
    audioUrl: null,
    documentUrl: null,
    interactiveUrl: null,
    downloadableUrl: null,
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

export const getContentUrlForType = (lesson: LessonUpload, contentType: LessonContentType = 'video'): string | null => {
  switch (contentType) {
    case 'video': return lesson.videoUrl;
    case 'pdf': return lesson.pdfUrl;
    case 'slides': return lesson.slidesUrl;
    case 'audio': return lesson.audioUrl;
    case 'document': return lesson.documentUrl;
    case 'interactive': return lesson.interactiveUrl;
    case 'downloadable': return lesson.downloadableUrl;
    default: return lesson.videoUrl;
  }
};

export const getContentTypeLabel = (contentType: LessonContentType = 'video'): string => {
  switch (contentType) {
    case 'video': return 'Video';
    case 'pdf': return 'PDF Document';
    case 'slides': return 'Presentation Slides';
    case 'audio': return 'Audio';
    case 'document': return 'Document';
    case 'interactive': return 'Interactive Content';
    case 'downloadable': return 'Downloadable Resources';
    default: return 'Video';
  }
};
