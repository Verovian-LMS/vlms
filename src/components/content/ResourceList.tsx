
import React, { useState, useMemo } from 'react';
import { FileDown, FilePlus, FileQuestion, DownloadCloud, CheckSquare, Square, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ResourceItem from './ResourceItem';
import { LectureResource } from '@/types/course';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

interface ResourceListProps {
  resources: LectureResource[];
  emptyMessage?: string;
  onAddResource?: () => void;
  className?: string;
  isEditable?: boolean;
  allowBatchDownload?: boolean;
}

// Extract file type from URL or actual file type
const getFileCategory = (resource: LectureResource): string => {
  const fileType = resource.fileType?.toLowerCase() || '';
  
  if (fileType.includes('pdf')) return 'PDF';
  if (fileType.includes('doc') || fileType.includes('word')) return 'Document';
  if (fileType.includes('xls') || fileType.includes('csv')) return 'Spreadsheet';
  if (fileType.includes('ppt') || fileType.includes('presentation')) return 'Presentation';
  if (fileType.includes('zip') || fileType.includes('rar')) return 'Archive';
  if (fileType.includes('jpg') || fileType.includes('png') || fileType.includes('gif')) return 'Image';
  if (fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('audio')) return 'Audio';
  if (fileType.includes('mp4') || fileType.includes('video')) return 'Video';
  
  return 'Other';
};

const ResourceList: React.FC<ResourceListProps> = ({
  resources,
  emptyMessage = "No resources available for this lecture",
  onAddResource,
  className,
  isEditable = false,
  allowBatchDownload = false
}) => {
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const { toast } = useToast();
  
  // Get unique categories from resources
  const categories = useMemo(() => {
    const categorySet = new Set<string>();
    resources.forEach(resource => {
      categorySet.add(getFileCategory(resource));
    });
    return Array.from(categorySet);
  }, [resources]);
  
  // Filter resources based on selected categories
  const filteredResources = useMemo(() => {
    if (selectedCategories.length === 0) return resources;
    
    return resources.filter(resource => 
      selectedCategories.includes(getFileCategory(resource))
    );
  }, [resources, selectedCategories]);
  
  const toggleResourceSelection = (id: string) => {
    setSelectedResources(prev => 
      prev.includes(id) 
        ? prev.filter(resourceId => resourceId !== id)
        : [...prev, id]
    );
  };
  
  const toggleSelectAll = () => {
    if (selectedResources.length === filteredResources.length) {
      setSelectedResources([]);
    } else {
      setSelectedResources(filteredResources.map(resource => resource.id));
    }
  };
  
  const downloadSelectedResources = async () => {
    setIsDownloading(true);
    
    try {
      const resourcesToDownload = resources.filter(resource => 
        selectedResources.includes(resource.id)
      );
      
      // Using for...of to handle sequential downloads if needed
      for (const resource of resourcesToDownload) {
        const link = document.createElement('a');
        link.href = resource.fileUrl;
        link.download = resource.title || 'download';
        link.click();
        
        // Small delay between downloads to prevent browser throttling
        await new Promise(resolve => setTimeout(resolve, 300));
      }
      
      toast({
        title: "Downloads initiated",
        description: `${selectedResources.length} resource(s) download started`,
      });
      
      // Clear selection after successful download
      setSelectedResources([]);
    } catch (error) {
      console.error("Error downloading resources:", error);
      toast({
        title: "Download error",
        description: "Some resources could not be downloaded",
        variant: "destructive"
      });
    } finally {
      setIsDownloading(false);
    }
  };

  if (resources.length === 0) {
    return (
      <div className={cn("p-8 text-center bg-slate-50 rounded-lg border border-dashed", className)}>
        <FileQuestion className="h-10 w-10 mx-auto text-slate-400 mb-2" />
        <p className="text-slate-500">{emptyMessage}</p>
        
        {isEditable && onAddResource && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={onAddResource}
          >
            <FilePlus className="h-4 w-4 mr-2" />
            Add Resources
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-heading font-semibold text-lg flex items-center">
          <FileDown className="h-5 w-5 mr-2 text-primary" />
          Downloadable Resources
          {selectedCategories.length > 0 && (
            <Badge variant="outline" className="ml-2">
              Filtered: {selectedCategories.length}
            </Badge>
          )}
        </h3>
        
        <div className="flex items-center space-x-2">
          {/* Category filter dropdown */}
          {categories.length > 1 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {categories.map(category => (
                  <DropdownMenuCheckboxItem
                    key={category}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedCategories(prev => [...prev, category]);
                      } else {
                        setSelectedCategories(prev => 
                          prev.filter(item => item !== category)
                        );
                      }
                    }}
                  >
                    {category}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          
          {isEditable && onAddResource && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAddResource}
            >
              <FilePlus className="h-4 w-4 mr-2" />
              Add
            </Button>
          )}
        </div>
      </div>
      
      {allowBatchDownload && filteredResources.length > 1 && (
        <div className="flex items-center justify-between bg-slate-50 p-2 rounded-md mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleSelectAll}
            className="text-slate-700"
          >
            {selectedResources.length === filteredResources.length ? (
              <CheckSquare className="h-4 w-4 mr-2" />
            ) : (
              <Square className="h-4 w-4 mr-2" />
            )}
            {selectedResources.length === filteredResources.length ? "Deselect All" : "Select All"}
          </Button>
          
          {selectedResources.length > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={downloadSelectedResources}
              disabled={isDownloading}
              className="text-primary"
            >
              <DownloadCloud className="h-4 w-4 mr-2" />
              Download {selectedResources.length} Selected
              {isDownloading && (
                <div className="ml-2 h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
              )}
            </Button>
          )}
        </div>
      )}
      
      <div className="space-y-2">
        {filteredResources.map(resource => (
          <ResourceItem 
            key={resource.id}
            id={resource.id}
            title={resource.title}
            description={resource.description}
            fileUrl={resource.fileUrl}
            fileType={resource.fileType}
            fileSize={resource.fileSize}
            isDownloadable={resource.isDownloadable}
            isSelectable={allowBatchDownload}
            isSelected={selectedResources.includes(resource.id)}
            onToggleSelect={() => toggleResourceSelection(resource.id)}
            category={getFileCategory(resource)}
          />
        ))}
      </div>
    </div>
  );
};

export default ResourceList;
