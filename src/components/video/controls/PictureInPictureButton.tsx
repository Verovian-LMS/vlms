
import React from "react";
import { MonitorPlay, MonitorPause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PictureInPictureButtonProps {
  isPictureInPicture: boolean;
  onClick: () => void;
}

const PictureInPictureButton: React.FC<PictureInPictureButtonProps> = ({
  isPictureInPicture,
  onClick,
}) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "text-white",
        isPictureInPicture && "text-blue-400"
      )}
      onClick={onClick}
      title={isPictureInPicture ? "Exit picture-in-picture" : "Enter picture-in-picture"}
    >
      {isPictureInPicture ? (
        <MonitorPause className="w-5 h-5" />
      ) : (
        <MonitorPlay className="w-5 h-5" />
      )}
    </Button>
  );
};

export default PictureInPictureButton;
