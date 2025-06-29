
import { useState, useRef } from 'react';
import { VideoQualityOption, useVideoQuality } from './useVideoQuality';
import { useVideoEvents, VideoState } from './useVideoEvents';
import { useVideoControls } from './useVideoControls';
import { useControlsVisibility } from './useControlsVisibility';
import { useVideoSrc } from './useVideoSrc';

export interface VideoPlayerHookProps {
  src?: string | null;
  onProgressUpdate?: (currentTime: number, duration: number) => void;
}

const useVideoPlayerHook = ({ src, onProgressUpdate }: VideoPlayerHookProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  // Use our extracted hooks
  const { state } = useVideoEvents(videoRef, containerRef, onProgressUpdate);
  const controls = useVideoControls(videoRef, containerRef);
  const { qualities, selectedQuality, changeQuality, setQualitySources } = useVideoQuality(videoRef, src);
  const { isControlsVisible, showControls, handleUserInteraction } = useControlsVisibility(
    state.isPlaying,
    state.seeking
  );
  const { formatTime } = useVideoSrc(videoRef, src);

  return {
    videoRef,
    containerRef,
    isPlaying: state.isPlaying,
    currentTime: state.currentTime,
    duration: state.duration,
    volume: state.volume,
    isMuted: state.isMuted,
    isFullscreen: state.isFullscreen,
    playbackSpeed: state.playbackRate,
    captionsEnabled: false, // To be implemented
    isPictureInPicture: state.isPictureInPicture,
    qualityOptions: qualities,
    currentQuality: selectedQuality,
    isControlsVisible,
    ...controls,
    formatTime,
    changeVideoQuality: changeQuality,
    setQualitySources,
    toggleCaptions: () => {
      // This would be implemented for captions functionality
      console.log("Toggle captions called - would implement real functionality here");
    },
  };
};

// Export both as default and named export for backward compatibility
export default useVideoPlayerHook;
export const useVideoPlayer = useVideoPlayerHook;
export type { VideoQualityOption };
