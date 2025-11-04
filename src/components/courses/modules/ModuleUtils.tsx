
import { CourseModule, LessonUpload } from '@/types/course';
import { v4 as uuidv4 } from 'uuid';

/**
 * Check if the modules are valid
 */
export const validateModules = (modules: CourseModule[]): boolean => {
  if (modules.length === 0) {
    return false;
  }
  
  return modules.every(module => {
    // Check if module has a title
    if (!module.title.trim()) {
      return false;
    }
    
    // If module has lessons, check if they all have titles
    if (module.lessons.length === 0) {
      return false;
    }
    
    return module.lessons.every(lesson => !!lesson.title.trim());
  });
};

/**
 * Create a new module
 */
export const createNewModule = (): CourseModule => {
  const newModuleId = uuidv4();
  const newLessonId = uuidv4();
  
  return {
    id: newModuleId,
    title: `New Module`,
    description: "",
    lessons: [{
      id: newLessonId,
      title: 'New Lesson',
      description: '',
      contentType: 'video',
      duration: 0,
      videoUrl: null,
      notes: '',
      resources: []
    }]
  };
};

/**
 * Create a new lesson for a module
 */
export const createNewLesson = (): LessonUpload => {
  return {
    id: uuidv4(),
    title: 'New Lesson',
    description: '',
    contentType: 'video',
    duration: 0,
    videoUrl: null,
    notes: '',
    resources: []
  };
};

/**
 * Debug modules - print useful information to console
 */
export const debugModules = (modules: CourseModule[]): void => {
  console.group('Modules Debug Info');
  console.log('Number of modules:', modules.length);
  
  modules.forEach((module, i) => {
    console.group(`Module ${i + 1}: ${module.title}`);
    console.log('ID:', module.id);
    console.log('Description length:', module.description?.length || 0);
    console.log('Lessons count:', module.lessons.length);
    
    module.lessons.forEach((lesson, j) => {
      console.group(`Lesson ${j + 1}: ${lesson.title}`);
      console.log('ID:', lesson.id);
      console.log('Has video:', !!lesson.videoUrl);
      console.log('Content type:', lesson.contentType || 'video');
      console.log('Duration:', lesson.duration || 0);
      console.log('Resources count:', lesson.resources?.length || 0);
      console.groupEnd();
    });
    
    console.groupEnd();
  });
  
  console.log('Valid?', validateModules(modules));
  console.groupEnd();
};

/**
 * Calculate total course duration in seconds
 */
export const calculateCourseDuration = (modules: CourseModule[]): number => {
  return modules.reduce((total, module) => {
    return total + module.lessons.reduce((moduleTotal, lesson) => {
      return moduleTotal + (lesson.duration || 0);
    }, 0);
  }, 0);
};

/**
 * Format seconds to readable duration (HH:MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || seconds <= 0) return '00:00';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};
