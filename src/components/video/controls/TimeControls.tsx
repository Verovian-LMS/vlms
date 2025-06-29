
import React from "react";
import { SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimeControlsProps {
  onSkipBackward: () => void;
  onSkipForward: () => void;
}

const TimeControls: React.FC<TimeControlsProps> = ({
  onSkipBackward,
  onSkipForward,
}) => {
  return (
    <>
      <Button variant="ghost" size="icon" className="text-white" onClick={onSkipBackward}>
        <SkipBack className="w-5 h-5" />
      </Button>
      <Button variant="ghost" size="icon" className="text-white" onClick={onSkipForward}>
        <SkipForward className="w-5 h-5" />
      </Button>
    </>
  );
};

export default TimeControls;
