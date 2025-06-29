
import React from 'react';
import { motion } from 'framer-motion';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import ProgressDashboard from '@/components/dashboard/ProgressDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/context/AuthContext';

const StudentDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  
  // Sample data - in a real application, this would come from your backend
  const sampleData = {
    studentName: profile?.name || 'Student',
    overallProgress: 65,
    courseProgress: [
      {
        courseId: 'course1',
        courseName: 'Introduction to Medical Anatomy',
        progress: 80,
        lastAccessed: '2023-05-10T14:32:00Z',
      },
      {
        courseId: 'course2',
        courseName: 'Fundamentals of Physiology',
        progress: 45,
        lastAccessed: '2023-05-08T09:15:00Z',
      },
      {
        courseId: 'course3',
        courseName: 'Clinical Skills Basics',
        progress: 30,
        lastAccessed: '2023-05-12T16:45:00Z',
      }
    ],
    learningData: [
      { date: 'Mon', timeSpent: 1.5, lecturesCompleted: 3 },
      { date: 'Tue', timeSpent: 2.2, lecturesCompleted: 5 },
      { date: 'Wed', timeSpent: 1.0, lecturesCompleted: 2 },
      { date: 'Thu', timeSpent: 3.5, lecturesCompleted: 7 },
      { date: 'Fri', timeSpent: 2.8, lecturesCompleted: 4 },
      { date: 'Sat', timeSpent: 1.2, lecturesCompleted: 2 },
      { date: 'Sun', timeSpent: 0.5, lecturesCompleted: 1 },
    ],
    quizScores: [
      { quizName: 'Quiz 1', score: 8, maxScore: 10 },
      { quizName: 'Quiz 2', score: 15, maxScore: 20 },
      { quizName: 'Quiz 3', score: 7, maxScore: 15 },
      { quizName: 'Quiz 4', score: 18, maxScore: 20 },
    ]
  };
  
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
                  studentName={sampleData.studentName}
                  overallProgress={sampleData.overallProgress}
                  courseProgress={sampleData.courseProgress}
                  learningData={sampleData.learningData}
                  quizScores={sampleData.quizScores}
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
