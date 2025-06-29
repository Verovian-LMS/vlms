
import React from 'react';
import { FileIcon, Download, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResourceItemProps {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize?: number;
  isDownloadable: boolean;
  isSelectable?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  category?: string;
}

// Format file size in a readable format
const formatFileSize = (bytes?: number): string => {
  if (bytes === undefined) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Icon mapper for different file types
const getFileIcon = (fileType: string): React.ReactNode => {
  const type = fileType.toLowerCase();
  
  // This would be expanded with proper icons for each file type
  const defaultIcon = <FileIcon className="h-5 w-5 text-blue-600" />;
  
  return defaultIcon;
};

const ResourceItem: React.FC<ResourceItemProps> = ({
  id,
  title,
  description,
  fileUrl,
  fileType,
  fileSize,
  isDownloadable,
  isSelectable = false,
  isSelected = false,
  onToggleSelect,
  category = 'Other'
}) => {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = title || 'download';
    link.click();
  };

  return (
    <div 
      className={cn(
        "flex items-center p-3 border rounded-md hover:bg-slate-50 transition-colors",
        isSelected && "bg-blue-50 border-blue-200"
      )}
    >
      {isSelectable && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="p-0 mr-2 h-8 w-8" 
          onClick={onToggleSelect}
        >
          {isSelected ? (
            <CheckSquare className="h-5 w-5 text-blue-600" />
          ) : (
            <Square className="h-5 w-5 text-slate-400" />
          )}
          <span className="sr-only">
            {isSelected ? 'Deselect' : 'Select'} {title}
          </span>
        </Button>
      )}
      
      <div className="bg-slate-100 p-2 rounded-md mr-3">
        {getFileIcon(fileType)}
      </div>
      
      <div className="flex-grow min-w-0">
        <div className="flex items-center">
          <h4 className="font-medium text-slate-900 truncate">{title}</h4>
          <Badge variant="outline" className="ml-2 text-xs">{category}</Badge>
        </div>
        
        {description && (
          <p className="text-sm text-slate-500 truncate">{description}</p>
        )}
        
        <div className="flex items-center text-xs text-slate-500 mt-1">
          <span className="uppercase">{fileType}</span>
          {fileSize !== undefined && (
            <span className="ml-2">({formatFileSize(fileSize)})</span>
          )}
        </div>
      </div>
      
      {isDownloadable && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2"
                onClick={handleDownload}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download {title}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download file</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default ResourceItem;
