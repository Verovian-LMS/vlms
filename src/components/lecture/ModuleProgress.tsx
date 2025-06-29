
import React from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle } from "lucide-react";

interface LectureProgressItem {
  id: string;
  title: string;
  progress: number;
  isCompleted: boolean;
}

interface ModuleProgressProps {
  moduleProgress: {
    id: string;
    title: string;
    course_id?: string;
    lectures: LectureProgressItem[];
  }[];
  isLoading: boolean;
}

const ModuleProgress: React.FC<ModuleProgressProps> = ({ moduleProgress, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    );
  }
  
  if (!moduleProgress || moduleProgress.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4 font-exo2">
        No module progress to display.
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {moduleProgress.map((module) => (
        <div key={module.id} className="space-y-2">
          <h4 className="font-medium text-gray-900 font-nunito">{module.title}</h4>
          {module.lectures.length > 0 ? (
            module.lectures.map((lecture) => (
              <div key={lecture.id} className="flex items-center ml-4">
                {lecture.isCompleted || lecture.progress >= 90 ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />
                ) : lecture.progress > 0 ? (
                  <Circle className="w-4 h-4 text-medblue-600 mr-2" />
                ) : (
                  <Circle className="w-4 h-4 text-gray-300 mr-2" />
                )}
                <Link 
                  to={module.course_id ? `/courses/${module.course_id}/lecture/${lecture.id}` : "#"}
                  className={`font-exo2 ${
                    lecture.isCompleted ? "text-green-600" :
                    lecture.progress > 0 ? "text-medblue-600" : "text-gray-500"
                  }`}
                >
                  {lecture.title}
                </Link>
              </div>
            ))
          ) : (
            <div className="text-gray-500 ml-4 font-exo2">
              No lectures in this module.
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ModuleProgress;
