
import { useState, useCallback, useEffect } from 'react';

export const useVideoOfflineSupport = (videoUrl?: string | null) => {
  const [isAvailableOffline, setIsAvailableOffline] = useState(false);
  const [isSavingOffline, setIsSavingOffline] = useState(false);
  const [offlineError, setOfflineError] = useState<string | null>(null);
  
  // Check if video is already saved for offline viewing
  useEffect(() => {
    if (!videoUrl) {
      setIsAvailableOffline(false);
      return;
    }
    
    // Check if browser supports caches
    if (!('caches' in window)) {
      setOfflineError('Your browser does not support offline videos');
      return;
    }
    
    const checkOfflineStatus = async () => {
      try {
        const cache = await caches.open('video-cache');
        const response = await cache.match(videoUrl);
        setIsAvailableOffline(!!response);
      } catch (error) {
        console.error('Error checking offline status:', error);
        setOfflineError('Failed to check offline status');
        setIsAvailableOffline(false);
      }
    };
    
    checkOfflineStatus();
  }, [videoUrl]);
  
  // Save video for offline viewing
  const saveForOffline = useCallback(async () => {
    if (!videoUrl) {
      setOfflineError('No video URL provided');
      return false;
    }
    
    if (!('caches' in window)) {
      setOfflineError('Your browser does not support offline videos');
      return false;
    }
    
    setIsSavingOffline(true);
    setOfflineError(null);
    
    try {
      const cache = await caches.open('video-cache');
      const response = await fetch(videoUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status} ${response.statusText}`);
      }
      
      await cache.put(videoUrl, response);
      
      setIsAvailableOffline(true);
      return true;
    } catch (error) {
      console.error('Error saving video for offline:', error);
      setOfflineError(error instanceof Error ? error.message : 'Failed to save video for offline viewing');
      return false;
    } finally {
      setIsSavingOffline(false);
    }
  }, [videoUrl]);
  
  // Remove video from offline storage
  const removeFromOffline = useCallback(async () => {
    if (!videoUrl) return false;
    
    if (!('caches' in window)) {
      setOfflineError('Your browser does not support offline videos');
      return false;
    }
    
    try {
      const cache = await caches.open('video-cache');
      const success = await cache.delete(videoUrl);
      
      if (success) {
        setIsAvailableOffline(false);
      }
      
      return success;
    } catch (error) {
      console.error('Error removing video from offline storage:', error);
      setOfflineError(error instanceof Error ? error.message : 'Failed to remove video from offline storage');
      return false;
    }
  }, [videoUrl]);
  
  return {
    isAvailableOffline,
    isSavingOffline,
    offlineError,
    saveForOffline,
    removeFromOffline
  };
};
