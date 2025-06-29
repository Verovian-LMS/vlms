
import React, { useState } from 'react';
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

interface PDFViewerProps {
  src: string;
  title: string;
  allowDownload?: boolean;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ src, title, allowDownload = true }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleLoad = () => {
    setIsLoading(false);
    // In a real implementation, we would get the page count from the PDF
    setPageCount(10);
    setLoadingProgress(100);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load PDF document. Please try again later.");
  };

  const nextPage = () => {
    if (currentPage < pageCount) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="rounded-lg overflow-hidden flex flex-col bg-white">
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="text-blue-600 mr-2" size={20} />
          <h3 className="font-heading font-medium">{title}</h3>
        </div>
        {allowDownload && (
          <div className="flex space-x-2">
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const link = document.createElement('a');
                link.href = src;
                link.download = title || 'document.pdf';
                link.click();
              }}
              className="text-slate-600 hover:text-slate-900"
              aria-label="Download PDF"
            >
              <Download className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Download</span>
            </Button>
          </div>
        )}
      </div>

      <div className="relative bg-slate-100 flex-grow overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50">
            <Skeleton className="h-8 w-12 mb-4" />
            <Progress value={loadingProgress} className="w-48 mb-2" />
            <p className="text-sm text-slate-500">Loading PDF...</p>
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
          src={`${src}#page=${currentPage}`}
          className="w-full h-[600px] md:h-[700px]"
          onLoad={handleLoad}
          onError={handleError}
          title={title}
          aria-label={`PDF document: ${title}`}
        />
      </div>
      
      {pageCount > 0 && (
        <div className="bg-white p-3 border-t flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={prevPage}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          
          <span className="text-sm">
            Page {currentPage} of {pageCount}
          </span>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextPage}
            disabled={currentPage >= pageCount}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
