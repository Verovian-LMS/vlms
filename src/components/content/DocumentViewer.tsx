
import React, { useState } from 'react';
import { File, Download, ExternalLink, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface DocumentViewerProps {
  src: string;
  title: string;
  allowDownload?: boolean;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ 
  src, 
  title, 
  allowDownload = true 
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const handleLoad = () => {
    setIsLoading(false);
  };
  
  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load document. Please try again later.");
  };
  
  const copyToClipboard = async () => {
    try {
      const response = await fetch(src);
      const text = await response.text();
      
      await navigator.clipboard.writeText(text);
      
      setIsCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Document content copied to clipboard successfully",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy document:', error);
      toast({
        title: "Copy failed",
        description: "Failed to copy document to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="rounded-lg overflow-hidden flex flex-col bg-white border border-slate-200">
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
        <div className="flex items-center">
          <File className="text-blue-600 mr-2" size={20} />
          <h3 className="font-heading font-medium">{title}</h3>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={copyToClipboard}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Copy content"
          >
            {isCopied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
            <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Copy'}</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => window.open(src, '_blank')}
            className="text-slate-600 hover:text-slate-900"
            aria-label="Open in new tab"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Open</span>
          </Button>
          
          {allowDownload && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = src;
                link.download = title || 'document.txt';
                link.click();
              }}
              className="text-slate-600 hover:text-slate-900"
              aria-label="Download document"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          )}
        </div>
      </div>

      <div className="relative bg-slate-50 flex-grow">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <Skeleton className="h-8 w-12 mb-4" />
            <p className="text-sm text-slate-500">Loading document...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-50 p-4 rounded-lg text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <Button 
                variant="outline" 
                className="mt-3" 
                onClick={() => window.open(src, '_blank')}
              >
                Open Externally
              </Button>
            </div>
          </div>
        )}
        
        <iframe
          src={src}
          className="w-full h-[600px] md:h-[700px]"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          aria-label={`Document: ${title}`}
        />
      </div>
    </div>
  );
};

export default DocumentViewer;
