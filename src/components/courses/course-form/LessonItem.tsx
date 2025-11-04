
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Trash2, Video, FileSymlink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useVideoUpload } from '@/hooks/use-video-upload';

interface LessonItemProps {
  lesson: {
    id: string;
    title: string;
    description?: string;
    videoUrl?: string;
    duration?: number;
    notes?: string;
  };
  index: number;
  moduleIndex: number;
  updateLesson: (data: any) => void;
  removeLesson: () => void;
}

const LessonItem: React.FC<LessonItemProps> = ({
  lesson,
  index,
  moduleIndex,
  updateLesson,
  removeLesson
}) => {
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const { uploadVideo, uploadStatuses } = useVideoUpload();
  
  const uploadStatus = uploadStatuses[lesson.id] || { progress: 0, isUploading: false, error: null };

  const handleVideoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingVideo(true);
    
    try {
      await uploadVideo(
        file,
        `module_${moduleIndex}`,
        lesson.id,
        (lessonId, url, duration) => {
          updateLesson({
            videoUrl: url,
            duration: parseInt(duration) || 0,
          });
          setUploadingVideo(false);
        },
        (lessonId, error) => {
          console.error("Video upload error:", error);
          setUploadingVideo(false);
        }
      );
    } catch (error) {
      console.error("Upload handling error:", error);
      setUploadingVideo(false);
    }
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h5 className="text-sm font-medium">Lesson {index + 1}</h5>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={removeLesson}
          >
            <Trash2 size={16} />
          </Button>
        </div>

        <div className="space-y-3">
          <Input
            placeholder="Lesson Title"
            value={lesson.title}
            onChange={(e) => updateLesson({ title: e.target.value })}
            className="font-exo2 text-sm"
          />
          
          <Textarea
            placeholder="Lesson Description (optional)"
            value={lesson.description || ''}
            onChange={(e) => updateLesson({ description: e.target.value })}
            className="font-exo2 resize-none text-sm h-16"
          />

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-700">Video</label>
              {lesson.videoUrl && (
                <a 
                  href={lesson.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center text-xs text-blue-500 hover:text-blue-700"
                >
                  <FileSymlink size={14} className="mr-1" /> View
                </a>
              )}
            </div>

            <div>
              <input
                type="file"
                id={`video-upload-${lesson.id}`}
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
              
              {!lesson.videoUrl && !uploadStatus.isUploading ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full justify-center text-xs"
                  onClick={() => document.getElementById(`video-upload-${lesson.id}`)?.click()}
                  disabled={uploadingVideo}
                >
                  <Video size={14} className="mr-1" /> Upload Video
                </Button>
              ) : (
                <div className="space-y-1">
                  {uploadStatus.isUploading && (
                    <>
                      <Progress value={uploadStatus.progress} className="h-2" />
                      <p className="text-xs text-slate-500 text-center">
                        {uploadStatus.progress}% - Uploading...
                      </p>
                    </>
                  )}
                  
                  {lesson.videoUrl && !uploadStatus.isUploading && (
                    <div className="flex justify-between items-center text-xs text-slate-600">
                      <span>Video uploaded</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => document.getElementById(`video-upload-${lesson.id}`)?.click()}
                      >
                        Change
                      </Button>
                    </div>
                  )}
                  
                  {uploadStatus.error && (
                    <p className="text-xs text-red-500">{uploadStatus.error}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LessonItem;
