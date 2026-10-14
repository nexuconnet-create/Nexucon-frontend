'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

export interface TargetJump {
  page: number;
  seq: number;
}

interface ContinuousPdfViewerProps {
  blobUrl: string;
  currentPage: number;
  targetJump?: TargetJump | null;
  onPageChange: (page: number) => void;
  zoom: number; // percentage, e.g. 100, 125
  className?: string;
}

interface PageRenderItemProps {
  pdfDoc: any;
  pageNumber: number;
  zoom: number;
}

const PageRenderItem: React.FC<PageRenderItemProps> = ({
  pdfDoc,
  pageNumber,
  zoom,
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

  // Lazy observer: render canvas when within 800px of viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const lazyObserver = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsNearViewport(true);
        }
      },
      { rootMargin: '800px 0px 800px 0px' }
    );
    lazyObserver.observe(el);

    return () => {
      lazyObserver.disconnect();
    };
  }, []);

  // Fetch initial page dimensions
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

  // Render canvas once near viewport
  useEffect(() => {
    if (!pdfDoc || !isNearViewport || !canvasRef.current) return;
    let active = true;

    pdfDoc.getPage(pageNumber).then((page: any) => {
      if (!active || !canvasRef.current) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1.5 : 1.5;
      const scale = (zoom / 100) * dpr;
      const viewport = page.getViewport({ scale });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {
          // ignore
        }
      }

      const task = page.render({
        canvasContext: ctx,
        viewport,
      });
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
          // ignore
        }
      }
    };
  }, [pdfDoc, pageNumber, isNearViewport, zoom]);

  const displayWidth = pageDimensions.width * (zoom / 100);
  const displayHeight = pageDimensions.height * (zoom / 100);

  return (
    <div
      ref={containerRef}
      id={`pdf-page-${pageNumber}`}
      data-page-number={pageNumber}
      className="relative mb-6 mx-auto bg-white shadow-md border border-slate-200/90 rounded-sm transition-shadow hover:shadow-lg flex items-center justify-center select-none"
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
      <span className="absolute top-2 right-2 rounded bg-slate-900/60 px-1.5 py-0.5 text-[9px] font-mono text-white opacity-40 hover:opacity-100 transition-opacity pointer-events-none">
        P.{pageNumber}
      </span>
    </div>
  );
};

export default function ContinuousPdfViewer({
  blobUrl,
  currentPage,
  targetJump,
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
  const rafIdRef = useRef<number | null>(null);
  const lastActivePageRef = useRef(currentPage);

  // Load PDF via pdfjs-dist
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function loadPdf() {
      try {
        // @ts-ignore
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

  // Handle programmatic jump ONLY when targetJump changes (explicit user button/link clicks)
  const lastJumpSeqRef = useRef<number | null>(null);
  useEffect(() => {
    if (!targetJump || targetJump.seq === lastJumpSeqRef.current) return;
    lastJumpSeqRef.current = targetJump.seq;

    const targetEl = document.getElementById(`pdf-page-${targetJump.page}`);
    const container = containerRef.current;
    if (targetEl && container) {
      isProgrammaticScrollRef.current = true;
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

      const timer = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 750);
      return () => clearTimeout(timer);
    }
  }, [targetJump]);

  // Native container scroll listener: computes active center page without fighting scroll
  const handleScroll = useCallback(() => {
    if (isProgrammaticScrollRef.current) return;

    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
    }

    rafIdRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      if (!container || numPages === 0) return;

      const containerRect = container.getBoundingClientRect();
      const viewportMidY = containerRect.top + containerRect.height / 2;

      let closestPage = lastActivePageRef.current;
      let minDistance = Infinity;

      for (let i = 1; i <= numPages; i++) {
        const el = document.getElementById(`pdf-page-${i}`);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        // Check if viewport midpoint falls inside this page
        if (viewportMidY >= rect.top && viewportMidY <= rect.bottom) {
          closestPage = i;
          break;
        }

        const distance = Math.min(
          Math.abs(rect.top - viewportMidY),
          Math.abs(rect.bottom - viewportMidY)
        );
        if (distance < minDistance) {
          minDistance = distance;
          closestPage = i;
        }
      }

      if (closestPage !== lastActivePageRef.current) {
        lastActivePageRef.current = closestPage;
        onPageChange(closestPage);
      }
    });
  }, [numPages, onPageChange]);

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
      onScroll={handleScroll}
      className={`w-full h-full overflow-y-auto px-4 py-6 ${className}`}
      tabIndex={0}
      aria-label="Continuous PDF preview with live page tracking"
    >
      {Array.from({ length: numPages }).map((_, i) => (
        <PageRenderItem
          key={i + 1}
          pdfDoc={pdfDoc}
          pageNumber={i + 1}
          zoom={zoom}
        />
      ))}
    </div>
  );
}
