
import { useState, useEffect, RefObject } from 'react';

export interface VideoState {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  playbackRate: number;
  buffered: number;
  seeking: boolean;
  isPictureInPicture: boolean;
  selectedQuality: string;
}

export const useVideoEvents = (
  videoRef: RefObject<HTMLVideoElement>,
  wrapperRef: RefObject<HTMLDivElement>,
  onProgressUpdate?: (currentTime: number, duration: number) => void
) => {
  const [state, setState] = useState<VideoState>({
    isPlaying: false,
    progress: 0,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isFullscreen: false,
    playbackRate: 1,
    buffered: 0,
    seeking: false,
    isPictureInPicture: false,
    selectedQuality: '720p',
  });

  // Calculate buffered progress
  const calculateBufferedProgress = (): number => {
    if (!videoRef.current) return 0;
    
    const { buffered, duration, currentTime } = videoRef.current;
    if (!duration) return 0;
    
    // Find the buffered range that contains the current time
    for (let i = 0; i < buffered.length; i++) {
      if (buffered.start(i) <= currentTime && currentTime <= buffered.end(i)) {
        return (buffered.end(i) / duration) * 100;
      }
    }
    
    return 0;
  };

  // Handle progress updates
  useEffect(() => {
    const updateProgress = () => {
      if (!videoRef.current) return;
      
      const { currentTime, duration } = videoRef.current;
      const progress = duration ? (currentTime / duration) * 100 : 0;
      
      setState(prev => ({
        ...prev,
        currentTime,
        progress,
        buffered: calculateBufferedProgress()
      }));
      
      if (onProgressUpdate) {
        onProgressUpdate(currentTime, duration);
      }
    };
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', updateProgress);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', updateProgress);
      }
    };
  }, [onProgressUpdate, videoRef]);

  // Handle other video events
  useEffect(() => {
    const handlePlay = () => setState(prev => ({ ...prev, isPlaying: true }));
    const handlePause = () => setState(prev => ({ ...prev, isPlaying: false }));
    const handleDurationChange = () => {
      if (!videoRef.current) return;
      setState(prev => ({ ...prev, duration: videoRef.current?.duration || 0 }));
    };
    const handleVolumeChange = () => {
      if (!videoRef.current) return;
      setState(prev => ({ 
        ...prev, 
        volume: videoRef.current?.volume || 1,
        isMuted: videoRef.current?.muted || false
      }));
    };
    const handleRateChange = () => {
      if (!videoRef.current) return;
      setState(prev => ({ ...prev, playbackRate: videoRef.current?.playbackRate || 1 }));
    };
    const handleSeeking = () => setState(prev => ({ ...prev, seeking: true }));
    const handleSeeked = () => setState(prev => ({ ...prev, seeking: false }));
    const handleEnterPiP = () => setState(prev => ({ ...prev, isPictureInPicture: true }));
    const handleExitPiP = () => setState(prev => ({ ...prev, isPictureInPicture: false }));
    
    const handleFullscreenChange = () => {
      const isFullscreen = document.fullscreenElement !== null;
      setState(prev => ({ ...prev, isFullscreen }));
    };
    
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('play', handlePlay);
      videoElement.addEventListener('pause', handlePause);
      videoElement.addEventListener('durationchange', handleDurationChange);
      videoElement.addEventListener('volumechange', handleVolumeChange);
      videoElement.addEventListener('ratechange', handleRateChange);
      videoElement.addEventListener('seeking', handleSeeking);
      videoElement.addEventListener('seeked', handleSeeked);
      videoElement.addEventListener('enterpictureinpicture', handleEnterPiP);
      videoElement.addEventListener('leavepictureinpicture', handleExitPiP);
      
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    }
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
        videoElement.removeEventListener('durationchange', handleDurationChange);
        videoElement.removeEventListener('volumechange', handleVolumeChange);
        videoElement.removeEventListener('ratechange', handleRateChange);
        videoElement.removeEventListener('seeking', handleSeeking);
        videoElement.removeEventListener('seeked', handleSeeked);
        videoElement.removeEventListener('enterpictureinpicture', handleEnterPiP);
        videoElement.removeEventListener('leavepictureinpicture', handleExitPiP);
      }
      
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [videoRef]);

  return { state };
};
