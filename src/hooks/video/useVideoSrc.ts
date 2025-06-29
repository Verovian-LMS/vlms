
import { useEffect, RefObject } from 'react';

export const useVideoSrc = (videoRef: RefObject<HTMLVideoElement>, src?: string | null) => {
  // Update video source when src changes
  useEffect(() => {
    if (!src || !videoRef.current) return;
    
    videoRef.current.src = src;
    videoRef.current.load();
  }, [src, videoRef]);

  // Format time helper
  const formatTime = (time: number) => {
    if (isNaN(time) || time < 0) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return { formatTime };
};
