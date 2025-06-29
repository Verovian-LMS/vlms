
export interface ToastAPI {
  toast: (props: {
    title: string;
    description?: string;
    variant?: 'default' | 'destructive';
  }) => void;
}

export interface ContentUploadStatus {
  isUploading: boolean;
  progress: number;
  error?: string | null;
  url?: string | null;
  duration?: number;
  fileType?: string;
  fileSize?: number;
}

export interface ProgressStepProps {
  step: number;
  totalSteps?: number;
  labels?: string[];
}
