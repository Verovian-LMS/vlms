
import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProgressDashboard from '@/components/dashboard/ProgressDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/FastApiAuthContext';
import { apiClient } from '@/lib/api/client';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();

  const [studentName, setStudentName] = useState<string>(profile?.name || 'Student');
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [courseProgress, setCourseProgress] = useState<Array<{ courseId: string; courseName: string; progress: number; lastAccessed: string }>>([]);
  const [learningData, setLearningData] = useState<Array<{ date: string; timeSpent: number; lessonsCompleted: number }>>([]);
  const [quizScores, setQuizScores] = useState<Array<{ quizName: string; score: number; maxScore: number }>>([]);

  useEffect(() => {
    setStudentName(profile?.name || 'Student');
  }, [profile?.name]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) return;

      try {
        // Load enrolled courses
        const myCoursesResp = await apiClient.get<any[]>(`/api/v1/courses/my-courses`);
        const courses = myCoursesResp.data || [];

        // For each course, fetch progress
        const courseProg = await Promise.all(
          courses.map(async (course: any) => {
            try {
              const pResp = await apiClient.getCourseProgress(course.id);
              const p = pResp.data?.progress ?? 0;
              return {
                courseId: course.id,
                courseName: course.title || 'Untitled Course',
                progress: p,
                lastAccessed: course.updated_at || course.created_at || new Date().toISOString(),
              };
            } catch (e) {
              return {
                courseId: course.id,
                courseName: course.title || 'Untitled Course',
                progress: 0,
                lastAccessed: course.updated_at || course.created_at || new Date().toISOString(),
              };
            }
          })
        );
        setCourseProgress(courseProg);

        // Compute overall progress as average across courses
        if (courseProg.length > 0) {
          const avg = Math.round(courseProg.reduce((sum, c) => sum + (c.progress || 0), 0) / courseProg.length);
          setOverallProgress(avg);
        } else {
          setOverallProgress(0);
        }

        // Build simple learning activity from recent activity (lessons completed/viewed per day)
        try {
          const actResp = await apiClient.getRecentActivity();
          const activities = actResp.data || [];
          const byDay: Record<string, number> = {};
          activities.forEach((a: any) => {
            const d = new Date(a.created_at);
            const key = d.toLocaleDateString(undefined, { weekday: 'short' });
            byDay[key] = (byDay[key] || 0) + 1;
          });
          const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const todayIndex = new Date().getDay();
          const last7 = Array.from({ length: 7 }).map((_, i) => weekdays[(todayIndex - (6 - i) + 7) % 7]);
          const learning = last7.map((day) => ({
            date: day,
            timeSpent: 0,
            lessonsCompleted: byDay[day] || 0,
          }));
          setLearningData(learning);
        } catch (e) {
          setLearningData([]);
        }

        // Quiz scores: no endpoint yet, leave empty to avoid mock data
        setQuizScores([]);
      } catch (err) {
        // fall back to empty real values
        setCourseProgress([]);
        setOverallProgress(0);
        setLearningData([]);
        setQuizScores([]);
      }
    };
    loadDashboard();
  }, [user]);
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs defaultValue="overview">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold font-nunito-sans">Student Dashboard</h1>
                <TabsList>
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="courses">My Courses</TabsTrigger>
                  <TabsTrigger value="achievements">Achievements</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="overview">
                <ProgressDashboard 
                  studentName={studentName}
                  overallProgress={overallProgress}
                  courseProgress={courseProgress}
                  learningData={learningData}
                  quizScores={quizScores}
                />
              </TabsContent>
              
              <TabsContent value="courses">
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold font-nunito-sans mb-2">My Courses</h2>
                  <p className="text-muted-foreground font-exo2">
                    This tab will display a list of your enrolled courses and related details.
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="achievements">
                <div className="p-8 text-center">
                  <h2 className="text-2xl font-bold font-nunito-sans mb-2">Achievements</h2>
                  <p className="text-muted-foreground font-exo2">
                    This tab will display your badges, certificates, and learning milestones.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default StudentDashboard;
