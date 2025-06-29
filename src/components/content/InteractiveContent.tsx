
import React, { useState, useEffect } from 'react';
import { Sparkles, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface InteractiveContentProps {
  src: string;
  lectureId: string;
  title: string;
}

const InteractiveContent: React.FC<InteractiveContentProps> = ({
  src,
  lectureId,
  title
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Track user progress with interactive content
  useEffect(() => {
    const trackProgress = () => {
      // This would be connected to your progress tracking system
      console.log(`User interacting with interactive content: ${lectureId}`);
    };
    
    const interval = setInterval(trackProgress, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [lectureId]);
  
  const handleLoad = () => {
    setIsLoading(false);
    toast({
      title: "Interactive content loaded",
      description: "You can now interact with this content",
    });
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load interactive content. Please try again later.");
  };
  
  // Communication with the iframe for interactive content
  const handleMessage = (event: MessageEvent) => {
    // Make sure the message is from the expected source
    if (new URL(src).origin !== event.origin) return;
    
    const { type, data } = event.data;
    
    switch (type) {
      case 'progress':
        console.log(`Interactive content progress: ${data.progress}%`);
        break;
      case 'completed':
        toast({
          title: "Activity completed",
          description: "Great job! You've completed this interactive activity.",
        });
        break;
      case 'error':
        setError(`Error in interactive content: ${data.message}`);
        break;
    }
  };
  
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [src]);

  return (
    <div className="rounded-lg overflow-hidden flex flex-col bg-white border border-slate-200">
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b flex items-center justify-between">
        <div className="flex items-center">
          <Sparkles className="text-indigo-600 mr-2" size={20} />
          <h3 className="font-heading font-medium">{title}</h3>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.open(src, '_blank')}
          className="text-slate-600 hover:text-slate-900"
          aria-label="Open in new tab"
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline">Open Fullscreen</span>
        </Button>
      </div>

      <div className="relative bg-slate-50">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-t-indigo-500 border-r-transparent border-b-indigo-300 border-l-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-slate-500">Loading interactive content...</p>
          </div>
        )}
        
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <iframe
          src={src}
          className="w-full h-[700px]"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          allow="accelerometer; camera; microphone; clipboard-read; clipboard-write;"
          aria-label={`Interactive content: ${title}`}
        />
      </div>
    </div>
  );
};

export default InteractiveContent;
