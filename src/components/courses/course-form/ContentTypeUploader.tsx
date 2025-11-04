
import React, { useState } from 'react';
import { AlertCircle, FileText, Music, PlusCircle, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ContentTypeSelector from '@/components/content/ContentTypeSelector';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { LessonContentType } from '@/types/course';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Dropzone from '@/components/ui/Dropzone';

interface ContentTypeUploaderProps {
  contentType: LessonContentType;
  onContentTypeChange: (type: LessonContentType) => void;
  onFileSelect: (file: File) => void;
  onUrlChange?: (url: string) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
  moduleId: string;
  lessonId: string;
}

const ContentTypeUploader: React.FC<ContentTypeUploaderProps> = ({
  contentType,
  onContentTypeChange,
  onFileSelect,
  onUrlChange,
  uploadProgress = 0,
  isUploading = false,
  error = null,
  previewUrl = null,
  moduleId,
  lessonId
}) => {
  const [url, setUrl] = useState<string>('');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleUrlSubmit = () => {
    if (onUrlChange && url.trim()) {
      onUrlChange(url);
    }
  };

  const renderContentTypeUploader = () => {
    switch (contentType) {
      case 'video':
        return (
          <div className="space-y-4">
            <Label htmlFor={`video-upload-${lessonId}`} className="block text-sm font-medium text-gray-700">
              Upload Video
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`video-upload-${lessonId}`}
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="flex-1"
              />
            </div>
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                label="Uploading video..." 
                showPercentage={true}
              />
            )}
            {previewUrl && !isUploading && (
              <div className="mt-2 p-2 border rounded-md bg-slate-50">
                <p className="text-sm text-slate-600 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                  Video uploaded successfully
                </p>
              </div>
            )}
          </div>
        );

      case 'pdf':
        return (
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Upload PDF Document
            </Label>
            <Dropzone
              accept="application/pdf,.pdf"
              multiple={false}
              disabled={isUploading}
              previewUrl={previewUrl || null}
              progress={uploadProgress}
              label="Click or drag PDF to upload"
              helperText="Accepted: .pdf"
              onFilesSelected={(files) => {
                const arr = Array.isArray(files) ? files : Array.from(files);
                if (arr[0]) onFileSelect(arr[0] as File);
              }}
            />
          </div>
        );

      case 'slides':
        return (
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Upload Presentation Slides
            </Label>
            <Dropzone
              accept=".ppt,.pptx,.pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf"
              multiple={false}
              disabled={isUploading}
              previewUrl={previewUrl || null}
              progress={uploadProgress}
              label="Click or drag slides to upload"
              helperText="Accepted: .ppt, .pptx, .pdf"
              onFilesSelected={(files) => {
                const arr = Array.isArray(files) ? files : Array.from(files);
                if (arr[0]) onFileSelect(arr[0] as File);
              }}
            />
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Upload Audio File
            </Label>
            <Dropzone
              accept=".mp3,.wav,.ogg,.m4a"
              multiple={false}
              disabled={isUploading}
              previewUrl={previewUrl || null}
              progress={uploadProgress}
              label="Click or drag audio to upload"
              helperText="Accepted: .mp3, .wav, .ogg, .m4a"
              onFilesSelected={(files) => {
                const arr = Array.isArray(files) ? files : Array.from(files);
                if (arr[0]) onFileSelect(arr[0] as File);
              }}
            />
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <Label htmlFor={`interactive-url-${lessonId}`} className="block text-sm font-medium text-gray-700">
              Interactive Content URL
            </Label>
            <div className="flex gap-2">
              <Input
                id={`interactive-url-${lessonId}`}
                type="url"
                placeholder="Enter URL to interactive content (e.g., H5P, quiz)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleUrlSubmit} type="button">
                Add
              </Button>
            </div>
            <Textarea
              placeholder="Add instructions for using this interactive content (optional)"
              className="min-h-24"
            />
          </div>
        );

      case 'downloadable':
        return (
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Upload Downloadable Resources
            </Label>
            <Dropzone
              accept="*/*"
              multiple={true}
              disabled={isUploading}
              previewUrl={previewUrl || null}
              progress={uploadProgress}
              label="Click or drag files to upload"
              helperText="You can select multiple files"
              onFilesSelected={(files) => {
                const arr = Array.isArray(files) ? files : Array.from(files);
                arr.forEach((f) => onFileSelect(f as File));
              }}
            />
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <Label className="block text-sm font-medium text-gray-700">
              Upload Document
            </Label>
            <Dropzone
              accept=".doc,.docx,.txt,.rtf,.md,text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              multiple={false}
              disabled={isUploading}
              previewUrl={previewUrl || null}
              progress={uploadProgress}
              label="Click or drag document to upload"
              helperText="Accepted: .doc, .docx, .txt, .rtf, .md"
              onFilesSelected={(files) => {
                const arr = Array.isArray(files) ? files : Array.from(files);
                if (arr[0]) onFileSelect(arr[0] as File);
              }}
            />
          </div>
        );

      default:
        return (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Please select a content type</AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor={`content-type-${lessonId}`} className="block text-sm font-medium text-gray-700 mb-2">
          Content Type
        </Label>
        <ContentTypeSelector 
          selectedType={contentType}
          onChange={onContentTypeChange}
          className="w-full"
        />
      </div>

      <div className="mt-6">
        {renderContentTypeUploader()}
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ContentTypeUploader;
