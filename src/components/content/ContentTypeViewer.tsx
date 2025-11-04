
import React from 'react';
import { LessonContentType } from '@/types/course';
import VideoPlayer from '@/components/video/VideoPlayer';
import PDFViewer from '@/components/content/PDFViewer';
import SlidesViewer from '@/components/content/SlidesViewer';
import AudioPlayer from '@/components/content/AudioPlayer';
import DocumentViewer from '@/components/content/DocumentViewer';
import InteractiveContent from '@/components/content/InteractiveContent';
import ResourceList from '@/components/content/ResourceList';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ContentTypeViewerProps {
  contentType?: LessonContentType;
  lesson: {
    id: string;
    title?: string;
    videoUrl?: string | null;
    pdfUrl?: string | null;
    slidesUrl?: string | null;
    audioUrl?: string | null;
    documentUrl?: string | null;
    interactiveUrl?: string | null;
    downloadableUrl?: string | null;
    resources?: Array<{
      id: string;
      title: string;
      description?: string;
      fileUrl: string;
      fileType: string;
      fileSize?: number;
      isDownloadable: boolean;
    }>;
  };
  onProgressUpdate: (currentTime: number, duration: number) => void;
  isAuthor?: boolean;
  editCourseId?: string;
  updateOnSeek?: boolean;
  markCompleteOnLoad?: boolean;
}

const ContentTypeViewer: React.FC<ContentTypeViewerProps> = ({
  contentType = 'video',
  lesson,
  onProgressUpdate,
  isAuthor = false,
  editCourseId,
  updateOnSeek,
  markCompleteOnLoad
}) => {
  // Helper function to determine content source based on type
  const getContentSource = () => {
    switch (contentType) {
      case 'video': return lesson.videoUrl;
      case 'pdf': return lesson.pdfUrl;
      case 'slides': return lesson.slidesUrl;
      case 'audio': return lesson.audioUrl;
      case 'document': return lesson.documentUrl;
      case 'interactive': return lesson.interactiveUrl;
      case 'downloadable': return lesson.downloadableUrl;
      default: return null;
    }
  };

  const contentSource = getContentSource();
  
  // If no content source is available, show an alert
  if (!contentSource) {
    return (
      <Alert variant={isAuthor ? 'default' : 'destructive'} className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{isAuthor ? 'No Content Attached' : 'Content Not Available'}</AlertTitle>
        <AlertDescription>
          {isAuthor ? (
            <div className="space-y-2">
              <p>
                There is no source URL set for the {contentType} content in this lesson.
                Attach a file or set a URL in the course editor.
              </p>
              <div>
                <Button variant="outline" size="sm" asChild>
                  <Link to={editCourseId ? `/course-editor/${editCourseId}` : '/course-upload'}>
                    Edit Course Content
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <>The {contentType} content for this lesson is not available. Please contact the instructor.</>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Render the appropriate content viewer based on content type
  switch (contentType) {
    case 'video':
      return (
        <VideoPlayer 
          src={contentSource} 
          title={lesson.title || "Video"} 
          updateOnSeek={updateOnSeek}
          onProgressUpdate={onProgressUpdate}
        />
      );
      
    case 'pdf':
      return (
        <PDFViewer 
          src={contentSource} 
          title={lesson.title || "PDF Document"} 
          onProgressUpdate={onProgressUpdate}
          markCompleteOnLoad={markCompleteOnLoad}
        />
      );
      
    case 'slides':
      return (
        <SlidesViewer 
          src={contentSource} 
          title={lesson.title || "Presentation Slides"} 
        />
      );
      
    case 'audio':
      return (
        <AudioPlayer 
          src={contentSource} 
          title={lesson.title || "Audio"} 
        />
      );
      
    case 'document':
      return (
        <DocumentViewer 
          src={contentSource} 
          title={lesson.title || "Document"} 
        />
      );
      
    case 'interactive':
      return (
        <InteractiveContent 
          src={contentSource} 
          lessonId={lesson.id}
          title={lesson.title || "Interactive Content"} 
        />
      );
      
    case 'downloadable':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Downloadable Resources</h3>
          {lesson.resources && lesson.resources.length > 0 ? (
            <ResourceList 
              resources={lesson.resources}
              allowBatchDownload={true}
            />
          ) : (
            <p className="text-slate-500">No downloadable resources available for this lesson.</p>
          )}
        </div>
      );
      
    default:
      return (
        <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
          <p className="text-gray-500">Unknown content type</p>
        </div>
      );
  }
};

export default ContentTypeViewer;
