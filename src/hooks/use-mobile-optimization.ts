
import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from './use-mobile';

interface MobileOptimizationOptions {
  // Whether to enable offline support
  enableOfflineSupport?: boolean;
  // Whether to preload next content items
  enablePreloading?: boolean;
  // Whether to optimize images based on device
  enableImageOptimization?: boolean;
  // Whether to enable touch-friendly controls
  enableTouchControls?: boolean;
}

export const useMobileOptimization = (options: MobileOptimizationOptions = {}) => {
  const {
    enableOfflineSupport = true,
    enablePreloading = true,
    enableImageOptimization = true,
    enableTouchControls = true
  } = options;
  
  const isMobile = useIsMobile();
  const [isOfflineAvailable, setIsOfflineAvailable] = useState(false);
  const [offlineItems, setOfflineItems] = useState<string[]>([]);
  const [networkStatus, setNetworkStatus] = useState<'online' | 'offline' | 'slow'>('online');
  
  // Check network status
  useEffect(() => {
    const handleOnline = () => setNetworkStatus('online');
    const handleOffline = () => setNetworkStatus('offline');
    
    // Check for slow connection
    const checkConnectionSpeed = () => {
      // @ts-ignore - Connection property exists but TypeScript doesn't know about it
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      if (connection && connection.effectiveType) {
        if (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g') {
          setNetworkStatus('slow');
        } else {
          setNetworkStatus('online');
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    if (navigator.onLine === false) {
      handleOffline();
    } else {
      checkConnectionSpeed();
    }
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Check for service worker support
  useEffect(() => {
    if (enableOfflineSupport && 'serviceWorker' in navigator && navigator.onLine) {
      // Check if service worker is active
      navigator.serviceWorker.ready.then(() => {
        setIsOfflineAvailable(true);
      }).catch(error => {
        console.error('Service worker error:', error);
        setIsOfflineAvailable(false);
      });
    } else {
      setIsOfflineAvailable(false);
    }
  }, [enableOfflineSupport]);
  
  // Save item for offline use
  const saveForOffline = useCallback(async (itemId: string, itemData: any) => {
    if (!enableOfflineSupport || !isOfflineAvailable) return false;
    
    try {
      localStorage.setItem(`offline_item_${itemId}`, JSON.stringify(itemData));
      
      setOfflineItems(prev => {
        if (!prev.includes(itemId)) {
          return [...prev, itemId];
        }
        return prev;
      });
      
      return true;
    } catch (error) {
      console.error('Error saving item for offline use:', error);
      return false;
    }
  }, [enableOfflineSupport, isOfflineAvailable]);
  
  // Get offline item
  const getOfflineItem = useCallback((itemId: string) => {
    if (!enableOfflineSupport || !isOfflineAvailable) return null;
    
    try {
      const itemData = localStorage.getItem(`offline_item_${itemId}`);
      if (!itemData) return null;
      
      return JSON.parse(itemData);
    } catch (error) {
      console.error('Error getting offline item:', error);
      return null;
    }
  }, [enableOfflineSupport, isOfflineAvailable]);
  
  // Remove offline item
  const removeOfflineItem = useCallback((itemId: string) => {
    if (!enableOfflineSupport || !isOfflineAvailable) return false;
    
    try {
      localStorage.removeItem(`offline_item_${itemId}`);
      
      setOfflineItems(prev => prev.filter(id => id !== itemId));
      
      return true;
    } catch (error) {
      console.error('Error removing offline item:', error);
      return false;
    }
  }, [enableOfflineSupport, isOfflineAvailable]);
  
  // Mobile image url optimization
  const getOptimizedImageUrl = useCallback((url: string) => {
    if (!enableImageOptimization || !url) return url;
    
    // If already using a resizing service or contains size parameters, return as is
    if (url.includes('?w=') || url.includes('&w=') || url.includes('width=')) {
      return url;
    }
    
    try {
      const urlObj = new URL(url);
      
      // For image URLs that support resizing via query parameters
      if (url.includes('images.unsplash.com') || url.includes('cloudinary.com')) {
        // Determine appropriate size based on device
        const width = isMobile ? 640 : 1280;
        
        // Add sizing parameters based on the image service
        if (url.includes('images.unsplash.com')) {
          urlObj.searchParams.set('w', width.toString());
          urlObj.searchParams.set('q', '80');
        } else if (url.includes('cloudinary.com')) {
          // Assuming URL like: https://res.cloudinary.com/demo/image/upload/sample.jpg
          // Convert to: https://res.cloudinary.com/demo/image/upload/w_640,q_auto/sample.jpg
          const parts = url.split('/upload/');
          if (parts.length === 2) {
            return `${parts[0]}/upload/w_${width},q_auto/${parts[1]}`;
          }
        }
        
        return urlObj.toString();
      }
      
      return url;
    } catch (error) {
      console.error('Error optimizing image URL:', error);
      return url;
    }
  }, [isMobile, enableImageOptimization]);
  
  return {
    isMobile,
    networkStatus,
    isOfflineAvailable,
    offlineItems,
    saveForOffline,
    getOfflineItem,
    removeOfflineItem,
    getOptimizedImageUrl,
    useTouchControls: isMobile && enableTouchControls,
    shouldPreload: enablePreloading && networkStatus === 'online'
  };
};
