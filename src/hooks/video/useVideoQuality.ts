
import { useState, useEffect, RefObject } from 'react';

export interface VideoQualityOption {
  src: string;
  label: string;
  quality: string;
}

export const useVideoQuality = (videoRef: RefObject<HTMLVideoElement>, initialSrc?: string | null) => {
  const [qualities, setQualities] = useState<VideoQualityOption[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<string>('720p');
  
  // Initialize qualities
  useEffect(() => {
    if (!initialSrc) return;
    
    // In a real implementation, detect available qualities from source
    // For now, we'll provide some default options
    setQualities([
      { src: initialSrc, label: "1080p HD", quality: "1080p" },
      { src: initialSrc, label: "720p", quality: "720p" },
      { src: initialSrc, label: "480p", quality: "480p" },
      { src: initialSrc, label: "360p", quality: "360p" }
    ]);
  }, [initialSrc]);
  
  const changeQuality = (quality: string) => {
    const selectedOption = qualities.find(q => q.quality === quality);
    if (!selectedOption || !videoRef.current) return;
    
    // Save current time to resume at the same point
    const currentTime = videoRef.current.currentTime;
    const wasPlaying = !videoRef.current.paused;
    
    // Update source
    videoRef.current.src = selectedOption.src;
    videoRef.current.load();
    
    // Restore time and play state
    videoRef.current.addEventListener('loadedmetadata', function onceLoaded() {
      if (!videoRef.current) return;
      videoRef.current.currentTime = currentTime;
      if (wasPlaying) {
        videoRef.current.play().catch(err => console.error('Error playing video after quality change:', err));
      }
      videoRef.current.removeEventListener('loadedmetadata', onceLoaded);
    });
    
    // Update quality state
    setSelectedQuality(quality);
  };
  
  return {
    qualities,
    selectedQuality,
    changeQuality,
    setQualitySources: setQualities
  };
};
