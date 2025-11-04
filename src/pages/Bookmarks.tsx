
import React, { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookmarkIcon, Clock, Play, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface Bookmark {
  id: string;
  courseId: string;
  lessonId: string;
  timestamp: number;
  courseName: string;
  lessonName: string;
  addedAt: Date;
  thumbnailUrl: string;
}

interface CourseProgress {
  courseId: string;
  courseName: string;
  progress: number;
  lastAccessed: Date;
  thumbnailUrl: string;
}

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [inProgress, setInProgress] = useState<CourseProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching bookmarks from localStorage or API
    const fetchBookmarks = async () => {
      setIsLoading(true);
      
      // In a real app, you would fetch this data from an API or localStorage
      setTimeout(async () => {
        // Mock data
        const mockBookmarks: Bookmark[] = [
          {
            id: "bm1",
            courseId: "course-123",
            lessonId: "les-456",
            timestamp: 325, // 5:25
            courseName: "Cardiovascular System",
            lessonName: "Scientific Fundamentals",
            addedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            thumbnailUrl: "/placeholder.svg"
          },
          {
            id: "bm2",
            courseId: "course-789",
            lessonId: "les-012",
            timestamp: 732, // 12:12
            courseName: "Life Sciences",
            lessonName: "Brain Structure and Function",
            addedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            thumbnailUrl: "/placeholder.svg"
          }
        ];
        
        const mockProgress: CourseProgress[] = [
          {
            courseId: "course-123",
            courseName: "Cardiovascular System",
            progress: 45,
            lastAccessed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            thumbnailUrl: "/placeholder.svg"
          },
          {
            courseId: "course-789",
            courseName: "Life Sciences",
            progress: 30,
            lastAccessed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            thumbnailUrl: "/placeholder.svg"
          },
          {
            courseId: "course-456",
            courseName: "Respiratory System",
            progress: 70,
            lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            thumbnailUrl: "/placeholder.svg"
          }
        ];
        
        // Fetch accurate progress for each course using our new API endpoint
        const updatedProgress = await Promise.all(mockProgress.map(async (course) => {
          try {
            const { apiClient } = await import('@/lib/api/client');
            const progressResponse = await apiClient.getCourseProgress(course.courseId);
            
            if (progressResponse.data && progressResponse.data.progress !== undefined) {
              return {
                ...course,
                progress: progressResponse.data.progress,
                completed_lessons: progressResponse.data.completed_lessons,
                total_lessons: progressResponse.data.total_lessons
              };
            }
            return course;
          } catch (err) {
            console.error('Error fetching course progress:', err);
            return course;
          }
        }));
        
        setBookmarks(mockBookmarks);
        setInProgress(updatedProgress);
        setIsLoading(false);
      }, 800);
    };
    
    fetchBookmarks();
  }, []);

  const formatTimestamp = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };
  
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-slate-50 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2 font-heading">Your Learning</h1>
            <p className="text-gray-600 mb-8 font-sans">Track your progress and continue where you left off.</p>
          
            <Tabs defaultValue="progress" className="w-full">
              <TabsList className="mb-8">
                <TabsTrigger value="progress" className="text-base">In Progress</TabsTrigger>
                <TabsTrigger value="bookmarks" className="text-base">Bookmarks</TabsTrigger>
              </TabsList>
              
              <TabsContent value="progress">
                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 h-80 animate-pulse">
                        <div className="h-40 bg-slate-200 rounded-t-xl"></div>
                        <div className="p-4">
                          <div className="h-5 bg-slate-200 rounded mb-2 w-3/4"></div>
                          <div className="h-4 bg-slate-200 rounded mb-4 w-1/2"></div>
                          <div className="h-2 bg-slate-200 rounded mb-6 w-full"></div>
                          <div className="flex justify-between items-center">
                            <div className="h-8 bg-slate-200 rounded w-1/3"></div>
                            <div className="h-5 bg-slate-200 rounded-full w-1/4"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inProgress.length > 0 ? (
                      inProgress.map((course) => (
                        <Card key={course.courseId} className="overflow-hidden hover:shadow-md transition-shadow">
                          <div 
                            className="h-40 bg-cover bg-center" 
                            style={{ backgroundImage: `url(${course.thumbnailUrl})` }}
                          ></div>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-heading">{course.courseName}</CardTitle>
                          </CardHeader>
                          <CardContent className="pb-4">
                            <div className="mb-2">
                              <div className="flex justify-between text-sm text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{course.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-medblue-600 h-2 rounded-full" 
                                  style={{ width: `${course.progress}%` }}
                                ></div>
                              </div>
                              {course.completed_lessons !== undefined && course.total_lessons !== undefined && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {course.completed_lessons} of {course.total_lessons} lessons completed
                                </div>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              <Clock className="w-4 h-4 inline mr-1" />
                              Last accessed {formatDate(course.lastAccessed)}
                            </div>
                          </CardContent>
                          <CardFooter className="pt-0">
                            <Button asChild className="w-full">
                              <Link to={`/courses/${course.courseId}`}>
                                <Play className="mr-2 h-4 w-4" /> Continue Learning
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      ))
                    ) : (
                      <div className="col-span-3 text-center py-16">
                        <PlayCircle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2 font-heading">No courses in progress</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Start learning today by enrolling in one of our courses
                        </p>
                        <Button asChild>
                          <Link to="/">Browse Courses</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="bookmarks">
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 animate-pulse">
                        <div className="flex gap-4">
                          <div className="h-20 w-36 bg-slate-200 rounded"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-slate-200 rounded mb-2 w-3/4"></div>
                            <div className="h-3 bg-slate-200 rounded mb-2 w-1/2"></div>
                            <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                          </div>
                          <div className="h-8 w-24 bg-slate-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookmarks.length > 0 ? (
                      bookmarks.map((bookmark) => (
                        <Card key={bookmark.id} className="overflow-hidden">
                          <div className="flex flex-col sm:flex-row p-4 gap-4">
                            <div 
                              className="w-full sm:w-36 h-20 bg-cover bg-center rounded" 
                              style={{ backgroundImage: `url(${bookmark.thumbnailUrl})` }}
                            >
                              <div className="w-full h-full bg-black/20 flex items-center justify-center">
                                <Badge className="bg-black/60 text-white">
                                  {formatTimestamp(bookmark.timestamp)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-medium text-lg mb-1 font-heading">{bookmark.lessonName}</h3>
                              <p className="text-sm text-gray-500">{bookmark.courseName}</p>
                              <div className="text-xs text-gray-400 mt-1">
                                <BookmarkIcon className="w-3 h-3 inline mr-1" />
                                Bookmarked {formatDate(bookmark.addedAt)}
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Button asChild size="sm">
                                <Link to={`/courses/${bookmark.courseId}/lesson/${bookmark.lessonId}?t=${bookmark.timestamp}`}>
                                  <Play className="mr-1 h-3 w-3" /> Watch
                                </Link>
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    ) : (
                      <div className="text-center py-16">
                        <BookmarkIcon className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                        <h3 className="text-xl font-bold text-gray-700 mb-2 font-heading">No bookmarks yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md mx-auto">
                          Bookmark important moments in lessons to quickly reference them later
                        </p>
                        <Button asChild>
                          <Link to="/">Browse Courses</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Bookmarks;
