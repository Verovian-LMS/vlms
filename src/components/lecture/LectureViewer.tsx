
import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import QuizLecture from "./QuizLecture";
import ContentTypeViewer from "@/components/content/ContentTypeViewer";
import { LectureContentType } from "@/types/course";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface LectureViewerProps {
  lecture: {
    id: string;
    title?: string;
    video_url?: string | null;
    pdf_url?: string | null;
    slides_url?: string | null;
    audio_url?: string | null;
    document_url?: string | null;
    interactive_url?: string | null;
    downloadable_url?: string | null;
    description?: string;
    content_type?: string;
    resources?: Array<{
      id: string;
      title: string;
      description?: string;
      file_url: string;
      file_type: string;
      file_size?: number;
      is_downloadable: boolean;
    }>;
    modules?: {
      courses?: {
        id?: string;
      };
    };
  };
  videoProgress: number;
  prevLectureId: string | null;
  nextLectureId: string | null;
  onProgressUpdate: (currentTime: number, duration: number) => void;
}

const LectureViewer: React.FC<LectureViewerProps> = ({
  lecture,
  videoProgress,
  prevLectureId,
  nextLectureId,
  onProgressUpdate
}) => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  // Map DB content_type to our internal types
  const getContentType = (): LectureContentType => {
    // Default to 'video' if no content_type is provided
    if (!lecture.content_type) return 'video';
    
    const contentType = lecture.content_type.toLowerCase();
    
    if (contentType.includes('video')) return 'video';
    if (contentType.includes('pdf')) return 'pdf';
    if (contentType.includes('slide')) return 'slides';
    if (contentType.includes('audio')) return 'audio';
    if (contentType.includes('doc')) return 'document';
    if (contentType.includes('interact')) return 'interactive';
    if (contentType.includes('download')) return 'downloadable';
    
    // If we can't determine from content_type, try to infer from available URLs
    if (lecture.video_url) return 'video';
    if (lecture.pdf_url) return 'pdf';
    if (lecture.slides_url) return 'slides';
    if (lecture.audio_url) return 'audio';
    if (lecture.document_url) return 'document';
    if (lecture.interactive_url) return 'interactive';
    if (lecture.downloadable_url) return 'downloadable';
    
    // Default to video if we can't determine
    return 'video';
  };

  // Navigation handlers
  const handlePreviousLecture = () => {
    try {
      if (prevLectureId && lecture?.modules?.courses?.id) {
        navigate(`/courses/${lecture.modules.courses.id}/lecture/${prevLectureId}`);
      }
    } catch (error) {
      handleError(error, { 
        title: "Navigation Error", 
        source: "LectureViewer" 
      });
    }
  };

  const handleNextLecture = () => {
    try {
      if (nextLectureId && lecture?.modules?.courses?.id) {
        navigate(`/courses/${lecture.modules.courses.id}/lecture/${nextLectureId}`);
      }
    } catch (error) {
      handleError(error, { 
        title: "Navigation Error", 
        source: "LectureViewer" 
      });
    }
  };

  // Format lecture data for the ContentTypeViewer
  const formattedLecture = {
    id: lecture.id,
    title: lecture.title,
    videoUrl: lecture.video_url,
    pdfUrl: lecture.pdf_url,
    slidesUrl: lecture.slides_url,
    audioUrl: lecture.audio_url,
    documentUrl: lecture.document_url,
    interactiveUrl: lecture.interactive_url,
    downloadableUrl: lecture.downloadable_url,
    resources: lecture.resources?.map(resource => ({
      id: resource.id,
      title: resource.title,
      description: resource.description,
      fileUrl: resource.file_url,
      fileType: resource.file_type,
      fileSize: resource.file_size,
      isDownloadable: resource.is_downloadable
    }))
  };

  const contentType = getContentType();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ContentTypeViewer
        contentType={contentType}
        lecture={formattedLecture}
        onProgressUpdate={onProgressUpdate}
      />

      {/* Progress bar - shown for content types that track progress */}
      {contentType === 'video' && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>Progress</span>
            <span>{Math.round(videoProgress)}%</span>
          </div>
          <Progress value={videoProgress} className="h-2" />
        </div>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          onClick={handlePreviousLecture}
          disabled={!prevLectureId}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          className="bg-medblue-600 hover:bg-medblue-700 flex items-center space-x-2"
          onClick={handleNextLecture}
          disabled={!nextLectureId}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quiz component for this lecture if available */}
      {lecture.id && <QuizLecture lectureId={lecture.id} />}
    </motion.div>
  );
};

export default LectureViewer;
