
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

interface ProgressDashboardProps {
  studentName: string;
  overallProgress: number;
  courseProgress: {
    courseId: string;
    courseName: string;
    progress: number;
    lastAccessed: string;
  }[];
  learningData: {
    date: string;
    timeSpent: number;
    lecturesCompleted: number;
  }[];
  quizScores: {
    quizName: string;
    score: number;
    maxScore: number;
  }[];
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  studentName,
  overallProgress,
  courseProgress,
  learningData,
  quizScores
}) => {
  // Calculate data for pie chart
  const completionData = [
    { name: "Completed", value: overallProgress },
    { name: "Remaining", value: 100 - overallProgress }
  ];
  
  // Colors for charts
  const colors = ["#4f46e5", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444"];
  const pieColors = ["#3b82f6", "#e5e7eb"];
  
  // Transform quiz data for bar chart
  const quizData = quizScores.map(item => ({
    name: item.quizName,
    score: Math.round((item.score / item.maxScore) * 100)
  }));
  
  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight font-nunito-sans">Welcome back, {studentName}</h2>
        <p className="text-muted-foreground font-exo2">
          Here's an overview of your learning progress
        </p>
      </div>
      
      {/* Overall Progress */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-nunito-sans">Overall Progress</CardTitle>
          <CardDescription>Your progress across all courses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className="flex-grow">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">{overallProgress}% Complete</span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
            <div className="ml-4 w-20 h-20 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={completionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={22}
                    outerRadius={35}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {completionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Course Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-nunito-sans">Course Progress</CardTitle>
          <CardDescription>Your progress in each enrolled course</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {courseProgress.map((course, i) => (
              <div key={course.courseId} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium font-exo2">{course.courseName}</span>
                  <span className="text-muted-foreground">{course.progress}%</span>
                </div>
                <Progress 
                  value={course.progress} 
                  className="h-2" 
                  indicatorClassName={i === 0 ? "bg-blue-500" : i === 1 ? "bg-green-500" : "bg-purple-500"}
                />
                <div className="text-xs text-muted-foreground">
                  Last accessed: {new Date(course.lastAccessed).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Learning Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-nunito-sans">Learning Activity</CardTitle>
            <CardDescription>Time spent learning (hours)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={learningData}
                  margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Line
                    type="monotone"
                    dataKey="timeSpent"
                    stroke="#3b82f6"
                    activeDot={{ r: 6 }}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Quiz Scores */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-nunito-sans">Quiz Scores</CardTitle>
            <CardDescription>Your performance in quizzes (%)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} fontSize={12} />
                  <Tooltip contentStyle={{ fontSize: "12px" }} />
                  <Bar dataKey="score" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {quizData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.score >= 70 ? "#10b981" : "#f59e0b"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressDashboard;

