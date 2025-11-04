import React from "react";
import { useParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import EnhancedCourseCreationFlow from "@/components/courses/course-form/EnhancedCourseCreationFlow";

const EnhancedCourseCreation = () => {
  const { courseId } = useParams<{ courseId?: string }>();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <main className="flex-grow">
        <ErrorBoundary>
          <EnhancedCourseCreationFlow courseId={courseId} />
        </ErrorBoundary>
      </main>
      
      <Footer />
    </div>
  );
};

export default EnhancedCourseCreation;