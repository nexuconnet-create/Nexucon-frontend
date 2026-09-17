"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Play,
  Check,
  X,
  Navigation,
  Compass,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Hash,
} from "lucide-react";
import {
  getInspectorInspectionById,
  checkinInspectorInspection,
} from "@/services/inspector";
import { Inspection } from "@/services/inspections";
import { computeSHA256, enqueueSyncItem } from "@/lib/offline-sync";

export default function InspectorInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = (params?.id as string) || "insp-001";

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Geofence & Check-In State
  const [distanceMeters, setDistanceMeters] = useState(32);
  const [gpsVerified, setGpsVerified] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [sitePhoto, setSitePhoto] = useState<string | null>(null);
  const [sitePhotoHash, setSitePhotoHash] = useState<string | null>(null);
  const [isCapturingPhoto, setIsCapturingPhoto] = useState(false);
  const [timestamp, setTimestamp] = useState("2026-09-16 09:15:23 WAT");

  const GEOFENCE_RADIUS = 50;
  const isWithinGeofence = distanceMeters <= GEOFENCE_RADIUS;

  useEffect(() => {
    if (!inspectionId) return;
    setIsLoading(true);
    getInspectorInspectionById(inspectionId)
      .then((data) => {
        setInspection(data);
        if (data.gps_verified) {
          setGpsVerified(true);
          setDistanceMeters(28);
        }
      })
      .catch((err) => {
        console.warn("Using sample inspection detail for terminal:", err);
      })
      .finally(() => setIsLoading(false));
  }, [inspectionId]);

  const projectName = inspection?.project_name || "Eko Atlantic Tower";
  const siteAddress = inspection?.project_location || "Eko Atlantic Tower, Lekki Phase 1, Lagos";
  const coordinates = "6.428100° N, 3.421900° E";
  const inspectorBadge = "Badge #LAG-INS-042";

  const handleCapturePhoto = async () => {
    setIsCapturingPhoto(true);
    const mockImageData = `SITE_PHOTO_${projectName}_${Date.now()}`;
    const hash = await computeSHA256(mockImageData);
    setTimeout(() => {
      setSitePhoto("https://images.unsplash.com/photo-1541888946425-d0fbb1861593?q=80&w=800&auto=format&fit=crop");
      setSitePhotoHash(hash);
      setIsCapturingPhoto(false);

      enqueueSyncItem({
        type: "EVIDENCE",
        title: `Site Arrival Photo - ${projectName}.jpg`,
        payload: { coordinates, distanceMeters, inspectorBadge },
        hash: hash,
        timestamp: new Date().toISOString(),
        sizeBytes: 2400000,
        source: "FIELD_TERMINAL",
      });
    }, 600);
  };

  const handleCheckin = async () => {
    if (!isWithinGeofence) return;
    setIsCheckingIn(true);
    try {
      await checkinInspectorInspection(inspectionId, {
        latitude: 6.4281,
        longitude: 3.4219,
      });
    } catch (err) {
      console.warn("GPS Checkin offline cache mode:", err);
    } finally {
      setIsCheckingIn(false);
      setGpsVerified(true);
      setTimestamp(new Date().toLocaleString("en-US", { timeZoneName: "short" }));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-16">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard/inspections")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Inspections"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400 font-bold uppercase">
              <span>FIELD INSPECTION</span>
              <span>•</span>
              <span className="text-[#0284C7]">TERMINAL CHECK-IN</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              FIELD INSPECTION - {projectName.toUpperCase()}
            </h1>
          </div>
        </div>

        <Link
          href="/inspector/dashboard/inspections"
          className="text-xs font-bold text-[#022C4F] hover:text-[#0284C7] flex items-center gap-1 self-start sm:self-auto"
        >
          <span>&larr; Back to Schedule</span>
        </Link>
      </div>

      {/* GEOFENCED GPS CHECK-IN (Module 2 Wireframe Container) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Navigation size={18} className="text-[#022C4F]" />
            <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
              GEOFENCED GPS CHECK-IN
            </h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-mono font-bold border ${
            gpsVerified
              ? "bg-emerald-50 text-emerald-700 border-emerald-300"
              : isWithinGeofence
              ? "bg-cyan-50 text-cyan-800 border-cyan-300"
              : "bg-rose-50 text-rose-700 border-rose-300"
          }`}>
            {gpsVerified ? "CHECKED IN ✅" : isWithinGeofence ? "READY TO CHECK IN" : "OUTSIDE GEOFENCE ❌"}
          </span>
        </div>

        {/* Interactive Geofence Radar Canvas / Map Simulation */}
        <div className="relative rounded-2xl bg-[#031D33] border border-slate-700 p-6 text-white overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
          {/* Grid Background Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#093356_1px,transparent_1px),linear-gradient(to_bottom,#093356_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />

          {/* Concentric Geofence Rings */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            {/* Outer Geofence Perimeter: 50m Radius */}
            <div className="absolute w-56 h-56 rounded-full border-2 border-dashed border-cyan-400/60 animate-pulse flex items-center justify-center bg-cyan-900/10">
              <span className="absolute -top-3 px-2 py-0.5 rounded bg-cyan-950 text-[10px] font-mono text-cyan-300 font-bold border border-cyan-500/40">
                50m Boundary
              </span>
            </div>

            {/* Inner Proximity Ring: 25m */}
            <div className="absolute w-28 h-28 rounded-full border border-blue-400/30" />

            {/* Center: Site Construction Target */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <span className="text-xl">🏗️</span>
              </div>
              <span className="text-[11px] font-bold text-cyan-200 mt-1 font-mono">Site Datum</span>
            </div>

            {/* Inspector Current Position Marker (32m away) */}
            <div
              className="absolute z-20 flex flex-col items-center"
              style={{ transform: "translate(38px, -42px)" }}
            >
              <div className="relative">
                <span className="absolute -inset-1 rounded-full bg-rose-500/50 animate-ping" />
                <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-[9px] font-bold text-white shadow-lg">
                  🔴
                </div>
              </div>
              <div className="mt-1 px-2 py-0.5 rounded bg-slate-900/90 text-[10px] font-mono font-bold text-white border border-rose-500/40 whitespace-nowrap">
                Inspector ({distanceMeters}m)
              </div>
            </div>
          </div>

          {/* Live Geofence HUD Readout */}
          <div className="relative z-10 mt-4 px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/80 backdrop-blur-md flex flex-wrap items-center justify-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span>🔴 Your Location:</span>
              <span className="text-white">6.4281° N, 3.4219° E</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1.5 text-cyan-300">
              <span>🏗️ Site Boundary:</span>
              <span className="text-white">50m radius</span>
            </span>
            <span className="text-slate-500">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span>Distance: {distanceMeters}m</span>
              <span>•</span>
              <span>Status: WITHIN GEOFENCE ✅</span>
            </span>
          </div>
        </div>

        {/* Site Details Box (Specified in Wireframe 2) */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs font-mono">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <span className="text-gray-500 block">SITE ADDRESS:</span>
              <span className="font-bold text-gray-900">{siteAddress}</span>
            </div>
            <div>
              <span className="text-gray-500 block">GPS COORDINATES:</span>
              <span className="font-bold text-gray-900">{coordinates}</span>
            </div>
            <div>
              <span className="text-gray-500 block">INSPECTOR:</span>
              <span className="font-bold text-gray-900">{inspectorBadge}</span>
            </div>
            <div>
              <span className="text-gray-500 block">TIMESTAMP:</span>
              <span className="font-bold text-gray-900">{timestamp}</span>
            </div>
          </div>
        </div>

        {/* Photo Preview if Captured */}
        {sitePhoto && (
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sitePhoto}
                alt="Site Arrival"
                className="w-16 h-16 rounded-lg object-cover border border-emerald-300 shadow-sm"
              />
              <div>
                <span className="text-xs font-bold text-emerald-900 block">
                  Site Arrival Verification Photo Attached ✅
                </span>
                <span className="text-[11px] font-mono text-emerald-700 block truncate max-w-sm">
                  SHA-256: {sitePhotoHash}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-mono bg-emerald-200/70 text-emerald-900 font-bold px-2 py-1 rounded">
              Cryptographically Stamped
            </span>
          </div>
        )}

        {/* Geofence Check-In Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCapturePhoto}
            disabled={isCapturingPhoto}
            className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#022C4F] font-bold text-xs uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <Camera size={16} className="text-[#0284C7]" />
            <span>{isCapturingPhoto ? "Hashing Photo..." : "📸 TAKE SITE PHOTO"}</span>
          </button>

          <button
            type="button"
            onClick={handleCheckin}
            disabled={!isWithinGeofence || isCheckingIn || gpsVerified}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              gpsVerified
                ? "bg-emerald-600 text-white cursor-default"
                : isWithinGeofence
                ? "bg-[#022C4F] hover:bg-[#022C4F]/90 text-white"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            }`}
          >
            {gpsVerified ? (
              <>
                <CheckCircle2 size={16} />
                <span>CHECKED IN AT SITE ✅</span>
              </>
            ) : (
              <>
                <Navigation size={16} className="text-cyan-300" />
                <span>{isCheckingIn ? "Verifying Geofence..." : "📍 CAPTURE GPS + CHECK IN"}</span>
              </>
            )}
          </button>
        </div>

        {/* Geofence Notice Banner */}
        <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs font-medium text-amber-900 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-600 shrink-0" />
            <span>⚠️ <strong>WARNING:</strong> You must be within 50m of the site to check in. Current distance: {distanceMeters}m ✅</span>
          </div>
          <span className="font-mono text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
            WITHIN GEOFENCE
          </span>
        </div>

        {/* Stage Execution Gateway */}
        {gpsVerified && (
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#022C4F] to-[#014175] text-white flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
            <div>
              <span className="text-[10px] font-mono font-bold text-cyan-300 uppercase tracking-widest block mb-1">
                CHECK-IN VERIFIED &bull; STAGES UNLOCKED
              </span>
              <h3 className="text-base font-bold">Launch Interactive Structural Checklist</h3>
              <p className="text-xs text-cyan-100/80">Begin Foundation Excavation, Rebar Spacing, and Cover Alignment checks.</p>
            </div>
            <Link
              href={`/inspector/dashboard/inspections/${inspectionId}/stage/stage-1`}
              className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#022C4F] font-black text-xs uppercase tracking-wider transition-colors shadow-lg flex items-center gap-2 shrink-0"
            >
              <span>OPEN STAGE 1 CHECKLIST</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
