
import React from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import QuizLesson from "./QuizLesson";
import ContentTypeViewer from "@/components/content/ContentTypeViewer";
import { LessonContentType } from "@/types/course";
import { useErrorHandler } from "@/hooks/use-error-handler";

interface LessonViewerProps {
  lesson: {
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
  prevLessonId: string | null;
  nextLessonId: string | null;
  onProgressUpdate: (currentTime: number, duration: number) => void;
  isAuthor?: boolean;
  savedRecently?: boolean;
  updateOnSeek?: boolean;
  markCompleteOnLoad?: boolean;
}

const LessonViewer: React.FC<LessonViewerProps> = ({
  lesson,
  videoProgress,
  prevLessonId,
  nextLessonId,
  onProgressUpdate,
  isAuthor,
  savedRecently,
  updateOnSeek,
  markCompleteOnLoad
}) => {
  const navigate = useNavigate();
  const { handleError } = useErrorHandler();

  // Map DB content_type to our internal types
  const getContentType = (): LessonContentType => {
    // Prefer explicit URLs first
    if (lesson?.pdf_url) return 'pdf';
    if (lesson?.slides_url) return 'slides';
    if (lesson?.audio_url) return 'audio';
    if (lesson?.document_url) return 'document';
    if (lesson?.interactive_url) return 'interactive';
    if (lesson?.download_url || lesson?.downloadable_url) return 'downloadable';
    if (lesson?.video_url) return 'video';

    // Then rely on content_type string if present
    const contentType = (lesson?.content_type || '').toLowerCase();
    if (contentType.includes('pdf')) return 'pdf';
    if (contentType.includes('slide') || contentType.includes('ppt') || contentType.includes('presentation') || contentType.includes('powerpoint')) return 'slides';
    if (contentType.includes('audio')) return 'audio';
    if (contentType.includes('doc') || contentType.includes('docx') || contentType.includes('word') || contentType.includes('text')) return 'document';
    if (contentType.includes('interact')) return 'interactive';
    if (contentType.includes('download')) return 'downloadable';
    if (contentType.includes('video')) return 'video';

    // Treat plain text content as document
    if (lesson?.content) return 'document';
    return 'video';
  };

  // Navigation handlers
  const handlePreviousLesson = () => {
    try {
      if (prevLessonId && lesson?.modules?.courses?.id) {
        navigate(`/courses/${lesson.modules.courses.id}/lesson/${prevLessonId}`);
      }
    } catch (error) {
      handleError(error, { 
        title: "Navigation Error", 
        source: "LessonViewer" 
      });
    }
  };

  const handleNextLesson = () => {
    try {
      if (nextLessonId && lesson?.modules?.courses?.id) {
        navigate(`/courses/${lesson.modules.courses.id}/lesson/${nextLessonId}`);
      }
    } catch (error) {
      handleError(error, { 
        title: "Navigation Error", 
        source: "LessonViewer" 
      });
    }
  };

  // Format lesson data for the ContentTypeViewer
  const formattedLesson = {
    id: lesson.id,
    title: lesson.title,
    videoUrl: lesson.video_url,
    pdfUrl: lesson.pdf_url,
    slidesUrl: lesson.slides_url,
    audioUrl: lesson.audio_url,
    documentUrl: lesson.document_url,
    interactiveUrl: lesson.interactive_url,
    downloadableUrl: lesson.downloadable_url,
    resources: lesson.resources?.map(resource => ({
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
  // Prefer explicit prop; otherwise use lesson-level setting; otherwise default by content type
  const defaultMarkOnLoadByType = (ct: LessonContentType) => (ct === 'pdf' || ct === 'document' || ct === 'slides');
  const markOnLoad = (typeof markCompleteOnLoad !== 'undefined')
    ? markCompleteOnLoad
    : (
      (lesson as any)?.mark_complete_on_load ??
      (lesson as any)?.markCompleteOnLoad ??
      defaultMarkOnLoadByType(contentType)
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <ContentTypeViewer
        contentType={contentType}
        lesson={formattedLesson}
        onProgressUpdate={onProgressUpdate}
        isAuthor={isAuthor}
        editCourseId={lesson?.modules?.courses?.id}
        updateOnSeek={updateOnSeek}
        markCompleteOnLoad={markOnLoad}
      />

      {/* Progress bar - shown for video and PDF content */}
      {(contentType === 'video' || contentType === 'pdf') && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-1">
            <span>{contentType === 'pdf' ? 'Reading Progress' : 'Progress'}</span>
            <span>{Math.round(videoProgress)}%</span>
          </div>
          <Progress value={videoProgress} className="h-2" />
        </div>
      )}

      {/* Saved indicator shown for all content types when recent save occurred */}
      {savedRecently && (
        <div className="mt-2 text-xs text-green-600 opacity-90">Progress saved</div>
      )}

      <div className="mt-6 flex justify-between">
        <Button
          variant="outline"
          className="flex items-center space-x-2"
          onClick={handlePreviousLesson}
          disabled={!prevLessonId}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
        <Button
          className="bg-medblue-600 hover:bg-medblue-700 flex items-center space-x-2"
          onClick={handleNextLesson}
          disabled={!nextLessonId}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Quiz component for this lesson if available */}
      {lesson.id && <QuizLesson lessonId={lesson.id} />}
  </motion.div>
);
};

export default LessonViewer;
