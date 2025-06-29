
import React, { useState, useRef } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface HotspotDefinition {
  id: string;
  x: number;
  y: number;
  title: string;
  description: string;
}

interface InteractiveDiagramProps {
  title: string;
  imageUrl: string;
  hotspots: HotspotDefinition[];
  width?: number;
  height?: number;
}

const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  title,
  imageUrl,
  hotspots,
  width = 800,
  height = 600
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<HotspotDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };
  
  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };
  
  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.1 : -0.1;
    setScale(prev => Math.max(0.5, Math.min(prev + delta, 3)));
  };
  
  return (
    <div className="flex flex-col border rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
        <h3 className="font-heading font-medium">{title}</h3>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= 0.5}
            className="h-8 w-8 p-0"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          
          <div className="px-2 text-sm font-medium">
            {Math.round(scale * 100)}%
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= 3}
            className="h-8 w-8 p-0"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 w-8 p-0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className={cn(
          "relative overflow-hidden bg-slate-900 flex-grow",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{ height: `${height}px` }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        ref={containerRef}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
            <div className="w-12 h-12 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
          </div>
        )}
        
        <div
          className="absolute transition-transform duration-100 ease-out"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            onLoad={() => setIsLoading(false)}
            className="max-w-none"
          />
          
          <TooltipProvider>
            {hotspots.map((hotspot) => (
              <Tooltip key={hotspot.id}>
                <TooltipTrigger asChild>
                  <button
                    className="absolute bg-blue-500 rounded-full border-2 border-white w-6 h-6 flex items-center justify-center hover:bg-blue-600 transition-colors text-white shadow-md"
                    style={{
                      left: `${hotspot.x}px`,
                      top: `${hotspot.y}px`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedHotspot(hotspot);
                    }}
                  >
                    <Plus size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{hotspot.title}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      </div>
      
      <Dialog open={!!selectedHotspot} onOpenChange={(open) => {
        if (!open) setSelectedHotspot(null);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedHotspot?.title}</DialogTitle>
            <DialogDescription>
              {selectedHotspot?.description}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button
              variant="outline"
              onClick={() => setSelectedHotspot(null)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InteractiveDiagram;
