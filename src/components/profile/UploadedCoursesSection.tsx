
import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { BookOpen, FilePlus, Upload, Eye, Edit, Trash2 } from "lucide-react";

const UploadedCoursesSection = () => {
  const { toast } = useToast();
  const [uploadedCourses, setUploadedCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('courses')
          .select('*')
          .eq('author_id', user.id);
        
        if (error) {
          console.error('Error fetching courses:', error);
          return;
        }
        
        setUploadedCourses(data || []);
      } catch (error) {
        console.error('Error in fetchCourses:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [user]);

  const handleDelete = async (courseId: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUploadedCourses(uploadedCourses.filter((course: any) => course.id !== courseId));
      
      toast({
        title: "Course deleted",
        description: "The course has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error deleting course",
        description: error.message || "There was an error deleting the course.",
        variant: "destructive"
      });
    }
  };
  
  const handleStatusChange = async (courseId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', courseId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setUploadedCourses(uploadedCourses.map((course: any) => {
        if (course.id === courseId) {
          return { ...course, status: newStatus };
        }
        return course;
      }));
      
      toast({
        title: "Course status updated",
        description: `The course status has been changed to ${newStatus}.`,
      });
    } catch (error: any) {
      console.error('Error updating course:', error);
      toast({
        title: "Error updating course",
        description: error.message || "There was an error updating the course status.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Uploaded Courses</CardTitle>
            <CardDescription>Manage the courses you've created</CardDescription>
          </div>
          <Link to="/course-upload">
            <Button>
              <FilePlus className="mr-2 h-4 w-4" />
              Create New Course
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {uploadedCourses.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium">No courses yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                  You haven't uploaded any courses yet. Start creating your first course!
                </p>
                <Link to="/course-upload" className="mt-4 inline-block">
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Create Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-6 grid-cols-1">
                {uploadedCourses.map((course: any) => {
                  const createdDate = new Date(course.created_at);
                  const updatedDate = new Date(course.updated_at);
                  
                  const formatDate = (date: Date) => {
                    return new Intl.DateTimeFormat('en-US', { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }).format(date);
                  };
                  
                  return (
                    <Card key={course.id} className="overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-1/4">
                          <img 
                            src={course.image_url || `https://picsum.photos/400/300?random=${course.id}`} 
                            alt={course.title} 
                            className="w-full h-40 md:h-full object-cover"
                          />
                        </div>
                        <div className="w-full md:w-3/4 p-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-lg font-semibold">{course.title}</h3>
                              <p className="text-sm text-gray-500 mt-1">{course.description}</p>
                            </div>
                            <span className={`text-sm px-3 py-1 rounded-full ${
                              course.status === "Published" 
                                ? "bg-green-100 text-green-800" 
                                : course.status === "Draft" 
                                ? "bg-gray-100 text-gray-800" 
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {course.status}
                            </span>
                          </div>
                          
                          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">Created</p>
                              <p className="font-medium">{formatDate(createdDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Last Updated</p>
                              <p className="font-medium">{formatDate(updatedDate)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Modules</p>
                              <p className="font-medium">{course.modules || 0}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">Lectures</p>
                              <p className="font-medium">{course.lectures || 0}</p>
                            </div>
                          </div>
                          
                          <div className="mt-6 flex flex-wrap gap-2">
                            <Link to={`/courses/${course.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </Button>
                            </Link>
                            <Link to={`/course-upload?edit=${course.id}`}>
                              <Button variant="outline" size="sm">
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                            </Link>
                            
                            {course.status === "Draft" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(course.id, "Published")}
                              >
                                Publish
                              </Button>
                            )}
                            
                            {course.status === "Published" && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStatusChange(course.id, "Draft")}
                              >
                                Unpublish
                              </Button>
                            )}
                            
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDelete(course.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UploadedCoursesSection;
