import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/context/FastApiAuthContext";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Unlock } from "lucide-react";

// Import our components
import LessonHeader from "@/components/lesson/LessonHeader";
import LessonViewer from "@/components/lesson/LessonViewer";
import LessonContent from "@/components/lesson/LessonContent";
import LessonNotes from "@/components/lesson/LessonNotes";
import LessonDiscussion from "@/components/lesson/LessonDiscussion";
import ModuleProgress from "@/components/lesson/ModuleProgress";
import { Link } from "react-router-dom";

const LessonPage = () => {
  const { lessonId, courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [lessonNotes, setLessonNotes] = useState<string>("");
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lesson, setLesson] = useState<any>(null);
  const [prevLessonId, setPrevLessonId] = useState<string | null>(null);
  const [nextLessonId, setNextLessonId] = useState<string | null>(null);
  const [isAuthor, setIsAuthor] = useState<boolean>(false);
  const [savedRecently, setSavedRecently] = useState<boolean>(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to validate UUID
  const isValidUUID = (str: string | undefined): boolean => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // If lessonId (legacy lectureId) isn't a UUID, fetch the first lesson of the course
  useEffect(() => {
    const fetchFirstLesson = async () => {
      if (!courseId || isValidUUID(lessonId)) return;

      try {
        setIsLoading(true);
        console.log("Lesson route param is not a UUID, fetching first lesson of the course");

        // First get modules for this course
        const modulesResponse = await apiClient.getCourseModules(courseId);
        const modules = modulesResponse.data || [];

        if (modules && modules.length > 0) {
          const firstModuleId = modules[0].id;

          // Now get the first lesson in this module
          const lessonsResponse = await apiClient.getModuleLessons(firstModuleId);
          const lessons = lessonsResponse.data || [];

          if (lessons && lessons.length > 0) {
            // Redirect to the first lesson with a proper UUID
            navigate(`/courses/${courseId}/lesson/${lessons[0].id}`, { replace: true });
          } else {
            // No lessons found
            toast({
              title: "No lessons found",
              description: "This course doesn't have any lessons yet.",
              variant: "destructive"
            });
          }
        } else {
          // No modules found
          toast({
            title: "No modules found",
            description: "This course doesn't have any modules yet.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error fetching first lesson:", error);
        toast({
          title: "Error",
          description: "Failed to find lessons for this course.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirstLesson();
  }, [lessonId, courseId, navigate, toast]);

  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !isValidUUID(lessonId)) return;

      try {
        // Fetch lesson details including video URL
        const lessonResponse = await apiClient.getLesson(lessonId);
        const lessonData = lessonResponse.data;

        if (!lessonData) {
          console.error('No lesson data found for ID:', lessonId);
          toast({
            title: "Not Found",
            description: "The requested lesson could not be found.",
            variant: "destructive"
          });
          return;
        }

        // Compose lesson object with nested course id for navigation
        const moduleId = lessonData?.module_id;
        const composedLesson = {
          ...lessonData,
          modules: {
            id: moduleId,
            title: undefined,
            courses: {
              id: courseId,
              title: undefined,
            }
          }
        };

        console.log("Lesson data fetched:", composedLesson);
        setLesson(composedLesson);
        setLessonNotes(lessonData?.notes || "No notes available for this lesson.");

        // Determine if current user is the author of the course for preview access
        let isCreator = false;
        if (user && courseId) {
          try {
            const courseResp = await apiClient.getCourse(courseId);
            const course = courseResp.data;
            const authorId = course?.author?.id || course?.author_id || course?.profiles?.user_id || course?.profiles?.id;
            isCreator = !!authorId && !!user?.id && authorId === user.id;
            setIsAuthor(isCreator);
          } catch (authorErr) {
            console.warn('Unable to determine author for preview access:', authorErr);
            setIsAuthor(false);
          }
        }

        if (moduleId && courseId) {
          // Fetch all lessons in this module to determine prev/next
          const moduleLessonsResponse = await apiClient.getModuleLessons(moduleId);
          const moduleLessons = moduleLessonsResponse.data || [];

          if (moduleLessons && moduleLessons.length > 0) {
            const currentIndex = moduleLessons.findIndex((l: any) => l.id === lessonId);
            if (currentIndex > 0) {
              setPrevLessonId(moduleLessons[currentIndex - 1].id);
            } else {
              setPrevLessonId(null);
            }
            if (currentIndex < moduleLessons.length - 1) {
              setNextLessonId(moduleLessons[currentIndex + 1].id);
            } else {
              setNextLessonId(null);
            }
          }
        }

        // Fetch module progress (include authors for display, but authors won't write progress)
        if (user) {
          try {
            // Check progress for this lesson
            const progressResponse = await apiClient.getLessonProgress(lessonId);
            const progressData = progressResponse.data;
            if (progressData) {
              setVideoProgress(progressData.progress || 0);
              console.log("Found existing lesson progress:", progressData);
            }
            
            // Get all lessons from the same module to show module progress
            if (moduleId) {
              const moduleLessonsResponse = await apiClient.getModuleLessons(moduleId);
              const moduleLessons = moduleLessonsResponse.data || [];

              if (moduleLessons && moduleLessons.length > 0) {
            const moduleMap = new Map<string, any>();
                // We do not have module title and course_id directly here; use courseId from params
                moduleMap.set(moduleId, {
                  id: moduleId,
                  title: "Module",
                  course_id: courseId,
                  lessons: [] as any[],
                });

                // For each lesson, fetch progress and build entries
                for (const l of moduleLessons) {
                  try {
                    const pResp = await apiClient.getLessonProgress(l.id);
                    const p = pResp.data || { progress: 0, is_completed: false };
                    moduleMap.get(moduleId).lessons.push({
                      id: l.id,
                      title: l.title || "Untitled Lesson",
                      progress: p.progress || 0,
                      isCompleted: p.is_completed || false,
                    });
                  } catch (e) {
                    moduleMap.get(moduleId).lessons.push({
                      id: l.id,
                      title: l.title || "Untitled Lesson",
                      progress: 0,
                      isCompleted: false,
                    });
                  }
                }

                setModuleProgress(Array.from(moduleMap.values()));
              }
            }
          } catch (progressError) {
            console.error('Error in progress fetching:', progressError);
          }
        }
      } catch (error) {
        console.error('Error in fetchLessonData:', error);
        toast({
          title: "Error",
          description: "Failed to load lesson data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLessonData();
  }, [lessonId, user, toast]);

  // Function to handle video progress updates - improved with precision and reliability
  const handleVideoProgress = useCallback(async (currentTime: number, duration: number) => {
    // Allow authors to preview without recording progress
    if (isAuthor) return;
    if (!user || !lessonId || !isValidUUID(lessonId)) return;

    // More precise calculation with decimal points for better accuracy
    const progressPercentage = Math.min(parseFloat((currentTime / duration * 100).toFixed(1)), 100);
    setVideoProgress(progressPercentage);

    // Don't update database for very small changes (reduces DB load and improves accuracy)
    if (Math.abs(progressPercentage - videoProgress) < 0.5 && progressPercentage !== 100) return;

    try {
      // Calculate completion status more accurately
      // Only mark as completed if we're at the end of the video (>= 98%) or if user watched >= 95% of content
      const isCompleted = progressPercentage >= 98 || videoProgress >= 95;

      const response = await apiClient.upsertLessonProgress(lessonId, progressPercentage, isCompleted);
      if (response.error) {
        console.error('Error updating progress:', response.error);
        toast({
          title: "Error",
          description: "Failed to update lesson progress",
          variant: "destructive",
        });
        return;
      }

      // Subtle save indicator
      setSavedRecently(true);
      setTimeout(() => setSavedRecently(false), 1500);

      // If progress is near 100%, show completed toast only once when reaching that threshold
      if (progressPercentage >= 90 && videoProgress < 90) {
        toast({
          title: "Lesson Completed",
          description: "You've completed this lesson!",
        });
      }
    } catch (error) {
      console.error('Error in handleVideoProgress:', error);
    }
  }, [user, lessonId, toast, videoProgress, isAuthor]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-nunito">Lesson Not Found</h1>
          <p className="text-gray-600 mb-4 font-exo2">The lesson you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Extract properties for components
  const displayCourseId = lesson?.modules?.courses?.id;
  const courseTitle = lesson?.modules?.courses?.title;
  const moduleTitle = lesson?.modules?.title;
  const lessonTitle = lesson?.title;

  return (
    <div className="min-h-screen bg-slate-50">
      <LessonHeader 
        courseId={displayCourseId}
        courseTitle={courseTitle}
        moduleTitle={moduleTitle}
        lessonTitle={lessonTitle}
      />

      <div className="container mx-auto px-4 py-8">
        {isAuthor && (
          <Alert className="mb-4">
            <Unlock className="h-4 w-4" />
            <AlertTitle>Previewing as Author</AlertTitle>
            <AlertDescription>
              Lessons and modules are unlocked for you to review content.
            </AlertDescription>
          </Alert>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LessonViewer 
              lesson={lesson}
              videoProgress={videoProgress}
              prevLessonId={prevLessonId}
              nextLessonId={nextLessonId}
              onProgressUpdate={handleVideoProgress}
              isAuthor={isAuthor}
              savedRecently={savedRecently}
              updateOnSeek={true}
            />

            <LessonContent description={lesson.description} />
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Tabs
                defaultValue="notes"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="notes">Notes</TabsTrigger>
                  <TabsTrigger value="discussion">Discussion</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="mt-4">
                  <LessonNotes notes={lessonNotes} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="discussion" className="mt-4">
        <LessonDiscussion lessonId={lessonId} />
                </TabsContent>
              </Tabs>

              <div className="mt-6 bg-white rounded-xl shadow-sm border border-slate-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 font-nunito">Module Progress</h3>
                <ModuleProgress moduleProgress={moduleProgress} isLoading={isLoading} />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPage;
