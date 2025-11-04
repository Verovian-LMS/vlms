
import React, { useState } from 'react';
import ContentTypeSelector from './ContentTypeSelector';
import ContentTypeUploader from '@/components/courses/course-form/ContentTypeUploader';
import { LessonContentType } from '@/types/course';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EnhancedContentTypeSelectorProps {
  moduleId: string;
  lessonId: string;
  initialContentType?: LessonContentType;
  onContentSelected: (
    moduleId: string,
    lessonId: string,
    contentType: LessonContentType,
    data: any
  ) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
}

const EnhancedContentTypeSelector: React.FC<EnhancedContentTypeSelectorProps> = ({
  moduleId,
  lessonId,
  initialContentType = 'video',
  onContentSelected,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  previewUrl = null
}) => {
  const [selectedType, setSelectedType] = useState<LessonContentType>(initialContentType);

  const handleContentTypeChange = (type: LessonContentType) => {
    setSelectedType(type);
  };

  const handleFileSelect = (file: File) => {
    onContentSelected(moduleId, lessonId, selectedType, { file });
  };

  const handleUrlChange = (url: string) => {
    onContentSelected(moduleId, lessonId, selectedType, { url });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-heading font-medium">Select Content Type</h3>
        <p className="text-sm text-slate-500 font-exo2">
          Choose the type of content you want to add to this lesson
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <ContentTypeUploader
        contentType={selectedType}
        onContentTypeChange={handleContentTypeChange}
        onFileSelect={handleFileSelect}
        onUrlChange={handleUrlChange}
        uploadProgress={uploadProgress}
        isUploading={isUploading}
        error={error}
        previewUrl={previewUrl}
        moduleId={moduleId}
        lessonId={lessonId}
      />
    </div>
  );
};

export default EnhancedContentTypeSelector;
