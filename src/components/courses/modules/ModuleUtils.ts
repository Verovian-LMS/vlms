
import { CourseModule, LectureUpload, LectureContentType } from '@/types/course';

export const createNewModule = (): CourseModule => {
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    lectures: []
  };
};

export const createNewLecture = (contentType: LectureContentType = 'video'): LectureUpload => {
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
      module.lectures.length > 0 && 
      module.lectures.every(lecture => lecture.title.trim() !== '')
    );
};

export const getContentUrlForType = (lecture: LectureUpload, contentType: LectureContentType = 'video'): string | null => {
  switch (contentType) {
    case 'video': return lecture.videoUrl;
    case 'pdf': return lecture.pdfUrl;
    case 'slides': return lecture.slidesUrl;
    case 'audio': return lecture.audioUrl;
    case 'document': return lecture.documentUrl;
    case 'interactive': return lecture.interactiveUrl;
    case 'downloadable': return lecture.downloadableUrl;
    default: return lecture.videoUrl;
  }
};

export const getContentTypeLabel = (contentType: LectureContentType = 'video'): string => {
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
