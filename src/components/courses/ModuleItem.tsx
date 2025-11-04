
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LessonItem from './LessonItem';
import type { CourseModule, LessonUpload } from '@/types/course';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';

interface ModuleItemProps {
  module: CourseModule;
  moduleIndex: number; 
  updateModuleTitle: (moduleId: string, title: string) => void;
  removeModule: (moduleId: string) => void;
  updateLesson: (moduleId: string, lessonId: string, field: string, value: any) => void;
  addLesson: (moduleId: string) => void;
  removeLesson: (moduleId: string, lessonId: string) => void;
  canRemoveModule: boolean;
  isExpanded: boolean;
  toggleExpanded: () => void;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>, moduleId: string, lessonId: string) => void;
  uploadProgress: Record<string, number>;
  isUploading: Record<string, boolean>;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  moduleIndex,
  updateModuleTitle,
  removeModule,
  updateLesson,
  addLesson,
  removeLesson,
  canRemoveModule,
  isExpanded,
  toggleExpanded,
  handleVideoUpload,
  uploadProgress,
  isUploading
}) => {
  const { toast } = useToast();
  const [localTitle, setLocalTitle] = useState(module.title || "");
  const [localDescription, setLocalDescription] = useState(module.description || "");

  // Update local state when props change (for external updates)
  useEffect(() => {
    if (module.title !== localTitle) {
      setLocalTitle(module.title || "");
    }
    if (module.description !== localDescription) {
      setLocalDescription(module.description || "");
    }
  }, [module.title, module.description]);

  // Safety check for required module properties
  if (!module || !module.id) {
    console.error("Invalid module data in ModuleItem", module);
    return (
      <div className="mb-6 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm p-4">
        <p className="text-red-500">Error: Invalid module data. Please reload the page.</p>
      </div>
    );
  }

  const handleModuleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const newTitle = e.target.value;
      setLocalTitle(newTitle); // Update local state immediately for UI
      console.log("Updating module title:", { moduleId: module.id, newTitle });
      updateModuleTitle(module.id, newTitle);
    } catch (error) {
      console.error("Error updating module title:", error);
      toast({
        title: "Error",
        description: "Failed to update module title. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleModuleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      const newDescription = e.target.value;
      setLocalDescription(newDescription); // Update local state immediately for UI
      console.log("Updating module description:", { moduleId: module.id, description: newDescription });
      // We need to ensure this handler is properly passing the description to the parent component
      if (typeof updateLecture === 'function') {
        // We're passing a special field name to handle description at the module level
        updateLecture(module.id, "module_description", "description", newDescription);
      }
    } catch (error) {
      console.error("Error updating module description:", error);
      toast({
        title: "Error",
        description: "Failed to update module description. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveModule = () => {
    try {
      removeModule(module.id);
    } catch (error) {
      console.error("Error removing module:", error);
      toast({
        title: "Error",
        description: "Failed to remove module. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAddLesson = () => {
    try {
      addLesson(module.id);
    } catch (error) {
      console.error("Error adding lesson:", error);
      toast({
        title: "Error",
        description: "Failed to add lesson. Please try again.",
        variant: "destructive",
      });
    }
  };

  const safeLessons = module.lessons || [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: moduleIndex * 0.1 }}
      className="mb-6 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm"
    >
      <div className="bg-slate-50 p-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center flex-1">
            <span className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium mr-3 font-heading">
              {moduleIndex + 1}
            </span>
            <Input
              value={localTitle}
              onChange={handleModuleTitleChange}
              placeholder="Module Title"
              className="font-heading font-semibold text-slate-800 flex-1"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              className="text-slate-500 hover:text-slate-700"
              aria-label={isExpanded ? "Collapse module" : "Expand module"}
            >
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRemoveModule}
              disabled={!canRemoveModule}
              className="text-slate-400 hover:text-red-500 hover:bg-red-50"
              aria-label="Remove module"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <div className="mb-4">
            <label htmlFor={`module-desc-${module.id}`} className="block text-sm font-medium text-slate-700 mb-1">
              Module Description
            </label>
            <Textarea
              id={`module-desc-${module.id}`}
              value={localDescription}
              onChange={handleModuleDescriptionChange}
              placeholder="Enter a description for this module..."
              className="w-full min-h-[80px]"
            />
          </div>
          
          <div className="space-y-4">
            {safeLessons.length > 0 ? (
              safeLessons.map((lesson, index) => (
                <ErrorBoundary key={lesson.id}>
                  <LessonItem
                    lesson={lesson}
                    index={index}
                    moduleId={module.id}
                    updateLesson={(field: string, value: any) => {
                      console.log(`Updating lesson field '${field}' to:`, value);
                      updateLesson(module.id, lesson.id, field, value);
                    }}
                    removeLesson={() => removeLesson(module.id, lesson.id)}
                    canRemove={safeLessons.length > 1}
                    handleVideoUpload={(e: React.ChangeEvent<HTMLInputElement>) => 
                      handleVideoUpload(e, module.id, lesson.id)
                    }
                    uploadProgress={uploadProgress[lesson.id] || 0}
                    isUploading={!!isUploading[lesson.id]}
                  />
                </ErrorBoundary>
              ))
            ) : (
              <div className="p-4 border border-dashed border-slate-300 rounded-md">
                <p className="text-center text-slate-500">No lessons yet. Add your first lesson below.</p>
              </div>
            )}

            <div className="mt-4 text-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddLesson}
                className="w-full max-w-md mx-auto border-dashed border-slate-300 text-slate-600 hover:border-primary hover:text-primary"
              >
                <Plus className="w-4 h-4 mr-2" /> Add Lesson
              </Button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default ModuleItem;
