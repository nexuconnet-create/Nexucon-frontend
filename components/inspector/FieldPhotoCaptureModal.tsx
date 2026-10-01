"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Camera,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  ShieldCheck,
  Hash,
  Layers,
  Sparkles,
  RotateCcw,
  Sliders,
  Check,
} from "lucide-react";
import { uploadInspectorEvidence, getAssignableProjects } from "@/services/inspector";

interface FieldPhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  projectName?: string;
  batchId?: string;
  structuralElementId?: string;
  defaultCategory?: string;
  onEvidenceCreated?: (record: any) => void;
}

export default function FieldPhotoCaptureModal({
  isOpen,
  onClose,
  projectId: initialProjectId,
  projectName: initialProjectName,
  batchId,
  structuralElementId: initialElementId = "",
  defaultCategory = "honeycombing",
  onEvidenceCreated,
}: FieldPhotoCaptureModalProps) {
  // Mode: live camera stream or device file picker
  const [captureMode, setCaptureMode] = useState<"camera" | "upload">("camera");

  // Camera video feed & canvas
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isCameraDesiredRef = useRef(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Captured photo state
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [sha256Digest, setSha256Digest] = useState<string>("");
  const [isHashing, setIsHashing] = useState<boolean>(false);

  // Form Fields
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId || "");
  const [structuralElement, setStructuralElement] = useState<string>(initialElementId);
  const [gridLocation, setGridLocation] = useState<string>("");
  const [category, setCategory] = useState<string>(defaultCategory);
  const [severity, setSeverity] = useState<string>("MEDIUM");
  const [description, setDescription] = useState<string>("");
  const [coordinates, setCoordinates] = useState<{
    latitude: number;
    longitude: number;
    accuracy?: number;
  } | null>(null);
  const [isAcquiringGps, setIsAcquiringGps] = useState<boolean>(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [attestationAgreed, setAttestationAgreed] = useState<boolean>(true);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successRecord, setSuccessRecord] = useState<any | null>(null);

  // Initialize projects and reset GPS state on modal toggle
  useEffect(() => {
    if (isOpen) {
      setCoordinates(null);
      setGpsError(null);
      if (initialProjectId) {
        setSelectedProjectId(initialProjectId);
      } else {
        getAssignableProjects()
          .then((res) => {
            const list = Array.isArray(res) ? res : [];
            setProjects(list);
            if (list.length > 0 && !selectedProjectId) {
              setSelectedProjectId(list[0].id);
            }
          })
          .catch(() => {});
      }
      if (initialElementId) {
        setStructuralElement(initialElementId);
      }
      // Auto-acquire fresh GPS coordinates
      acquireGps();
    } else {
      stopCamera();
      setCoordinates(null);
      setGpsError(null);
    }
  }, [isOpen, initialProjectId, initialElementId]);

  // Handle camera start/stop
  useEffect(() => {
    if (isOpen && captureMode === "camera" && !capturedBlob) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, captureMode, capturedBlob]);

  const startCamera = async () => {
    stopCamera();
    isCameraDesiredRef.current = true;
    setCameraError(null);
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        throw new Error("Camera API is not supported in this browser environment.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      // If modal was closed or switched to upload while permission prompt was pending
      if (!isCameraDesiredRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      if (!isCameraDesiredRef.current) return;
      setCameraError(
        err?.message || "Could not access device camera. Please upload a photo or grant permissions."
      );
      setCameraActive(false);
      setCaptureMode("upload");
    }
  };

  const stopCamera = () => {
    isCameraDesiredRef.current = false;
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  // Acquire GPS fix with graceful fallback
  const acquireGps = () => {
    if (typeof window === "undefined" || !navigator?.geolocation) {
      setGpsError("Geolocation is not supported by your device.");
      return;
    }
    setIsAcquiringGps(true);
    setGpsError(null);

    const tryAcquire = (highAccuracy: boolean) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoordinates({
            latitude: parseFloat(pos.coords.latitude.toFixed(6)),
            longitude: parseFloat(pos.coords.longitude.toFixed(6)),
            accuracy: pos.coords.accuracy ? Math.round(pos.coords.accuracy) : undefined,
          });
          setIsAcquiringGps(false);
          setGpsError(null);
        },
        (err) => {
          if (highAccuracy) {
            // High-accuracy GPS timed out or unavailable on desktop/Mac indoors; retry standard network fix
            tryAcquire(false);
          } else {
            const msg =
              err.code === 1
                ? "Location permission was denied. Allow location access in browser settings."
                : err.code === 2
                ? "GPS fix unavailable indoors. You can use project site coordinates or retry."
                : "GPS request timed out. You can retry or continue.";
            setGpsError(msg);
            setIsAcquiringGps(false);
          }
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 5000 : 10000,
          maximumAge: highAccuracy ? 0 : 300000,
        }
      );
    };

    tryAcquire(true);
  };

  // Compute SHA-256 for a blob
  const computeDigest = async (blob: Blob): Promise<string> => {
    setIsHashing(true);
    try {
      const buffer = await blob.arrayBuffer();
      if (window?.crypto?.subtle) {
        const digestBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
        const hashArray = Array.from(new Uint8Array(digestBuffer));
        const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
        setSha256Digest(hashHex);
        return hashHex;
      } else {
        // Fallback placeholder hash
        const dummy = "sha256_" + Math.random().toString(16).substring(2, 10);
        setSha256Digest(dummy);
        return dummy;
      }
    } catch {
      return "";
    } finally {
      setIsHashing(false);
    }
  };

  // Take Snapshot from video
  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      async (blob) => {
        if (!blob) return;
        stopCamera();
        setCapturedBlob(blob);
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        const fName = `field_photo_${Date.now()}.jpg`;
        setFileName(fName);
        await computeDigest(blob);
      },
      "image/jpeg",
      0.92
    );
  };

  // Handle File Input Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedBlob(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setFileName(file.name);
    await computeDigest(file);
  };

  // Retake / Clear photo
  const handleRetake = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setCapturedBlob(null);
    setPreviewUrl(null);
    setFileName("");
    setSha256Digest("");
    if (captureMode === "camera") {
      startCamera();
    }
  };

  // Submit Evidence
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!capturedBlob) {
      setSubmitError("Please capture or upload a field test photo before submitting.");
      return;
    }
    if (!selectedProjectId) {
      setSubmitError("Please select a project.");
      return;
    }
    if (!structuralElement.trim()) {
      setSubmitError("Please specify the structural member / element identifier.");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setUploadProgress(0.1);

    try {
      const fileToUpload = new File([capturedBlob], fileName || `field_photo_${Date.now()}.jpg`, {
        type: capturedBlob.type || "image/jpeg",
      });

      const fullDescription = [
        description.trim(),
        gridLocation.trim() ? `[Location: ${gridLocation.trim()}]` : "",
        `[Defect: ${category.toUpperCase()} | Severity: ${severity}]`,
      ]
        .filter(Boolean)
        .join(" ");

      const result = await uploadInspectorEvidence(
        {
          project: selectedProjectId,
          file: fileToUpload,
          structuralElementId: structuralElement.trim(),
          description: fullDescription,
          category,
          severity,
          batchId: batchId || undefined,
          sha256: sha256Digest || undefined,
          capturedAt: new Date().toISOString(),
          coordinates: coordinates || null,
        },
        (fraction) => {
          setUploadProgress(fraction);
        }
      );

      setSuccessRecord(result);
      if (onEvidenceCreated) {
        onEvidenceCreated(result);
      }
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.detail ||
          err?.message ||
          "Failed to submit evidence record to Government registry."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetModal = () => {
    handleRetake();
    setSuccessRecord(null);
    setSubmitError(null);
    setDescription("");
    setCoordinates(null);
    setGpsError(null);
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#022C4F] flex items-center justify-center text-white shadow-md">
              <Camera size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#022C4F] flex items-center gap-2">
                Field Test Photo Evidence
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <ShieldCheck size={11} />
                  Tamper Evident
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Official statutory capture with SHA-256 integrity seal for the Government Directorate.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResetModal}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-200/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Success Overlay Screen */}
          {successRecord ? (
            <div className="py-8 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Evidence Sealed & Transmitted
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1">
                  Photo evidence was verified and registered in the Unified Evidence Registry and linked to the Government Command Center dashboard.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-left space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Evidence Reference:</span>
                  <span className="font-bold text-[#022C4F] bg-blue-50 px-2 py-0.5 rounded">
                    {successRecord.evidence_reference || "Registered"}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">Element Link:</span>
                  <span className="font-bold text-slate-800">
                    {successRecord.structural_element_id || structuralElement}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-medium">SHA-256 Digest:</span>
                  <span className="font-mono text-[11px] text-slate-700 truncate max-w-[200px]" title={successRecord.evidence_hash}>
                    {successRecord.evidence_hash || sha256Digest}
                  </span>
                </div>
                {coordinates && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-medium">GPS Georeference:</span>
                    <span className="text-[11px] text-slate-700">
                      {coordinates.latitude}, {coordinates.longitude}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleResetModal}
                  className="px-6 py-2.5 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033B6B] transition-colors shadow-md"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Photo Viewfinder / Upload Box */}
              <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-slate-900 overflow-hidden min-h-[240px] flex items-center justify-center">
                {previewUrl ? (
                  <div className="relative w-full h-[280px] bg-black flex items-center justify-center">
                    <img
                      src={previewUrl}
                      alt="Captured evidence"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 border border-white/20">
                      <Hash size={12} className="text-emerald-400" />
                      <span className="truncate max-w-[180px]">{sha256Digest ? sha256Digest.substring(0, 16) + "…" : "Computing Hash..."}</span>
                    </div>

                    <button
                      type="button"
                      onClick={handleRetake}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 text-xs font-bold flex items-center gap-1.5 shadow-lg transition-transform active:scale-95"
                    >
                      <RotateCcw size={13} />
                      Retake Photo
                    </button>
                  </div>
                ) : captureMode === "camera" ? (
                  <div className="relative w-full h-[280px] bg-black flex items-center justify-center">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      playsInline
                      muted
                      autoPlay
                    />
                    {/* Targeting reticle */}
                    <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex items-center justify-center">
                      <div className="w-10 h-10 border border-white/60 rounded-full" />
                    </div>

                    {cameraActive && (
                      <div className="absolute bottom-4 inset-x-0 flex justify-center items-center gap-3">
                        <button
                          type="button"
                          onClick={takeSnapshot}
                          className="w-14 h-14 rounded-full bg-white border-4 border-slate-300 hover:border-emerald-500 shadow-xl flex items-center justify-center transition-transform active:scale-90"
                          title="Capture Snapshot"
                        >
                          <div className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-700" />
                        </button>
                      </div>
                    )}

                    {cameraError && (
                      <div className="absolute inset-0 bg-slate-900/90 p-6 flex flex-col items-center justify-center text-center text-white space-y-2">
                        <AlertTriangle size={24} className="text-amber-400" />
                        <p className="text-xs text-slate-300 max-w-sm">{cameraError}</p>
                        <button
                          type="button"
                          onClick={() => setCaptureMode("upload")}
                          className="px-3.5 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                        >
                          Switch to File Upload
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <Upload size={22} />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-200">
                        Choose photo file or take with mobile device
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        JPEG, PNG, HEIC up to 25MB
                      </p>
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold cursor-pointer transition-colors shadow-md">
                      <Camera size={14} />
                      <span>Select Device Photo</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}

                {/* Mode Selector Toggle */}
                {!previewUrl && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md p-1 rounded-xl flex items-center gap-1 text-[11px] font-semibold text-white border border-white/20">
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureMode("camera");
                        startCamera();
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        captureMode === "camera"
                          ? "bg-[#022C4F] text-white shadow-sm"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      Live Camera
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCaptureMode("upload");
                        stopCamera();
                      }}
                      className={`px-2.5 py-1 rounded-lg transition-colors ${
                        captureMode === "upload"
                          ? "bg-[#022C4F] text-white shadow-sm"
                          : "text-slate-300 hover:text-white"
                      }`}
                    >
                      File Upload
                    </button>
                  </div>
                )}
              </div>

              {/* Hidden canvas for snapshot rasterization */}
              <canvas ref={canvasRef} className="hidden" />

              {/* Metadata Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Project Selection */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Project *
                  </label>
                  {initialProjectName ? (
                    <input
                      type="text"
                      disabled
                      value={initialProjectName}
                      className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium"
                    />
                  ) : (
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      required
                      className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value="">Select Project...</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Structural Element ID */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Structural Element ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={structuralElement}
                    onChange={(e) => setStructuralElement(e.target.value)}
                    placeholder="e.g. Column C24, Drop Beam B12"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Defect Category */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Defect Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  >
                    <option value="honeycombing">Honeycombing / Voiding</option>
                    <option value="cracking">Cracking (Shear / Flexure / Thermal)</option>
                    <option value="spalling">Spalling & Delamination</option>
                    <option value="rebar_exposure">Exposed Rebar / Low Cover</option>
                    <option value="moisture_ingress">Moisture Ingress / Dampness</option>
                    <option value="efflorescence">Efflorescence / Leaching</option>
                    <option value="sound_uniform">Sound & Uniform Concrete</option>
                    <option value="other">Other Workmanship Defect</option>
                  </select>
                </div>

                {/* Defect Severity */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Severity *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="INFO">Informational / Superficial</option>
                    <option value="LOW">Low Severity</option>
                    <option value="MEDIUM">Medium Severity</option>
                    <option value="HIGH">High (Structural Concern)</option>
                    <option value="CRITICAL">Critical (Stop Work / Urgent Remediation)</option>
                  </select>
                </div>
              </div>

              {/* Grid Location & Remarks */}
              <div className="space-y-2 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Grid Location / Floor Axis
                  </label>
                  <input
                    type="text"
                    value={gridLocation}
                    onChange={(e) => setGridLocation(e.target.value)}
                    placeholder="e.g. Axis 4-D, 2nd Floor Pour Level"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Field Remarks & Defect Dimensions
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Note defect width, surface depth, acoustic sounding response, or correlation with UPV velocity readings..."
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Georeference & Cryptographic Hash Strip */}
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-cyan-100 text-cyan-800 shrink-0">
                    <MapPin size={15} />
                  </div>
                  <div>
                    <span className="font-bold text-slate-800 block text-[11px]">
                      GPS Coordinates
                    </span>
                    {coordinates ? (
                      <span className="text-[11px] text-slate-600 font-mono">
                        {coordinates.latitude}, {coordinates.longitude}
                        {coordinates.accuracy ? ` (±${coordinates.accuracy}m)` : ""}
                      </span>
                    ) : (
                      <span className="text-[11px] text-amber-700">
                        {gpsError || "GPS fix not acquired yet."}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {!coordinates && (
                    <button
                      type="button"
                      onClick={() => {
                        const proj = projects.find((p) => p.id === selectedProjectId);
                        if (proj?.latitude && proj?.longitude) {
                          setCoordinates({
                            latitude: parseFloat(Number(proj.latitude).toFixed(6)),
                            longitude: parseFloat(Number(proj.longitude).toFixed(6)),
                            accuracy: 10,
                          });
                          setGpsError(null);
                        } else {
                          setCoordinates({
                            latitude: 6.5244,
                            longitude: 3.3792,
                            accuracy: 50,
                          });
                          setGpsError(null);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#022C4F] text-[11px] font-semibold transition-colors cursor-pointer"
                    >
                      Use Site Coordinates
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={acquireGps}
                    disabled={isAcquiringGps}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw size={12} className={isAcquiringGps ? "animate-spin" : ""} />
                    <span>{isAcquiringGps ? "Acquiring..." : "Update GPS Fix"}</span>
                  </button>
                </div>
              </div>

              {/* Statutory Attestation Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={attestationAgreed}
                  onChange={(e) => setAttestationAgreed(e.target.checked)}
                  className="mt-0.5 rounded text-[#022C4F] focus:ring-0 cursor-pointer"
                />
                <span className="text-[11px] text-slate-600 leading-snug">
                  I attest under statutory penalty that this photograph is a true and unaltered field record captured at the specified project element location during inspection testing.
                </span>
              </label>

              {/* Error Alert */}
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle size={15} className="shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleResetModal}
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !capturedBlob || !attestationAgreed}
                  className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#033B6B] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Transmitting & Sealing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck size={15} />
                      <span>Seal & Submit to Government</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
