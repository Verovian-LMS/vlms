
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, BookOpen } from "lucide-react";

interface LectureHeaderProps {
  courseId?: string;
  courseTitle?: string;
  moduleTitle?: string;
  lectureTitle?: string;
}

const LectureHeader: React.FC<LectureHeaderProps> = ({
  courseId,
  courseTitle,
  moduleTitle,
  lectureTitle
}) => {
  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to={courseId ? `/courses/${courseId}` : "/dashboard"} className="flex items-center text-gray-700 hover:text-medblue-600">
              <ChevronLeft className="w-5 h-5 mr-1" />
              <span>Back to Course</span>
            </Link>
            <div className="text-sm text-gray-500">
              Course: {courseTitle || "Unknown Course"}
            </div>
          </div>
        </div>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2 font-nunito">{lectureTitle || "Untitled Lecture"}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center text-gray-600 gap-2 sm:gap-6">
          <div className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>Module: {moduleTitle || "Unknown Module"}</span>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default LectureHeader;
