
import { CourseModule } from '@/types/course';
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
    
    // If module has lectures, check if they all have titles
    if (module.lectures.length === 0) {
      return false;
    }
    
    return module.lectures.every(lecture => !!lecture.title.trim());
  });
};

/**
 * Create a new module
 */
export const createNewModule = (): CourseModule => {
  const newModuleId = uuidv4();
  const newLectureId = uuidv4();
  
  return {
    id: newModuleId,
    title: `New Module`,
    description: "",
    lectures: [{
      id: newLectureId,
      title: 'New Lecture',
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
 * Create a new lecture for a module
 */
export const createNewLecture = () => {
  return {
    id: uuidv4(),
    title: 'New Lecture',
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
    console.log('Lectures count:', module.lectures.length);
    
    module.lectures.forEach((lecture, j) => {
      console.group(`Lecture ${j + 1}: ${lecture.title}`);
      console.log('ID:', lecture.id);
      console.log('Has video:', !!lecture.videoUrl);
      console.log('Content type:', lecture.contentType || 'video');
      console.log('Duration:', lecture.duration || 0);
      console.log('Resources count:', lecture.resources?.length || 0);
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
    return total + module.lectures.reduce((moduleTotal, lecture) => {
      return moduleTotal + (lecture.duration || 0);
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
