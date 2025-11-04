
import React from 'react';
import { 
  Video, 
  FileText, 
  Presentation, 
  Music, 
  FileDown, 
  Sparkles, 
  File,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { LessonContentType } from '@/types/course';

interface ContentTypeSelectorProps {
  selectedType: LessonContentType;
  onChange: (type: LessonContentType) => void;
  className?: string;
}

interface ContentTypeOption {
  type: LessonContentType;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const ContentTypeSelector: React.FC<ContentTypeSelectorProps> = ({
  selectedType,
  onChange,
  className
}) => {
  const contentTypes: ContentTypeOption[] = [
    {
      type: 'video',
      label: 'Video',
      icon: <Video className="h-5 w-5" />,
      description: 'Upload video lessons'
    },
    {
      type: 'pdf',
      label: 'PDF',
      icon: <FileText className="h-5 w-5" />,
      description: 'Upload PDF documents'
    },
    {
      type: 'slides',
      label: 'Slides',
      icon: <Presentation className="h-5 w-5" />,
      description: 'Upload presentation slides'
    },
    {
      type: 'audio',
      label: 'Audio',
      icon: <Music className="h-5 w-5" />,
      description: 'Upload audio recordings'
    },
    {
      type: 'document',
      label: 'Document',
      icon: <File className="h-5 w-5" />,
      description: 'Upload text documents'
    },
    {
      type: 'interactive',
      label: 'Interactive',
      icon: <Sparkles className="h-5 w-5" />,
      description: 'Add interactive content'
    },
    {
      type: 'downloadable',
      label: 'Downloadable',
      icon: <FileDown className="h-5 w-5" />,
      description: 'Add downloadable resources'
    }
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3", className)}>
      {contentTypes.map((option) => (
        <div 
          key={option.type}
          className={cn(
            "border rounded-lg p-3 cursor-pointer transition-all",
            selectedType === option.type 
              ? "border-primary bg-primary/5 ring-1 ring-primary" 
              : "border-slate-200 hover:border-slate-300 bg-white"
          )}
          onClick={() => onChange(option.type)}
        >
          <div className="flex items-start">
            <div className={cn(
              "p-1.5 rounded-md mr-3",
              selectedType === option.type 
                ? "bg-primary/10 text-primary" 
                : "bg-slate-100 text-slate-500"
            )}>
              {option.icon}
            </div>
            <div>
              <div className="flex items-center">
                <h4 className="font-heading font-medium text-sm">{option.label}</h4>
                {selectedType === option.type && (
                  <Check className="h-4 w-4 text-primary ml-1" />
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">{option.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ContentTypeSelector;
