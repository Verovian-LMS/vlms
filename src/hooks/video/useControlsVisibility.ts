
import { useState, useEffect, useCallback } from 'react';

export const useControlsVisibility = (isPlaying: boolean, seeking: boolean) => {
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [hideControlsTimeout, setHideControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const showControls = useCallback(() => {
    setIsControlsVisible(true);
    
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
      setHideControlsTimeout(null);
    }
  }, [hideControlsTimeout]);

  const handleUserInteraction = useCallback((interacting: boolean) => {
    setIsUserInteracting(interacting);
  }, []);

  // Hide controls after a period of inactivity
  useEffect(() => {
    if (isUserInteracting || seeking || !isPlaying) {
      showControls();
      return;
    }
    
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
    }
    
    const timeout = setTimeout(() => {
      setIsControlsVisible(false);
    }, 3000);
    
    setHideControlsTimeout(timeout);
    
    return () => {
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
      }
    };
  }, [isUserInteracting, seeking, isPlaying, showControls, hideControlsTimeout]);

  return {
    isControlsVisible,
    showControls,
    handleUserInteraction
  };
};
