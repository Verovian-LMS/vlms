
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// Use FastAPI client for data fetching
import { apiClient } from "@/lib/api/client";
import { useAuth } from "@/context/FastApiAuthContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookOpen, FileText, Plus, Clock, Activity, CheckCircle } from "lucide-react";

const Dashboard = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [weeklyLessonsCompleted, setWeeklyLessonsCompleted] = useState(0);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // Fetch "my courses" from FastAPI
        const response = await apiClient.get<any[]>(`/api/v1/courses/my-courses`);

        const courses = response.data || [];

        // Map courses into the enrollment-like structure expected by the UI
        const updatedEnrollments = await Promise.all(courses.slice(0, 5).map(async (course: any) => {
          try {
            const progressResponse = await apiClient.getCourseProgress(course.id);
            return {
              id: course.id,
              user_id: user.id,
              course_id: course.id,
              progress: progressResponse.data?.progress ?? 0,
              completed_lessons: progressResponse.data?.completed_lessons ?? 0,
              total_lessons: progressResponse.data?.total_lessons ?? 0,
              created_at: course.created_at,
              updated_at: course.updated_at,
              courses: {
                id: course.id,
                title: course.title,
                image_url: course.image_url,
                profiles: course.author ? { name: course.author.name, avatar: course.author.avatar } : undefined
              }
            };
          } catch (err) {
            console.error('Error fetching course progress:', err);
            return {
              id: course.id,
              user_id: user.id,
              course_id: course.id,
              progress: 0,
              completed_lessons: 0,
              total_lessons: 0,
              created_at: course.created_at,
              updated_at: course.updated_at,
              courses: {
                id: course.id,
                title: course.title,
                image_url: course.image_url,
                profiles: course.author ? { name: course.author.name, avatar: course.author.avatar } : undefined
              }
            };
          }
        }));

        setEnrollments(updatedEnrollments);
        setFavorites([]);

        // Fetch recent activity and compute lessons completed in last 7 days
        try {
          const recent = await apiClient.getRecentActivity();
          const items = recent.data || [];
          const now = Date.now();
          const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
          const count = items.filter((a: any) => {
            const t = new Date(a.created_at).getTime();
            const isRecent = now - t <= sevenDaysMs;
            const isCompleted = typeof a.type === 'string' && a.type.toLowerCase().includes('completed');
            return isRecent && isCompleted;
          }).length;
          setWeeklyLessonsCompleted(count);
        } catch (e) {
          setWeeklyLessonsCompleted(0);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <main className="flex-grow bg-slate-50 py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto"
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome back, {profile?.name || 'Student'}!</h1>
            <p className="text-gray-600">Track your progress and continue learning</p>
          </div>
          
          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4">
                    <BookOpen className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Continue Learning</h3>
                    <p className="text-sm text-gray-500">Pick up where you left off</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to={enrollments.length > 0 ? `/courses/${enrollments[0]?.courses?.id}` : '/courses'}>
                    <Button className="w-full">
                      {enrollments.length > 0 ? 'Resume Course' : 'Find a Course'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 rounded-lg mr-4">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Progress Overview</h3>
                    <p className="text-sm text-gray-500">Check your learning stats</p>
                  </div>
                </div>
                <div className="mt-4">
                  <Link to="/profile">
                    <Button variant="outline" className="w-full">
                      View Progress
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">Upload New Course</h3>
                    <p className="text-sm text-gray-500">Share your knowledge</p>
                  </div>
                </div>
                <div className="mt-4">
                  {profile?.role === 'creator' ? (
                    <Link to="/course-upload">
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        Create Course
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Creator Access Only
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Continue Learning */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Continue Learning</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrollments.length > 0 ? (
                enrollments.slice(0, 3).map((enrollment: any) => (
                  <Card key={enrollment.id} className="overflow-hidden flex flex-col">
                    <img 
                      src={enrollment.courses.image_url || `https://picsum.photos/600/300?random=${enrollment.id}`}
                      alt={enrollment.courses.title}
                      className="h-40 w-full object-cover"
                    />
                    <CardContent className="flex-grow p-4">
                      <h3 className="font-bold mb-1">{enrollment.courses.title}</h3>
                      <div className="flex items-center mb-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                          <img 
                            src={enrollment.courses.profiles?.avatar || `https://ui-avatars.com/api/?name=${enrollment.courses.profiles?.name}`} 
                            alt={enrollment.courses.profiles?.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-sm">{enrollment.courses.profiles?.name}</span>
                      </div>
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{enrollment.progress}%</span>
                        </div>
                        <Progress value={enrollment.progress} className="h-2" />
                        {enrollment.completed_lessons !== undefined && enrollment.total_lessons !== undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            {enrollment.completed_lessons} of {enrollment.total_lessons} lessons completed
                          </div>
                        )}
                      </div>
                      <div className="flex mt-auto">
                        <Link to={`/courses/${enrollment.courses.id}`} className="w-full">
                          <Button variant="outline" className="w-full">Continue</Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="col-span-3 bg-white p-8 rounded-lg text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No courses in progress</h3>
                  <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet. Browse our catalog to get started.</p>
                  <Link to="/courses">
                    <Button>
                      Browse Courses
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
          
          {/* Two Column Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Achievements */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Your Achievements</CardTitle>
                <CardDescription>Track your learning milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                    <div className="mr-4">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">First Course Completed</h4>
                      <p className="text-sm text-gray-500">Finish your first course</p>
                    </div>
                    <div className="ml-auto">
                      {enrollments.some((e: any) => e.progress === 100) ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Unlocked</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Locked</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-slate-50 rounded-lg">
                    <div className="mr-4">
                      <Clock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium">Lessons Completed This Week</h4>
                      <p className="text-sm text-gray-500">Based on your recent activity</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`px-2 py-1 text-xs rounded-full ${weeklyLessonsCompleted > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {weeklyLessonsCompleted}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Recent Activity */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning progress</CardDescription>
              </CardHeader>
              <CardContent>
                {enrollments.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course</TableHead>
                        <TableHead>Progress</TableHead>
                        <TableHead>Last Activity</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {enrollments.map((enrollment: any) => (
                        <TableRow key={enrollment.id}>
                          <TableCell className="font-medium">{enrollment.courses.title}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Progress value={enrollment.progress} className="h-2 w-20 mr-2" />
                              <span>{enrollment.progress}%</span>
                            </div>
                          </TableCell>
                          <TableCell>{new Date(enrollment.updated_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No recent activity to display</p>
                    <p className="text-sm text-gray-400 mt-1">Start learning to track your progress</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
