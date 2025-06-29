
import React, { useState, useRef } from 'react';
import { Maximize2, Minimize2, ChevronLeft, ChevronRight, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface SlidesViewerProps {
  src: string;
  title: string;
  slideCount?: number;
  allowDownload?: boolean;
}

const SlidesViewer: React.FC<SlidesViewerProps> = ({ 
  src, 
  title, 
  slideCount: initialSlideCount = 10,
  allowDownload = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [slideCount, setSlideCount] = useState(initialSlideCount);
  const [currentSlide, setCurrentSlide] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const nextSlide = () => {
    if (currentSlide < slideCount) {
      setCurrentSlide(currentSlide + 1);
    }
  };
  
  const prevSlide = () => {
    if (currentSlide > 1) {
      setCurrentSlide(currentSlide - 1);
    }
  };
  
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
          .then(() => setIsFullscreen(true))
          .catch(err => {
            toast({
              title: "Fullscreen Error",
              description: `Error entering fullscreen mode: ${err.message}`,
              variant: "destructive"
            });
          });
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
          .then(() => setIsFullscreen(false))
          .catch(err => {
            toast({
              title: "Fullscreen Error",
              description: `Error exiting fullscreen mode: ${err.message}`,
              variant: "destructive"
            });
          });
      }
    }
  };
  
  // Listen for fullscreen change events
  React.useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);
  
  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        document.exitFullscreen().catch(console.error);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, slideCount, isFullscreen]);

  return (
    <div 
      ref={containerRef} 
      className={`rounded-lg overflow-hidden flex flex-col bg-white ${
        isFullscreen ? 'fixed inset-0 z-50' : ''
      }`}
    >
      <div className="p-3 bg-slate-100 border-b flex items-center justify-between">
        <div className="flex items-center">
          <h3 className="font-heading font-medium text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs">
            {title}
          </h3>
        </div>
        <div className="flex space-x-2">
          {allowDownload && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = src;
                link.download = title || 'slides';
                link.click();
              }}
              className="text-slate-600 hover:text-slate-900"
              aria-label="Download slides"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Download</span>
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleFullscreen}
            className="text-slate-600 hover:text-slate-900"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <div className="relative bg-slate-100 flex-grow">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <Skeleton className="h-72 w-full max-w-lg" />
          </div>
        )}
        
        <iframe
          src={`${src}#page=${currentSlide}`}
          className="w-full h-[400px] md:h-[500px] lg:h-[600px]"
          onLoad={handleLoad}
          title={`${title} - Slide ${currentSlide}`}
          aria-label={`Slide ${currentSlide} of ${slideCount} from ${title}`}
        />
        
        <div className="absolute top-1/2 left-4 transform -translate-y-1/2">
          <Button 
            variant="secondary" 
            size="icon"
            onClick={prevSlide}
            disabled={currentSlide <= 1}
            className="opacity-70 hover:opacity-100"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
          <Button 
            variant="secondary" 
            size="icon"
            onClick={nextSlide}
            disabled={currentSlide >= slideCount}
            className="opacity-70 hover:opacity-100"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white p-3 border-t flex items-center justify-center">
        <span className="text-sm font-medium">
          Slide {currentSlide} of {slideCount}
        </span>
      </div>
    </div>
  );
};

export default SlidesViewer;
