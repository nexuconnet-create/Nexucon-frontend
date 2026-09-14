"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scan, Camera, Ruler, AlertTriangle, ChevronLeft,
  Settings2, Activity, MapPin, X, CheckCircle2, QrCode
} from "lucide-react";
import { getProjects, Project } from "@/services/projects";
import { getDocuments, Document } from "@/services/documents";
import {
  getDigitalEyeFindings,
  getTrimbleConnectionStatus,
  DigitalEyeFinding,
  TrimbleConnection,
} from "@/services/digitalEye";

// A live-inspection deviation entry, derived from a real Digital Eye finding.
interface DeviationItem {
  id: string;
  element: string;
  issue: string;
  status: 'FAIL' | 'PASS';
  ncrReference: string | null;
}

// Map a real finding status onto the panel's PASS/FAIL rendering.
const mapFindingStatus = (finding: DigitalEyeFinding): 'FAIL' | 'PASS' => {
  if (finding.status === 'RESOLVED' || finding.status === 'VERIFIED') return 'PASS';
  return 'FAIL'; // OPEN / INVESTIGATING / CONVERTED_TO_NCR
};

export default function ARIntegrationWorkflow() {
  const [activeTool, setActiveTool] = useState<string | null>("overlay");
  const [isSpatialAnchoring, setIsSpatialAnchoring] = useState(false);
  const [showDeviationPanel, setShowDeviationPanel] = useState(true);

  // Real context: the latest project, the Trimble Connect connection state,
  // real Digital Eye findings, and the latest recorded site photo. No
  // fabricated device data — honest placeholders render until real data exists.
  const [projectName, setProjectName] = useState<string | null>(null);
  const [connection, setConnection] = useState<TrimbleConnection | null>(null);
  const [deviations, setDeviations] = useState<DeviationItem[]>([]);
  const [sitePhoto, setSitePhoto] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    Promise.all([
      getProjects().catch(() => [] as Project[]),
      getDocuments().catch(() => [] as Document[]),
      getDigitalEyeFindings().catch(() => [] as DigitalEyeFinding[]),
      getTrimbleConnectionStatus().catch(() => null),
    ]).then(([projects, docs, findings, trimble]) => {
      if (cancelled) return;
      const latest = [...projects].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0];
      setProjectName(latest?.name ?? null);
      const photos = docs
        .filter((d) => d.document_type === 'SITE_PHOTO' && d.file_url)
        .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime());
      setSitePhoto(photos[0] ?? null);
      setConnection(trimble);
      setDeviations(
        findings.map((f) => ({
          id: f.finding_reference || f.id,
          element: f.structural_element_name || '—',
          issue: f.title,
          status: mapFindingStatus(f),
          ncrReference: f.ncr_reference ?? null,
        }))
      );
      setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const isConnected = connection?.status === 'CONNECTED';
  const firstFail = deviations.find((d) => d.status === 'FAIL');

  const tools = [
    { id: 'overlay', icon: Camera, label: 'Physical Site Overlay' },
    { id: 'anchor', icon: MapPin, label: 'Azure Spatial Anchors' },
    { id: 'qr', icon: QrCode, label: 'QR Model Alignment' },
    { id: 'measure', icon: Ruler, label: 'Point-to-Point Measurement' },
    { id: 'clash', icon: AlertTriangle, label: 'Deviation Clash Visualization' },
  ];

  return (
    <div className="fixed inset-0 z-[100] w-full h-screen bg-black animate-in fade-in duration-500 overflow-hidden">

      {/* Camera/AR View Background — the latest real site photo on record, or an
          honest no-feed state. No stock imagery is presented as a live feed. */}
      {sitePhoto?.file_url ? (
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: `url('${sitePhoto.file_url}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: activeTool === 'overlay' ? "brightness(0.6) sepia(0.2)" : "none"
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#0F181F] flex flex-col items-center justify-center text-center px-8">
          <Camera size={36} className="text-white/30 mb-4" />
          <p className="text-[14px] font-bold text-white/70">No camera feed available</p>
          <p className="text-[11px] text-white/40 mt-1 max-w-[360px]">
            The latest recorded site photo will appear here once one has been uploaded.
          </p>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 h-16 bg-white/10 backdrop-blur-xl border-b border-white/20 z-30 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/professional/dashboard/workspace">
            <button className="p-2 rounded-full hover:bg-white/20 text-white transition-colors">
              <ChevronLeft size={24} />
            </button>
          </Link>
          <div className="flex flex-col text-white">
            <h1 className="text-[16px] font-extrabold leading-tight flex items-center gap-2">
              <Scan size={16} className={isConnected ? "text-green-400" : "text-gray-400"} /> SiteSupervise AR Inspection
            </h1>
            <span className="text-[11px] text-white/70 font-medium">
              {isConnected
                ? `Live Feed • ${projectName || 'No project recorded'}`
                : `${connection ? (connection.status_display || connection.status) : 'Feed Not Connected'} • ${projectName || 'No project recorded'}`}
            </span>
          </div>
        </div>
      </div>

      {/* Main AR UI Overlay */}
      <div className="relative w-full h-full mt-16 flex items-center justify-between pointer-events-none p-6">

        {/* Left Tools Palette */}
        <div className="pointer-events-auto bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 flex flex-col gap-4 shadow-2xl">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(isActive ? null : tool.id)}
                className={`p-3 rounded-xl transition-all group relative ${
                  isActive
                    ? tool.id === 'clash' ? 'bg-red-500 text-white' : 'bg-blue-600 text-white'
                    : 'text-white/70 hover:bg-white/20 hover:text-white'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-gray-900 text-white text-[11px] font-bold rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                  {tool.label}
                </div>
              </button>
            );
          })}
        </div>

        {/* Center Canvas Reticle / Visualizations */}
        <div className="flex-1 h-full relative flex items-center justify-center">
          {/* Alignment Reticle */}
          <div className="w-16 h-16 border-2 border-white/30 rounded-full flex items-center justify-center relative">
            <div className="w-1 h-4 bg-white/50 absolute top-0" />
            <div className="w-1 h-4 bg-white/50 absolute bottom-0" />
            <div className="w-4 h-1 bg-white/50 absolute left-0" />
            <div className="w-4 h-1 bg-white/50 absolute right-0" />
            <div className="w-2 h-2 bg-green-400 rounded-full" />
          </div>

          {/* Point-to-Point Measurement — no measurement device feeds this
              overlay, so no distance value is invented. */}
          {activeTool === 'measure' && (
            <div className="absolute top-1/3 left-1/4 w-64 h-px bg-yellow-400 rotate-12 flex items-center justify-center shadow-[0_0_8px_rgba(250,204,21,0.8)]">
              <div className="absolute left-0 w-3 h-3 bg-white rounded-full border-2 border-yellow-400 -translate-x-1/2" />
              <div className="absolute right-0 w-3 h-3 bg-white rounded-full border-2 border-yellow-400 translate-x-1/2" />
              <div className="bg-yellow-400 text-black text-[10px] font-bold px-2 py-0.5 rounded-full -translate-y-4">
                No measurement captured
              </div>
            </div>
          )}

          {/* Clash/Deviation Visualization — anchored to the first real open
              finding, when one exists. */}
          {activeTool === 'clash' && firstFail && (
            <div className="absolute top-[40%] right-[30%]">
              <div className="w-32 h-32 bg-red-500/20 border-2 border-red-500 animate-pulse rounded-lg relative">
                <div className="absolute -top-3 -right-3 bg-red-600 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                  <AlertTriangle size={12} /> {firstFail.id}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right AR Deviation Sync Panel */}
        {showDeviationPanel && (
          <div className="pointer-events-auto w-[360px] h-full max-h-[700px] bg-white/95 backdrop-blur-xl border border-white/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden shrink-0">

            <div className="p-5 border-b border-gray-200 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-[14px] font-extrabold text-[#022C4F] flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> Live Inspection Sync
              </h3>
              {isConnected ? (
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Connected
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full" /> Not connected
                </span>
              )}
            </div>

            <div className="p-4 flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4">
              <p className="text-[11px] text-gray-500 font-medium mb-2">
                Deviations recorded through Digital Eye scan sessions appear here. Open items can be escalated by the engineering team.
              </p>

              {isLoading ? (
                <div className="py-12 text-center text-[12px] text-gray-400 font-medium">Loading inspection records...</div>
              ) : deviations.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-[12px] font-bold text-gray-500">No deviations recorded yet</p>
                  <p className="text-[10px] text-gray-400 leading-relaxed max-w-[260px]">
                    Findings captured through Digital Eye scan sessions will appear here.
                  </p>
                </div>
              ) : (
                deviations.map((dev) => (
                  <div key={dev.id} className={`p-4 rounded-2xl border transition-all ${
                    dev.status === 'FAIL'
                      ? 'bg-red-50/50 border-red-200'
                      : 'bg-green-50/50 border-green-200'
                  }`}>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[12px] font-bold text-[#0F181F]">{dev.element}</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        dev.status === 'FAIL' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {dev.status}
                      </span>
                    </div>

                    <p className="text-[12px] text-gray-600 mb-4">{dev.issue}</p>

                    {dev.ncrReference && (
                      <div className="w-full py-2 bg-gray-100 text-gray-600 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 border border-gray-200">
                        <CheckCircle2 size={14} /> NCR {dev.ncrReference}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
