
import React from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressIndicatorProps {
  progress: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showPercentage?: boolean;
  color?: "default" | "success" | "warning" | "error";
  label?: string;
}

const ProgressIndicator = ({
  progress,
  size = "md",
  className,
  showPercentage = true,
  color = "default",
  label,
}: ProgressIndicatorProps) => {
  const heightClass = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };
  
  const colorClass = {
    default: "bg-medblue-600",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500",
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      {label && (
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(progress)}%</span>}
        </div>
      )}
      <Progress 
        value={progress} 
        className={cn(heightClass[size])} 
        indicatorClassName={colorClass[color]}
      />
      {!label && showPercentage && (
        <p className="text-xs text-right text-gray-500">{Math.round(progress)}%</p>
      )}
    </div>
  );
};

export { ProgressIndicator };
