import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import type { RequirementItem, LearningPointItem } from '@/types/course';

interface CourseContentProps {
  requirements: RequirementItem[];
  learningPoints: LearningPointItem[];
  onRequirementsChange: (items: RequirementItem[]) => void;
  onLearningPointsChange: (items: LearningPointItem[]) => void;
  isStep2Valid: boolean;
  setStep: (step: number) => void;
}

export const CourseContent: React.FC<CourseContentProps> = ({
  requirements,
  learningPoints,
  onRequirementsChange,
  onLearningPointsChange,
  isStep2Valid,
  setStep
}) => {
  // Handle requirement updates
  const updateRequirement = (id: string, text: string) => {
    const updated = requirements.map(item => 
      item.id === id ? { ...item, text } : item
    );
    onRequirementsChange(updated);
  };

  const addRequirement = () => {
    onRequirementsChange([
      ...requirements,
      { id: Date.now().toString(), text: '' }
    ]);
  };

  // Handle learning point updates
  const updateLearningPoint = (id: string, text: string) => {
    const updated = learningPoints.map(item => 
      item.id === id ? { ...item, text } : item
    );
    onLearningPointsChange(updated);
  };

  const addLearningPoint = () => {
    onLearningPointsChange([
      ...learningPoints,
      { id: Date.now().toString(), text: '' }
    ]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 rounded-xl shadow-sm border border-slate-100"
    >
      {/* Requirements Section */}
      <div className="mb-8">
        <h3 className="font-bold mb-4">Requirements</h3>
        {requirements.map((req) => (
          <div key={req.id} className="flex items-center gap-2 mb-2">
            <Input
              value={req.text}
              onChange={(e) => updateRequirement(req.id, e.target.value)}
              placeholder="e.g., Basic scientific knowledge"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRequirementsChange(
                requirements.filter(item => item.id !== req.id)
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addRequirement}>
          <Plus className="w-4 h-4 mr-2" /> Add Requirement
        </Button>
      </div>

      {/* Learning Points Section */}
      <div className="mb-8">
        <h3 className="font-bold mb-4">What Students Will Learn</h3>
        {learningPoints.map((point) => (
          <div key={point.id} className="flex items-center gap-2 mb-2">
            <Input
              value={point.text}
              onChange={(e) => updateLearningPoint(point.id, e.target.value)}
              placeholder="e.g., Understand scientific principles"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onLearningPointsChange(
                learningPoints.filter(item => item.id !== point.id)
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
        <Button variant="outline" onClick={addLearningPoint}>
          <Plus className="w-4 h-4 mr-2" /> Add Learning Point
        </Button>
      </div>

      <div className="flex justify-between mt-8">
        <Button variant="outline" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button
          onClick={() => setStep(3)}
          disabled={!isStep2Valid}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );
};
