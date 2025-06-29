
import React from 'react';
import { Button } from '@/components/ui/button';
import LoadingIndicator from '@/components/ui/loading-indicator';
import { CourseModule } from '@/types/course';

interface ModuleActionsProps {
  modules: CourseModule[];
  isStep3Valid: boolean;
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
  uploadStatuses: Record<string, { isUploading: boolean; progress: number; error?: string | null }>;
}

const ModuleActions: React.FC<ModuleActionsProps> = ({
  modules,
  isStep3Valid,
  isSubmitting,
  onSubmit,
  onBack,
  uploadStatuses
}) => {
  const isAnyUploading = Object.values(uploadStatuses).some(status => status.isUploading);
  const hasUploadErrors = Object.values(uploadStatuses).some(status => status.error);
  
  return (
    <div className="flex flex-col md:flex-row md:justify-between gap-4 mt-8 pt-6 border-t border-slate-200">
      <Button variant="outline" onClick={onBack}>
        Back to Content
      </Button>
      
      <div className="flex flex-col items-end gap-2">
        {isAnyUploading && (
          <LoadingIndicator 
            isLoading={true} 
            loadingMessage="Uploads in progress... Please wait" 
            size="sm"
          />
        )}
        
        {hasUploadErrors && (
          <LoadingIndicator 
            error="Some uploads failed. Please try again." 
            size="sm"
            showRetry={false}
          />
        )}
        
        {!isStep3Valid && modules.length > 0 && (
          <p className="text-xs text-amber-600 mb-1">
            Please ensure all modules have titles and content
          </p>
        )}
        
        <Button
          size="lg"
          onClick={onSubmit}
          disabled={!isStep3Valid || isSubmitting || isAnyUploading}
          aria-disabled={!isStep3Valid || isSubmitting || isAnyUploading}
        >
          {isSubmitting ? 'Publishing...' : 'Publish Course'}
        </Button>
      </div>
    </div>
  );
};

export default ModuleActions;
