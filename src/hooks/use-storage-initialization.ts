
import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { isBucketAccessible, areAllBucketsAccessible } from "@/utils/initializeStorage";

const API_BASE_URL = 'http://localhost:8000';
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('access_token');
  const headers: HeadersInit = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const useStorageInitialization = () => {
  const [storageInitialized, setStorageInitialized] = useState(false);
  const [storageChecked, setStorageChecked] = useState(false);
  const [bucketStatuses, setBucketStatuses] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    let isMounted = true;
    const initializeAppStorage = async () => {
      try {
        console.log('Initializing storage...');
        
        // First attempt using FastAPI storage status
        const allAccessible = await areAllBucketsAccessible();
        
        if (!isMounted) return;
        
        // Get individual bucket statuses
        // Modified: Only check for course-images and course-videos buckets
        const requiredBuckets = ['course-images', 'course-videos'];
        const initialStatuses: Record<string, boolean> = {};
        
        // Check each bucket individually with detailed logging
        for (const bucket of requiredBuckets) {
          console.log(`Checking individual bucket: ${bucket}`);
          const isAccessible = await isBucketAccessible(bucket);
          initialStatuses[bucket] = isAccessible;
          console.log(`${bucket} accessibility: ${isAccessible ? 'Success' : 'Failed'}`);
        }
        
        console.log('Initial bucket statuses:', initialStatuses);
        setBucketStatuses(initialStatuses);
        
        // Always set storage as initialized to allow the app to function
        setStorageInitialized(true);
        
        // Retry once if not all buckets are accessible
        if (!allAccessible) {
          console.warn('Some storage buckets could not be accessed, retrying in 2 seconds...');
          console.log('Current bucket statuses:', initialStatuses);
          
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
          
          if (!isMounted) return;
          
          // Retry checking all buckets
          const retryAccessible = await areAllBucketsAccessible();
          console.log('Retry result:', retryAccessible);
          
          if (!isMounted) return;
          
          // Update individual bucket statuses after retry
          const retryStatuses: Record<string, boolean> = {};
          for (const bucket of requiredBuckets) {
            const isAccessible = await isBucketAccessible(bucket);
            retryStatuses[bucket] = isAccessible;
            console.log(`${bucket} retry accessibility: ${isAccessible ? 'Success' : 'Failed'}`);
          }
          
          console.log('Retry bucket statuses:', retryStatuses);
          setBucketStatuses(retryStatuses);
        }
        
        setStorageChecked(true);
        
        // We're not showing toasts about storage anymore, as we don't want to alarm users
        // and the app functions even without all buckets being accessible
        
      } catch (error) {
        console.error('Storage init failed:', error);
        if (isMounted) {
          setStorageChecked(true);
          // Set to true anyway to allow the app to function
          setStorageInitialized(true);
          
          // No toast about storage issues to avoid alarming users
        }
      }
    };

    initializeAppStorage();
    
    return () => {
      isMounted = false;
    };
  }, [toast]);

  return {
    // Always return true to allow the app to function regardless of storage status
    storageInitialized: true,
    storageChecked,
    bucketStatuses
  };
};
