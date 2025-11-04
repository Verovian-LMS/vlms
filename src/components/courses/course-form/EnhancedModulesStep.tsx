import React, { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/FastApiAuthContext';
import Dropzone from '@/components/ui/Dropzone';
import VideoPlayer from '@/components/video/VideoPlayer';
import apiClient from '@/lib/api/client';
// Backend base URL for building absolute file URLs
const API_BASE_URL = 'http://localhost:8000';
import { 
  Plus, 
  GripVertical, 
  Trash2, 
  Edit3, 
  Eye, 
  Video, 
  FileText, 
  Presentation, 
  Headphones, 
  Download, 
  MousePointer, 
  Upload,
  Clock,
  Users,
  BookOpen,
  Play,
  Pause,
  MoreVertical,
  AlertCircle
} from 'lucide-react';

// Content type configurations
const CONTENT_TYPES = {
  video: {
    icon: Video,
    label: 'Video Lesson',
    description: 'Upload or embed video content',
    color: 'bg-red-100 text-red-700 border-red-200',
    fields: ['video_url', 'duration', 'transcript']
  },
  pdf: {
    icon: FileText,
    label: 'PDF Document',
    description: 'Upload PDF files and documents',
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    fields: ['pdf_url', 'page_count']
  },
  slides: {
    icon: Presentation,
    label: 'Presentation',
    description: 'Interactive slide presentations',
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    fields: ['slides_url', 'slide_count']
  },
  audio: {
    icon: Headphones,
    label: 'Audio Content',
    description: 'Podcasts, lessons, and audio materials',
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    fields: ['audio_url', 'duration', 'transcript']
  },
  document: {
    icon: FileText,
    label: 'Text Document',
    description: 'Rich text content and articles',
    color: 'bg-green-100 text-green-700 border-green-200',
    fields: ['content', 'reading_time']
  },
  interactive: {
    icon: MousePointer,
    label: 'Interactive Content',
    description: 'Quizzes, simulations, and interactive exercises',
    color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    fields: ['interactive_url', 'completion_criteria']
  },
  downloadable: {
    icon: Download,
    label: 'Downloadable Resource',
    description: 'Files students can download',
    color: 'bg-gray-100 text-gray-700 border-gray-200',
    fields: ['download_url', 'file_size', 'file_type']
  }
};

interface EnhancedModulesStepProps {
  form: any;
  onNext: () => void;
  onPrevious: () => void;
  isLastStep: boolean;
  isFirstStep: boolean;
  courseId?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  content_type: keyof typeof CONTENT_TYPES;
  duration?: number;
  is_preview?: boolean;
  mark_complete_on_load?: boolean;
  order_index: number;
  // Content-specific fields
  video_url?: string;
  pdf_url?: string;
  slides_url?: string;
  audio_url?: string;
  content?: string;
  interactive_url?: string;
  download_url?: string;
  transcript?: string;
  page_count?: number;
  slide_count?: number;
  reading_time?: number;
  completion_criteria?: string;
  file_size?: string;
  file_type?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order_index: number;
  lessons: Lesson[];
}

const EnhancedModulesStep: React.FC<EnhancedModulesStepProps> = ({
  form,
  onNext,
  onPrevious,
  isLastStep,
  isFirstStep,
  courseId,
}) => {
  const { control, watch, setValue } = useFormContext();
  const { fields: modules, append: appendModule, remove: removeModule, move: moveModule } = useFieldArray({
    control,
    name: 'modules'
  });

  const [selectedModule, setSelectedModule] = useState<number | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isLessonDialogOpen, setIsLessonDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<{ moduleIndex: number; lessonIndex: number } | null>(null);
  const { toast } = useToast();

  // Add new module
  const addModule = () => {
    const newModule: Module = {
      id: `module-${uuidv4()}`,
      title: `Module ${modules.length + 1}`,
      description: '',
      order_index: modules.length,
      lessons: []
    };
    appendModule(newModule);
    setSelectedModule(modules.length);
  };

  // Add new lesson to module
  const addLesson = (moduleIndex: number, contentType: keyof typeof CONTENT_TYPES) => {
    const currentModules = watch('modules');
    const module = currentModules[moduleIndex];
    
    // Initialize content-specific fields based on content type
    const contentFields: Partial<Lesson> = {};
    
    switch (contentType) {
      case 'video':
        contentFields.video_url = '';
        contentFields.duration = 0;
        contentFields.transcript = '';
        break;
      case 'pdf':
        contentFields.pdf_url = '';
        contentFields.page_count = 0;
        break;
      case 'slides':
        contentFields.slides_url = '';
        contentFields.slide_count = 0;
        break;
      case 'audio':
        contentFields.audio_url = '';
        contentFields.duration = 0;
        contentFields.transcript = '';
        break;
      case 'document':
        contentFields.content = '';
        contentFields.reading_time = 0;
        break;
      case 'interactive':
        contentFields.interactive_url = '';
        contentFields.completion_criteria = '';
        break;
      case 'downloadable':
        contentFields.download_url = '';
        contentFields.file_size = '';
        contentFields.file_type = '';
        break;
    }
    
    const newLesson: Lesson = {
      id: `lesson-${uuidv4()}`,
      title: `New ${CONTENT_TYPES[contentType].label}`,
      description: '',
      content_type: contentType,
      order_index: module.lessons.length,
      is_preview: false,
      mark_complete_on_load: (contentType === 'pdf' || contentType === 'document' || contentType === 'slides'),
      ...contentFields
    };

    const updatedModules = [...currentModules];
    // Capture the index before pushing to avoid off-by-one when editing
    const nextIndex = module.lessons.length;
    updatedModules[moduleIndex].lessons.push(newLesson);
    setValue('modules', updatedModules);
    
    setSelectedLesson(newLesson);
    // Use the pre-push index so save updates the correct lesson
    setEditingLesson({ moduleIndex, lessonIndex: nextIndex });
    setIsLessonDialogOpen(true);
  };

  // Edit lesson
  const editLesson = (moduleIndex: number, lessonIndex: number) => {
    const currentModules = watch('modules');
    const lesson = currentModules[moduleIndex].lessons[lessonIndex];
    setSelectedLesson(lesson);
    setEditingLesson({ moduleIndex, lessonIndex });
    setIsLessonDialogOpen(true);
  };

  // Save lesson
  const saveLesson = (lessonData: Lesson) => {
    if (!editingLesson) {
      console.warn('EnhancedModulesStep.saveLesson called without editingLesson context', {
        lessonData,
      });
      return;
    }

    console.groupCollapsed('EnhancedModulesStep.saveLesson');
    const t0 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
    try {
      const { moduleIndex, lessonIndex } = editingLesson;
      const currentModules = watch('modules');

      console.debug('Before update snapshot', {
        moduleIndex,
        lessonIndex,
        modulesCount: Array.isArray(currentModules) ? currentModules.length : null,
        lessonsCount:
          Array.isArray(currentModules?.[moduleIndex]?.lessons)
            ? currentModules[moduleIndex].lessons.length
            : null,
      });

      console.debug('Applying lesson update', {
        lessonSummary: {
          id: lessonData.id,
          title: lessonData.title,
          content_type: lessonData.content_type,
          duration: lessonData.duration,
          hasVideoUrl: Boolean((lessonData as any).video_url || (lessonData as any).videoUrl),
          hasPoster: Boolean((lessonData as any).poster),
        },
      });
      // Update nested lesson path directly to avoid remounting whole modules array
      // and ensure react-hook-form notifies dependent fields/tabs correctly.
      const nestedPath = `modules.${moduleIndex}.lessons.${lessonIndex}` as const;
      setValue(nestedPath, lessonData, { shouldDirty: true, shouldValidate: true, shouldTouch: true });


      const afterModules = watch('modules');
      console.debug('After update snapshot', {
        modulesCount: Array.isArray(afterModules) ? afterModules.length : null,
        updatedLessonTitle: afterModules?.[moduleIndex]?.lessons?.[lessonIndex]?.title,
        hasLecturesMirror: false,
        updatedLectureTitle: undefined,
      });

      setIsLessonDialogOpen(false);
      setEditingLesson(null);
      setSelectedLesson(null);

      const t1 = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
      console.info('Lesson saved successfully', {
        moduleIndex,
        lessonIndex,
        elapsedMs: t1 - t0,
      });

      toast({
        title: "Lesson Updated",
        description: "Your lesson has been saved successfully.",
      });
    } catch (err) {
      console.error('Lesson save error', err, {
        lessonData,
        editingLesson,
      });
      toast({
        title: "Lesson Save Error",
        description:
          err instanceof Error
            ? err.message
            : 'An unexpected error occurred while saving the lesson.',
        variant: 'destructive',
      });
    } finally {
      console.groupEnd();
    }
  };

  // Delete lesson
  const deleteLesson = (moduleIndex: number, lessonIndex: number) => {
    const currentModules = watch('modules');
    const updatedModules = [...currentModules];
    updatedModules[moduleIndex].lessons.splice(lessonIndex, 1);
    
    // Reorder remaining lessons
    updatedModules[moduleIndex].lessons.forEach((lesson, index) => {
      lesson.order_index = index;
    });
    
    setValue('modules', updatedModules);
    
    toast({
      title: "Lesson Deleted",
      description: "The lesson has been removed from your course.",
    });
  };

  // Calculate total course stats
  const courseStats = React.useMemo(() => {
    const allModules = watch('modules') || [];
    const totalLessons = allModules.reduce((acc, module) => acc + module.lessons.length, 0);
    const totalDuration = allModules.reduce((acc, module) => 
      acc + module.lessons.reduce((lessonAcc, lesson) => lessonAcc + (lesson.duration || 0), 0), 0
    );
    
    const contentTypeCount = allModules.reduce((acc, module) => {
      module.lessons.forEach(lesson => {
        const ct = (lesson?.content_type ?? lesson?.contentType);
        if (ct) {
          acc[ct] = (acc[ct] || 0) + 1;
        }
      });
      return acc;
    }, {} as Record<string, number>);

    return { totalLessons, totalDuration, contentTypeCount };
  }, [watch('modules')]);

  return (
    <div className="space-y-8">
      {/* Missing course context banner */}
      {!courseId && (
        <Alert className="bg-amber-50 border-amber-300 text-amber-900">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm">Course not saved yet</AlertTitle>
          <AlertDescription className="text-xs">
            Save the course first to enable creating modules and lessons and to persist uploads.
          </AlertDescription>
        </Alert>
      )}
      {/* Course Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Course Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{modules.length}</div>
              <div className="text-sm text-blue-600">Modules</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{courseStats.totalLessons}</div>
              <div className="text-sm text-green-600">Lessons</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.floor(courseStats.totalDuration / 60)}h {courseStats.totalDuration % 60}m
              </div>
              <div className="text-sm text-purple-600">Duration</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(courseStats.contentTypeCount).length}
              </div>
              <div className="text-sm text-orange-600">Content Types</div>
            </div>
          </div>
          
          {/* Content Type Distribution */}
          {Object.keys(courseStats.contentTypeCount).length > 0 && (
            <div className="mt-4">
              <Label className="text-sm font-medium mb-2 block">Content Distribution</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(courseStats.contentTypeCount).map(([type, count]) => {
                  const config = CONTENT_TYPES[type as keyof typeof CONTENT_TYPES];
                  const Icon = config.icon;
                  return (
                    <Badge key={type} variant="secondary" className={config.color}>
                      <Icon className="h-3 w-3 mr-1" />
                      {config.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Course Modules</h3>
          <Button type="button" onClick={addModule} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Module</span>
          </Button>
        </div>

        {modules.length === 0 ? (
          <Card className="border-dashed border-2 border-gray-300">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">No modules yet</h3>
              <p className="text-gray-500 mb-4">Start building your course by adding your first module</p>
              <Button type="button" onClick={addModule} className="flex items-center space-x-2">
                <Plus className="h-4 w-4" />
                <span>Create First Module</span>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Reorder.Group 
            axis="y" 
            values={modules} 
            onReorder={(newOrder) => setValue('modules', newOrder)}
            className="space-y-4"
          >
            {modules.map((module: Module, moduleIndex) => (
              <Reorder.Item key={module.id} value={module}>
                <ModuleCard
                  module={module}
                  moduleIndex={moduleIndex}
                  isSelected={selectedModule === moduleIndex}
                  onSelect={() => setSelectedModule(moduleIndex === selectedModule ? null : moduleIndex)}
                  onAddLesson={addLesson}
                  onEditLesson={editLesson}
                  onDeleteLesson={deleteLesson}
                  onDeleteModule={() => removeModule(moduleIndex)}
                  form={form}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        )}
      </div>

      {/* Lesson Editor Dialog */}
      <LessonEditorDialog
        isOpen={isLessonDialogOpen}
        onClose={() => setIsLessonDialogOpen(false)}
        lesson={selectedLesson}
        onSave={saveLesson}
        courseId={courseId}
      />
    </div>
  );
};

// Module Card Component
const ModuleCard: React.FC<{
  module: Module;
  moduleIndex: number;
  isSelected: boolean;
  onSelect: () => void;
  onAddLesson: (moduleIndex: number, contentType: keyof typeof CONTENT_TYPES) => void;
  onEditLesson: (moduleIndex: number, lessonIndex: number) => void;
  onDeleteLesson: (moduleIndex: number, lessonIndex: number) => void;
  onDeleteModule: () => void;
  form: any;
}> = ({ 
  module, 
  moduleIndex, 
  isSelected, 
  onSelect, 
  onAddLesson, 
  onEditLesson, 
  onDeleteLesson, 
  onDeleteModule,
  form 
}) => {
  const { setValue, watch } = useFormContext();

  const updateModuleField = (field: string, value: string) => {
    // Update only the specific nested field to avoid replacing the array
    // Replacing the entire array on each keystroke was causing remounts and focus loss
    setValue(`modules.${moduleIndex}.${field}`, value, { shouldDirty: true, shouldTouch: true });
  };

  return (
    <Card className={`transition-all ${isSelected ? 'ring-2 ring-medblue-500' : ''}`}>
      <CardHeader className="cursor-pointer" onClick={onSelect}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <GripVertical className="h-5 w-5 text-gray-400" />
            <div className="flex-1">
              {(() => {
                const currentTitle = watch(`modules.${moduleIndex}.title`);
                const currentDescription = watch(`modules.${moduleIndex}.description`);
                return (
                  <>
                  <Input
                value={currentTitle ?? module.title}
                onChange={(e) => updateModuleField('title', e.target.value)}
                className="font-semibold text-lg border-none p-0 h-auto focus:ring-0"
                placeholder="Module Title"
                onClick={(e) => e.stopPropagation()}
              />
              <Input
                value={currentDescription ?? module.description}
                onChange={(e) => updateModuleField('description', e.target.value)}
                className="text-sm text-gray-600 border-none p-0 h-auto focus:ring-0 mt-1"
                placeholder="Module description..."
                onClick={(e) => e.stopPropagation()}
              />
                  </>
                );
              })()}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              {module.lessons.length} lesson{module.lessons.length !== 1 ? 's' : ''}
            </Badge>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteModule();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="pt-0">
              <Separator className="mb-4" />
              
              {/* Add Lesson Buttons */}
              <div className="mb-4">
                <Label className="text-sm font-medium mb-2 block">Add New Lesson</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(CONTENT_TYPES).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <Button
                        type="button"
                        key={type}
                        variant="outline"
                        size="sm"
                        onClick={() => onAddLesson(moduleIndex, type as keyof typeof CONTENT_TYPES)}
                        className={`flex flex-col items-center p-3 h-auto ${config.color}`}
                      >
                        <Icon className="h-4 w-4 mb-1" />
                        <span className="text-xs">{config.label}</span>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Lessons List */}
              {module.lessons.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Lessons</Label>
                  {(() => {
                    const seen = new Set<string>();
                    const uniqueLessons = module.lessons.filter((l) => {
                      if (seen.has(l.id)) return false;
                      seen.add(l.id);
                      return true;
                    });
                    return uniqueLessons.map((lesson, lessonIndex) => (
                      <LessonItem
                        key={`${lesson.id}-${lessonIndex}`}
                        lesson={lesson}
                        onEdit={() => onEditLesson(moduleIndex, lessonIndex)}
                        onDelete={() => onDeleteLesson(moduleIndex, lessonIndex)}
                      />
                    ));
                  })()}
                </div>
              )}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

// Lesson Item Component
const LessonItem: React.FC<{
  lesson: Lesson;
  onEdit: () => void;
  onDelete: () => void;
}> = ({ lesson, onEdit, onDelete }) => {
  const config = CONTENT_TYPES[lesson.content_type];
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <div className={`p-2 rounded ${config.color}`}>
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <p className="font-medium text-sm">{lesson.title}</p>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>{config.label}</span>
            {lesson.duration && (
              <>
                <span>•</span>
                <span>{lesson.duration} min</span>
              </>
            )}
            {lesson.is_preview && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-xs">Preview</Badge>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-1">
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          <Edit3 className="h-3 w-3" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

// Lesson Editor Dialog Component
const LessonEditorDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  lesson: Lesson | null;
  onSave: (lesson: Lesson) => void;
  courseId?: string;
}> = ({ isOpen, onClose, lesson, onSave, courseId }) => {
  const [editedLesson, setEditedLesson] = useState<Lesson | null>(null);

  React.useEffect(() => {
    if (lesson) {
      setEditedLesson({ ...lesson });
    }
  }, [lesson]);
  // Ensure hooks run on every render; avoid conditional returns before hooks.
  // Derive safe values when editedLesson is not yet available.
  const contentType: keyof typeof CONTENT_TYPES = editedLesson?.content_type ?? 'video';
  const duration = editedLesson?.duration ?? 0;
  const hasVideoUrl = Boolean(editedLesson?.video_url);
  const config = CONTENT_TYPES[contentType];
  const Icon = config.icon;
  // Compute save button disabled state and reasons for diagnostics
  const saveDisabled = React.useMemo(() => {
    const isMedia = contentType === 'video' || contentType === 'audio';
    const missingDuration = !duration || duration <= 0;
    const missingVideoUrl = contentType === 'video' && !hasVideoUrl;
    return isMedia && (missingDuration || missingVideoUrl);
  }, [contentType, duration, hasVideoUrl]);

  const saveDisabledReasons = React.useMemo(() => {
    const reasons: string[] = [];
    if (contentType === 'video' || contentType === 'audio') {
      if (!duration || duration <= 0) reasons.push('missing_duration');
      if (contentType === 'video' && !hasVideoUrl) reasons.push('missing_video_url');
    }
    return reasons;
  }, [contentType, duration, hasVideoUrl]);

  React.useEffect(() => {
    // Log save button state when relevant fields change
    console.debug('LessonEditorDialog save button state', {
      disabled: saveDisabled,
      reasons: saveDisabledReasons,
      lessonId: editedLesson?.id ?? null,
      content_type: contentType,
      duration,
      hasVideoUrl,
    });
  }, [saveDisabled, saveDisabledReasons, editedLesson?.id, contentType, duration, hasVideoUrl]);

  const handleSave = () => {
    console.groupCollapsed('LessonEditorDialog.handleSave');
    try {
      console.debug('Dispatching onSave with editedLesson', { editedLesson });
      if (!editedLesson) {
        console.warn('No editedLesson to save');
        return;
      }
      onSave(editedLesson);
      console.info('onSave dispatched');
    } catch (error) {
      console.error('Error in handleSave', error);
    } finally {
      console.groupEnd();
    }
  };

  const updateField = (field: keyof Lesson, value: any) => {
    setEditedLesson(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <div className={`p-2 rounded ${config.color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <span>{editedLesson ? `Edit ${config.label}` : 'Loading Lesson...'}</span>
          </DialogTitle>
          <DialogDescription>
            Update lesson details, upload content, and set properties.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {!editedLesson ? (
            <div className="text-sm text-muted-foreground">Preparing lesson editor...</div>
          ) : (
            <>
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="lesson-title">Lesson Title</Label>
              <Input
                id="lesson-title"
                value={editedLesson.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="Enter lesson title"
              />
            </div>
            
            <div>
              <Label htmlFor="lesson-description">Description</Label>
              <Textarea
                id="lesson-description"
                value={editedLesson.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Describe what students will learn in this lesson"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={editedLesson.is_preview}
                  onCheckedChange={(checked) => updateField('is_preview', checked)}
                />
                <Label>Free Preview</Label>
              </div>
              
              {(contentType === 'video' || contentType === 'audio') && (
                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={editedLesson.duration ?? ''}
                    onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-24"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Content-Specific Fields */}
          <Tabs defaultValue="content" className="w-full">
            <TabsList>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="content" className="space-y-4">
              {renderContentFields(editedLesson, updateField, courseId)}
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              {renderSettingsFields(editedLesson, updateField)}
            </TabsContent>
          </Tabs>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={saveDisabled}
            >
              Save Lesson
            </Button>
          </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Video content editor component with upload, preview, and duration auto-calc
const VideoContentEditor: React.FC<{ lesson: Lesson; updateField: (field: keyof Lesson, value: any) => void; courseId?: string }> = ({ lesson, updateField, courseId }) => {
  console.debug('VideoContentEditor rendering', { lesson, hasUpdateField: typeof updateField === 'function', courseId });
  
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [useManualUrl, setUseManualUrl] = useState(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const formCtx = useFormContext();

  // Normalize frontend-generated IDs like "lesson-<uuid>" to pure UUIDs for backend endpoints
  const normalizeLessonId = (id?: string | null) => (id || '').replace(/^lesson-/, '');
  const normalizeModuleId = (id?: string | null) => (id || '').replace(/^module-/, '');

  // Safely cleanup blob preview URLs when they change or on unmount
  React.useEffect(() => {
    return () => {
      if (localPreview && localPreview.startsWith('blob:')) {
        try {
          URL.revokeObjectURL(localPreview);
        } catch (err) {
          console.warn('Failed to revoke localPreview URL', err);
        }
      }
    };
  }, [localPreview]);

  // Add error boundary for this component
  React.useEffect(() => {
    console.debug('VideoContentEditor mounted', { 
      lessonId: lesson?.id, 
      contentType: lesson?.content_type,
      hasVideoUrl: Boolean(lesson?.video_url)
    });
    
    return () => {
      console.debug('VideoContentEditor unmounting', { lessonId: lesson?.id });
    };
  }, [lesson?.id, lesson?.content_type, lesson?.video_url]);

  // Validate props
  if (!lesson) {
    console.error('VideoContentEditor: lesson prop is null/undefined');
    return <div className="text-red-500">Error: No lesson data provided</div>;
  }

  if (typeof updateField !== 'function') {
    console.error('VideoContentEditor: updateField prop is not a function');
    return <div className="text-red-500">Error: Invalid updateField function</div>;
  }

  const simulateProgress = () => {
    // Simulate progress when server doesn't provide it
    setUploadProgress(5);
    const start = Date.now();
    const tick = () => {
      setUploadProgress(prev => {
        const elapsed = Date.now() - start;
        const target = Math.min(95, Math.floor(elapsed / 100));
        return Math.max(prev, target);
      });
      if (uploadProgress < 95 && isUploading) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const isBackendUuid = (id?: string | null) => /^[0-9a-fA-F-]{36}$/.test(String(id || ''));

  const handleFilesSelected = async (files: FileList | File[]) => {
    // Require authentication before allowing uploads
    if (!isAuthenticated) {
      toast({
        title: 'Login required',
        description: 'Please log in to upload lesson videos.',
        variant: 'destructive',
      });
      return;
    }

    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);
    simulateProgress();

    // Auto-calculate duration from local preview for precision
    try {
      const localVideo = document.createElement('video');
      localVideo.src = previewUrl;
      localVideo.preload = 'metadata';
      localVideo.onloadedmetadata = () => {
        const seconds = localVideo.duration || 0;
        const minutes = Math.max(1, Math.round(seconds / 60));
        updateField('duration', minutes);
        // Do not revoke previewUrl here; cleanup effect handles revocation
      };
    } catch {}

    try {
      const response = await apiClient.uploadFile(file, 'course-video');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Upload failed');
      }
      // Build absolute public URL for the uploaded video so the player loads from backend, not the frontend origin
      const uploadedUrl = response.data.url;
      const publicUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${API_BASE_URL}${uploadedUrl}`;
      // Set the video URL on the lesson (sync both snake_case and camelCase)
      updateField('video_url', publicUrl);
      try { (updateField as any)('videoUrl', publicUrl); } catch {}

      // Immediately persist to backend so LessonPage can load the video
      // Only attempt direct update if the lesson has a real backend UUID
      let attemptedDirectPersist = false;
      try {
        if (lesson?.id && isBackendUuid(lesson.id)) {
          attemptedDirectPersist = true;
          const backendId = normalizeLessonId(lesson.id);
          const resp = await apiClient.updateLesson(backendId, {
            content_type: 'video',
            video_url: publicUrl,
          });
          if (resp.error) {
            throw new Error(resp.error);
          }
        }
      } catch (persistErr: any) {
        console.error('Failed to persist video URL to lesson, attempting auto-create', persistErr);
        // Auto-create the lesson in backend if update fails (e.g., 404 Not Found)
        try {
          const modules = formCtx?.watch?.('modules') || [];
          console.debug('Auto-create attempt', { courseId, modulesCount: modules.length, lessonId: lesson.id });
          // Find the module that contains this lesson
          const module = modules.find((m: any) => Array.isArray(m?.lessons) && m.lessons.some((l: any) => l.id === lesson.id));
          const moduleId = module?.id;
          const lessonIndex = Array.isArray(module?.lessons) ? module.lessons.findIndex((l: any) => l.id === lesson.id) : 0;
          console.debug('Found module for lesson', { moduleId, module: module?.title, lessonIndex });

          if (moduleId) {
            // If we don't have a courseId, we cannot create modules or lessons server-side
            if (!courseId) {
              console.warn('Auto-create blocked: missing courseId in creation flow', { moduleId, lessonId: lesson?.id });
              toast({
                title: 'Save failed',
                description: 'Missing course context; save the course first, then retry.',
                variant: 'destructive',
              });
            } else {
              // First, ensure the module exists; if it looks frontend-generated or lesson creation returns 404, create the module
              let effectiveModuleId = normalizeModuleId(moduleId);
              const isFrontendModuleId = (moduleId || '').startsWith('module-');

              if ((isFrontendModuleId || String(persistErr?.message || '').includes('404')) && courseId) {
                console.debug('Attempting module creation', { isFrontendModuleId, courseId, moduleId });
                try {
                  const modCreateResp = await apiClient.createCourseModule(courseId, {
                    title: module?.title || 'Untitled Module',
                    description: module?.description || '',
                    sequence_order: typeof module?.order_index === 'number' ? module.order_index : modules.findIndex((m: any) => m.id === moduleId),
                  });
                  if (modCreateResp?.error) throw new Error(modCreateResp.error);
                  const newModuleId = modCreateResp?.data?.id;
                  if (newModuleId) {
                    effectiveModuleId = newModuleId;
                    // Update form state with the new backend module ID
                    try {
                      const updatedModules = modules.map((m: any) => m.id === moduleId ? { ...m, id: newModuleId } : m);
                      formCtx?.setValue?.('modules', updatedModules);
                    } catch {}
                  }
                } catch (moduleCreateErr: any) {
                  console.warn('Module auto-create failed; proceeding to try lesson create with existing moduleId', moduleCreateErr);
                }
              }

                const createResp = await apiClient.createModuleLesson(effectiveModuleId, {
                  title: lesson?.title || 'Untitled Lesson',
                  description: lesson?.description || '',
                  sequence_order: lessonIndex,
                  content_type: 'video',
                  video_url: publicUrl,
                  duration: typeof lesson?.duration === 'number' ? lesson.duration : undefined,
                });
              if (createResp.error) {
                throw new Error(createResp.error);
              }

              const newLessonId = createResp.data?.id;
              if (newLessonId) {
                // Update local editedLesson state with the backend ID
                updateField('id', newLessonId);

                // Align the form's modules state so future saves use the backend ID
                try {
                  const updatedModules = modules.map((m: any) => {
                    if (m.id !== moduleId) return m;
                    return {
                      ...m,
                      lessons: (m.lessons || []).map((l: any) => (
                        l.id === lesson.id
                          ? { ...l, id: newLessonId, video_url: publicUrl, videoUrl: publicUrl }
                          : l
                      ))
                    };
                  });
                  formCtx?.setValue?.('modules', updatedModules);
                } catch {}

                // Retry the update with the new backend ID (ensure fields are persisted)
                const retryResp = await apiClient.updateLesson(newLessonId, {
                  content_type: 'video',
                  video_url: publicUrl,
                  duration: typeof lesson?.duration === 'number' ? lesson.duration : undefined,
                });
                if (retryResp.error) {
                  throw new Error(retryResp.error);
                }
              }
            }
          } else {
            console.warn('Auto-create failed: could not determine module context for lesson', { lessonId: lesson?.id });
            toast({
              title: 'Save failed',
              description: courseId ? 'Could not locate module in the form. Try re-opening the editor.' : 'Missing course context; save the course first, then retry.',
              variant: 'destructive',
            });
          }
        } catch (autoCreateErr: any) {
          console.error('Auto-create lesson during upload failed', autoCreateErr);
          toast({
            title: 'Save failed',
            description: 'Video uploaded, but the lesson record did not exist and could not be auto-created. Please ensure the module exists for this course.',
            variant: 'destructive',
          });
        }
      }

      setUploadProgress(100);
      setIsUploading(false);

      // Fallback: try duration from remote URL (CORS-safe)
      const tempVideo = document.createElement('video');
      tempVideo.crossOrigin = 'anonymous';
      tempVideo.src = publicUrl;
      tempVideo.preload = 'metadata';
      tempVideo.onloadedmetadata = () => {
        const seconds = tempVideo.duration || 0;
        const roundedSeconds = Math.max(1, Math.round(seconds));
        const minutes = Math.max(1, Math.round(roundedSeconds / 60));
        // Keep minutes in local form for UI, also persist seconds to backend
        updateField('duration', minutes);
        // Only persist duration if we have a real backend lesson ID
        if (lesson?.id && isBackendUuid(lesson.id)) {
          const normalizedId = normalizeLessonId(lesson.id);
          apiClient.updateLesson(normalizedId, { duration: roundedSeconds }).catch((err: any) => {
            console.error('Failed to persist video duration', err);
          });
        }
      };
      tempVideo.onerror = () => {
        // Non-blocking: duration remains optional
      };

      toast({
        title: 'Video uploaded',
        description: 'Your video has been uploaded successfully.',
      });
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({
        title: 'Upload error',
        description: err.message || 'Failed to upload video',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveVideo = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(localPreview); } catch {}
    }
    setLocalPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    updateField('video_url', '');
    try { (updateField as any)('videoUrl', ''); } catch {}
  };

  return (
    <div className="space-y-4">
      {/* Warning banner when course context is missing or lesson lacks a backend ID */}
      {(!courseId || !isBackendUuid(lesson?.id)) && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <div>
            <AlertTitle>Save course to persist videos</AlertTitle>
            <AlertDescription>
              Your video uploads are previewed locally until the course is saved.
              Please save the course to avoid losing videos or seeing a blank editor when reopening.
            </AlertDescription>
          </div>
        </Alert>
      )}
      {!useManualUrl && (
        <div>
          <Label>Lesson Video</Label>
          <div className="grid grid-cols-1 gap-4">
            {(lesson.video_url || (lesson as any).videoUrl) ? (
              <div className="space-y-3">
                <VideoPlayer 
                  // Guard: rewrite any relative URL to absolute at render time
                  src={(() => {
                    const srcCandidate = (lesson.video_url || (lesson as any).videoUrl || '') as string;
                    return srcCandidate?.startsWith('http') ? srcCandidate : `${API_BASE_URL}${srcCandidate || ''}`;
                  })()} 
                  title={lesson.title || 'Lesson video'} 
                  poster={localPreview || undefined}
                />
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleRemoveVideo}>Remove</Button>
                  <Button type="button" variant="secondary" onClick={() => setUseManualUrl(true)}>Use URL instead</Button>
                </div>
              </div>
            ) : (
              <Dropzone
                accept="video/*"
                multiple={false}
                previewUrl={localPreview}
                progress={uploadProgress}
                label="Drag & drop video or click to browse"
                helperText="Supported: MP4, MOV, WEBM. Max ~1GB"
                onRemove={handleRemoveVideo}
                onFilesSelected={handleFilesSelected}
              />
            )}
          </div>
        </div>
      )}

      {useManualUrl && (
        <div className="space-y-2">
          <Label htmlFor="video-url">Video URL</Label>
          <Input
            id="video-url"
            value={lesson.video_url || ''}
            onChange={(e) => {
              updateField('video_url', e.target.value);
              try { (updateField as any)('videoUrl', e.target.value); } catch {}
            }}
            placeholder="https://..."
          />
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={() => setUseManualUrl(false)}>Use uploader</Button>
            <Button type="button" variant="outline" onClick={handleRemoveVideo}>Clear</Button>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="transcript">Transcript (Optional)</Label>
        <Textarea
          id="transcript"
          value={lesson.transcript || ''}
          onChange={(e) => updateField('transcript', e.target.value)}
          placeholder="Video transcript for accessibility"
          rows={4}
        />
      </div>
    </div>
  );
};

// PDF content editor component with Dropzone upload and direct persistence
const PdfContentEditor: React.FC<{ lesson: Lesson; updateField: (field: keyof Lesson, value: any) => void; courseId?: string }> = ({ lesson, updateField, courseId }) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const formCtx = useFormContext();

  // Normalize frontend-generated IDs like "lesson-<uuid>" to pure UUIDs for backend endpoints
  const normalizeLessonId = (id?: string | null) => (id || '').replace(/^lesson-/, '');
  const normalizeModuleId = (id?: string | null) => (id || '').replace(/^module-/, '');
  const isBackendUuid = (id?: string | null) => /^[0-9a-fA-F-]{36}$/.test(String(id || ''));

  const simulateProgress = () => {
    setUploadProgress(5);
    const start = Date.now();
    const tick = () => {
      setUploadProgress(prev => {
        const elapsed = Date.now() - start;
        const target = Math.min(95, Math.floor(elapsed / 120));
        return Math.max(prev, target);
      });
      if (uploadProgress < 95 && isUploading) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please log in to upload documents.', variant: 'destructive' });
      return;
    }
    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);
    simulateProgress();

    try {
      const response = await apiClient.uploadFile(file, 'course-content');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Upload failed');
      }
      const uploadedUrl = response.data.url as string;
      const publicUrl = uploadedUrl.startsWith('http') ? uploadedUrl : `${API_BASE_URL}${uploadedUrl}`;
      // Update local lesson field so the UI reflects the change
      updateField('pdf_url', publicUrl);
      try { (updateField as any)('pdfUrl', publicUrl); } catch {}

      // Immediately persist to backend so LessonPage can load the PDF
      let attemptedDirectPersist = false;
      try {
        if (lesson?.id && isBackendUuid(lesson.id)) {
          attemptedDirectPersist = true;
          const backendId = normalizeLessonId(lesson.id);
          const resp = await apiClient.updateLesson(backendId, {
            content_type: 'pdf',
            pdf_url: publicUrl,
            page_count: typeof lesson?.page_count === 'number' ? lesson.page_count : undefined,
          });
          if (resp.error) {
            throw new Error(resp.error);
          }
        }
      } catch (persistErr: any) {
        console.error('Failed to persist PDF URL to lesson, attempting auto-create', persistErr);
        // Auto-create the lesson in backend if update fails (e.g., 404 Not Found)
        try {
          const modules = formCtx?.watch?.('modules') || [];
          // Find the module that contains this lesson
          const module = modules.find((m: any) => Array.isArray(m?.lessons) && m.lessons.some((l: any) => l.id === lesson.id));
          const moduleId = module?.id;
          const lessonIndex = Array.isArray(module?.lessons) ? module.lessons.findIndex((l: any) => l.id === lesson.id) : 0;

          if (moduleId) {
            if (!courseId) {
              console.warn('Auto-create blocked: missing courseId in creation flow', { moduleId, lessonId: lesson?.id });
              toast({
                title: 'Save failed',
                description: 'Missing course context; save the course first, then retry.',
                variant: 'destructive',
              });
            } else {
              // Ensure the module exists; if frontend-generated, create it
              let effectiveModuleId = normalizeModuleId(moduleId);
              const isFrontendModuleId = (moduleId || '').startsWith('module-');

              if ((isFrontendModuleId || String(persistErr?.message || '').includes('404')) && courseId) {
                try {
                  const modCreateResp = await apiClient.createCourseModule(courseId, {
                    title: module?.title || 'Untitled Module',
                    description: module?.description || '',
                    sequence_order: typeof module?.order_index === 'number' ? module.order_index : modules.findIndex((m: any) => m.id === moduleId),
                  });
                  if (modCreateResp?.error) throw new Error(modCreateResp.error);
                  const newModuleId = modCreateResp?.data?.id;
                  if (newModuleId) {
                    effectiveModuleId = newModuleId;
                    // Update form state with the new backend module ID
                    try {
                      const updatedModules = modules.map((m: any) => m.id === moduleId ? { ...m, id: newModuleId } : m);
                      formCtx?.setValue?.('modules', updatedModules);
                    } catch {}
                  }
                } catch (moduleCreateErr: any) {
                  console.warn('Module auto-create failed; proceeding to try lesson create with existing moduleId', moduleCreateErr);
                }
              }

              const createResp = await apiClient.createModuleLesson(effectiveModuleId, {
                title: lesson?.title || 'Untitled Lesson',
                description: lesson?.description || '',
                sequence_order: lessonIndex,
                content_type: 'pdf',
                pdf_url: publicUrl,
                page_count: typeof lesson?.page_count === 'number' ? lesson.page_count : undefined,
              });
              if (createResp.error) {
                throw new Error(createResp.error);
              }

              const newLessonId = createResp.data?.id;
              if (newLessonId) {
                // Update local editedLesson state with the backend ID
                updateField('id', newLessonId);
                // Align the form's modules state so future saves use the backend ID
                try {
                  const updatedModules = modules.map((m: any) => {
                    if (m.id !== moduleId) return m;
                    return {
                      ...m,
                      lessons: (m.lessons || []).map((l: any) => (
                        l.id === lesson.id
                          ? { ...l, id: newLessonId, pdf_url: publicUrl, pdfUrl: publicUrl }
                          : l
                      ))
                    };
                  });
                  formCtx?.setValue?.('modules', updatedModules);
                } catch {}

                // Retry the update with the new backend ID (ensure fields are persisted)
                const retryResp = await apiClient.updateLesson(newLessonId, {
                  content_type: 'pdf',
                  pdf_url: publicUrl,
                  page_count: typeof lesson?.page_count === 'number' ? lesson.page_count : undefined,
                });
                if (retryResp.error) {
                  throw new Error(retryResp.error);
                }
              }
            }
          } else {
            console.warn('Auto-create failed: could not determine module context for lesson', { lessonId: lesson?.id });
            toast({
              title: 'Save failed',
              description: courseId ? 'Could not locate module in the form. Try re-opening the editor.' : 'Missing course context; save the course first, then retry.',
              variant: 'destructive',
            });
          }
        } catch (autoCreateErr: any) {
          console.error('Auto-create lesson during upload failed', autoCreateErr);
          toast({
            title: 'Save failed',
            description: 'PDF uploaded, but the lesson record did not exist and could not be auto-created. Please ensure the module exists for this course.',
            variant: 'destructive',
          });
        }
      }

      setUploadProgress(100);
      setIsUploading(false);
      toast({ title: 'PDF uploaded', description: 'Your PDF has been uploaded successfully.' });
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: 'Upload error', description: err.message || 'Failed to upload PDF', variant: 'destructive' });
    }
  };

  const handleRemove = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(localPreview); } catch {}
    }
    setLocalPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    updateField('pdf_url', '');
  };

  return (
    <div className="space-y-4">
      {/* Warning banner when course context is missing or lesson lacks a backend ID */}
      {(!courseId || !isBackendUuid(lesson?.id)) && (
        <Alert className="border-yellow-300 bg-yellow-50">
          <AlertCircle className="h-4 w-4" />
          <div>
            <AlertTitle>Save course to persist documents</AlertTitle>
            <AlertDescription>
              Your PDF uploads are previewed locally until the course is saved.
              Please save the course to avoid losing documents or seeing a blank editor when reopening.
            </AlertDescription>
          </div>
        </Alert>
      )}
      <div>
        <Label>PDF File</Label>
        {lesson.pdf_url ? (
          <div className="space-y-3">
            <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-700">PDF uploaded</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleRemove}>Remove</Button>
            </div>
          </div>
        ) : (
          <Dropzone
            accept="application/pdf,.pdf"
            multiple={false}
            previewUrl={localPreview}
            progress={uploadProgress}
            label="Drag & drop PDF or click to browse"
            helperText="Accepted: .pdf"
            onRemove={handleRemove}
            onFilesSelected={handleFilesSelected}
          />
        )}
      </div>
      <div>
        <Label htmlFor="page-count">Page Count</Label>
        <Input
          id="page-count"
          type="number"
          value={lesson.page_count || ''}
          onChange={(e) => updateField('page_count', parseInt(e.target.value) || 0)}
          placeholder="Number of pages"
        />
      </div>
    </div>
  );
};

// Audio content editor component with Dropzone upload and transcript
const AudioContentEditor: React.FC<{ lesson: Lesson; updateField: (field: keyof Lesson, value: any) => void }> = ({ lesson, updateField }) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const simulateProgress = () => {
    setUploadProgress(5);
    const start = Date.now();
    const tick = () => {
      setUploadProgress(prev => {
        const elapsed = Date.now() - start;
        const target = Math.min(95, Math.floor(elapsed / 120));
        return Math.max(prev, target);
      });
      if (uploadProgress < 95 && isUploading) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please log in to upload audio.', variant: 'destructive' });
      return;
    }
    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);
    simulateProgress();

    // Try to derive duration from local audio metadata
    try {
      const audio = new Audio();
      audio.src = previewUrl;
      audio.onloadedmetadata = () => {
        const seconds = audio.duration || 0;
        const minutes = Math.max(1, Math.round(seconds / 60));
        updateField('duration', minutes);
      };
    } catch {}

    try {
      const response = await apiClient.uploadFile(file, 'course-content');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Upload failed');
      }
      updateField('audio_url', response.data.url);
      setUploadProgress(100);
      setIsUploading(false);
      toast({ title: 'Audio uploaded', description: 'Your audio has been uploaded successfully.' });
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: 'Upload error', description: err.message || 'Failed to upload audio', variant: 'destructive' });
    }
  };

  const handleRemove = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(localPreview); } catch {}
    }
    setLocalPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    updateField('audio_url', '');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Audio File</Label>
        {lesson.audio_url ? (
          <div className="space-y-3">
            <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-700">Audio uploaded</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleRemove}>Remove</Button>
            </div>
          </div>
        ) : (
          <Dropzone
            accept=".mp3,.wav,.ogg,.m4a"
            multiple={false}
            previewUrl={localPreview}
            progress={uploadProgress}
            label="Drag & drop audio or click to browse"
            helperText="Accepted: .mp3, .wav, .ogg, .m4a"
            onRemove={handleRemove}
            onFilesSelected={handleFilesSelected}
          />
        )}
      </div>
      <div>
        <Label htmlFor="transcript">Transcript (Optional)</Label>
        <Textarea
          id="transcript"
          value={lesson.transcript || ''}
          onChange={(e) => updateField('transcript', e.target.value)}
          placeholder="Audio transcript for accessibility"
          rows={4}
        />
      </div>
    </div>
  );
};

// Slides content editor with Dropzone upload
const SlidesContentEditor: React.FC<{ lesson: Lesson; updateField: (field: keyof Lesson, value: any) => void }> = ({ lesson, updateField }) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const simulateProgress = () => {
    setUploadProgress(5);
    const start = Date.now();
    const tick = () => {
      setUploadProgress(prev => {
        const elapsed = Date.now() - start;
        const target = Math.min(95, Math.floor(elapsed / 120));
        return Math.max(prev, target);
      });
      if (uploadProgress < 95 && isUploading) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please log in to upload slides.', variant: 'destructive' });
      return;
    }
    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);
    simulateProgress();

    try {
      const response = await apiClient.uploadFile(file, 'course-content');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Upload failed');
      }
      updateField('slides_url', response.data.url);
      setUploadProgress(100);
      setIsUploading(false);
      toast({ title: 'Slides uploaded', description: 'Your presentation has been uploaded successfully.' });
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: 'Upload error', description: err.message || 'Failed to upload slides', variant: 'destructive' });
    }
  };

  const handleRemove = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(localPreview); } catch {}
    }
    setLocalPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    updateField('slides_url', '');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>Slides File</Label>
        {lesson.slides_url ? (
          <div className="space-y-3">
            <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-700">Slides uploaded</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleRemove}>Remove</Button>
            </div>
          </div>
        ) : (
          <Dropzone
            accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
            multiple={false}
            previewUrl={localPreview}
            progress={uploadProgress}
            label="Drag & drop slides or click to browse"
            helperText="Accepted: .ppt, .pptx, .pdf"
            onRemove={handleRemove}
            onFilesSelected={handleFilesSelected}
          />
        )}
      </div>
      <div>
        <Label htmlFor="slide-count">Number of Slides</Label>
        <Input
          id="slide-count"
          type="number"
          value={lesson.slide_count || ''}
          onChange={(e) => updateField('slide_count', parseInt(e.target.value) || 0)}
          placeholder="Number of slides"
        />
      </div>
    </div>
  );
};

// Downloadable content editor with Dropzone upload
const DownloadableContentEditor: React.FC<{ lesson: Lesson; updateField: (field: keyof Lesson, value: any) => void }> = ({ lesson, updateField }) => {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  const simulateProgress = () => {
    setUploadProgress(5);
    const start = Date.now();
    const tick = () => {
      setUploadProgress(prev => {
        const elapsed = Date.now() - start;
        const target = Math.min(95, Math.floor(elapsed / 120));
        return Math.max(prev, target);
      });
      if (uploadProgress < 95 && isUploading) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  };

  const formatSize = (bytes: number) => {
    if (!bytes && bytes !== 0) return '';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const handleFilesSelected = async (files: FileList | File[]) => {
    if (!isAuthenticated) {
      toast({ title: 'Login required', description: 'Please log in to upload files.', variant: 'destructive' });
      return;
    }
    const file = Array.isArray(files) ? (files[0] as File) : files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setLocalPreview(previewUrl);
    setIsUploading(true);
    setUploadProgress(0);
    simulateProgress();

    try {
      const response = await apiClient.uploadFile(file, 'course-content');
      if (response.error || !response.data?.url) {
        throw new Error(response.error || 'Upload failed');
      }
      updateField('download_url', response.data.url);
      updateField('file_type', file.type || '');
      updateField('file_size', formatSize(file.size));
      setUploadProgress(100);
      setIsUploading(false);
      toast({ title: 'File uploaded', description: 'Your file has been uploaded successfully.' });
    } catch (err: any) {
      setIsUploading(false);
      setUploadProgress(0);
      toast({ title: 'Upload error', description: err.message || 'Failed to upload file', variant: 'destructive' });
    }
  };

  const handleRemove = () => {
    if (localPreview && localPreview.startsWith('blob:')) {
      try { URL.revokeObjectURL(localPreview); } catch {}
    }
    setLocalPreview(null);
    setUploadProgress(0);
    setIsUploading(false);
    updateField('download_url', '');
    updateField('file_type', '');
    updateField('file_size', '');
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>File to Download</Label>
        {lesson.download_url ? (
          <div className="space-y-3">
            <div className="p-2 border rounded-md bg-slate-50 text-sm text-slate-700">File uploaded</div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" onClick={handleRemove}>Remove</Button>
            </div>
          </div>
        ) : (
          <Dropzone
            accept="*/*"
            multiple={false}
            previewUrl={localPreview}
            progress={uploadProgress}
            label="Drag & drop file or click to browse"
            helperText="Any file type is accepted"
            onRemove={handleRemove}
            onFilesSelected={handleFilesSelected}
          />
        )}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="file-type">File Type</Label>
          <Input
            id="file-type"
            value={lesson.file_type || ''}
            onChange={(e) => updateField('file_type', e.target.value)}
            placeholder="PDF, ZIP, etc."
          />
        </div>
        <div>
          <Label htmlFor="file-size">File Size</Label>
          <Input
            id="file-size"
            value={lesson.file_size || ''}
            onChange={(e) => updateField('file_size', e.target.value)}
            placeholder="2.5 MB"
          />
        </div>
      </div>
    </div>
  );
};

// Helper function to render content-specific fields
const renderContentFields = (lesson: Lesson, updateField: (field: keyof Lesson, value: any) => void, courseId?: string) => {
  console.debug('renderContentFields called', { 
    contentType: lesson?.content_type, 
    lessonId: lesson?.id,
    hasUpdateField: typeof updateField === 'function'
  });

  try {
    switch (lesson.content_type) {
      case 'video':
        return <VideoContentEditor lesson={lesson} updateField={updateField} courseId={courseId} />;

      case 'pdf':
        return <PdfContentEditor lesson={lesson} updateField={updateField} courseId={courseId} />;

      case 'audio':
        return <AudioContentEditor lesson={lesson} updateField={updateField} />;
    
      case 'document':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Content</Label>
              <RichTextEditor
                value={lesson.content || ''}
                onChange={(html) => updateField('content', html)}
                placeholder="Write your lesson content here..."
                ariaLabel="Document content editor"
              />
            </div>
            <div>
              <Label htmlFor="reading-time">Estimated Reading Time (minutes)</Label>
              <Input
                id="reading-time"
                type="number"
                value={lesson.reading_time || ''}
                onChange={(e) => updateField('reading_time', parseInt(e.target.value) || 0)}
                placeholder="5"
              />
            </div>
          </div>
        );
    
      case 'interactive':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="interactive-url">Interactive Content URL</Label>
              <Input
                id="interactive-url"
                value={lesson.interactive_url || ''}
                onChange={(e) => updateField('interactive_url', e.target.value)}
                placeholder="URL to interactive content or embed code"
              />
            </div>
            <div>
              <Label htmlFor="completion-criteria">Completion Criteria</Label>
              <Textarea
                id="completion-criteria"
                value={lesson.completion_criteria || ''}
                onChange={(e) => updateField('completion_criteria', e.target.value)}
                placeholder="How students complete this interactive lesson"
                rows={3}
              />
            </div>
          </div>
        );
    
      case 'downloadable':
        return <DownloadableContentEditor lesson={lesson} updateField={updateField} />;
    
      case 'slides':
        return <SlidesContentEditor lesson={lesson} updateField={updateField} />;
    
      default:
        return <div>Content type not supported yet.</div>;
    }
  } catch (error) {
    console.error('Error in renderContentFields', { error, lesson, contentType: lesson?.content_type });
    return (
      <div className="text-red-500 p-4 border border-red-200 rounded">
        <h4 className="font-semibold">Error rendering content fields</h4>
        <p className="text-sm mt-1">Content type: {lesson?.content_type}</p>
        <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
};

// Helper function to render settings fields
const renderSettingsFields = (lesson: Lesson, updateField: (field: keyof Lesson, value: any) => void) => {
  return (
    <div className="space-y-4">
      <div>
        <Label>Lesson Order</Label>
        <Input
          type="number"
          value={lesson.order_index}
          onChange={(e) => updateField('order_index', parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch
          checked={lesson.is_preview}
          onCheckedChange={(checked) => updateField('is_preview', checked)}
        />
        <div>
          <Label>Free Preview Lesson</Label>
          <p className="text-sm text-gray-500">Allow students to preview this lesson before enrolling</p>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={Boolean(lesson.mark_complete_on_load)}
          onCheckedChange={(checked) => updateField('mark_complete_on_load', checked)}
        />
        <div>
          <Label>Mark Complete On Load</Label>
          <p className="text-sm text-gray-500">When enabled, this lesson is marked as 100% upon opening.</p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedModulesStep;