
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { useVideoPlayer } from "./useVideoPlayer"; 
import VideoControls from "./VideoControls";
import { Play } from "lucide-react";

interface VideoPlayerProps {
  src?: string;
  title: string;
  poster?: string;
  captions?: { src: string; label: string; language: string }[];
  qualities?: { label: string; src: string; quality: string }[];
  onProgressUpdate?: (currentTime: number, duration: number) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  title,
  poster,
  captions,
  qualities,
  onProgressUpdate
}) => {
  // Remove default sample video
  const [videoAnalytics, setVideoAnalytics] = useState({
    started: false,
    playCount: 0,
    pauseCount: 0,
    seekCount: 0,
    completedCount: 0,
    watchTimeSeconds: 0
  });
  
  const {
    videoRef,
    containerRef,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isControlsVisible,
    playbackSpeed,
    captionsEnabled,
    isPictureInPicture,
    qualityOptions,
    currentQuality,
    togglePlay,
    toggleMute,
    handleVolumeChange,
    handleSeek,
    skipForward,
    skipBackward,
    toggleFullscreen,
    togglePictureInPicture,
    formatTime,
    setIsPlaying,
    setQualitySources,
    changePlaybackSpeed,
    toggleCaptions,
    changeVideoQuality
  } = useVideoPlayer({ onProgressUpdate });

  // Initialize quality options
  useEffect(() => {
    if (qualities && qualities.length > 0) {
      setQualitySources(qualities);
    } else if (src) {
      // If no qualities provided but we have a source, set it as default
      setQualitySources([
        { label: "Auto", src: src, quality: "auto" }
      ]);
    }
  }, [qualities, src, setQualitySources]);

  // Track analytics
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    
    const trackEvent = (eventType: string) => {
      // This would typically send data to an analytics service
      console.log(`Video analytics: ${eventType}`, {
        title,
        currentTime: video.currentTime,
        duration: video.duration
      });
      
      // Update local analytics state
      setVideoAnalytics(prev => {
        const newState = { ...prev };
        
        if (eventType === 'play') {
          if (!prev.started) newState.started = true;
          newState.playCount++;
        } else if (eventType === 'pause') {
          newState.pauseCount++;
        } else if (eventType === 'seek') {
          newState.seekCount++;
        } else if (eventType === 'ended') {
          newState.completedCount++;
        }
        
        return newState;
      });
    };
    
    // Track watch time in 15-second intervals
    const watchTimeInterval = setInterval(() => {
      if (isPlaying) {
        setVideoAnalytics(prev => ({
          ...prev,
          watchTimeSeconds: prev.watchTimeSeconds + 15
        }));
      }
    }, 15000);
    
    const handlePlay = () => trackEvent('play');
    const handlePause = () => trackEvent('pause');
    const handleSeek = () => trackEvent('seek');
    const handleEnded = () => trackEvent('ended');
    
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeked', handleSeek);
    video.addEventListener('ended', handleEnded);
    
    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeked', handleSeek);
      video.removeEventListener('ended', handleEnded);
      clearInterval(watchTimeInterval);
      
      // Log final analytics when component unmounts
      console.log('Final video analytics:', {
        ...videoAnalytics,
        title,
        src
      });
    };
  }, [title, src, isPlaying, videoRef]);

  const addBookmark = useCallback(() => {
    const currentTimeFormatted = formatTime(currentTime);
    toast({
      title: "Bookmark Added",
      description: `Timestamp ${currentTimeFormatted} has been bookmarked.`,
    });
  }, [currentTime, formatTime]);

  const handleDoubleClick = useCallback(() => {
    addBookmark();
  }, [addBookmark]);
  
  // Show message if no video source is provided
  if (!src) {
    return (
      <div 
        className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg flex items-center justify-center"
      >
        <div className="text-center text-white p-6">
          <Play className="w-16 h-16 mx-auto mb-4 opacity-20" />
          <h3 className="text-xl font-medium">No video available</h3>
          <p className="text-sm text-gray-400 mt-2">This lecture doesn't have a video resource</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="relative bg-black rounded-xl overflow-hidden aspect-video shadow-lg"
      onDoubleClick={handleDoubleClick}
    >
      <video 
        ref={videoRef}
        className="w-full h-full object-contain"
        poster={poster || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&h=675&q=80'}
        onClick={togglePlay}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        {src && <source src={src} type="video/mp4" />}
        
        {/* Add caption tracks if available */}
        {captions && captions.map((caption, index) => (
          <track 
            key={index}
            kind="subtitles"
            src={caption.src}
            label={caption.label}
            srcLang={caption.language}
            default={index === 0}
          />
        ))}
        
        Your browser does not support the video tag.
      </video>
      
      <VideoControls 
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        isMuted={isMuted}
        isFullscreen={isFullscreen}
        isControlsVisible={isControlsVisible}
        playbackSpeed={playbackSpeed}
        captionsEnabled={captionsEnabled}
        isPictureInPicture={isPictureInPicture}
        qualityOptions={qualityOptions}
        currentQuality={currentQuality}
        onPlayPause={togglePlay}
        onVolumeChange={(value) => handleVolumeChange(value[0])}
        onMuteToggle={toggleMute}
        onSeek={(value) => handleSeek(value[0])}
        onSkipForward={skipForward}
        onSkipBackward={skipBackward}
        onFullscreenToggle={toggleFullscreen}
        onPictureInPictureToggle={togglePictureInPicture}
        onBookmark={addBookmark}
        onSpeedChange={changePlaybackSpeed}
        onCaptionsToggle={toggleCaptions}
        onQualityChange={changeVideoQuality}
      />
    </div>
  );
};

export default VideoPlayer;
