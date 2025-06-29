
import React from 'react';

interface ProgressStepsProps {
  step: number;
}

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ step }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between max-w-sm mx-auto">
        <div className={`flex flex-col items-center ${step >= 1 ? 'text-medblue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 1 ? 'bg-medblue-100 text-medblue-600' : 'bg-gray-100 text-gray-400'}`}>
            1
          </div>
          <span className="text-sm font-exo2">Basics</span>
        </div>
        <div className={`w-16 h-1 ${step >= 2 ? 'bg-medblue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 2 ? 'text-medblue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 2 ? 'bg-medblue-100 text-medblue-600' : 'bg-gray-100 text-gray-400'}`}>
            2
          </div>
          <span className="text-sm font-exo2">Content</span>
        </div>
        <div className={`w-16 h-1 ${step >= 3 ? 'bg-medblue-600' : 'bg-gray-200'}`}></div>
        <div className={`flex flex-col items-center ${step >= 3 ? 'text-medblue-600' : 'text-gray-400'}`}>
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${step >= 3 ? 'bg-medblue-100 text-medblue-600' : 'bg-gray-100 text-gray-400'}`}>
            3
          </div>
          <span className="text-sm font-exo2">Modules</span>
        </div>
      </div>
    </div>
  );
};
