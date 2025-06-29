import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import CourseUploadForm from "@/components/courses/CourseUploadForm";
import { areAllBucketsAccessible, initializeStorage } from "@/utils/initializeStorage";
import { supabase } from "@/integrations/supabase/client";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const CourseUpload = () => {
  const { profile, user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [storageReady, setStorageReady] = useState<boolean>(false);
  const [storageMessage, setStorageMessage] = useState<string | null>(null);

  // Redirect if not logged in or not a creator
  useEffect(() => {
    const checkUserAuthorization = async () => {
      try {
        setDataLoading(true);
        console.log("Checking user authorization...", { user, profile });
        
        // If user data is still loading, don't do anything
        if (user === undefined || profile === undefined) {
          console.log("User data is still loading, waiting...");
          return;
        }
        
        setDataLoading(false);
        
        // If user is not logged in, redirect to login
        if (!user) {
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
  }, [profile, user, navigate, toast]);

  // Check if required storage buckets exist and are accessible
  useEffect(() => {
    const checkStorageBuckets = async () => {
      if (!user) return;
      
      try {
        console.log("Checking storage buckets...");
        setStorageMessage("Checking storage buckets...");
        
        // First check if buckets are accessible
        const storageResults = await initializeStorage();
        console.log("Storage initialization results:", storageResults);
        
        const allAccessible = Object.values(storageResults).every(result => result.accessible);
        
        if (allAccessible) {
          console.log("All storage buckets are accessible");
          setStorageReady(true);
          setStorageMessage(null);
        } else {
          // Log which buckets are not accessible
          const inaccessibleBuckets = Object.entries(storageResults)
            .filter(([_, status]) => !status.accessible)
            .map(([name, status]) => `${name}: ${status.error}`);
            
          console.warn("Some storage buckets are not accessible:", inaccessibleBuckets);
          setStorageMessage(`Storage issues detected: ${inaccessibleBuckets.join(', ')}`);
          
          // Try direct test as a last resort
          try {
            // Test course-images bucket directly
            const { data: imagesList, error: imagesError } = await supabase.storage
              .from('course-images')
              .list('', { limit: 1 });
              
            // Test course-videos bucket directly
            const { data: videosList, error: videosError } = await supabase.storage
              .from('course-videos')
              .list('', { limit: 1 });
              
            const directTestPassed = !imagesError && !videosError;
            
            if (directTestPassed) {
              console.log("Direct bucket tests passed despite earlier failures");
              setStorageReady(true);
              setStorageMessage(null);
            } else {
              console.error("Direct bucket tests failed:", { imagesError, videosError });
              setStorageReady(false);
              
              // Show a more user-friendly message
              if (imagesError?.message?.includes("does not exist") || videosError?.message?.includes("does not exist")) {
                setStorageMessage("Required storage buckets don't exist. Please create course-images and course-videos buckets in Supabase.");
              } else {
                setStorageMessage("Storage buckets are not accessible. You may need admin permissions.");
              }
            }
          } catch (directTestError) {
            console.error("Error during direct bucket tests:", directTestError);
            setStorageReady(false);
          }
        }
      } catch (error) {
        console.error("Error checking storage buckets:", error);
        setStorageReady(false);
        setStorageMessage("Failed to verify storage access. Video uploads may not work.");
      }
    };
    
    if (user) {
      checkStorageBuckets();
    }
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
              <p className="text-slate-600 font-exo2">Fill out the form below to create a new course. Complete all required fields before publishing.</p>
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
              <CourseUploadForm storageReady={storageReady} />
            </ErrorBoundary>
          </motion.div>
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default CourseUpload;
