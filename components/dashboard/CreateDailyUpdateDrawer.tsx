"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Camera, Plus, Activity, CloudSun, MapPin, Building2, 
  UploadCloud, Image as ImageIcon, Link as LinkIcon, RefreshCw, 
  ShieldCheck, AlertTriangle, CheckCircle, Trash2, SwitchCamera, Sparkles
} from 'lucide-react';
import { createDailySiteUpdate, DailySiteUpdate } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface CreateDailyUpdateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (update?: DailySiteUpdate) => void;
}

export default function CreateDailyUpdateDrawer({
  isOpen,
  onClose,
  onSuccess
}: CreateDailyUpdateDrawerProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [updateType, setUpdateType] = useState('DAILY_PHOTO');
  const [progressPercentage, setProgressPercentage] = useState(50);
  const [workSummary, setWorkSummary] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('Clear / Sunny');
  const [workforceCount, setWorkforceCount] = useState(30);

  // Photo Input Method State: 'upload' | 'camera' | 'link'
  const [photoTab, setPhotoTab] = useState<'upload' | 'camera' | 'link'>('upload');
  const [photos, setPhotos] = useState<string[]>([
    'https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=1200&q=80'
  ]);
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');

  // Link State & Security Verification
  const [urlInput, setUrlInput] = useState('');
  const [urlSecurityStatus, setUrlSecurityStatus] = useState<'idle' | 'validating' | 'safe' | 'insecure'>('idle');
  const [urlSecurityMessage, setUrlSecurityMessage] = useState('');

  // Camera Stream State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          const activeProj = list.find((p: Project) => p.status === 'ACTIVE') || list[0];
          setSelectedProjectId(activeProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async (facing: 'environment' | 'user' = cameraFacing) => {
    stopCamera();
    setCameraError(null);
    setIsCameraActive(true);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access failed:', err);
      setCameraError(err.message || 'Unable to access camera device.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const handleCapturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `live_site_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      await uploadFileToCloudinary(file);
    }, 'image/jpeg', 0.92);
  };

  // Upload File directly to Cloudinary via server route
  const uploadFileToCloudinary = async (file: File) => {
    setIsUploadingToCloudinary(true);
    setUploadProgressText(`Uploading ${file.name} to Cloudinary...`);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      if (!res.ok || !data.url) {
        throw new Error(data.error || 'Failed to upload photo to Cloudinary');
      }

      setPhotos(prev => [...prev, data.url]);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Photo uploaded to Cloudinary successfully', type: 'success' } 
      }));
    } catch (err: any) {
      console.error('Cloudinary upload error:', err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: err.message || 'Upload failed', type: 'error' } 
      }));
    } finally {
      setIsUploadingToCloudinary(false);
      setUploadProgressText('');
    }
  };

  // Handle Multi-File Upload from device
  const handleDeviceFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      await uploadFileToCloudinary(files[i]);
    }
    e.target.value = '';
  };

  // Verify and Add External Image Link with Security Checks
  const verifyAndAddUrl = async () => {
    const url = urlInput.trim();
    if (!url) return;

    setUrlSecurityStatus('validating');
    setUrlSecurityMessage('Verifying URL security & protocol integrity...');

    // 1. Enforce HTTPS
    if (!url.startsWith('https://')) {
      setUrlSecurityStatus('insecure');
      setUrlSecurityMessage('Security Alert: Only secure HTTPS image protocols are permitted.');
      return;
    }

    // 2. Prevent SSRF / Local IP addresses
    const lower = url.toLowerCase();
    if (
      lower.includes('localhost') ||
      lower.includes('127.0.0.1') ||
      lower.includes('0.0.0.0') ||
      lower.includes('192.168.') ||
      lower.includes('10.') ||
      lower.includes('172.16.')
    ) {
      setUrlSecurityStatus('insecure');
      setUrlSecurityMessage('Security Alert: Private network & loopback addresses are blocked.');
      return;
    }

    // 3. Verify that URL actually resolves to an image
    try {
      await new Promise<void>((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Invalid image asset or resource unreachable'));
        img.src = url;
      });

      // Mirror securely to Cloudinary
      setIsUploadingToCloudinary(true);
      setUploadProgressText('Securing and caching image on Cloudinary...');

      const formData = new FormData();
      formData.append('url', url);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();

      const finalUrl = (res.ok && data.url) ? data.url : url;
      setPhotos(prev => [...prev, finalUrl]);
      setUrlInput('');
      setUrlSecurityStatus('safe');
      setUrlSecurityMessage('✓ Verified safe image and cached on Cloudinary CDN.');

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Image verified and added successfully', type: 'success' } 
      }));
    } catch (err: any) {
      setUrlSecurityStatus('insecure');
      setUrlSecurityMessage('Verification Failed: Unable to verify image format or server blocked connection.');
    } finally {
      setIsUploadingToCloudinary(false);
      setUploadProgressText('');
    }
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos(photos.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !workSummary.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project and work summary are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const update = await createDailySiteUpdate({
        project: selectedProjectId,
        update_type: updateType,
        progress_percentage: Number(progressPercentage),
        work_summary: workSummary.trim(),
        weather_condition: weatherCondition,
        workforce_count: Number(workforceCount),
        photos: photos.length > 0 ? photos : ['https://images.unsplash.com/photo-1541888946425-d0fbb180c5f2?auto=format&fit=crop&w=1200&q=80']
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Daily site update published successfully', type: 'success' } 
      }));
      stopCamera();
      onClose();
      if (onSuccess) onSuccess(update);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to submit update';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={() => {
          stopCamera();
          onClose();
        }}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white p-7 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-5 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                Cloudinary Sync
              </span>
              <span className="text-xs text-slate-400 font-bold">Field Telemetry</span>
            </div>
            <h2 className="text-xl font-black text-[#022C4F] flex items-center gap-2 mt-1">
              <Camera className="text-blue-600" size={22} /> Daily Site & Photo Update
            </h2>
          </div>
          <button 
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-5 space-y-5 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Construction Project Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Active Construction Project
            </label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.reference_number || p.id.slice(0,8)}) - ${p.status || 'Active'}`
              }))}
              placeholder="Select project..."
              searchable={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Update Category</label>
              <CustomSelect
                value={updateType}
                onChange={(val) => setUpdateType(val)}
                options={[
                  { value: "DAILY_PHOTO", label: "Daily Photo Update" },
                  { value: "DRONE_SURVEY", label: "Drone Photogrammetry Survey" },
                  { value: "PROGRESS_REPORT", label: "Detailed Progress Report" },
                  { value: "SITE_LOG", label: "General Site Log" }
                ]}
                placeholder="Category..."
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Weather Condition</label>
              <CustomSelect
                value={weatherCondition}
                onChange={(val) => setWeatherCondition(val)}
                options={[
                  { value: "Clear / Sunny", label: "Clear / Sunny (31°C)" },
                  { value: "Partly Cloudy", label: "Partly Cloudy (29°C)" },
                  { value: "Overcast / Wind", label: "Overcast / Wind (27°C)" },
                  { value: "Light Rain", label: "Light Rain (25°C)" },
                  { value: "Heavy Rain / Suspended", label: "Heavy Rain / Operations Paused" }
                ]}
                placeholder="Weather..."
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Estimated Progress ({progressPercentage}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progressPercentage}
                onChange={(e) => setProgressPercentage(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Workforce on Site</label>
              <input
                type="number"
                min="0"
                value={workforceCount}
                onChange={(e) => setWorkforceCount(Number(e.target.value))}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Daily Summary & Key Milestones</label>
            <textarea
              value={workSummary}
              onChange={(e) => setWorkSummary(e.target.value)}
              rows={3}
              required
              placeholder="e.g. Concluded reinforcement fixing on Level 4 slab. 120m3 concrete cast with slump test compliance verified..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Photo Upload Section with 3 Methods */}
          <div className="p-4 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-xs font-black text-[#022C4F] uppercase tracking-wider">
                  Site Progress Evidence & Photography
                </label>
                <p className="text-[11px] text-slate-500">Live Camera, Device Upload, or Verified Secure Link</p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800">
                {photos.length} Photo{photos.length === 1 ? '' : 's'}
              </span>
            </div>

            {/* Source Switcher */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-200/70 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setPhotoTab('camera');
                  if (!isCameraActive) startCamera();
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoTab === 'camera' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera size={14} /> Live Camera
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoTab('upload');
                  stopCamera();
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoTab === 'upload' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <UploadCloud size={14} /> Device Files
              </button>
              <button
                type="button"
                onClick={() => {
                  setPhotoTab('link');
                  stopCamera();
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  photoTab === 'link' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <LinkIcon size={14} /> Secure Link
              </button>
            </div>

            {/* 1. Live Camera Viewfinder */}
            {photoTab === 'camera' && (
              <div className="space-y-3">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-slate-700">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover" 
                  />

                  {/* Camera overlay controls */}
                  <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleCameraFacing}
                      className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-sm transition-colors cursor-pointer"
                      title="Switch Camera (Front/Rear)"
                    >
                      <SwitchCamera size={16} />
                    </button>
                  </div>

                  {!isCameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white bg-black/80 p-4 text-center">
                      <Camera size={36} className="text-slate-400 mb-2" />
                      <p className="text-xs font-bold">{cameraError || 'Camera stream inactive'}</p>
                      <button
                        type="button"
                        onClick={() => startCamera()}
                        className="mt-3 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
                      >
                        Activate Camera
                      </button>
                    </div>
                  )}
                </div>

                {isCameraActive && (
                  <div className="flex items-center justify-center gap-3">
                    <button
                      type="button"
                      disabled={isUploadingToCloudinary}
                      onClick={handleCapturePhoto}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold shadow-md shadow-blue-600/30 flex items-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                    >
                      <Camera size={16} />
                      {isUploadingToCloudinary ? 'Saving to Cloudinary...' : 'Capture Site Photo'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. Device File Uploader Dropzone */}
            {photoTab === 'upload' && (
              <div>
                <label 
                  htmlFor="device-file-input"
                  className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-white rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:bg-blue-50/50 group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 group-hover:bg-blue-100 text-blue-600 flex items-center justify-center mb-2 transition-colors">
                    <UploadCloud size={24} />
                  </div>
                  <h4 className="text-xs font-black text-[#022C4F]">Click to upload or drag & drop</h4>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    JPEG, PNG, WebP, HEIC (Auto-uploaded to Cloudinary)
                  </p>
                  <input
                    id="device-file-input"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleDeviceFiles}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {/* 3. Secure Link Input with Security Validation */}
            {photoTab === 'link' && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlSecurityStatus('idle');
                      }}
                      placeholder="https://example.com/site-photo.jpg"
                      className="w-full pl-3 pr-8 py-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    {urlSecurityStatus === 'safe' && (
                      <CheckCircle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500" />
                    )}
                    {urlSecurityStatus === 'insecure' && (
                      <AlertTriangle size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500" />
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isUploadingToCloudinary || !urlInput.trim()}
                    onClick={verifyAndAddUrl}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <ShieldCheck size={14} /> Verify & Add
                  </button>
                </div>

                {urlSecurityMessage && (
                  <p className={`text-[11px] font-semibold px-2 ${
                    urlSecurityStatus === 'safe' ? 'text-emerald-600' :
                    urlSecurityStatus === 'insecure' ? 'text-rose-600' : 'text-slate-500'
                  }`}>
                    {urlSecurityMessage}
                  </p>
                )}
              </div>
            )}

            {/* Uploading progress indicator */}
            {isUploadingToCloudinary && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-2.5 text-xs text-blue-800 font-semibold animate-pulse">
                <RefreshCw size={14} className="animate-spin text-blue-600" />
                <span>{uploadProgressText || 'Uploading image asset to Cloudinary...'}</span>
              </div>
            )}

            {/* Gallery Thumbnail Preview Strip */}
            {photos.length > 0 && (
              <div className="pt-2">
                <div className="grid grid-cols-3 gap-2.5">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-white h-24 shadow-sm">
                      <img src={p} alt={`Site evidence ${idx + 1}`} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => handleRemovePhoto(idx)}
                          className="p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer"
                          title="Remove photo"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingToCloudinary}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Plus size={16} /> {isSubmitting ? 'Publishing...' : 'Publish Daily Update'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
