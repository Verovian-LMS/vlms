
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Play,
  FileText,
  Users,
  Award,
  BookOpen,
  CheckCircle,
  Calendar,
  Clock,
  Star,
  Download,
  Share2
} from "lucide-react";
import { Video, Presentation, Music, FileDown, Sparkles, File as FileIcon, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navigation from "@/components/Navigation";
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/context/FastApiAuthContext";
import { useCourses } from "@/hooks/use-courses";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [firstLessonId, setFirstLessonId] = useState<string | null>(null);
  const [courseRating, setCourseRating] = useState<{rating: number, count: number}>({rating: 0, count: 0});
  const [modules, setModules] = useState<any[]>([]);
  const [lessonsByModule, setLessonsByModule] = useState<Record<string, any[]>>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [lessonProgressById, setLessonProgressById] = useState<Record<string, { progress: number; is_completed: boolean }>>({});
  const { user, isAuthenticated } = useAuth();
  const { enrollInCourse: enrollMutation, fetchCourseProgress } = useCourses();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        // Fetch course details via FastAPI
        const courseResp = await apiClient.getCourse(courseId);
        if (courseResp.error) throw new Error(courseResp.error);
        setCourse(courseResp.data);

        // Ratings not yet backed by FastAPI; leave defaults

        // Determine first lesson by fetching modules and lessons
        const modulesResp = await apiClient.getCourseModules(courseId);
        const fetchedModules = modulesResp.data || [];
        setModules(fetchedModules);
        
        // Fetch lessons for each module in parallel
        const lessonsMap: Record<string, any[]> = {};
        if (fetchedModules.length > 0) {
          const lessonsPromises = fetchedModules.map((m: any) => apiClient.getModuleLessons(m.id));
          const results = await Promise.all(lessonsPromises);
          results.forEach((resp, idx) => {
            const moduleId = fetchedModules[idx].id;
            const lessons = resp.data || [];
            lessonsMap[moduleId] = lessons;
          });
          setLessonsByModule(lessonsMap);
          // Determine first lesson id for start button
          const firstModuleId = fetchedModules[0]?.id;
          const firstModuleLessons = lessonsMap[firstModuleId] || [];
          if (firstModuleLessons.length > 0) {
            setFirstLessonId(firstModuleLessons[0].id);
          }
          // Default expand first module
          if (firstModuleId) {
            setExpandedModules(prev => ({ ...prev, [firstModuleId]: true }));
          }
        }

        // Fetch per-lesson progress if user is available
        try {
          const allLessons: any[] = Object.values(lessonsMap).flat();
          if (user && allLessons.length > 0) {
            const progressResults = await Promise.all(
              allLessons.map(async (lesson: any) => {
                try {
                  const resp = await apiClient.getLessonProgress(lesson.id);
                  const p = resp?.data?.progress ?? 0;
                  const done = resp?.data?.is_completed ?? false;
                  return { id: lesson.id, progress: p, is_completed: done };
                } catch (e) {
                  return { id: lesson.id, progress: 0, is_completed: false };
                }
              })
            );
            const map: Record<string, { progress: number; is_completed: boolean }> = {};
            progressResults.forEach((r) => {
              map[r.id] = { progress: r.progress, is_completed: r.is_completed };
            });
            setLessonProgressById(map);
          }
        } catch (e) {
          console.warn('Unable to load lesson progress:', e);
        }

        // Check enrollment and progress
        if (user) {
          try {
            const myCoursesResp = await apiClient.get<any[]>(`/api/v1/courses/my-courses`);
            const myCourses = myCoursesResp.data || [];
            const enrolled = myCourses.some((c: any) => c.id === courseId);
            setIsEnrolled(enrolled);
            if (enrolled) {
              const progressResp = await apiClient.getCourseProgress(courseId);
              setProgress(progressResp.data?.progress ?? 0);
            }
          } catch (err) {
            console.warn('Error checking enrollment/progress:', err);
          }
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, user]);

  // Author can preview their own course without enrollment
  const isAuthor = !!user && !!course && (
    (course.author_id && course.author_id === user.id) ||
    (course.author && course.author.id === user.id) ||
    (course.profiles && (course.profiles.user_id === user.id || course.profiles.id === user.id))
  );

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!courseId) return;

    try {
      // Use mutateAsync instead of calling the mutation object directly
      const success = await enrollMutation.mutateAsync(courseId);
      if (success) {
        setIsEnrolled(true);
        setProgress(0);
      }
    } catch (error) {
      console.error("Error enrolling in course:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto py-32 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-medblue-600"></div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navigation />
        <div className="container mx-auto py-16 px-4">
          <div className="text-center">
            <BookOpen className="mx-auto h-16 w-16 text-gray-400" />
            <h2 className="mt-4 text-2xl font-bold">Course Not Found</h2>
            <p className="mt-2 text-gray-600">The course you're looking for doesn't exist or has been removed.</p>
            <Link to="/courses" className="mt-6 inline-block">
              <Button>Browse Other Courses</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Helper function to render the start/continue button with the correct link
  const renderCourseButton = () => {
    // If author, allow preview without enrollment
    if (isAuthor) {
      if (!firstLessonId) {
        return (
          <Button size="lg" className="gap-2" disabled>
            <Play className="h-5 w-5" />
            No Lessons Available
          </Button>
        );
      }
      return (
        <Link to={`/courses/${courseId}/lesson/${firstLessonId}`}>
          <Button size="lg" className="gap-2">
            <Play className="h-5 w-5" />
            Preview Course
          </Button>
        </Link>
      );
    }

    if (!isEnrolled) {
      return (
        <Button size="lg" className="gap-2" onClick={handleEnroll}>
          <BookOpen className="h-5 w-5" />
          Enroll in Course
        </Button>
      );
    }
    
    // If enrolled but no lesson found, show disabled button
    if (!firstLessonId) {
      return (
        <Button size="lg" className="gap-2" disabled>
          <Play className="h-5 w-5" />
          No Lessons Available
        </Button>
      );
    }
    
    // If enrolled and lesson found, show start/continue button
    return (
      <Link to={`/courses/${courseId}/lesson/${firstLessonId}`}>
        <Button size="lg" className="gap-2">
          {progress > 0 ? (
            <>
              <Play className="h-5 w-5" />
              Continue Learning
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              Start Learning
            </>
          )}
        </Button>
      </Link>
    );
  };

  // Helpers to derive content type and icons for lessons
  const getLessonContentType = (lesson: any): string => {
    const ct = (lesson?.content_type || '').toLowerCase();
    const ft = (lesson?.file_type || '').toLowerCase();

    // 1) Prefer explicit URLs first (most reliable signal)
    if (lesson?.pdf_url) return 'pdf';
    if (lesson?.slides_url) return 'slides';
    if (lesson?.audio_url) return 'audio';
    if (lesson?.document_url) return 'document';
    if (lesson?.interactive_url) return 'interactive';
    if (lesson?.download_url || lesson?.downloadable_url) return 'downloadable';
    if (lesson?.video_url) return 'video';

    // 2) Then infer from file_type if present
    if (ft.includes('pdf')) return 'pdf';
    if (ft.includes('ppt') || ft.includes('pptx') || ft.includes('presentation') || ft.includes('powerpoint')) return 'slides';
    if (ft.includes('audio') || ft.includes('mp3') || ft.includes('wav') || ft.includes('ogg') || ft.includes('m4a')) return 'audio';
    if (ft.includes('doc') || ft.includes('docx') || ft.includes('txt') || ft.includes('msword')) return 'document';

    // 3) Use content_type as a fallback (least reliable in this app)
    if (ct.includes('pdf')) return 'pdf';
    if (ct.includes('slide') || ct.includes('ppt') || ct.includes('presentation') || ct.includes('powerpoint')) return 'slides';
    if (ct.includes('audio')) return 'audio';
    if (ct.includes('doc') || ct.includes('docx') || ct.includes('word') || ct.includes('text')) return 'document';
    if (ct.includes('interact')) return 'interactive';
    if (ct.includes('download')) return 'downloadable';
    if (ct.includes('video')) return 'video';

    // 4) If text content exists without URLs, treat as document
    if (lesson?.content) return 'document';
    // Default to video when we truly cannot infer
    return 'video';
  };

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-medblue-600" />;
      case 'pdf': return <FileText className="h-4 w-4 text-medblue-600" />;
      case 'slides': return <Presentation className="h-4 w-4 text-medblue-600" />;
      case 'audio': return <Music className="h-4 w-4 text-medblue-600" />;
      case 'document': return <FileIcon className="h-4 w-4 text-medblue-600" />;
      case 'interactive': return <Sparkles className="h-4 w-4 text-medblue-600" />;
      case 'downloadable': return <FileDown className="h-4 w-4 text-medblue-600" />;
      default: return <Video className="h-4 w-4 text-medblue-600" />;
    }
  };

  const toggleModuleExpanded = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-medblue-900 to-medblue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{course.title}</h1>
                <p className="text-lg text-white/90 mb-6">{course.description}</p>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-8 text-white/80">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                        <span>{(course?.lesson_count ?? 0)} lessons</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{(course?.module_count ?? 0)} modules</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-400" />
                    <span>
                      {courseRating.count > 0 
                        ? `${courseRating.rating} (${courseRating.count} reviews)` 
                        : "No reviews yet"}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>Last updated {(() => {
                      const dateStr = course?.updated_at || course?.created_at;
                      if (!dateStr) return '—';
                      const d = new Date(dateStr);
                      return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
                    })()}</span>
                  </div>
                </div>

                <div className="flex items-center mb-8">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={course.profiles?.avatar} alt={course.profiles?.name} />
                    <AvatarFallback>{course.profiles?.name?.substring(0, 2) || "IN"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.profiles?.name || "Instructor"}</p>
                    <p className="text-sm text-white/70">{course.profiles?.role || "Educator"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  {isEnrolled ? (
                    <>
                      {renderCourseButton()}
                      <div className="flex items-center text-white/80 ml-2">
                        <div className="w-32 bg-white/20 rounded-full h-2.5">
                          <div
                            className="bg-green-500 h-2.5 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <span className="ml-2">{progress}% complete</span>
                      </div>
                    </>
                  ) : (
                    renderCourseButton()
                  )}

                  <Button variant="outline" size="icon" className="bg-white/10 hover:bg-white/20 border-white/20">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              <div className="w-full md:w-1/3 flex justify-center md:justify-end">
                <div className="relative max-w-md">
                  <img
                    src={course.image_url || 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&w=800&q=80'}
                    alt={course.title}
                    className="rounded-lg shadow-xl object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    { (isAuthor || isEnrolled) && firstLessonId ? (
                      <Link 
                        to={`/courses/${courseId}/lesson/${firstLessonId}`}
                        className="rounded-full bg-white/20 p-4 backdrop-blur-sm hover:bg-white/30 transition-colors"
                        aria-label="Start course"
                      >
                        <Play className="h-10 w-10 text-white" fill="white" />
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={handleEnroll}
                        className="rounded-full bg-white/20 p-4 backdrop-blur-sm hover:bg-white/30 transition-colors cursor-pointer"
                        aria-label="Enroll to start"
                      >
                        <Play className="h-10 w-10 text-white" fill="white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Course Content */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="w-full max-w-3xl mb-8">
            <TabsTrigger value="content" className="flex-1">Course Content</TabsTrigger>
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
            <TabsTrigger value="instructor" className="flex-1">Instructor</TabsTrigger>
          </TabsList>

          <TabsContent value="content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {modules && modules.length > 0 ? (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-slate-100 px-4 py-3 flex justify-between items-center">
                            <h3 className="font-medium">Course Modules</h3>
                            <span className="text-sm text-gray-500">{modules.length} modules</span>
                          </div>
                          <div className="divide-y">
                            {modules.map((m) => {
                              const lessonList = lessonsByModule[m.id] || [];
                              const isExpanded = expandedModules[m.id] ?? false;
                              const completedCount = lessonList.filter(l => lessonProgressById[l.id]?.is_completed).length;
                              const avgProgress = lessonList.length > 0
                                ? Math.round(
                                    lessonList.reduce((acc, l) => acc + (lessonProgressById[l.id]?.progress ?? 0), 0) / lessonList.length
                                  )
                                : 0;
                              return (
                                <div key={m.id} className="">
                                  <div
                                    className="w-full p-4 flex justify-between items-center hover:bg-slate-50 text-left cursor-pointer"
                                    onClick={() => toggleModuleExpanded(m.id)}
                                  >
                                    <div className="flex items-center">
                                      <Play className="h-5 w-5 text-medblue-600 mr-3" />
                                      <div>
                                        <p className="font-medium">{m.title || 'Module'}</p>
                                        <div className="flex items-center gap-3">
                                          <p className="text-sm text-gray-500">{lessonList.length} lessons</p>
                                          {lessonList.length > 0 && (completedCount > 0 || avgProgress > 0) && (
                                            <div className="flex items-center gap-2">
                                              <Progress value={avgProgress} className="h-2 w-24" />
                                              <span className="text-xs text-gray-500">{completedCount} of {lessonList.length} completed</span>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  <div className="flex items-center gap-2">
                                      {(isEnrolled || isAuthor) ? (
                                        lessonList.length > 0 ? (
                                          <Link to={`/courses/${courseId}/lesson/${lessonList[0].id}`} onClick={(e) => e.stopPropagation()}>
                                            <Button variant="outline" size="sm">Start</Button>
                                          </Link>
                                        ) : (
                                          <Button variant="outline" size="sm" disabled>Empty</Button>
                                        )
                                      ) : (
                                        <Lock className="h-5 w-5 text-gray-300" />
                                      )}
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="px-4 pb-4">
                                      {lessonList.length > 0 ? (
                                        <div className="space-y-4">
                                          {(() => {
                                            const groups: Record<string, any[]> = {};
                                            lessonList.forEach((lesson: any) => {
                                              const t = getLessonContentType(lesson);
                                              if (!groups[t]) groups[t] = [];
                                              groups[t].push(lesson);
                                            });
                                            const order = ['video','pdf','slides','audio','document','interactive','downloadable'];
                                            return order.filter(t => groups[t]?.length).map((t) => (
                                              <div key={`${m.id}-${t}`} className="space-y-2">
                                                <div className="flex items-center gap-2">
                                                  <Badge variant="secondary" className="capitalize">{t}</Badge>
                                                  <Badge variant="outline">{groups[t].length}</Badge>
                                                </div>
                                                <ul className="space-y-2">
                                                  {groups[t].map((lesson: any) => {
                                                    const type = t;
                                                    const lp = lessonProgressById[lesson.id];
                                                    const isCompleted = lp?.is_completed;
                                                    const pval = lp?.progress ?? 0;
                                                    const isPreview = lesson?.is_preview === true;
                                                    return (
                                                      <li key={lesson.id} className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50">
                                                        <div className="flex items-center gap-3">
                                                          {getLessonIcon(type)}
                                                          <div>
                                                          <div className="flex items-center gap-2">
                                                            <p className="font-medium">{lesson.title || 'Untitled Lesson'}</p>
                                                            <Badge variant="outline" className="capitalize">{type}</Badge>
                                                            <Badge variant="secondary" className="text-xs">
                                                              {Math.round(pval)}%
                                                            </Badge>
                                                            {isPreview && !isEnrolled && (
                                                              <Badge variant="secondary">Preview</Badge>
                                                            )}
                                                          </div>
                                                            {(isCompleted || pval > 0) && (
                                                              <div className="flex items-center gap-2 mt-1">
                                                                {isCompleted ? (
                                                                  <Badge className="bg-green-600">Completed</Badge>
                                                                ) : (
                                                                  <>
                                                                    <Progress value={pval} className="h-2 w-24" />
                                                                    <span className="text-xs text-gray-500">{Math.round(pval)}%</span>
                                                                  </>
                                                                )}
                                                              </div>
                                                            )}
                                                          </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                          {(isEnrolled || isAuthor) ? (
                                                            <Link to={`/courses/${courseId}/lesson/${lesson.id}`}>
                                                              <Button variant="outline" size="sm">View</Button>
                                                            </Link>
                                                          ) : isPreview ? (
                                                            <Link to={`/courses/${courseId}/lesson/${lesson.id}`}>
                                                              <Button variant="outline" size="sm">Preview</Button>
                                                            </Link>
                                                          ) : (
                                                            <Lock className="h-4 w-4 text-gray-300" />
                                                          )}
                                                        </div>
                                                      </li>
                                                    );
                                                  })}
                                                </ul>
                                              </div>
                                            ));
                                          })()}
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">No lessons in this module yet.</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                          })}
                          </div>
                        </div>
                      ) : (
                        <p className="text-gray-500">No modules available yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-1">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-4">
                      <li className="flex items-center">
                        <Play className="h-5 w-5 text-medblue-600 mr-3" />
                        <span>{(course?.lesson_count ?? 0)} lessons</span>
                      </li>
                      <li className="flex items-center">
                        <FileText className="h-5 w-5 text-medblue-600 mr-3" />
                        <span>Course materials and resources</span>
                      </li>
                      <li className="flex items-center">
                        <Award className="h-5 w-5 text-medblue-600 mr-3" />
                        <span>Certificate of completion</span>
                      </li>
                      <li className="flex items-center">
                        <Users className="h-5 w-5 text-medblue-600 mr-3" />
                        <span>Access to course community</span>
                      </li>
                      <li className="flex items-center">
                        <Download className="h-5 w-5 text-medblue-600 mr-3" />
                        <span>Downloadable resources</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>About This Course</CardTitle>
                  </CardHeader>
                  <CardContent className="prose max-w-none">
                    <p>{course?.long_description || course?.description || "No description available."}</p>

                    <h3>What You'll Learn</h3>
                    <ul>
                      <li>Comprehensive understanding of the course material</li>
                      <li>Practical skills and knowledge</li>
                      <li>Real-world applications</li>
                    </ul>

                    <h3>Course Requirements</h3>
                    <ul>
                      <li>Basic understanding of the subject matter</li>
                      <li>Willingness to learn and engage with the material</li>
                      <li>Access to a computer and internet connection</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/3">
                    <div className="text-center p-6 bg-slate-50 rounded-lg">
                      {courseRating.count > 0 ? (
                        <>
                          <div className="text-5xl font-bold text-medblue-600 mb-2">{courseRating.rating}</div>
                          <div className="flex justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star 
                                key={star} 
                                className={`h-5 w-5 ${
                                  star <= Math.floor(courseRating.rating) ? 
                                  'text-yellow-500 fill-yellow-500' : 
                                  star - courseRating.rating <= 0.5 ? 
                                  'text-yellow-500' : 
                                  'text-gray-300'
                                }`} 
                              />
                            ))}
                          </div>
                          <p className="text-gray-600">Based on {courseRating.count} reviews</p>
                        </>
                      ) : (
                        <>
                          <div className="text-5xl font-bold text-gray-400 mb-2">-</div>
                          <div className="flex justify-center mb-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className="h-5 w-5 text-gray-300" />
                            ))}
                          </div>
                          <p className="text-gray-600">No reviews yet</p>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="w-full md:w-2/3">
                    <div className="space-y-6">
                      <p className="text-gray-500">No reviews yet. Be the first to review this course!</p>
                    </div>

                    {isEnrolled && (
                      <div className="mt-8 pt-6 border-t">
                        <h3 className="font-medium mb-4">Leave a Review</h3>
                        <Button>Write a Review</Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="instructor">
            <Card>
              <CardHeader>
                <CardTitle>About the Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="w-full md:w-1/4">
                    <div className="flex flex-col items-center text-center">
                      <Avatar className="h-24 w-24 mb-4">
                        <AvatarImage src={course?.profiles?.avatar} alt={course?.profiles?.name} />
                        <AvatarFallback>{course?.profiles?.name?.substring(0, 2) || "IN"}</AvatarFallback>
                      </Avatar>
                      <h3 className="text-xl font-bold">{course?.profiles?.name || "Instructor"}</h3>
                      <p className="text-gray-600">{course?.profiles?.role || "Educator"}</p>
                    </div>
                  </div>

                  <div className="w-full md:w-3/4">
                    <div className="prose max-w-none">
                      <h3>Instructor Bio</h3>
                      <p>{course?.profiles?.bio || "No bio available yet."}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CourseDetail;
