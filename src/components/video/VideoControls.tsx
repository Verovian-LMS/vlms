
import React from "react";
import { cn } from "@/lib/utils";
import { Play, Keyboard } from "lucide-react";
import PlayPauseButton from "./controls/PlayPauseButton";
import VolumeControl from "./controls/VolumeControl";
import TimeControls from "./controls/TimeControls";
import FullscreenButton from "./controls/FullscreenButton";
import BookmarkButton from "./controls/BookmarkButton";
import ProgressBar from "./controls/ProgressBar";
import SpeedControl from "./controls/SpeedControl";
import CaptionsButton from "./controls/CaptionsButton";
import PictureInPictureButton from "./controls/PictureInPictureButton";
import QualityControl from "./controls/QualityControl";
import { VideoQualityOption } from "./useVideoPlayer";
import { Button } from "@/components/ui/button";

interface VideoControlsProps {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isControlsVisible: boolean;
  playbackSpeed: number;
  captionsEnabled: boolean;
  isPictureInPicture: boolean;
  qualityOptions: VideoQualityOption[];
  currentQuality: string;
  onPlayPause: () => void;
  onVolumeChange: (value: number[]) => void;
  onMuteToggle: () => void;
  onSeek: (value: number[]) => void;
  onSkipForward: () => void;
  onSkipBackward: () => void;
  onFullscreenToggle: () => void;
  onPictureInPictureToggle: () => void;
  onBookmark: () => void;
  onSpeedChange: (speed: number) => void;
  onCaptionsToggle: () => void;
  onQualityChange: (quality: string) => void;
}

const VideoControls: React.FC<VideoControlsProps> = ({
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
  onPlayPause,
  onVolumeChange,
  onMuteToggle,
  onSeek,
  onSkipForward,
  onSkipBackward,
  onFullscreenToggle,
  onPictureInPictureToggle,
  onBookmark,
  onSpeedChange,
  onCaptionsToggle,
  onQualityChange,
}) => {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = React.useState(false);

  return (
    <>
      {/* Video Title */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/70 to-transparent transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <h2 className="text-white text-lg font-medium">{""}</h2>
      </div>

      {/* Keyboard Shortcuts Overlay */}
      {showKeyboardShortcuts && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20" onClick={() => setShowKeyboardShortcuts(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 font-nunito-sans">Keyboard Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3 text-sm font-exo2">
              <div className="font-medium">Space</div><div>Play/Pause</div>
              <div className="font-medium">Left Arrow</div><div>Rewind 10s</div>
              <div className="font-medium">Right Arrow</div><div>Forward 10s</div>
              <div className="font-medium">Up Arrow</div><div>Volume Up</div>
              <div className="font-medium">Down Arrow</div><div>Volume Down</div>
              <div className="font-medium">M</div><div>Mute/Unmute</div>
              <div className="font-medium">F</div><div>Fullscreen</div>
              <div className="font-medium">C</div><div>Toggle Captions</div>
              <div className="font-medium">P</div><div>Picture-in-Picture</div>
            </div>
            <Button variant="outline" className="w-full mt-4" onClick={() => setShowKeyboardShortcuts(false)}>Close</Button>
          </div>
        </div>
      )}

      {/* Video Controls */}
      <div 
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 transition-opacity duration-300",
          isControlsVisible ? "opacity-100" : "opacity-0"
        )}
      >
        <div className="flex flex-col space-y-2">
          <ProgressBar 
            currentTime={currentTime} 
            duration={duration} 
            onSeek={onSeek} 
          />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <PlayPauseButton 
                isPlaying={isPlaying} 
                onClick={onPlayPause} 
              />
              <TimeControls 
                onSkipBackward={onSkipBackward} 
                onSkipForward={onSkipForward} 
              />
              <VolumeControl 
                volume={volume} 
                isMuted={isMuted} 
                onMuteToggle={onMuteToggle} 
                onVolumeChange={onVolumeChange} 
              />
            </div>
            
            <div className="flex items-center space-x-1">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => setShowKeyboardShortcuts(true)}
                title="Keyboard shortcuts"
              >
                <Keyboard className="w-5 h-5" />
              </Button>
              <BookmarkButton onClick={onBookmark} />
              <CaptionsButton 
                enabled={captionsEnabled}
                onClick={onCaptionsToggle}
              />
              {document.pictureInPictureEnabled && (
                <PictureInPictureButton 
                  isPictureInPicture={isPictureInPicture}
                  onClick={onPictureInPictureToggle}
                />
              )}
              <SpeedControl 
                speed={playbackSpeed} 
                onSpeedChange={onSpeedChange} 
              />
              {qualityOptions.length > 0 && (
                <QualityControl
                  options={qualityOptions}
                  currentQuality={currentQuality}
                  onQualityChange={onQualityChange}
                />
              )}
              <FullscreenButton 
                isFullscreen={isFullscreen} 
                onClick={onFullscreenToggle} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Play/Pause Overlay - allow controls to remain clickable when paused */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 pointer-events-none">
          <button 
            className="w-16 h-16 rounded-full bg-white/20 text-white hover:bg-white/30 hover:scale-110 transition-all flex items-center justify-center pointer-events-auto"
            onClick={onPlayPause}
          >
            <Play className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
};

export default VideoControls;
