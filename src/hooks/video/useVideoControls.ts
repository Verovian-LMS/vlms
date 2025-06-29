
import { RefObject } from 'react';

export const useVideoControls = (videoRef: RefObject<HTMLVideoElement>, wrapperRef: RefObject<HTMLDivElement>) => {
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

  const setIsPlaying = (playing: boolean) => {
    if (playing && videoRef.current?.paused) {
      videoRef.current.play().catch(err => console.error('Error playing video:', err));
    } else if (!playing && !videoRef.current?.paused) {
      videoRef.current?.pause();
    }
  };

  return {
    togglePlay,
    seek,
    setVolume,
    toggleMute,
    toggleFullscreen,
    setPlaybackRate,
    togglePictureInPicture,
    setIsPlaying,
    skipForward: () => {
      if (videoRef.current) {
        seek(videoRef.current.currentTime + 10);
      }
    },
    skipBackward: () => {
      if (videoRef.current) {
        seek(Math.max(0, videoRef.current.currentTime - 10));
      }
    }
  };
};
