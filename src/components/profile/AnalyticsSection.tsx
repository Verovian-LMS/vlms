
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/context/FastApiAuthContext";

const AnalyticsSection = () => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    // Real implementation would fetch actual analytics data
    setAnalyticsData([]);
  }, [user]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Learning Analytics</CardTitle>
          <CardDescription>Track your study habits and progress</CardDescription>
        </CardHeader>
        <CardContent>
          {analyticsData.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Week</TableHead>
                  <TableHead>Hours Studied</TableHead>
                  <TableHead>Quizzes Taken</TableHead>
                  <TableHead>Avg. Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.map((weekData, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{weekData.week}</TableCell>
                    <TableCell>{weekData.hoursStudied} hours</TableCell>
                    <TableCell>{weekData.quizzesTaken} quizzes</TableCell>
                    <TableCell>{weekData.avgScore}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No analytics data available yet. Start learning to generate analytics.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Progress Chart</CardTitle>
          <CardDescription>Visualize your learning progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">
              Not enough data to generate chart. Continue learning to see your progress.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSection;
