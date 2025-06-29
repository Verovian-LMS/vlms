
import React, { useState } from "react";
import { Gauge } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SpeedControlProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

const SpeedControl: React.FC<SpeedControlProps> = ({ speed, onSpeedChange }) => {
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-white relative">
          <Gauge className="w-5 h-5" />
          <span className="absolute text-[10px] font-bold -bottom-1">{speed}x</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-24">
        {speedOptions.map((option) => (
          <DropdownMenuItem
            key={option}
            className={`text-center ${speed === option ? "bg-slate-100" : ""}`}
            onClick={() => onSpeedChange(option)}
          >
            {option}x
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SpeedControl;
