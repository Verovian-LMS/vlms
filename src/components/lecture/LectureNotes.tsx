
import React from "react";

interface LectureNotesProps {
  notes: string;
  isLoading: boolean;
}

const LectureNotes: React.FC<LectureNotesProps> = ({ notes, isLoading }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4 font-nunito">Lecture Notes</h3>
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      ) : (
        <div className="prose prose-sm max-w-none font-exo2">
          {notes || "No notes available for this lecture."}
        </div>
      )}
    </div>
  );
};

export default LectureNotes;
