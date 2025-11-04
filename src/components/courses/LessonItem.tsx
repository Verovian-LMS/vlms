
import React, { useState } from 'react';
import { 
  X, 
  Video, 
  Upload, 
  FileText, 
  Presentation, 
  Music, 
  FilePlus, 
  Sparkles,
  FileDown
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useToast } from "@/hooks/use-toast";
import VideoPlayer from '@/components/video/VideoPlayer';
import { ProgressIndicator } from '@/components/ui/progress-indicator';
import ContentTypeSelector from '@/components/content/ContentTypeSelector';
import { LessonContentType } from '@/types/course';
import { uploadContentFile } from '@/lib/actions/course.actions';

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    contentType?: LessonContentType;
    videoUrl?: string | null;
    pdfUrl?: string | null;
    slidesUrl?: string | null;
    audioUrl?: string | null;
    documentUrl?: string | null;
    interactiveUrl?: string | null;
    downloadableUrl?: string | null;
    duration?: number;
    notes?: string;
    resources?: any[];
  };
  index: number;
  moduleId: string;
  updateLesson: (field: string, value: any) => void;
  removeLesson: () => void;
  canRemove: boolean;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadProgress: number;
  isUploading: boolean;
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  index,
  moduleId,
  updateLesson,
  removeLesson,
  canRemove,
  handleVideoUpload,
  uploadProgress,
  isUploading
}) => {
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const { toast } = useToast();
  
  const contentType = lesson.contentType || 'video';
  
  const getContentTypeIcon = () => {
    switch (contentType) {
      case 'video': return <Video className="h-5 w-5" />;
      case 'pdf': return <FileText className="h-5 w-5" />;
      case 'slides': return <Presentation className="h-5 w-5" />;
      case 'audio': return <Music className="h-5 w-5" />;
      case 'document': return <FileText className="h-5 w-5" />;
      case 'interactive': return <Sparkles className="h-5 w-5" />;
      case 'downloadable': return <FileDown className="h-5 w-5" />;
      default: return <Video className="h-5 w-5" />;
    }
  };
  
  const getContentUrlForType = () => {
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
  
  const handleContentTypeChange = (newContentType: LessonContentType) => {
    updateLesson('contentType', newContentType);
  };
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // For video content, use the existing video upload handler
    if (contentType === 'video') {
      handleVideoUpload(e);
      return;
    }
    
    // For other content types, implement file upload logic
    try {
      // You would implement file upload logic here
      // This is a placeholder for the actual implementation
      toast({
        title: `${contentType} upload started`,
        description: `Uploading ${file.name}...`,
      });
      
      // Example for updating URL based on content type
      const fieldToUpdate = `${contentType}Url`;
      
      // Simulate file upload - in a real app, replace with actual upload logic
      setTimeout(() => {
        // Example URL - replace with actual URL from your upload function
        const mockUrl = `https://example.com/files/${contentType}/${Date.now()}-${file.name}`;
        updateLesson(fieldToUpdate, mockUrl);
        
        toast({
          title: `${contentType} upload complete`,
          description: `${file.name} has been uploaded successfully`,
        });
      }, 1500);
    } catch (error) {
      console.error(`Error uploading ${contentType}:`, error);
      toast({
        title: `${contentType} upload failed`,
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };
  
  const addResource = () => {
    if (!resourceName.trim()) {
      toast({
        title: "Resource name required",
        description: "Please provide a name for the resource",
        variant: "destructive",
      });
      return;
    }
    
    // In a real implementation, you would upload the resource file
    // and get a URL back from your storage service
    
    const newResource = {
      id: crypto.randomUUID(),
      title: resourceName,
      description: resourceDescription,
      fileUrl: "https://example.com/resource.pdf", // Placeholder URL
      fileType: "PDF", // Placeholder file type
      fileSize: 1024 * 1024, // Placeholder file size (1 MB)
      isDownloadable: true
    };
    
    const updatedResources = [...(lesson.resources || []), newResource];
    updateLesson('resources', updatedResources);
    
    // Reset form
    setResourceName('');
    setResourceDescription('');
    setShowResourcesPanel(false);
    
    toast({
      title: "Resource added",
      description: `${resourceName} has been added to lesson resources`,
    });
  };

  return (
    <div className="border border-slate-200 rounded-md p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium mr-2">
            {index + 1}
          </span>
          <span className="font-medium">{lesson.title || 'Untitled Lesson'}</span>
        </div>
        
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeLesson}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove lesson</span>
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor={`lesson-title-${lesson.id}`}>Lesson Title</Label>
          <Input
            id={`lesson-title-${lesson.id}`}
            value={lesson.title}
            onChange={(e) => updateLesson('title', e.target.value)}
            placeholder="Enter lesson title"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor={`lesson-desc-${lesson.id}`}>Description</Label>
          <Textarea
            id={`lesson-desc-${lesson.id}`}
            value={lesson.description || ''}
            onChange={(e) => updateLesson('description', e.target.value)}
            placeholder="Enter lesson description"
            className="mt-1 min-h-[80px] resize-none"
          />
        </div>
        
        <div>
          <Label className="mb-2 block">Content Type</Label>
          <ContentTypeSelector
            selectedType={contentType}
            onChange={handleContentTypeChange}
            className="mb-4"
          />
          
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <Label className="flex items-center">
                {getContentTypeIcon()}
                <span className="ml-2 capitalize">{contentType} Content</span>
              </Label>
              
              {getContentUrlForType() && (
                <a 
                  href={getContentUrlForType() || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-xs text-blue-500 hover:text-blue-700 underline"
                >
                  View {contentType}
                </a>
              )}
            </div>
            
            <div className="border rounded-md p-3 bg-slate-50">
              <input
                type="file"
                id={`file-upload-${lesson.id}`}
                className="hidden"
                onChange={handleFileUpload}
                accept={
                  contentType === 'video' ? "video/*" :
                  contentType === 'pdf' ? "application/pdf" :
                  contentType === 'slides' ? "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf" :
                  contentType === 'audio' ? ".mp3,.wav,.ogg,.m4a" :
                  contentType === 'document' ? "text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                  contentType === 'interactive' ? "text/html,application/json" :
                  "*/*"
                }
              />
              
              {!getContentUrlForType() ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(`file-upload-${lesson.id}`)?.click()}
                  disabled={isUploading}
                  className="w-full justify-center"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload {contentType}
                </Button>
              ) : (
                <div className="text-sm text-slate-600 flex items-center justify-between">
                  <span>Content uploaded</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.getElementById(`file-upload-${lesson.id}`)?.click()}
                  >
                    Change
                  </Button>
                </div>
              )}
              
              {isUploading && (
                <div className="mt-2">
                  <ProgressIndicator progress={uploadProgress} />
                  <p className="text-xs text-center mt-1 text-slate-500">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-2">
            <Label>Resources</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResourcesPanel(!showResourcesPanel)}
            >
              <FilePlus className="h-4 w-4 mr-1" />
              Add Resource
            </Button>
          </div>
          
          {showResourcesPanel && (
            <div className="border rounded-md p-3 mb-3 bg-slate-50">
              <div className="space-y-3">
                <div>
                  <Label htmlFor={`resource-name-${lesson.id}`} className="text-sm">Resource Name</Label>
                  <Input
                    id={`resource-name-${lesson.id}`}
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder="Enter resource name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`resource-desc-${lesson.id}`} className="text-sm">Description (optional)</Label>
                  <Textarea
                    id={`resource-desc-${lesson.id}`}
                    value={resourceDescription}
                    onChange={(e) => setResourceDescription(e.target.value)}
                    placeholder="Enter resource description"
                    className="mt-1 min-h-[60px] resize-none"
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowResourcesPanel(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={addResource}
                  >
                    Add Resource
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="border rounded-md p-3 bg-white">
            {lesson.resources && lesson.resources.length > 0 ? (
              <ul className="divide-y">
                {lesson.resources.map((resource, idx) => (
                  <li key={resource.id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{resource.title}</p>
                      {resource.description && (
                        <p className="text-xs text-slate-500">{resource.description}</p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0"
                      onClick={() => {
                        const updatedResources = (lesson.resources || []).filter(
                          (r) => r.id !== resource.id
                        );
                        updateLesson('resources', updatedResources);
                      }}
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Remove resource</span>
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-500 text-center py-2">
                No resources added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonItem;
