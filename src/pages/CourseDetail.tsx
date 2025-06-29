
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
import Navigation from "@/components/Navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useCourses } from "@/hooks/use-courses";

const CourseDetail = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [firstLectureId, setFirstLectureId] = useState<string | null>(null);
  const [courseRating, setCourseRating] = useState<{rating: number, count: number}>({rating: 0, count: 0});
  const { user, isAuthenticated } = useAuth();
  const { enrollInCourse: enrollMutation, fetchCourseProgress } = useCourses();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId) return;

      try {
        // Fetch course details
        const { data, error } = await supabase
          .from('courses')
          .select(`
            *,
            profiles:author_id(id, name, email, avatar, role)
          `)
          .eq('id', courseId)
          .single();

        if (error) {
          throw error;
        }

        setCourse(data);
        
        // Fetch course rating data (if you have a ratings table)
        try {
          // Placeholder for actual rating data fetch - replace with your actual ratings table
          const { data: ratingsData, error: ratingsError } = await supabase
            .from('ratings')
            .select('rating')
            .eq('course_id', courseId);
            
          if (!ratingsError && ratingsData && ratingsData.length > 0) {
            // Calculate average rating
            const totalRating = ratingsData.reduce((sum, item) => sum + item.rating, 0);
            const avgRating = totalRating / ratingsData.length;
            setCourseRating({
              rating: parseFloat(avgRating.toFixed(1)),
              count: ratingsData.length
            });
          }
        } catch (ratingError) {
          console.error('Error fetching ratings:', ratingError);
        }

        // Fetch the first lecture ID from the course's modules
        try {
          // First get modules for this course
          const { data: modules, error: modulesError } = await supabase
            .from('modules')
            .select('id')
            .eq('course_id', courseId)
            .order('sequence_order', { ascending: true })
            .limit(1);
            
          if (modulesError) {
            console.error('Error fetching first module:', modulesError);
            return;
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
              console.error('Error fetching first lecture:', lecturesError);
            } else if (lectures && lectures.length > 0) {
              setFirstLectureId(lectures[0].id);
              console.log("First lecture ID:", lectures[0].id);
            }
          }
        } catch (fetchError) {
          console.error('Error fetching first lecture:', fetchError);
        }

        // Check if user is enrolled
        if (user) {
          const { data: enrollmentData, error: enrollmentError } = await supabase
            .from('enrollments')
            .select('id, progress')
            .eq('user_id', user.id)
            .eq('course_id', courseId)
            .maybeSingle();

          if (!enrollmentError && enrollmentData) {
            setIsEnrolled(true);
            setProgress(enrollmentData.progress || 0);
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
    if (!isEnrolled) {
      return (
        <Button size="lg" className="gap-2" onClick={handleEnroll}>
          <BookOpen className="h-5 w-5" />
          Enroll in Course
        </Button>
      );
    }
    
    // If enrolled but no lecture found, show disabled button
    if (!firstLectureId) {
      return (
        <Button size="lg" className="gap-2" disabled>
          <Play className="h-5 w-5" />
          No Lectures Available
        </Button>
      );
    }
    
    // If enrolled and lecture found, show start/continue button
    return (
      <Link to={`/courses/${courseId}/lecture/${firstLectureId}`}>
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
                    <span>{course.lectures || 0} lectures</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{course.modules || 0} modules</span>
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
                    <span>Last updated {new Date(course.updated_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center mb-8">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={course.profiles?.avatar} alt={course.profiles?.name} />
                    <AvatarFallback>{course.profiles?.name?.substring(0, 2) || "IN"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{course.profiles?.name || "Instructor"}</p>
                    <p className="text-sm text-white/70">{course.profiles?.role || "Medical Educator"}</p>
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
                    <div className="rounded-full bg-white/20 p-4 backdrop-blur-sm cursor-pointer hover:bg-white/30 transition-colors">
                      <Play className="h-10 w-10 text-white" fill="white" />
                    </div>
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
                    <div className="space-y-6">
                      {course?.modules ? (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-slate-100 px-4 py-3 flex justify-between items-center">
                            <h3 className="font-medium">Course Modules</h3>
                            <span className="text-sm text-gray-500">{course.modules} modules</span>
                          </div>
                          <div className="divide-y">
                            <div className="p-4 flex justify-between items-center hover:bg-slate-50">
                              <div className="flex items-center">
                                <Play className="h-5 w-5 text-medblue-600 mr-3" />
                                <div>
                                  <p className="font-medium">Course Content</p>
                                  <p className="text-sm text-gray-500">{course.lectures || 0} lectures</p>
                                </div>
                              </div>
                              {isEnrolled ? (
                                firstLectureId ? (
                                  <Link to={`/courses/${courseId}/lecture/${firstLectureId}`}>
                                    <Button variant="outline" size="sm">View</Button>
                                  </Link>
                                ) : (
                                  <Button variant="outline" size="sm" disabled>Not Available</Button>
                                )
                              ) : (
                                <CheckCircle className="h-5 w-5 text-gray-300" />
                              )}
                            </div>
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
                        <span>{course?.lectures || 0} on-demand video lectures</span>
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
                      <p className="text-gray-600">{course?.profiles?.role || "Medical Educator"}</p>
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
