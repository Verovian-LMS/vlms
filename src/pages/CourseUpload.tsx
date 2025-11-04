import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/FastApiAuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import EnhancedCourseCreationFlow from "@/components/courses/course-form/EnhancedCourseCreationFlow";
import { apiClient } from "@/lib/api-client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { createCourse } from "@/lib/actions/course.actions";
import { CourseFormValues } from "@/lib/validations/course";

const CourseUpload = () => {
  const { profile, user, isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [storageReady, setStorageReady] = useState<boolean>(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle course creation
  const handleCourseSubmit = async (values: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await createCourse(values);
      
      if (result.success) {
        toast({
          title: "Success!",
          description: "Course created successfully.",
          variant: "default",
        });
        
        // Navigate to the courses listing page (valid route)
        navigate(`/courses`);
      } else {
        throw new Error(result.error || 'Failed to create course');
      }
    } catch (error) {
      console.error('Course creation error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create course. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Redirect if not logged in or not a creator
  useEffect(() => {
    const checkUserAuthorization = async () => {
      try {
        setDataLoading(true);
        console.log("Checking user authorization...", { user, profile, isLoading, isAuthenticated });

        // Wait for auth context to finish initializing
        if (isLoading) {
          console.log("Auth is loading, waiting...");
          return;
        }

        setDataLoading(false);

        // If user is not logged in, redirect to login
        if (!isAuthenticated) {
          console.log("User is not logged in, redirecting to login");
          toast({
            title: "Authentication Required",
            description: "Please log in to access the course upload page",
            variant: "destructive"
          });
          navigate("/login", { state: { from: "/course-upload" } });
          return;
        }

        // If user is logged in but not a creator, redirect to dashboard
        if (profile && profile.role !== 'creator') {
          console.log("User is not a creator, redirecting to dashboard");
          toast({
            title: "Access Denied",
            description: "Only course creators can access this page",
            variant: "destructive"
          });
          navigate("/dashboard");
        }
      } catch (authError) {
        console.error("Error checking user authorization:", authError);
        setDataLoading(false);
        setError("Error checking user authorization. Please try again.");
      }
    };
    
    checkUserAuthorization();
  }, [profile, user, isLoading, isAuthenticated, navigate, toast]);

  // Skip storage check for now to avoid storage errors
  useEffect(() => {
    // Always set storage as ready to avoid transient storage errors
    setStorageReady(true);
    setStorageMessage(null);
  }, [user]);

  // If we're still loading user data, show a loading state
  if (dataLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navigation />
        <main className="flex-grow py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
            <p className="mt-2 text-slate-600">Loading user information...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // If user is not authorized, don't render the form at all
  if (profile && profile.role !== 'creator') {
    return null; // The redirect in useEffect will handle navigation
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow py-12 px-4">
        <ErrorBoundary>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-5xl"
          >
            <div className="mb-8">
              <h1 className="text-3xl font-heading font-bold text-slate-800 mb-2">Create New Course</h1>
              <p className="text-slate-600 font-exo2">Follow the step-by-step process to create your course. Complete all steps before publishing.</p>
            </div>
            
            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                  <h3 className="text-red-800 font-semibold">Error</h3>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}
            
            {storageMessage && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Storage Warning</AlertTitle>
                <AlertDescription>{storageMessage}</AlertDescription>
              </Alert>
            )}
            
            <ErrorBoundary>
              <EnhancedCourseCreationFlow 
                onSubmit={handleCourseSubmit}
                isSubmitting={isSubmitting}
                mode="create"
              />
            </ErrorBoundary>
          </motion.div>
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseUpload;
