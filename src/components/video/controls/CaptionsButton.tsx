
import React from "react";
import { Subtitles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CaptionsButtonProps {
  enabled: boolean;
  onClick: () => void;
}

const CaptionsButton: React.FC<CaptionsButtonProps> = ({ enabled, onClick }) => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className={cn(
        "text-white",
        enabled && "text-blue-400"
      )} 
      onClick={onClick}
      title={enabled ? "Disable captions" : "Enable captions"}
    >
      <Subtitles className="w-5 h-5" />
    </Button>
  );
};

export default CaptionsButton;
