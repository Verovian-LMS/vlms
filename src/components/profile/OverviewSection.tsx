
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/FastApiAuthContext";
import { apiClient } from "@/lib/api/client";

// User activity type
interface UserActivity {
  id: string;
  type: string;
  name: string;
  created_at: string;
  details?: Record<string, any>;
  score?: number;
  cards?: number;
}

const OverviewSection = () => {
  const [userStats, setUserStats] = useState({
    coursesCompleted: 0,
    hoursWatched: 0,
    quizzesTaken: 0,
    flashcardsMastered: 0,
    progress: 0
  });
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    let isMounted = true;
    const loadActivity = async () => {
      try {
        const res = await apiClient.getRecentActivity();
        if (!isMounted) return;
        const items = (res.data || []).map((a: any) => {
          return {
            id: a.id,
            type: a.type,
            name: a.name,
            created_at: a.created_at,
            details: a.details,
            score: a.details?.score,
            cards: a.details?.cards,
          } as UserActivity;
        });
        setUserActivities(items);
      } catch (e) {
        // swallow for now; UI will show empty state
        setUserActivities([]);
      }
    };
    loadActivity();
    return () => { isMounted = false; };
  }, [user]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Summary</CardTitle>
          <CardDescription>Your learning statistics and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500">Courses Completed</h4>
              <p className="text-3xl font-bold text-medblue-600">{userStats.coursesCompleted}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500">Hours Watched</h4>
              <p className="text-3xl font-bold text-medblue-600">{userStats.hoursWatched}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500">Quizzes Taken</h4>
              <p className="text-3xl font-bold text-medblue-600">{userStats.quizzesTaken}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-lg text-center">
              <h4 className="text-sm font-medium text-gray-500">Flashcards Mastered</h4>
              <p className="text-3xl font-bold text-medblue-600">{userStats.flashcardsMastered}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <h4 className="font-medium mb-2">Overall Progress</h4>
            <div className="w-full bg-slate-200 rounded-full h-4">
              <div 
                className="bg-medblue-600 h-4 rounded-full transition-all duration-500" 
                style={{ width: `${userStats.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500">You've completed {userStats.progress}% of your curriculum</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
          <CardDescription>Your latest learning activities</CardDescription>
        </CardHeader>
        <CardContent>
          {userActivities.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activity</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userActivities.map((activity) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.type}</TableCell>
                    <TableCell>{activity.name}</TableCell>
                    <TableCell>{new Date(activity.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {activity.score && <span className="text-green-600 font-medium">{activity.score}%</span>}
                      {activity.cards && <span>{activity.cards} cards</span>}
                      {!activity.score && !activity.cards && <span>-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500 mb-3">No activity recorded yet</p>
              <p className="text-sm text-gray-400">Start learning to see your activity here</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OverviewSection;
