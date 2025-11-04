
import { useState, useCallback } from 'react';
import { useToast } from './use-toast';

// FastAPI base URL used for uploads and file serving
const API_BASE_URL = 'http://localhost:8000';

// Made this interface exportable
export interface UploadStatus {
  isUploading: boolean;
  progress: number;
  error?: string | null;
}

export interface UseVideoUploadReturn {
  uploadVideo: (
    file: File,
    moduleId: string,
    lessonId: string,
    onSuccess: (lessonId: string, url: string, duration: string) => void,
    onError?: (lessonId: string, error: Error) => void
  ) => Promise<void>;
  uploadStatuses: Record<string, UploadStatus>;
}

const formatDuration = (totalSeconds: number): string => {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

export const useVideoUpload = (): UseVideoUploadReturn => {
  const [uploadStatuses, setUploadStatuses] = useState<Record<string, UploadStatus>>({});
  const { toast } = useToast();

  const getVideoDuration = useCallback((url: string): Promise<string> => {
    return new Promise((resolve) => {
      try {
        if (!url) {
          resolve('0:00');
          return;
        }
        
        const videoElement = document.createElement('video');
        videoElement.preload = 'metadata';
        
        const handleMetadataLoaded = () => {
          resolve(formatDuration(videoElement.duration));
          cleanup();
        };

        const handleError = () => {
          console.error("Error loading video metadata for duration calculation");
          resolve('0:00');
          cleanup();
        };

        const timeoutId = setTimeout(handleError, 7000);

        const cleanup = () => {
          clearTimeout(timeoutId);
          videoElement.removeEventListener('loadedmetadata', handleMetadataLoaded);
          videoElement.removeEventListener('error', handleError);
          if (url && url.startsWith('blob:')) {
            try {
              URL.revokeObjectURL(url);
            } catch (error) {
              console.error("Error revoking URL:", error);
            }
          }
          videoElement.src = '';
        };

        videoElement.addEventListener('loadedmetadata', handleMetadataLoaded);
        videoElement.addEventListener('error', handleError);
        videoElement.src = url;
      } catch (error) {
        console.error("Error getting video duration:", error);
        resolve('0:00');
      }
    });
  }, []);

  const verifyBucketExists = useCallback(async (bucketName: string): Promise<boolean> => {
    if (!bucketName) return false;
    try {
      // Ask backend storage status; it creates directories as needed
      const response = await fetch(`${API_BASE_URL}/api/v1/storage/status`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.error('Storage status check failed:', response.statusText);
        return false;
      }
      const status = await response.json();
      const bucketStatus = status?.buckets?.[bucketName]?.status;
      return bucketStatus === 'available';
    } catch (error) {
      console.error(`Bucket verification error for ${bucketName}:`, error);
      return false;
    }
  }, []);

  const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
    const headers: HeadersInit = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  };

  const uploadVideo = useCallback(async (
    file: File,
    moduleId: string,
    lessonId: string,
    onSuccess: (lessonId: string, url: string, duration: string) => void,
    onError?: (lessonId: string, error: Error) => void
  ) => {
    if (!file) {
      console.error("No file provided for upload");
      const error = new Error("No file provided for upload");
      if (onError && typeof onError === 'function') onError(lessonId, error);
      return;
    }
    
    if (!moduleId || !lessonId) {
      console.error("Invalid moduleId or lessonId for upload", { moduleId, lessonId });
      const error = new Error("Invalid module or lesson ID for upload");
      if (onError && typeof onError === 'function') onError(lessonId, error);
      return;
    }
    
    console.log(`Starting upload process for file: ${file.name}, size: ${file.size} bytes`);

    // Set initial upload status
    setUploadStatuses(prev => ({
      ...prev,
      [lessonId]: { isUploading: true, progress: 0, error: null }
    }));

    try {
      // Verify backend storage buckets exist (directories are created on demand)
      const bucketName = 'course-videos';
      const bucketExists = await verifyBucketExists(bucketName);
      if (!bucketExists) {
        const error = new Error(`Storage bucket "${bucketName}" is not available.`);
        setUploadStatuses(prev => ({
          ...prev,
          [lessonId]: { isUploading: false, progress: 0, error: error.message }
        }));
        toast({
          title: 'Storage Error',
          description: error.message,
          variant: 'destructive',
        });
        if (onError) onError(lessonId, error);
        return;
      }

      // Upload via FastAPI
      const formData = new FormData();
      formData.append('file', file);
      const uploadResponse = await fetch(`${API_BASE_URL}/api/v1/files/upload/course-video`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errData = await uploadResponse.json().catch(() => ({}));
        const message = errData?.detail || uploadResponse.statusText || 'Upload failed';
        throw new Error(message);
      }

      const data = await uploadResponse.json();
      const publicUrl = `${API_BASE_URL}${data.file_path}`;

      // Get duration for the uploaded video
      const duration = await getVideoDuration(publicUrl);

      // Update status and notify success
      setUploadStatuses(prev => ({
        ...prev,
        [lessonId]: { isUploading: false, progress: 100 }
      }));

      if (onSuccess) {
        onSuccess(lessonId, publicUrl, duration);
      }
      
    } catch (generalError) {
      console.error("General upload error:", generalError);
      
      // Update status with error info
      setUploadStatuses(prev => ({
        ...prev,
        [lessonId]: { 
          isUploading: false, 
          progress: 0, 
          error: generalError instanceof Error ? generalError.message : "Unknown upload error" 
        }
      }));
      
      // Display error message
      toast({ 
        title: "Upload Error", 
        description: generalError instanceof Error ? generalError.message : "Unknown upload error", 
        variant: "destructive" 
      });
      
      // Call error callback if provided
      if (onError && typeof onError === 'function') {
        onError(
          lessonId, 
          generalError instanceof Error ? generalError : new Error("Unknown upload error")
        );
      }
  }
  }, [toast, getVideoDuration, verifyBucketExists]);

  return { uploadVideo, uploadStatuses };
};

export default useVideoUpload;
