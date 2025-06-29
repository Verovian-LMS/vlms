
import React from "react";
import { Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlayPauseButtonProps {
  isPlaying: boolean;
  onClick: () => void;
}

const PlayPauseButton: React.FC<PlayPauseButtonProps> = ({ isPlaying, onClick }) => {
  return (
    <Button variant="ghost" size="icon" className="text-white" onClick={onClick}>
      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
    </Button>
  );
};

export default PlayPauseButton;
