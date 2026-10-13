'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

interface ContinuousPdfViewerProps {
  blobUrl: string;
  currentPage: number;
  onPageChange: (page: number) => void;
  zoom: number; // percentage, e.g. 100, 125
  className?: string;
}

interface PageRenderItemProps {
  pdfDoc: any;
  pageNumber: number;
  zoom: number;
  onVisibleChange: (pageNumber: number, isIntersecting: boolean, ratio: number) => void;
}

const PageRenderItem: React.FC<PageRenderItemProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
  onVisibleChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);
  const [rendered, setRendered] = useState(false);
  const [isNearViewport, setIsNearViewport] = useState(false);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({
    width: 595,
    height: 842,
  });

  // Track visibility for scroll detection & lazy rendering
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Observer 1: Near viewport for lazy canvas rendering (large rootMargin)
    const lazyObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { rootMargin: '600px 0px 600px 0px' }
    );
    lazyObserver.observe(el);

    // Observer 2: Active page indicator (center of viewport)
    const activeObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        onVisibleChange(pageNumber, entry.isIntersecting, entry.intersectionRatio);
      },
      {
        threshold: [0.1, 0.3, 0.5, 0.7, 0.9],
      }
    );
    activeObserver.observe(el);

    return () => {
      lazyObserver.disconnect();
      activeObserver.disconnect();
    };
  }, [pageNumber, onVisibleChange]);

  // Initial page dimensions
  useEffect(() => {
    if (!pdfDoc) return;
    let active = true;
    pdfDoc.getPage(pageNumber).then((page: any) => {
      if (!active) return;
      const viewport = page.getViewport({ scale: 1.0 });
      setPageDimensions({ width: viewport.width, height: viewport.height });
    }).catch(() => {});
    return () => {
      active = false;
    };
  }, [pdfDoc, pageNumber]);

  // Render canvas when near viewport
  useEffect(() => {
    if (!pdfDoc || !isNearViewport || !canvasRef.current) return;
    let active = true;

    pdfDoc.getPage(pageNumber).then((page: any) => {
      if (!active || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Base scale matching A4 / standard DPI
      const scale = (zoom / 100) * (window.devicePixelRatio || 1.5);
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Display size via CSS
      canvas.style.width = `${viewport.width / (window.devicePixelRatio || 1.5)}px`;
      canvas.style.height = `${viewport.height / (window.devicePixelRatio || 1.5)}px`;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancel error
        }
      }

      const renderContext = {
        canvasContext: ctx,
        viewport,
      };

      const task = page.render(renderContext);
      renderTaskRef.current = task;

      task.promise
        .then(() => {
          if (active) setRendered(true);
        })
        .catch((err: any) => {
          if (err?.name !== 'RenderingCancelledException') {
            console.error(`Page ${pageNumber} render error:`, err);
          }
        });
    });

    return () => {
      active = false;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore cancel error
        }
      }
    };
  }, [pdfDoc, pageNumber, isNearViewport, zoom]);

  const displayWidth = (pageDimensions.width * (zoom / 100));
  const displayHeight = (pageDimensions.height * (zoom / 100));

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="relative mb-6 mx-auto bg-white shadow-md border border-slate-200/90 rounded-sm transition-shadow hover:shadow-lg flex items-center justify-center"
      style={{
        width: `${displayWidth}px`,
        minHeight: `${displayHeight}px`,
      }}
    >
      <canvas
        ref={canvasRef}
        className={`block mx-auto ${rendered ? 'opacity-100' : 'opacity-0'} transition-opacity duration-200`}
      />
      {!rendered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50/70 text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          <span className="text-xs font-mono font-medium">Page {pageNumber}</span>
        </div>
      )}
      {/* Floating page label corner badge */}
      <span className="absolute top-2 right-2 rounded bg-slate-900/60 px-1.5 py-0.5 text-[9px] font-mono text-white opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
        P.{pageNumber}
      </span>
    </div>
  );
};

export default function ContinuousPdfViewer({
  blobUrl,
  currentPage,
  onPageChange,
  zoom,
  className = '',
}: ContinuousPdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isProgrammaticScrollRef = useRef(false);
  const visibilityMapRef = useRef<Map<number, number>>(new Map());

  // Load PDF via pdfjs-dist
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        const pdfjsLib: any = await import('pdfjs-dist/legacy/build/pdf.js');
        if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
          pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
        }

        const loadingTask = pdfjsLib.getDocument({
          url: blobUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
        });

        const doc = await loadingTask.promise;
        if (!active) return;
        setPdfDoc(doc);
        setNumPages(doc.numPages);
        setLoading(false);
      } catch (err: any) {
        if (!active) return;
        console.error('Failed to load PDF document:', err);
        setError(err?.message || 'Failed to parse PDF document.');
        setLoading(false);
      }
    }

    if (blobUrl) {
      loadPdf();
    }

    return () => {
      active = false;
    };
  }, [blobUrl]);

  // Handle visibility changes from each page
  const handleVisibleChange = useCallback(
    (pageNumber: number, isIntersecting: boolean, ratio: number) => {
      if (isProgrammaticScrollRef.current) return;

      if (!isIntersecting) {
        visibilityMapRef.current.delete(pageNumber);
      } else {
        visibilityMapRef.current.set(pageNumber, ratio);
      }

      // Find page with highest visibility ratio
      let maxRatio = 0;
      let dominantPage = currentPage;
      visibilityMapRef.current.forEach((val, pNum) => {
        if (val > maxRatio) {
          maxRatio = val;
          dominantPage = pNum;
        }
      });

      if (dominantPage !== currentPage && maxRatio >= 0.25) {
        onPageChange(dominantPage);
      }
    },
    [currentPage, onPageChange]
  );

  // Scroll to page when external currentPage changes
  const lastTargetPageRef = useRef(currentPage);
  useEffect(() => {
    if (currentPage === lastTargetPageRef.current) return;
    lastTargetPageRef.current = currentPage;

    const el = document.getElementById(`pdf-page-${currentPage}`);
    if (el) {
      isProgrammaticScrollRef.current = true;
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const timer = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [currentPage]);

  if (loading) {
    return (
      <div className="flex h-full min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-[#0A3D2E]" />
        <p className="text-sm font-medium text-slate-600">
          Loading document pages for continuous review…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Document Rendering Notice</p>
          <p className="mt-1 text-xs text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`w-full h-full overflow-y-auto px-4 py-6 scroll-smooth ${className}`}
      tabIndex={0}
      aria-label="Continuous PDF preview with live page tracking"
    >
      {Array.from({ length: numPages }).map((_, i) => (
        <PageRenderItem
          key={i + 1}
          pdfDoc={pdfDoc}
          pageNumber={i + 1}
          zoom={zoom}
          onVisibleChange={handleVisibleChange}
        />
      ))}
    </div>
  );
}
