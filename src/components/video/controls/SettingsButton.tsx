
import React from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SettingsButtonProps {
  onClick?: () => void;
}

const SettingsButton: React.FC<SettingsButtonProps> = ({ onClick }) => {
  return (
    <Button variant="ghost" size="icon" className="text-white" onClick={onClick}>
      <Settings className="w-5 h-5" />
    </Button>
  );
};

export default SettingsButton;
