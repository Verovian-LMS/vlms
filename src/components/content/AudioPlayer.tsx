
import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  src: string;
  title: string;
  artist?: string;
  coverImage?: string;
  allowDownload?: boolean;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  artist,
  coverImage,
  allowDownload = true,
  className
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  // Handle audio events
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);
    const handleVolumeChange = () => {
      setVolume(audio.volume);
      setIsMuted(audio.muted);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('volumechange', handleVolumeChange);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('volumechange', handleVolumeChange);
    };
  }, []);

  // Format time to MM:SS
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Play/pause audio
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Error playing audio:', err);
      });
    }
    
    setIsPlaying(!isPlaying);
  };

  // Skip forward/backward
  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime += seconds;
    }
  };

  // Seek to specific time
  const seek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !audioRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  // Change volume
  const changeVolume = (newVolume: number) => {
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      if (newVolume > 0 && audioRef.current.muted) {
        audioRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  return (
    <div className={cn("bg-white rounded-lg shadow-sm border p-4", className)}>
      <audio ref={audioRef} src={src} preload="metadata" />
      
      <div className="flex items-center mb-4">
        {coverImage ? (
          <div className="w-16 h-16 mr-4 rounded overflow-hidden">
            <img 
              src={coverImage} 
              alt={`${title} cover`} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-16 h-16 mr-4 rounded bg-slate-200 flex items-center justify-center">
            <Volume2 className="text-slate-500" size={24} />
          </div>
        )}
        
        <div>
          <h3 className="font-heading font-semibold text-slate-800">{title}</h3>
          {artist && <p className="text-sm text-slate-600 font-exo2">{artist}</p>}
        </div>

        {allowDownload && (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              const link = document.createElement('a');
              link.href = src;
              link.download = title || 'audio';
              link.click();
            }}
            className="ml-auto"
            aria-label="Download audio"
          >
            <Download className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {/* Progress bar */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-medium text-slate-500 w-10 text-right">
            {formatTime(currentTime)}
          </span>
          <Slider 
            value={[currentTime]} 
            max={duration || 100}
            step={0.1}
            onValueChange={([value]) => seek(value)}
            className="flex-1"
          />
          <span className="text-xs font-medium text-slate-500 w-10">
            {formatTime(duration)}
          </span>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => skip(-10)}
              aria-label="Skip backward 10 seconds"
            >
              <SkipBack className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="secondary" 
              size="icon"
              onClick={togglePlay}
              className="h-10 w-10 rounded-full"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 ml-0.5" />
              )}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => skip(10)}
              aria-label="Skip forward 10 seconds"
            >
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleMute}
              aria-label={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
            
            <Slider 
              value={[isMuted ? 0 : volume]} 
              max={1}
              step={0.01}
              onValueChange={([value]) => changeVolume(value)}
              className="w-24"
              aria-label="Volume"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;
