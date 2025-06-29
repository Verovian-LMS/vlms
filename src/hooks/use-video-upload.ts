
import { useState, useCallback } from 'react';
import { supabase, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import * as tus from 'tus-js-client';

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
    lectureId: string,
    onSuccess: (lectureId: string, url: string, duration: string) => void,
    onError?: (lectureId: string, error: Error) => void
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
      console.log(`Checking if bucket "${bucketName}" exists...`);
      
      // First try with direct bucket info
      const { data, error } = await supabase.storage.getBucket(bucketName);
      
      if (error) {
        console.error(`Bucket check error for ${bucketName}:`, error);
        
        // Try list operation as fallback
        const { error: listError } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });
        
        if (listError) {
          console.error(`Bucket list error for ${bucketName}:`, listError);
          return false;
        }
        
        console.log(`Bucket "${bucketName}" exists (verified via list operation)`);
        return true;
      }
      
      console.log(`Bucket "${bucketName}" exists:`, data);
      return true;
    } catch (error) {
      console.error(`Bucket verification error for ${bucketName}:`, error);
      return false;
    }
  }, []);

  const uploadVideo = useCallback(async (
    file: File,
    moduleId: string,
    lectureId: string,
    onSuccess: (lectureId: string, url: string, duration: string) => void,
    onError?: (lectureId: string, error: Error) => void
  ) => {
    if (!file) {
      console.error("No file provided for upload");
      const error = new Error("No file provided for upload");
      if (onError && typeof onError === 'function') onError(lectureId, error);
      return;
    }
    
    if (!moduleId || !lectureId) {
      console.error("Invalid moduleId or lectureId for upload", { moduleId, lectureId });
      const error = new Error("Invalid module or lecture ID for upload");
      if (onError && typeof onError === 'function') onError(lectureId, error);
      return;
    }
    
    console.log(`Starting upload process for file: ${file.name}, size: ${file.size} bytes`);

    // Set initial upload status
    setUploadStatuses(prev => ({
      ...prev,
      [lectureId]: { isUploading: true, progress: 0, error: null }
    }));

    try {
      // Check Supabase configuration
      if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        const error = new Error("Supabase configuration is missing");
        console.error("Supabase configuration error:", error);
        
        setUploadStatuses(prev => ({
          ...prev,
          [lectureId]: { isUploading: false, progress: 0, error: error.message }
        }));
        
        if (onError && typeof onError === 'function') onError(lectureId, error);
        return;
      }

      // Verify bucket exists first
      const bucketName = 'course-videos';
      const bucketExists = await verifyBucketExists(bucketName);
      
      if (!bucketExists) {
        const error = new Error(`Storage bucket "${bucketName}" does not exist. Please create it in your Supabase dashboard.`);
        console.error(`Bucket verification error for ${bucketName}:`, error);
        
        setUploadStatuses(prev => ({
          ...prev,
          [lectureId]: { isUploading: false, progress: 0, error: error.message }
        }));
        
        toast({ 
          title: "Storage Setup Error", 
          description: `Error checking storage bucket: ${error.message}. Please ensure the "${bucketName}" bucket exists in Supabase.`, 
          variant: "destructive" 
        });
        
        if (onError && typeof onError === 'function') onError(lectureId, error);
        return;
      }

      // Get auth token
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !sessionData || !sessionData.session) {
        const error = sessionError || new Error("No active session");
        console.error("Authentication error:", error);
        
        setUploadStatuses(prev => ({
          ...prev,
          [lectureId]: { isUploading: false, progress: 0, error: error.message }
        }));
        
        toast({ 
          title: "Authentication Error", 
          description: `Failed to authenticate: ${error.message}`, 
          variant: "destructive" 
        });
        
        if (onError && typeof onError === 'function') onError(lectureId, error);
        return;
      }
      
      const token = sessionData.session.access_token;
      if (!token) {
        const error = new Error("Authentication token is missing");
        console.error("Auth token error:", error);
        
        setUploadStatuses(prev => ({
          ...prev,
          [lectureId]: { isUploading: false, progress: 0, error: error.message }
        }));
        
        if (onError && typeof onError === 'function') onError(lectureId, error);
        return;
      }
      
      console.log('Authentication token retrieved successfully');

      // Prepare upload parameters
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'mp4';
      const objectPath = `${moduleId}/${lectureId}-${Date.now()}.${fileExt}`;
      
      console.log(`Starting TUS upload for lecture ${lectureId} to bucket ${bucketName}: ${objectPath}`);

      // Configure and execute TUS upload
      const tusUpload = new tus.Upload(file, {
        endpoint: `${SUPABASE_URL}/storage/v1/upload/resumable`,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${token}`,
          apikey: SUPABASE_PUBLISHABLE_KEY,
          'x-upsert': 'true',
        },
        metadata: {
          bucketName,
          objectName: objectPath,
          contentType: file.type || 'video/mp4',
        },
        onError: (tusError) => {
          console.error('TUS upload error:', tusError);
          
          setUploadStatuses(prev => ({
            ...prev,
            [lectureId]: { isUploading: false, progress: 0, error: tusError.message }
          }));
          
          toast({ 
            title: 'Upload Failed', 
            description: tusError.message || 'Video upload failed', 
            variant: 'destructive' 
          });
          
          if (onError && typeof onError === 'function') onError(lectureId, tusError);
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          if (bytesTotal === 0) return;
          const progress = Math.round((bytesUploaded / bytesTotal) * 100);
          
          setUploadStatuses(prev => ({
            ...prev,
            [lectureId]: { ...prev[lectureId], progress }
          }));
        },
        onSuccess: async () => {
          try {
            console.log(`Upload successful for lecture ${lectureId}, getting public URL...`);
            
            // Get public URL for the uploaded file
            const { data: urlData, error: urlError } = await supabase.storage
              .from(bucketName)
              .getPublicUrl(objectPath);

            if (urlError || !urlData) {
              throw new Error(`Failed to get public URL: ${urlError?.message || "Unknown error"}`);
            }

            // Get duration for the uploaded video
            const duration = await getVideoDuration(urlData.publicUrl);
            
            console.log(`Video uploaded successfully: ${urlData.publicUrl}, duration: ${duration}`);
            
            // Update status and notify success
            setUploadStatuses(prev => ({
              ...prev,
              [lectureId]: { isUploading: false, progress: 100 }
            }));
            
            if (onSuccess && typeof onSuccess === 'function') {
              onSuccess(lectureId, urlData.publicUrl, duration);
            }
            
          } catch (postUploadError) {
            console.error('Post-upload processing error:', postUploadError);
            
            const message = postUploadError instanceof Error 
              ? postUploadError.message 
              : 'Post-upload processing failed';
              
            setUploadStatuses(prev => ({
              ...prev,
              [lectureId]: { isUploading: false, progress: 100, error: message }
            }));
            
            if (onError && typeof onError === 'function') {
              onError(
                lectureId, 
                postUploadError instanceof Error 
                  ? postUploadError 
                  : new Error(message)
              );
            }
          }
        }
      });

      // Start the upload process
      if (tusUpload && tusUpload.start) {
        tusUpload.start();
      } else {
        throw new Error("Failed to initialize upload");
      }
      
    } catch (generalError) {
      console.error("General upload error:", generalError);
      
      // Update status with error info
      setUploadStatuses(prev => ({
        ...prev,
        [lectureId]: { 
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
          lectureId, 
          generalError instanceof Error ? generalError : new Error("Unknown upload error")
        );
      }
    }
  }, [toast, getVideoDuration, verifyBucketExists]);

  return { uploadVideo, uploadStatuses };
};

export default useVideoUpload;
