
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/FastApiAuthContext";
import Navigation from "@/components/Navigation";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import OverviewSection from "@/components/profile/OverviewSection";
import AnalyticsSection from "@/components/profile/AnalyticsSection";
import CoursesSection from "@/components/profile/CoursesSection";
import CalendarSection from "@/components/profile/CalendarSection";
import UploadedCoursesSection from "@/components/profile/UploadedCoursesSection";
import SettingsSection from "@/components/profile/SettingsSection";

const Profile = () => {
  const [activeSection, setActiveSection] = useState("overview");
  const { profile, isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-medblue-600"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  let sectionContent;
  switch (activeSection) {
    case "analytics":
      sectionContent = <AnalyticsSection />;
      break;
    case "courses":
      sectionContent = <CoursesSection />;
      break;
    case "uploaded-courses":
      sectionContent = <UploadedCoursesSection />;
      break;
    case "calendar":
      sectionContent = <CalendarSection />;
      break;
    case "settings":
      sectionContent = <SettingsSection profile={profile} />;
      break;
    default:
      sectionContent = <OverviewSection />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navigation />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4 py-8"
      >
        <div className="md:grid md:grid-cols-[250px_1fr] gap-8">
          <ProfileSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection}
            profile={profile}
          />
          <div className="mt-8 md:mt-0">
            {sectionContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
