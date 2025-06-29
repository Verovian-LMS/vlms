
import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VideoQualityOption } from "../useVideoPlayer";

interface QualityControlProps {
  options: VideoQualityOption[];
  currentQuality: string;
  onQualityChange: (quality: string) => void;
}

const QualityControl: React.FC<QualityControlProps> = ({
  options,
  currentQuality,
  onQualityChange,
}) => {
  if (options.length === 0) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white relative">
          <Settings className="w-5 h-5" />
          <span className="absolute text-[10px] font-bold -bottom-1">{currentQuality}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-32">
        <div className="py-1 px-2 text-xs font-semibold text-slate-500 border-b">
          Quality
        </div>
        {options.map((option) => (
          <DropdownMenuItem
            key={option.quality}
            className={`text-center ${currentQuality === option.quality ? "bg-slate-100" : ""}`}
            onClick={() => onQualityChange(option.quality)}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default QualityControl;
