
import React from "react";
import { Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenButtonProps {
  isFullscreen: boolean;
  onClick: () => void;
}

const FullscreenButton: React.FC<FullscreenButtonProps> = ({ isFullscreen, onClick }) => {
  return (
    <Button variant="ghost" size="icon" className="text-white" onClick={onClick}>
      {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
    </Button>
  );
};

export default FullscreenButton;
