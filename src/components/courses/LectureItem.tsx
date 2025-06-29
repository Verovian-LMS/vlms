
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
import { LectureContentType } from '@/types/course';
import { uploadContentFile } from '@/lib/actions/course.actions';

interface LectureItemProps {
  lecture: {
    id: string;
    title: string;
    description?: string;
    contentType?: LectureContentType;
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
  updateLecture: (field: string, value: any) => void;
  removeLecture: () => void;
  canRemove: boolean;
  handleVideoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadProgress: number;
  isUploading: boolean;
}

const LectureItem: React.FC<LectureItemProps> = ({
  lecture,
  index,
  moduleId,
  updateLecture,
  removeLecture,
  canRemove,
  handleVideoUpload,
  uploadProgress,
  isUploading
}) => {
  const [showResourcesPanel, setShowResourcesPanel] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const { toast } = useToast();
  
  const contentType = lecture.contentType || 'video';
  
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
  
  const handleContentTypeChange = (newContentType: LectureContentType) => {
    updateLecture('contentType', newContentType);
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
        updateLecture(fieldToUpdate, mockUrl);
        
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
    
    const updatedResources = [...(lecture.resources || []), newResource];
    updateLecture('resources', updatedResources);
    
    // Reset form
    setResourceName('');
    setResourceDescription('');
    setShowResourcesPanel(false);
    
    toast({
      title: "Resource added",
      description: `${resourceName} has been added to lecture resources`,
    });
  };

  return (
    <div className="border border-slate-200 rounded-md p-4 bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium mr-2">
            {index + 1}
          </span>
          <span className="font-medium">{lecture.title || 'Untitled Lecture'}</span>
        </div>
        
        {canRemove && (
          <Button
            variant="ghost"
            size="sm"
            onClick={removeLecture}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove lecture</span>
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor={`lecture-title-${lecture.id}`}>Lecture Title</Label>
          <Input
            id={`lecture-title-${lecture.id}`}
            value={lecture.title}
            onChange={(e) => updateLecture('title', e.target.value)}
            placeholder="Enter lecture title"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor={`lecture-desc-${lecture.id}`}>Description</Label>
          <Textarea
            id={`lecture-desc-${lecture.id}`}
            value={lecture.description || ''}
            onChange={(e) => updateLecture('description', e.target.value)}
            placeholder="Enter lecture description"
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
                id={`file-upload-${lecture.id}`}
                className="hidden"
                onChange={handleFileUpload}
                accept={
                  contentType === 'video' ? "video/*" :
                  contentType === 'pdf' ? "application/pdf" :
                  contentType === 'slides' ? "application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/pdf" :
                  contentType === 'audio' ? "audio/*" :
                  contentType === 'document' ? "text/plain,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" :
                  contentType === 'interactive' ? "text/html,application/json" :
                  "*/*"
                }
              />
              
              {!getContentUrlForType() ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById(`file-upload-${lecture.id}`)?.click()}
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
                    onClick={() => document.getElementById(`file-upload-${lecture.id}`)?.click()}
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
                  <Label htmlFor={`resource-name-${lecture.id}`} className="text-sm">Resource Name</Label>
                  <Input
                    id={`resource-name-${lecture.id}`}
                    value={resourceName}
                    onChange={(e) => setResourceName(e.target.value)}
                    placeholder="Enter resource name"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor={`resource-desc-${lecture.id}`} className="text-sm">Description (optional)</Label>
                  <Textarea
                    id={`resource-desc-${lecture.id}`}
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
            {lecture.resources && lecture.resources.length > 0 ? (
              <ul className="divide-y">
                {lecture.resources.map((resource, idx) => (
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
                        const updatedResources = (lecture.resources || []).filter(
                          (r) => r.id !== resource.id
                        );
                        updateLecture('resources', updatedResources);
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

export default LectureItem;
