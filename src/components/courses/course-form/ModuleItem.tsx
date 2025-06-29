
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2, ChevronDown, ChevronUp, Plus } from "lucide-react";
import LectureItem from './LectureItem';

interface ModuleItemProps {
  module: {
    id: string;
    title: string;
    description?: string;
    lectures: {
      id: string;
      title: string;
      description?: string;
      videoUrl?: string;
      duration?: number;
      notes?: string;
    }[];
  };
  index: number;
  updateModule: (index: number, data: any) => void;
  removeModule: (index: number) => void;
  onAddLecture: (moduleIndex: number) => void;
  onRemoveLecture: (moduleIndex: number, lectureIndex: number) => void;
  onUpdateLecture: (moduleIndex: number, lectureIndex: number, data: any) => void;
}

const ModuleItem: React.FC<ModuleItemProps> = ({
  module,
  index,
  updateModule,
  removeModule,
  onAddLecture,
  onRemoveLecture,
  onUpdateLecture
}) => {
  const [expanded, setExpanded] = useState(true);

  return (
    <Card className="mb-4 shadow-sm border-slate-200">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0" 
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </Button>
            <h3 className="font-semibold text-lg font-heading">Module {index + 1}</h3>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => removeModule(index)}
          >
            <Trash2 size={18} />
          </Button>
        </div>

        {expanded && (
          <div className="space-y-4">
            <div>
              <Input
                placeholder="Module Title"
                value={module.title}
                onChange={(e) => updateModule(index, { title: e.target.value })}
                className="font-exo2 mb-2"
              />
              <Textarea
                placeholder="Module Description (optional)"
                value={module.description || ''}
                onChange={(e) => updateModule(index, { description: e.target.value })}
                className="font-exo2 resize-none h-20"
              />
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-medium text-slate-700">Lectures</h4>
              
              {module.lectures.map((lecture, lectureIndex) => (
                <LectureItem
                  key={lecture.id}
                  lecture={lecture}
                  index={lectureIndex}
                  moduleIndex={index}
                  updateLecture={(data) => onUpdateLecture(index, lectureIndex, data)}
                  removeLecture={() => onRemoveLecture(index, lectureIndex)}
                />
              ))}

              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2 w-full justify-center"
                onClick={() => onAddLecture(index)}
              >
                <Plus size={16} className="mr-1" /> Add Lecture
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleItem;
