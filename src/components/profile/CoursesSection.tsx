
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BookOpen } from "lucide-react";

const CoursesSection = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('enrollments')
          .select(`
            id,
            progress,
            created_at,
            courses(id, title, description, image_url, status, author_id, profiles(name))
          `)
          .eq('user_id', user.id);
        
        if (error) {
          console.error('Error fetching enrollments:', error);
          return;
        }
        
        setEnrollments(data || []);
      } catch (error) {
        console.error('Error in fetchEnrollments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  if (enrollments.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>My Courses</CardTitle>
            <CardDescription>Courses you've enrolled in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium">No courses enrolled</h3>
              <p className="mt-2 text-sm text-gray-500">
                You haven't enrolled in any courses yet. Browse our catalog to find courses that interest you.
              </p>
              <Link to="/courses" className="mt-4 inline-block">
                <Button>
                  <BookOpen className="mr-2 h-4 w-4" />
                  Browse Courses
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses you've enrolled in</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
            {enrollments.map((enrollment: any) => {
              const course = enrollment.courses;
              return (
                <Card key={enrollment.id} className="overflow-hidden">
                  <img 
                    src={course.image_url || `https://picsum.photos/400/300?random=${course.id}`} 
                    alt={course.title} 
                    className="w-full h-40 object-cover"
                  />
                  <CardContent className="p-4">
                    <h4 className="font-bold">{course.title}</h4>
                    <p className="text-sm text-gray-500">{course.profiles?.name || "Instructor"}</p>
                    <div className="mt-3">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-medblue-600 h-2 rounded-full" 
                          style={{ width: `${enrollment.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        enrollment.progress === 100 
                          ? "bg-green-100 text-green-800" 
                          : enrollment.progress > 0 
                          ? "bg-yellow-100 text-yellow-800" 
                          : "bg-blue-100 text-blue-800"
                      }`}>
                        {enrollment.progress === 100 ? "Completed" : enrollment.progress > 0 ? "In Progress" : "Just Started"}
                      </span>
                      <Link to={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm">
                          {enrollment.progress === 100 ? "Review" : "Continue"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CoursesSection;
