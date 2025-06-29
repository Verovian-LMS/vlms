
import React from 'react';
import { LectureContentType } from '@/types/course';
import VideoPlayer from '@/components/video/VideoPlayer';
import PDFViewer from '@/components/content/PDFViewer';
import SlidesViewer from '@/components/content/SlidesViewer';
import AudioPlayer from '@/components/content/AudioPlayer';
import DocumentViewer from '@/components/content/DocumentViewer';
import InteractiveContent from '@/components/content/InteractiveContent';
import ResourceList from '@/components/content/ResourceList';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ContentTypeViewerProps {
  contentType?: LectureContentType;
  lecture: {
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
}

const ContentTypeViewer: React.FC<ContentTypeViewerProps> = ({
  contentType = 'video',
  lecture,
  onProgressUpdate
}) => {
  // Helper function to determine content source based on type
  const getContentSource = () => {
    switch (contentType) {
      case 'video': return lecture.videoUrl;
      case 'pdf': return lecture.pdfUrl;
      case 'slides': return lecture.slidesUrl;
      case 'audio': return lecture.audioUrl;
      case 'document': return lecture.documentUrl;
      case 'interactive': return lecture.interactiveUrl;
      case 'downloadable': return lecture.downloadableUrl;
      default: return null;
    }
  };

  const contentSource = getContentSource();
  
  // If no content source is available, show an alert
  if (!contentSource) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Content Not Available</AlertTitle>
        <AlertDescription>
          The {contentType} content for this lecture is not available. Please contact the instructor.
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
          title={lecture.title || "Video"} 
          onProgressUpdate={onProgressUpdate}
        />
      );
      
    case 'pdf':
      return (
        <PDFViewer 
          src={contentSource} 
          title={lecture.title || "PDF Document"} 
        />
      );
      
    case 'slides':
      return (
        <SlidesViewer 
          src={contentSource} 
          title={lecture.title || "Presentation Slides"} 
        />
      );
      
    case 'audio':
      return (
        <AudioPlayer 
          src={contentSource} 
          title={lecture.title || "Audio"} 
        />
      );
      
    case 'document':
      return (
        <DocumentViewer 
          src={contentSource} 
          title={lecture.title || "Document"} 
        />
      );
      
    case 'interactive':
      return (
        <InteractiveContent 
          src={contentSource} 
          lectureId={lecture.id}
          title={lecture.title || "Interactive Content"} 
        />
      );
      
    case 'downloadable':
      return (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Downloadable Resources</h3>
          {lecture.resources && lecture.resources.length > 0 ? (
            <ResourceList 
              resources={lecture.resources}
              allowBatchDownload={true}
            />
          ) : (
            <p className="text-slate-500">No downloadable resources available for this lecture.</p>
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
