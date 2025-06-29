
import React from "react";
import { Download, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LectureContentProps {
  description?: string;
}

const LectureContent: React.FC<LectureContentProps> = ({ description }) => {
  return (
    <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-100">
      <h2 className="text-xl font-bold text-gray-900 mb-4 font-nunito">About this lecture</h2>
      <p className="text-gray-700 mb-6 font-exo2">{description || "No description available."}</p>

      <div className="flex flex-wrap gap-4">
        <Button variant="outline" className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Notes</span>
        </Button>
        <Button variant="outline" className="flex items-center space-x-2">
          <ListChecks className="w-4 h-4" />
          <span>Take Quiz</span>
        </Button>
      </div>
    </div>
  );
};

export default LectureContent;
