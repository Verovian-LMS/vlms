
import React from "react";
import { Slider } from "@/components/ui/slider";

interface ProgressBarProps {
  currentTime: number;
  duration: number;
  onSeek: (value: number[]) => void;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentTime, duration, onSeek }) => {
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div className="flex items-center space-x-2">
      <div className="text-white text-sm">{formatTime(currentTime)}</div>
      <div className="flex-grow">
        <Slider
          value={[currentTime]}
          min={0}
          max={duration || 100}
          step={1}
          onValueChange={onSeek}
          className="cursor-pointer"
        />
      </div>
      <div className="text-white text-sm">{formatTime(duration)}</div>
    </div>
  );
};

export default ProgressBar;
