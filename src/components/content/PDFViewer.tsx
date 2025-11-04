
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FileText, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf';
// Vite-friendly way to set workerSrc
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { checkContentHeaders } from '@/lib/content-headers';

interface PDFViewerProps {
  src: string;
  title: string;
  allowDownload?: boolean;
  onProgressUpdate?: (currentPage: number, pageCount: number) => void;
  markCompleteOnLoad?: boolean; // optional: mark 100% on load
}

const PDFViewer: React.FC<PDFViewerProps> = ({ src, title, allowDownload = true, onProgressUpdate, markCompleteOnLoad = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [pageCount, setPageCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [headerWarning, setHeaderWarning] = useState<string | null>(null);
  const [scale, setScale] = useState<number>(1.0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const [thumbnailUrls, setThumbnailUrls] = useState<(string | undefined)[]>([]);
  const thumbsContainerRef = useRef<HTMLDivElement | null>(null);
  const THUMB_CACHE_CAPACITY = 64;
  const thumbCacheRef = useRef<Map<number, string>>(new Map());
  const visibleThumbsRef = useRef<Set<number>>(new Set());

  // Backend base used to rewrite absolute URLs to same-origin paths
  const API_BASE_URL = 'http://localhost:8000';

  // Normalize to a same-origin URL so Vite dev proxy can forward to backend
  const effectiveSrc = useMemo(() => {
    try {
      if (!src) return src;
      // If already relative or same-origin (no scheme), keep as-is
      if (!/^https?:\/\//i.test(src)) return src;
      // If pointing to backend origin, strip the origin to rely on dev proxy
      if (src.startsWith(API_BASE_URL)) {
        const path = src.replace(API_BASE_URL, '');
        return path.startsWith('/') ? path : `/${path}`;
      }
      return src;
    } catch {
      return src;
    }
  }, [src]);

  // Quick header check to verify content-type and disposition
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      try {
        const info = await checkContentHeaders(effectiveSrc);
        if (cancelled) return;
        const ct = (info.contentType || '').toLowerCase();
        const cd = (info.contentDisposition || '').toLowerCase();
        const notPdf = ct && !ct.includes('application/pdf');
        const forcedDownload = cd && cd.includes('attachment');
        if (notPdf || forcedDownload) {
          setHeaderWarning(
            notPdf
              ? `Resource served as ${ct || 'unknown type'}; inline preview may not work.`
              : 'Server requests download (Content-Disposition: attachment); inline preview may be limited.'
          );
        } else {
          setHeaderWarning(null);
        }
      } catch {
        // Non-blocking; ignore
      }
    };
    run();
    return () => { cancelled = true; };
  }, [effectiveSrc]);

  // Configure PDF.js worker
  useEffect(() => {
    try {
      GlobalWorkerOptions.workerSrc = pdfjsWorker as string;
    } catch {}
  }, []);

  // Load PDF to get real page count
  useEffect(() => {
    let canceled = false;
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setLoadingProgress(10);
        const task = getDocument({ url: effectiveSrc });
        const pdf = await task.promise;
        if (canceled) return;
        setPageCount(pdf.numPages || 0);
        setPdfDoc(pdf);
        // Initialize sparse thumbnails cache sized to page count
        const num = pdf.numPages || 0;
        setThumbnailUrls(Array.from({ length: num }, () => undefined));
        try {
          await renderPage(pdf, 1, scale);
        } catch {}
        setLoadingProgress(100);
        setIsLoading(false);
        // Emit initial progress: either first page, or full complete if configured
        if (typeof onProgressUpdate === 'function') {
          const initialPage = markCompleteOnLoad ? pdf.numPages : 1;
          const totalPages = pdf.numPages || 1;
          try { onProgressUpdate(initialPage, totalPages); } catch {}
        }
      } catch (e) {
        console.error('Failed to load PDF via pdfjs:', e);
        if (canceled) return;
        setIsLoading(false);
        setError('Failed to load PDF document. Please try again later.');
      }
    };
    loadPdf();
    return () => { canceled = true; };
  }, [effectiveSrc, onProgressUpdate, markCompleteOnLoad]);

  // When showing thumbnails, ensure array is sized; when hiding, clear caches to free memory
  useEffect(() => {
    if (showThumbnails) {
      if (pageCount > 0 && thumbnailUrls.length !== pageCount) {
        setThumbnailUrls(Array.from({ length: pageCount }, () => undefined));
      }
    } else {
      thumbCacheRef.current.clear();
      visibleThumbsRef.current.clear();
      setThumbnailUrls([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showThumbnails]);

  // Render the specified page to canvas
  const renderPage = async (pdf: any, pageNumber: number, renderScale: number) => {
    try {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: renderScale });
      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');
      if (!context) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const renderContext = { canvasContext: context, viewport } as any;
      await page.render(renderContext).promise;
    } catch (e) {
      console.error('Failed to render PDF page:', e);
    }
  };

  // Re-render on page or zoom changes
  useEffect(() => {
    if (pdfDoc) {
      renderPage(pdfDoc, currentPage, scale);
    }
  }, [pdfDoc, currentPage, scale]);

  const handleLoad = () => {
    // iframe loaded; pdfjs handles real pageCount and progress emission
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError("Failed to load PDF document. Please try again later.");
  };

  const nextPage = () => {
    if (pageCount > 0 && currentPage < pageCount) {
      const next = currentPage + 1;
      setCurrentPage(next);
      if (typeof onProgressUpdate === 'function') {
        try { onProgressUpdate(next, pageCount); } catch {}
      }
    }
  };

  const prevPage = () => {
    if (pageCount > 0 && currentPage > 1) {
      const prev = currentPage - 1;
      setCurrentPage(prev);
      if (typeof onProgressUpdate === 'function') {
        try { onProgressUpdate(prev, pageCount); } catch {}
      }
    }
  };

  const zoomIn = () => setScale(s => Math.min(3.0, parseFloat((s + 0.1).toFixed(2))));
  const zoomOut = () => setScale(s => Math.max(0.5, parseFloat((s - 0.1).toFixed(2))));
  const resetZoom = () => setScale(1.0);

  // Generate a single thumbnail when it comes into view (lazy)
  const generateThumbnail = useCallback(async (pageNumber: number) => {
    try {
      if (!pdfDoc || pageNumber < 1 || pageNumber > pageCount) return;
      const idx = pageNumber - 1;
      // LRU cache check
      const cache = thumbCacheRef.current;
      if (cache.has(pageNumber)) {
        const existing = cache.get(pageNumber)!;
        cache.delete(pageNumber);
        cache.set(pageNumber, existing);
        if (!thumbnailUrls[idx]) {
          setThumbnailUrls(prev => { const next = [...prev]; next[idx] = existing; return next; });
        }
        return;
      }
      if (thumbnailUrls[idx]) return;
      const page = await pdfDoc.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 0.18 });
      const thumbCanvas = document.createElement('canvas');
      const ctx = thumbCanvas.getContext('2d');
      if (!ctx) return;
      thumbCanvas.width = viewport.width;
      thumbCanvas.height = viewport.height;
      await page.render({ canvasContext: ctx, viewport } as any).promise;
      const url = thumbCanvas.toDataURL('image/png');
      // Insert into LRU cache
      cache.set(pageNumber, url);
      setThumbnailUrls(prev => { const next = [...prev]; next[idx] = url; return next; });
      // Evict least-recently-used entries if capacity exceeded
      while (cache.size > THUMB_CACHE_CAPACITY) {
        const firstKey = cache.keys().next().value as number | undefined;
        if (typeof firstKey === 'number') {
          cache.delete(firstKey);
          setThumbnailUrls(prev => {
            const next = [...prev];
            const evictIdx = firstKey - 1;
            if (evictIdx >= 0 && evictIdx < next.length) next[evictIdx] = undefined;
            return next;
          });
        } else {
          break;
        }
      }
    } catch (e) {
      // Non-blocking
    }
  }, [pdfDoc, pageCount, thumbnailUrls]);

  const evictFarThumbnails = useCallback(() => {
    try {
      const cache = thumbCacheRef.current;
      const visible = visibleThumbsRef.current;
      // Evict pages not visible and far from current page
      for (const key of Array.from(cache.keys())) {
        if (!visible.has(key) && Math.abs(key - currentPage) > 20) {
          cache.delete(key);
          setThumbnailUrls(prev => {
            const next = [...prev];
            const idx = key - 1; if (idx >= 0 && idx < next.length) next[idx] = undefined; return next;
          });
        }
      }
    } catch {}
  }, [currentPage]);

  // Thumbnail item component using IntersectionObserver for virtualization
  const ThumbnailItem: React.FC<{ pageNumber: number; url?: string }> = ({ pageNumber, url }) => {
    const itemRef = useRef<HTMLButtonElement | null>(null);
    useEffect(() => {
      const el = itemRef.current;
      const root = thumbsContainerRef.current || null;
      if (!el || !root || !showThumbnails) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              generateThumbnail(pageNumber);
              visibleThumbsRef.current.add(pageNumber);
            }
            if (!entry.isIntersecting) {
              visibleThumbsRef.current.delete(pageNumber);
            }
          });
          evictFarThumbnails();
        },
        { root, rootMargin: '200px', threshold: 0.01 }
      );
      observer.observe(el);
      return () => {
        visibleThumbsRef.current.delete(pageNumber);
        try { observer.unobserve(el); observer.disconnect(); } catch {}
      };
    }, [pageNumber, showThumbnails, generateThumbnail, evictFarThumbnails]);

    return (
      <button
        ref={itemRef}
        className={`w-full p-1 border-b ${currentPage === pageNumber ? 'bg-slate-100' : ''}`}
        onClick={() => setCurrentPage(pageNumber)}
        aria-label={`Go to page ${pageNumber}`}
      >
        {url ? (
          <img src={url} alt={`Thumbnail ${pageNumber}`} className="w-full" />
        ) : (
          <div className="w-full h-20 bg-slate-100 flex items-center justify-center">
            <span className="text-[10px] text-slate-500">Page {pageNumber}</span>
          </div>
        )}
      </button>
    );
  };

  return (
    <div className="rounded-lg overflow-hidden flex flex-col bg-white">
      <div className="p-4 bg-slate-100 border-b flex items-center justify-between">
        <div className="flex items-center">
          <FileText className="text-blue-600 mr-2" size={20} />
          <h3 className="font-heading font-medium">{title}</h3>
        </div>
        <div className="flex space-x-2 items-center">
          <div className="flex items-center space-x-2 mr-3">
            <Button variant="outline" size="sm" onClick={zoomOut} aria-label="Zoom out">-</Button>
            <span className="text-sm text-slate-600 w-16 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={zoomIn} aria-label="Zoom in">+</Button>
            <Button variant="ghost" size="sm" onClick={resetZoom} aria-label="Reset zoom">Reset</Button>
            <Button variant="ghost" size="sm" onClick={() => setShowThumbnails(s => !s)} aria-label="Toggle thumbnails">
              {showThumbnails ? 'Hide Thumbs' : 'Show Thumbs'}
            </Button>
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
      </div>

      <div className="relative bg-slate-100 flex-grow overflow-hidden">
        {pageCount > 0 && (
          <div className="px-4 pt-3">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
              <span>Reading Progress</span>
              <span>{Math.round((currentPage / pageCount) * 100)}%</span>
            </div>
            <Progress value={(currentPage / pageCount) * 100} className="h-2" />
          </div>
        )}
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
        {headerWarning && (
          <div className="px-4 py-2">
            <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs rounded p-2">
              {headerWarning}
            </div>
          </div>
        )}
        
        <div className="flex">
          {showThumbnails && pageCount > 0 && (
            <div ref={thumbsContainerRef} className="w-32 bg-white border-r overflow-y-auto max-h-[700px]">
              {Array.from({ length: pageCount }, (_, i) => (
                <ThumbnailItem key={i} pageNumber={i + 1} url={thumbnailUrls[i]} />
              ))}
            </div>
          )}
          <div className="flex-1 flex items-center justify-center p-4">
            <canvas
              ref={canvasRef}
              className="shadow bg-white"
              aria-label={`PDF canvas: ${title}`}
            />
          </div>
        </div>
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
