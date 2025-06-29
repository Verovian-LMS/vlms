import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Import our components
import LectureHeader from "@/components/lecture/LectureHeader";
import LectureViewer from "@/components/lecture/LectureViewer";
import LectureContent from "@/components/lecture/LectureContent";
import LectureNotes from "@/components/lecture/LectureNotes";
import LectureDiscussion from "@/components/lecture/LectureDiscussion";
import ModuleProgress from "@/components/lecture/ModuleProgress";
import { Link } from "react-router-dom";

const LecturePage = () => {
  const { lectureId, courseId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  const [videoProgress, setVideoProgress] = useState<number>(0);
  const [lectureNotes, setLectureNotes] = useState<string>("");
  const [moduleProgress, setModuleProgress] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lecture, setLecture] = useState<any>(null);
  const [prevLectureId, setPrevLectureId] = useState<string | null>(null);
  const [nextLectureId, setNextLectureId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Function to validate UUID
  const isValidUUID = (str: string | undefined): boolean => {
    if (!str) return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(str);
  };

  // If lectureId isn't a UUID, try to fetch the first lecture of the course
  useEffect(() => {
    const fetchFirstLecture = async () => {
      if (!courseId || isValidUUID(lectureId)) return;

      try {
        setIsLoading(true);
        console.log("Lecture ID is not a UUID, fetching first lecture of the course");
        
        // First get modules for this course
        const { data: modules, error: modulesError } = await supabase
          .from('modules')
          .select('id')
          .eq('course_id', courseId)
          .order('sequence_order', { ascending: true })
          .limit(1);
          
        if (modulesError) {
          throw modulesError;
        }
        
        if (modules && modules.length > 0) {
          const firstModuleId = modules[0].id;
          
          // Now get the first lecture in this module
          const { data: lectures, error: lecturesError } = await supabase
            .from('lectures')
            .select('id')
            .eq('module_id', firstModuleId)
            .order('sequence_order', { ascending: true })
            .limit(1);
            
          if (lecturesError) {
            throw lecturesError;
          }
          
          if (lectures && lectures.length > 0) {
            // Redirect to the first lecture with a proper UUID
            navigate(`/courses/${courseId}/lecture/${lectures[0].id}`, { replace: true });
          } else {
            // No lectures found
            toast({
              title: "No lectures found",
              description: "This course doesn't have any lectures yet.",
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
        console.error("Error fetching first lecture:", error);
        toast({
          title: "Error",
          description: "Failed to find lectures for this course.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirstLecture();
  }, [lectureId, courseId, navigate, toast]);

  useEffect(() => {
    const fetchLectureData = async () => {
      if (!lectureId || !isValidUUID(lectureId)) return;

      try {
        // Fetch lecture details including video URL
        const { data: lectureData, error: lectureError } = await supabase
          .from('lectures')
          .select(`
            id,
            title,
            description,
            video_url,
            duration_minutes,
            duration,
            notes,
            sequence_order,
            module_id,
            modules (
              id,
              title,
              course_id,
              courses (
                id,
                title
              )
            )
          `)
          .eq('id', lectureId)
          .maybeSingle();

        if (lectureError) {
          console.error('Error fetching lecture details:', lectureError);
          toast({
            title: "Error",
            description: "Failed to load lecture details. Please try again later.",
            variant: "destructive"
          });
          return;
        } 
        
        if (!lectureData) {
          console.error('No lecture data found for ID:', lectureId);
          toast({
            title: "Not Found",
            description: "The requested lecture could not be found.",
            variant: "destructive"
          });
          return;
        }
        
        console.log("Lecture data fetched:", lectureData);
        setLecture(lectureData);
        setLectureNotes(lectureData?.notes || "No notes available for this lecture.");

        // Get course_id from the lecture data
        const fetchedCourseId = lectureData?.modules?.courses?.id;
        const moduleId = lectureData?.module_id;

        if (moduleId && fetchedCourseId) {
          // Fetch all lectures in this module to determine prev/next
          const { data: moduleLectures, error: moduleLecturesError } = await supabase
            .from('lectures')
            .select('id, sequence_order')
            .eq('module_id', moduleId)
            .order('sequence_order', { ascending: true });
            
          if (moduleLecturesError) {
            console.error('Error fetching module lectures:', moduleLecturesError);
          } else if (moduleLectures && moduleLectures.length > 0) {
            // Find current lecture index
            const currentIndex = moduleLectures.findIndex(l => l.id === lectureId);
            
            // Set previous and next lecture IDs
            if (currentIndex > 0) {
              setPrevLectureId(moduleLectures[currentIndex - 1].id);
            } else {
              setPrevLectureId(null);
            }
            
            if (currentIndex < moduleLectures.length - 1) {
              setNextLectureId(moduleLectures[currentIndex + 1].id);
            } else {
              setNextLectureId(null);
            }
          }
        }

        // Fetch module progress
        if (user) {
          try {
            // First check if we have any progress for this lecture
            const { data: lectureProgressData, error: lectureProgressError } = await supabase
              .from('lecture_progress')
              .select('progress, is_completed')
              .eq('user_id', user.id)
              .eq('lecture_id', lectureId)
              .maybeSingle();

            if (lectureProgressError) {
              console.error('Error fetching lecture progress:', lectureProgressError);
            } else if (lectureProgressData) {
              setVideoProgress(lectureProgressData.progress || 0);
              console.log("Found existing lecture progress:", lectureProgressData);
            }
            
            // Get all lectures from the same module to show module progress
            if (lectureData?.module_id) {
              const { data: moduleLectures, error: moduleLecturesError } = await supabase
                .from('lectures')
                .select(`
                  id, 
                  title,
                  module_id,
                  modules (
                    id,
                    title,
                    course_id,
                    courses (
                      id,
                      title
                    )
                  )
                `)
                .eq('module_id', lectureData.module_id);
                
              if (moduleLecturesError) {
                console.error('Error fetching module lectures:', moduleLecturesError);
              } else if (moduleLectures) {
                // For each lecture, get the progress
                const lectureIds = moduleLectures.map(lecture => lecture.id);
                
                if (lectureIds.length > 0) {
                  const { data: progressData, error: progressError } = await supabase
                    .from('lecture_progress')
                    .select('lecture_id, progress, is_completed')
                    .eq('user_id', user.id)
                    .in('lecture_id', lectureIds);
                    
                  if (progressError) {
                    console.error('Error fetching lectures progress:', progressError);
                  } else {
                    // Create a map of lecture progress
                    const progressMap = new Map();
                    progressData?.forEach(item => {
                      progressMap.set(item.lecture_id, {
                        progress: item.progress || 0,
                        isCompleted: item.is_completed || false
                      });
                    });
                    
                    // Group lectures by module
                    const moduleMap = new Map();
                    if (moduleLectures?.[0]?.modules) {
                      const moduleInfo = moduleLectures[0].modules;
                      moduleMap.set(moduleInfo.id, {
                        id: moduleInfo.id,
                        title: moduleInfo.title || "Unknown Module",
                        course: moduleInfo.courses?.title || "Unknown Course",
                        course_id: moduleInfo.courses?.id,
                        lectures: []
                      });
                      
                      // Add lectures with their progress
                      moduleLectures.forEach(lecture => {
                        const progress = progressMap.get(lecture.id) || { progress: 0, isCompleted: false };
                        moduleMap.get(moduleInfo.id).lectures.push({
                          id: lecture.id,
                          title: lecture.title || "Untitled Lecture",
                          progress: progress.progress,
                          isCompleted: progress.isCompleted
                        });
                      });
                      
                      setModuleProgress(Array.from(moduleMap.values()));
                    }
                  }
                }
              }
            }
          } catch (progressError) {
            console.error('Error in progress fetching:', progressError);
          }
        }
      } catch (error) {
        console.error('Error in fetchLectureData:', error);
        toast({
          title: "Error",
          description: "Failed to load lecture data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLectureData();
  }, [lectureId, user, toast]);

  // Function to handle video progress updates - improved with debounce logic
  const handleVideoProgress = useCallback(async (currentTime: number, duration: number) => {
    if (!user || !lectureId || !isValidUUID(lectureId)) return;

    const progressPercentage = Math.min(Math.round((currentTime / duration) * 100), 100);
    setVideoProgress(progressPercentage);

    try {
      // First check if we already have a record
      const { data: existingProgress, error: checkError } = await supabase
        .from('lecture_progress')
        .select('id')
        .eq('user_id', user.id)
        .eq('lecture_id', lectureId)
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking existing progress:', checkError);
        return;
      }
      
      let updateError;
      
      if (existingProgress) {
        // Update existing record
        const { error } = await supabase
          .from('lecture_progress')
          .update({
            progress: progressPercentage,
            last_watched_at: new Date().toISOString(),
            is_completed: progressPercentage >= 90,
            completed_at: progressPercentage >= 90 ? new Date().toISOString() : null
          })
          .eq('id', existingProgress.id);
        
        updateError = error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('lecture_progress')
          .insert({
            user_id: user.id,
            lecture_id: lectureId,
            progress: progressPercentage,
            last_watched_at: new Date().toISOString(),
            is_completed: progressPercentage >= 90,
            completed_at: progressPercentage >= 90 ? new Date().toISOString() : null
          });
        
        updateError = error;
      }

      if (updateError) {
        console.error('Error updating progress:', updateError);
        toast({
          title: "Error",
          description: "Failed to update lecture progress",
          variant: "destructive",
        });
        return;
      }

      // If progress is near 100%, show completed toast only once when reaching that threshold
      if (progressPercentage >= 90 && videoProgress < 90) {
        toast({
          title: "Lecture Completed",
          description: "You've completed this lecture!",
        });
      }
    } catch (error) {
      console.error('Error in handleVideoProgress:', error);
    }
  }, [user, lectureId, toast, videoProgress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  if (!lecture) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-nunito">Lecture Not Found</h1>
          <p className="text-gray-600 mb-4 font-exo2">The lecture you're looking for doesn't exist or you don't have access to it.</p>
          <Button asChild>
            <Link to="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Extract properties for components
  const displayCourseId = lecture?.modules?.courses?.id;
  const courseTitle = lecture?.modules?.courses?.title;
  const moduleTitle = lecture?.modules?.title;
  const lectureTitle = lecture?.title;

  return (
    <div className="min-h-screen bg-slate-50">
      <LectureHeader 
        courseId={displayCourseId}
        courseTitle={courseTitle}
        moduleTitle={moduleTitle}
        lectureTitle={lectureTitle}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <LectureViewer 
              lecture={lecture}
              videoProgress={videoProgress}
              prevLectureId={prevLectureId}
              nextLectureId={nextLectureId}
              onProgressUpdate={handleVideoProgress}
            />

            <LectureContent description={lecture.description} />
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
                  <LectureNotes notes={lectureNotes} isLoading={isLoading} />
                </TabsContent>

                <TabsContent value="discussion" className="mt-4">
                  <LectureDiscussion lectureId={lectureId} />
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

export default LecturePage;
