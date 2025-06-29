
import React, { useState } from 'react';
import { AlertCircle, FileText, Music, PlusCircle, Upload } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ContentTypeSelector from '@/components/content/ContentTypeSelector';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import { LectureContentType } from '@/types/course';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ContentTypeUploaderProps {
  contentType: LectureContentType;
  onContentTypeChange: (type: LectureContentType) => void;
  onFileSelect: (file: File) => void;
  onUrlChange?: (url: string) => void;
  uploadProgress?: number;
  isUploading?: boolean;
  error?: string | null;
  previewUrl?: string | null;
  moduleId: string;
  lectureId: string;
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
  lectureId
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
            <Label htmlFor={`video-upload-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload Video
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id={`video-upload-${lectureId}`}
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
            <Label htmlFor={`pdf-upload-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload PDF Document
            </Label>
            <Input
              id={`pdf-upload-${lectureId}`}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                label="Uploading PDF..." 
                showPercentage={true}
              />
            )}
            {previewUrl && !isUploading && (
              <div className="mt-2 p-2 border rounded-md bg-slate-50">
                <p className="text-sm text-slate-600 flex items-center">
                  <FileText className="h-4 w-4 mr-2 text-green-600" />
                  PDF uploaded successfully
                </p>
              </div>
            )}
          </div>
        );

      case 'slides':
        return (
          <div className="space-y-4">
            <Label htmlFor={`slides-upload-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload Presentation Slides
            </Label>
            <Input
              id={`slides-upload-${lectureId}`}
              type="file"
              accept=".ppt,.pptx,.pdf"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                label="Uploading slides..." 
                showPercentage={true}
              />
            )}
          </div>
        );

      case 'audio':
        return (
          <div className="space-y-4">
            <Label htmlFor={`audio-upload-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload Audio File
            </Label>
            <Input
              id={`audio-upload-${lectureId}`}
              type="file"
              accept="audio/*"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                label="Uploading audio..." 
                showPercentage={true}
              />
            )}
            {previewUrl && !isUploading && (
              <div className="mt-2 p-2 border rounded-md bg-slate-50">
                <p className="text-sm text-slate-600 flex items-center">
                  <Music className="h-4 w-4 mr-2 text-green-600" />
                  Audio uploaded successfully
                </p>
              </div>
            )}
          </div>
        );

      case 'interactive':
        return (
          <div className="space-y-4">
            <Label htmlFor={`interactive-url-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Interactive Content URL
            </Label>
            <div className="flex gap-2">
              <Input
                id={`interactive-url-${lectureId}`}
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
            <Label htmlFor={`downloadable-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload Downloadable Resources
            </Label>
            <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center bg-slate-50">
              <Upload className="h-8 w-8 text-slate-400 mb-2" />
              <p className="text-sm text-slate-600 mb-2">Drag and drop files or click to browse</p>
              <Input
                id={`downloadable-${lectureId}`}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById(`downloadable-${lectureId}`)?.click()}>
                <PlusCircle className="h-4 w-4 mr-2" /> Select Files
              </Button>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="space-y-4">
            <Label htmlFor={`document-upload-${lectureId}`} className="block text-sm font-medium text-gray-700">
              Upload Document
            </Label>
            <Input
              id={`document-upload-${lectureId}`}
              type="file"
              accept=".doc,.docx,.txt,.rtf,.md"
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {isUploading && (
              <ProgressIndicator 
                progress={uploadProgress} 
                label="Uploading document..." 
                showPercentage={true}
              />
            )}
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
        <Label htmlFor={`content-type-${lectureId}`} className="block text-sm font-medium text-gray-700 mb-2">
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
