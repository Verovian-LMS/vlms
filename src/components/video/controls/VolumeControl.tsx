
import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onMuteToggle: () => void;
  onVolumeChange: (value: number[]) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onMuteToggle,
  onVolumeChange,
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Button variant="ghost" size="icon" className="text-white" onClick={onMuteToggle}>
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>
      <div className="w-24 hidden sm:block">
        <Slider
          value={[isMuted ? 0 : volume]}
          min={0}
          max={1}
          step={0.01}
          onValueChange={onVolumeChange}
        />
      </div>
    </div>
  );
};

export default VolumeControl;
