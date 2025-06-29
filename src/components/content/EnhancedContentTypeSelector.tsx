
import React, { useState } from 'react';
import ContentTypeSelector from './ContentTypeSelector';
import ContentTypeUploader from '@/components/courses/course-form/ContentTypeUploader';
import { LectureContentType } from '@/types/course';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EnhancedContentTypeSelectorProps {
  moduleId: string;
  lectureId: string;
  initialContentType?: LectureContentType;
  onContentSelected: (
    moduleId: string,
    lectureId: string,
    contentType: LectureContentType,
    data: any
  ) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
}

const EnhancedContentTypeSelector: React.FC<EnhancedContentTypeSelectorProps> = ({
  moduleId,
  lectureId,
  initialContentType = 'video',
  onContentSelected,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  previewUrl = null
}) => {
  const [selectedType, setSelectedType] = useState<LectureContentType>(initialContentType);

  const handleContentTypeChange = (type: LectureContentType) => {
    setSelectedType(type);
  };

  const handleFileSelect = (file: File) => {
    onContentSelected(moduleId, lectureId, selectedType, { file });
  };

  const handleUrlChange = (url: string) => {
    onContentSelected(moduleId, lectureId, selectedType, { url });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-heading font-medium">Select Content Type</h3>
        <p className="text-sm text-slate-500 font-exo2">
          Choose the type of content you want to add to this lecture
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
        lectureId={lectureId}
      />
    </div>
  );
};

export default EnhancedContentTypeSelector;
