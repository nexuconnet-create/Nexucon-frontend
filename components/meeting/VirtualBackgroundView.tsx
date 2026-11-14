"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Sparkles, Loader2 } from "lucide-react";

export interface VirtualBackgroundViewProps {
  stream: MediaStream | null;
  isVideoOn: boolean;
  selectedBgId: string;
  backgroundUrl: string;
  className?: string;
  isMirror?: boolean;
  onProcessedStream?: (processedStream: MediaStream | null) => void;
}

export const VirtualBackgroundView: React.FC<VirtualBackgroundViewProps> = ({
  stream,
  isVideoOn,
  selectedBgId,
  backgroundUrl,
  className = "w-full h-full object-cover",
  isMirror = true,
  onProcessedStream,
}) => {
  const rawVideoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const segmenterRef = useRef<any>(null);
  const animFrameRef = useRef<number | null>(null);
  const isProcessingRef = useRef<boolean>(false);
  const bgImageRef = useRef<HTMLImageElement | null>(null);

  const [isSegmentationActive, setIsSegmentationActive] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 1. Keep raw video element fed with local webcam stream
  useEffect(() => {
    const video = rawVideoRef.current;
    if (!video) return;

    if (stream && isVideoOn) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
      }
      video.play().catch(() => {});
    } else {
      video.srcObject = null;
    }
  }, [stream, isVideoOn]);

  // 2. Preload and maintain selected background image
  useEffect(() => {
    if (!backgroundUrl || backgroundUrl === 'blur' || selectedBgId === 'none') {
      bgImageRef.current = null;
      return;
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = backgroundUrl;
    img.onload = () => {
      bgImageRef.current = img;
    };
    img.onerror = () => {
      // Fallback to local background path if external URL failed
      if (backgroundUrl.startsWith("http") && backgroundUrl.includes("WhatsApp_Image")) {
        const localFallback = `/images/meeting-backgrounds/bg_${selectedBgId.replace("bg-", "")}.jpg`;
        const fallbackImg = new Image();
        fallbackImg.crossOrigin = "anonymous";
        fallbackImg.src = localFallback;
        fallbackImg.onload = () => {
          bgImageRef.current = fallbackImg;
        };
      }
    };
  }, [backgroundUrl, selectedBgId]);

  // 3. Load MediaPipe SelfieSegmentation Script and Engine
  useEffect(() => {
    if (typeof window === "undefined") return;

    let isMounted = true;

    const initEngine = async () => {
      // Wait for window.SelfieSegmentation if script is already loading
      if ((window as any).SelfieSegmentation) {
        try {
          if (!segmenterRef.current && isMounted) {
            setIsAiLoading(true);
            const segmenter = new (window as any).SelfieSegmentation({
              locateFile: (file: string) => `/mediapipe/selfie_segmentation/${file}`,
            });
            segmenter.setOptions({
              modelSelection: 1, // 1 = landscape (faster, optimized for webcams)
              selfieMode: isMirror,
            });
            await segmenter.initialize();
            if (isMounted) {
              segmenterRef.current = segmenter;
              setIsAiLoading(false);
            }
          }
        } catch (err) {
          console.warn("SelfieSegmentation init warning:", err);
          if (isMounted) setIsAiLoading(false);
        }
        return;
      }

      // Check if script element already exists
      const existingScript = document.querySelector('script[src*="selfie_segmentation.js"]');
      if (!existingScript) {
        setIsAiLoading(true);
        const script = document.createElement("script");
        script.src = "/mediapipe/selfie_segmentation/selfie_segmentation.js";
        script.async = true;
        script.onload = async () => {
          if (!isMounted) return;
          try {
            if ((window as any).SelfieSegmentation) {
              const segmenter = new (window as any).SelfieSegmentation({
                locateFile: (file: string) => `/mediapipe/selfie_segmentation/${file}`,
              });
              segmenter.setOptions({
                modelSelection: 1,
                selfieMode: isMirror,
              });
              await segmenter.initialize();
              if (isMounted) {
                segmenterRef.current = segmenter;
                setIsAiLoading(false);
              }
            }
          } catch (e) {
            console.warn("MediaPipe script loaded but init error:", e);
            if (isMounted) setIsAiLoading(false);
          }
        };
        script.onerror = () => {
          console.warn("Could not load local mediapipe script, using fallback presenter mode");
          if (isMounted) setIsAiLoading(false);
        };
        document.head.appendChild(script);
      }
    };

    initEngine();

    return () => {
      isMounted = false;
    };
  }, [isMirror]);

  // 4. Render and Segmentation Frame Loop
  const drawCover = useCallback((ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number) => {
    const hRatio = w / img.naturalWidth;
    const vRatio = h / img.naturalHeight;
    const ratio = Math.max(hRatio, vRatio);
    const centerShiftX = (w - img.naturalWidth * ratio) / 2;
    const centerShiftY = (h - img.naturalHeight * ratio) / 2;
    ctx.drawImage(
      img,
      0, 0, img.naturalWidth, img.naturalHeight,
      centerShiftX, centerShiftY, img.naturalWidth * ratio, img.naturalHeight * ratio
    );
  }, []);

  useEffect(() => {
    let active = true;
    const video = rawVideoRef.current;
    const canvas = canvasRef.current;

    if (!video || !canvas || !isVideoOn || !stream) {
      setIsSegmentationActive(false);
      return;
    }

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    if (!offscreenCanvasRef.current) {
      offscreenCanvasRef.current = document.createElement("canvas");
    }
    const offCanvas = offscreenCanvasRef.current;
    const offCtx = offCanvas.getContext("2d");

    // Setup onResults callback for the segmenter
    if (segmenterRef.current) {
      segmenterRef.current.onResults((results: any) => {
        if (!active || !canvas || !ctx) return;

        const w = results.image.width || 640;
        const h = results.image.height || 360;

        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
          offCanvas.width = w;
          offCanvas.height = h;
        }

        ctx.save();
        ctx.clearRect(0, 0, w, h);

        // A. Draw Virtual Background (Image or Blur)
        if (selectedBgId === "blur") {
          ctx.filter = "blur(18px)";
          ctx.drawImage(results.image, 0, 0, w, h);
          ctx.filter = "none";
        } else if (bgImageRef.current && bgImageRef.current.complete && bgImageRef.current.naturalWidth > 0) {
          drawCover(ctx, bgImageRef.current, w, h);
        } else {
          // Fallback deep navy stage gradient
          const grad = ctx.createLinearGradient(0, 0, 0, h);
          grad.addColorStop(0, "#0b1726");
          grad.addColorStop(1, "#030712");
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }

        // B. Composite Masked Person on top
        if (offCtx) {
          offCtx.save();
          offCtx.clearRect(0, 0, w, h);
          // 1. Draw segmentation mask (white where person is, black elsewhere)
          offCtx.drawImage(results.segmentationMask, 0, 0, w, h);
          // 2. Keep only pixels where mask is opaque
          offCtx.globalCompositeOperation = "source-in";
          offCtx.drawImage(results.image, 0, 0, w, h);
          offCtx.restore();

          // 3. Draw segmented person over virtual background
          ctx.drawImage(offCanvas, 0, 0, w, h);
        }

        ctx.restore();

        if (!isSegmentationActive && active) {
          setIsSegmentationActive(true);
        }
      });
    }

    // Capture processed video stream for WebRTC
    let capturedStream: MediaStream | null = null;
    try {
      if (selectedBgId !== "none" && onProcessedStream && canvas.captureStream) {
        capturedStream = canvas.captureStream(30);
        onProcessedStream(capturedStream);
      }
    } catch (e) {
      console.warn("Could not capture processed canvas stream:", e);
    }

    // Frame pump loop
    const renderLoop = async () => {
      if (!active) return;

      if (video.readyState >= 2) {
        if (selectedBgId === "none") {
          // When background is none, directly copy video to canvas or let raw video show
          if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 360;
          }
          ctx.save();
          if (isMirror) {
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          ctx.restore();
          setIsSegmentationActive(false);
        } else if (segmenterRef.current) {
          // Send frame to AI segmenter
          if (!isProcessingRef.current) {
            isProcessingRef.current = true;
            try {
              await segmenterRef.current.send({ image: video });
            } catch (err) {
              // Frame dropped, proceed to next
            } finally {
              isProcessingRef.current = false;
            }
          }
        }
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      active = false;
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      if (onProcessedStream) {
        onProcessedStream(null);
      }
    };
  }, [isVideoOn, stream, selectedBgId, drawCover, isMirror, onProcessedStream]);

  // When video is OFF: return null (handled by parent avatar badge & tile background)
  if (!isVideoOn || !stream) {
    return null;
  }

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Hidden raw video element used as media source for AI segmenter */}
      <video
        ref={rawVideoRef}
        autoPlay
        playsInline
        muted
        className="hidden absolute -top-[9999px] -left-[9999px] pointer-events-none opacity-0"
      />

      {/* Main Composited Canvas (Person cutout over Virtual Background) */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          selectedBgId === "none" || isSegmentationActive ? "opacity-100" : "opacity-0 absolute inset-0 pointer-events-none"
        }`}
      />

      {/* Instant Fallback / Loading Mode: If AI is initializing, display the background image with floating presenter card */}
      {selectedBgId !== "none" && !isSegmentationActive && (
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center bg-slate-950 transition-all duration-300"
          style={
            backgroundUrl && backgroundUrl !== "blur"
              ? {
                  backgroundImage: `url(${backgroundUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }
              : {
                  background: "radial-gradient(circle, #0B1726 0%, #030712 100%)",
                }
          }
        >
          {backgroundUrl === "blur" && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" />
          )}

          {/* Centered Presenter Portrait Window inside chosen background */}
          <div className="relative z-10 w-44 sm:w-56 h-36 sm:h-44 rounded-2xl overflow-hidden border-2 border-amber-400/50 shadow-2xl shadow-black/80 ring-4 ring-amber-500/20">
            <video
              autoPlay
              playsInline
              muted
              ref={(el) => {
                if (el && stream && el.srcObject !== stream) {
                  el.srcObject = stream;
                  el.play().catch(() => {});
                }
              }}
              className={`w-full h-full object-cover ${isMirror ? "transform -scale-x-100" : ""}`}
            />
            {isAiLoading && (
              <div className="absolute top-2 right-2 bg-slate-950/90 text-amber-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1 shadow">
                <Loader2 size={10} className="animate-spin" />
                <span>AI Enhancing</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

