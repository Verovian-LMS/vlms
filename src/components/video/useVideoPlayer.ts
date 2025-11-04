import { useState, useEffect, useRef } from 'react';

export interface VideoQualityOption {
  src: string;
  label: string;
  quality: string;
}

interface VideoPlayerHookProps {
  src?: string | null;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
  updateOnSeek?: boolean;
}

interface VideoState {
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

// Making the export compatible with both default and named import styles
const useVideoPlayerHook = ({ src, onProgressUpdate, updateOnSeek }: VideoPlayerHookProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [hideControlsTimeout, setHideControlsTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [qualities, setQualities] = useState<VideoQualityOption[]>([]);
  
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

  // Update video source when src changes
  useEffect(() => {
    if (!src) return;
    if (videoRef.current) {
      videoRef.current.src = src;
      videoRef.current.load();
    }
  }, [src]);

  // Initialize qualities
  useEffect(() => {
    if (!src) return;
    
    // In a real implementation, detect available qualities from source
    // For now, we'll provide some default options
    setQualities([
      { src: src, label: "1080p HD", quality: "1080p" },
      { src: src, label: "720p", quality: "720p" },
      { src: src, label: "480p", quality: "480p" },
      { src: src, label: "360p", quality: "360p" }
    ]);
  }, [src]);

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
  }, [onProgressUpdate]);

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
    const handleSeeked = () => {
      setState(prev => ({ ...prev, seeking: false }));
      // Optionally record progress on seek, even when paused
      const video = videoRef.current;
      if (!video) return;
      if (updateOnSeek && typeof onProgressUpdate === 'function') {
        // Only send when paused to honor the "while paused" requirement
        if (video.paused) {
          const { currentTime, duration } = video;
          onProgressUpdate(currentTime, duration);
        }
      }
    };
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
  }, []);

  // Hide controls after a period of inactivity
  useEffect(() => {
    if (isUserInteracting || state.seeking || !state.isPlaying) {
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
  }, [isUserInteracting, state.seeking, state.isPlaying]);

  // Helper to calculate buffered progress
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

  // Video control functions
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play().catch(err => console.error('Error playing video:', err));
    } else {
      video.pause();
    }
  };

  const seek = (time: number) => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = time;
  };

  const setVolume = (volume: number) => {
    if (!videoRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    videoRef.current.volume = clampedVolume;
    
    // Unmute if setting volume above 0
    if (clampedVolume > 0 && videoRef.current.muted) {
      videoRef.current.muted = false;
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  };

  const toggleFullscreen = () => {
    if (!wrapperRef.current) return;
    
    if (!document.fullscreenElement) {
      wrapperRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen();
    }
  };

  const setPlaybackRate = (rate: number) => {
    if (!videoRef.current) return;
    videoRef.current.playbackRate = rate;
  };

  const togglePictureInPicture = async () => {
    if (!videoRef.current) return;
    
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (error) {
      console.error('Picture-in-Picture error:', error);
    }
  };

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
    setState(prev => ({ ...prev, selectedQuality: quality }));
  };

  const showControls = () => {
    setIsControlsVisible(true);
    
    if (hideControlsTimeout) {
      clearTimeout(hideControlsTimeout);
      setHideControlsTimeout(null);
    }
  };

  const handleUserInteraction = (interacting: boolean) => {
    setIsUserInteracting(interacting);
  };

  return {
    videoRef,
    containerRef: wrapperRef,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    isMuted: state.isMuted,
    isFullscreen: state.isFullscreen,
    isControlsVisible,
    playbackSpeed: state.playbackRate,
    captionsEnabled: false, // This could be implemented in full
    isPictureInPicture: state.isPictureInPicture,
    qualityOptions: qualities,
    currentQuality: state.selectedQuality,
    togglePlay,
    handleVolumeChange: setVolume,
    toggleMute,
    handleSeek: seek,
    skipForward: () => seek(state.currentTime + 10),
    skipBackward: () => seek(Math.max(0, state.currentTime - 10)),
    toggleFullscreen,
    togglePictureInPicture,
    formatTime: (time: number) => {
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    },
    setIsPlaying: (playing: boolean) => {
      if (playing && videoRef.current?.paused) {
        videoRef.current.play().catch(err => console.error('Error playing video:', err));
      } else if (!playing && !videoRef.current?.paused) {
        videoRef.current?.pause();
      }
    },
    setQualitySources: (sources: VideoQualityOption[]) => {
      setQualities(sources);
    },
    changePlaybackSpeed: setPlaybackRate,
    toggleCaptions: () => {
      // This would be implemented for captions functionality
      console.log("Toggle captions called - would implement real functionality here");
    },
    changeVideoQuality: changeQuality
  };
};

// Export both as default and named export for backward compatibility
export default useVideoPlayerHook;
export const useVideoPlayer = useVideoPlayerHook;
