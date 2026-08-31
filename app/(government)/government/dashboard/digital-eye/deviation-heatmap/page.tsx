"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Map,
  Download,
  AlertTriangle,
  Maximize,
  Layers,
  Thermometer,
  Loader2,
  CheckCircle,
  ChevronDown
} from "lucide-react";
import api from "@/lib/api";

interface Hotspot {
  id: string;
  element: string;
  level?: string;
  deviation_mm: number | null;
  severity: string;
  type: string;
  location: string;
  confidence?: number | null;
  description?: string | null;
}

interface HeatmapResponse {
  available: boolean;
  session_id: string;
  session_name: string;
  alignment_status: string;
  mean_deviation: number | null;
  max_deviation: number | null;
  min_deviation: number | null;
  hotspot_count: number;
  hotspots: Hotspot[];
  updated_at: string | null;
  message?: string;
}

/** Classify severity based on tolerance slider and real deviation value. */
function classifySeverity(
  devMm: number | null,
  backendSeverity: string,
  tolerance: number
): string {
  // If no measured deviation, use backend severity as-is
  if (devMm === null || devMm === undefined) return backendSeverity;

  const abs = Math.abs(devMm);
  if (abs > tolerance + 5) return "critical";
  if (abs > tolerance) return "high";
  if (abs > 5) return "medium";
  return "low";
}

/** Pick the optimal grid layout based on the number of hotspots. */
function getGridLayout(count: number): { cols: number; rows: number; className: string } {
  if (count <= 1) return { cols: 1, rows: 1, className: "grid-cols-1 grid-rows-1" };
  if (count <= 2) return { cols: 2, rows: 1, className: "grid-cols-2 grid-rows-1" };
  if (count <= 4) return { cols: 2, rows: 2, className: "grid-cols-2 grid-rows-2" };
  if (count <= 6) return { cols: 3, rows: 2, className: "grid-cols-3 grid-rows-2" };
  if (count <= 9) return { cols: 3, rows: 3, className: "grid-cols-3 grid-rows-3" };
  if (count <= 12) return { cols: 4, rows: 3, className: "grid-cols-4 grid-rows-3" };
  return { cols: 4, rows: 4, className: "grid-cols-4 grid-rows-4" };
}

/** Colour class for a severity badge */
function severityBadge(severity: string) {
  switch (severity) {
    case "critical": return "bg-red-100 text-red-700";
    case "high": return "bg-orange-100 text-orange-700";
    case "medium": return "bg-yellow-100 text-yellow-700";
    case "low": return "bg-emerald-100 text-emerald-700";
    default: return "bg-slate-100 text-slate-600";
  }
}

/** Overlay gradient for a heatmap cell */
function cellOverlay(severity: string) {
  switch (severity) {
    case "critical":
      return <div className="absolute inset-0 bg-gradient-to-br from-red-500/80 to-red-600/30 animate-pulse" />;
    case "high":
      return <div className="absolute inset-0 bg-gradient-to-tl from-orange-500/70 to-orange-400/20" />;
    case "medium":
      return <div className="absolute inset-0 bg-gradient-to-tl from-yellow-400/60 to-yellow-300/15" />;
    case "low":
      return <div className="absolute inset-0 bg-gradient-to-tl from-emerald-400/40 to-emerald-300/10" />;
    default:
      return null;
  }
}

function formatDev(devMm: number | null): string {
  if (devMm === null || devMm === undefined) return "N/A";
  return `${devMm > 0 ? "+" : ""}${devMm}mm`;
}

export default function DeviationHeatmapPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [loading, setLoading] = useState(true);
  const [deviationData, setDeviationData] = useState<HeatmapResponse | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [rawHotspots, setRawHotspots] = useState<Hotspot[]>([]);

  // UI states
  const [tolerance, setTolerance] = useState(15);
  const [viewMode, setViewMode] = useState("Floor Plan View");
  const [exportingPdf, setExportingPdf] = useState(false);
  const [typeFilter, setTypeFilter] = useState("all");
  const [layersOpen, setLayersOpen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);

  // ----- Derived hotspots with tolerance-based severity -----
  const hotspots = useMemo(() => {
    // Backend clash ids can repeat (e.g. several clusters against one BIM
    // element); de-duplicate so every hotspot keeps a unique React key.
    // (Plain object, not Map — this module imports the lucide "Map" icon.)
    const seen: Record<string, number> = {};
    return rawHotspots.map((h, idx) => {
      const base = h.id || `HS-${String(idx + 1).padStart(2, "0")}`;
      const n = (seen[base] || 0) + 1;
      seen[base] = n;
      return {
        ...h,
        severity: classifySeverity(h.deviation_mm, h.severity, tolerance),
        displayId: n > 1 ? `${base}-${n}` : base,
      };
    });
  }, [rawHotspots, tolerance]);

  const availableTypes = useMemo(
    () => Array.from(new Set(hotspots.map(h => h.type).filter(Boolean))),
    [hotspots]
  );

  const visibleHotspots = useMemo(
    () => typeFilter === "all" ? hotspots : hotspots.filter(h => h.type === typeFilter),
    [hotspots, typeFilter]
  );

  const toggleFullscreen = () => {
    const el = viewerRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      el.requestFullscreen().catch(err => console.error("Fullscreen request failed", err));
    }
  };

  // ----- Grid layout adapts to visible hotspot count -----
  const gridLayout = useMemo(() => {
    const count = visibleHotspots.length || 0;
    return getGridLayout(count);
  }, [visibleHotspots]);

  // ----- PDF export -----
  const handleExportPdf = async () => {
    if (!selectedSessionId) return;
    try {
      setExportingPdf(true);
      await api.post(`/scans/${selectedSessionId}/report/`).catch(() => {});
      const response = await api.get(`/scans/${selectedSessionId}/report/pdf/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([response.data], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Deviation_Report_${selectedSessionId.substring(0, 8)}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error("Export PDF failed:", err);
    } finally {
      setExportingPdf(false);
    }
  };

  // ----- Fetch sessions -----
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get("/scans/sessions/");
        const data = res.data;
        setSessions(data);
        if (data.length > 0) {
          setSelectedSessionId(data[0].id);
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // ----- Fetch heatmap data when session changes -----
  useEffect(() => {
    if (!selectedSessionId) return;

    const fetchDeviationData = async () => {
      try {
        setLoadingData(true);
        const res = await api.get(`/scans/${selectedSessionId}/heatmap/`);
        const data: HeatmapResponse = res.data;

        if (data && data.available) {
          setDeviationData(data);
          setRawHotspots(Array.isArray(data.hotspots) ? data.hotspots : []);
        } else {
          setDeviationData(data); // keep the response for the "no data" message
          setRawHotspots([]);
        }
      } catch (error) {
        console.error("Failed to fetch deviation data", error);
        setDeviationData(null);
        setRawHotspots([]);
      } finally {
        setLoadingData(false);
      }
    };

    fetchDeviationData();
  }, [selectedSessionId]);

  // ----- View-mode grid override -----
  const getGridClasses = () => {
    if (visibleHotspots.length === 0) return "grid-cols-1 grid-rows-1";
    const count = visibleHotspots.length;
    switch (viewMode) {
      case "Elevation View":
        // Wide, shallow — up to 6 columns
        if (count <= 1) return "grid-cols-1 grid-rows-1";
        if (count <= 2) return "grid-cols-2 grid-rows-1";
        if (count <= 3) return "grid-cols-3 grid-rows-1";
        if (count <= 4) return "grid-cols-4 grid-rows-1";
        if (count <= 6) return "grid-cols-6 grid-rows-1";
        if (count <= 12) return "grid-cols-6 grid-rows-2";
        return "grid-cols-6 grid-rows-3";
      case "Section Box":
        // Narrow, tall — up to 3 columns
        if (count <= 1) return "grid-cols-1 grid-rows-1";
        if (count <= 2) return "grid-cols-1 grid-rows-2";
        if (count <= 3) return "grid-cols-1 grid-rows-3";
        if (count <= 6) return "grid-cols-2 grid-rows-3";
        if (count <= 9) return "grid-cols-3 grid-rows-3";
        return "grid-cols-3 grid-rows-4";
      case "Floor Plan View":
      default:
        return gridLayout.className;
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Map className="text-orange-500" size={32} />
            Deviation Heatmap
          </h1>
          <p className="text-gray-500 mt-1">
            Visual analysis of geometric variance between SLAM point cloud and BIM model.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            disabled={exportingPdf || !selectedSessionId}
            className="px-4 py-2 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {exportingPdf ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Download size={18} />
            )}
            {exportingPdf ? "Exporting PDF..." : "Export PDF Report"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Panel - Legend & Hotspots */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="mb-4">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                Select Scan Session{" "}
                {loading && (
                  <Loader2 size={12} className="animate-spin text-blue-500" />
                )}
              </label>
              <select
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none"
                value={selectedSessionId}
                onChange={(e) => setSelectedSessionId(e.target.value)}
                disabled={loading || sessions.length === 0}
              >
                {sessions.length === 0 && !loading && (
                  <option>No scan sessions available</option>
                )}
                {sessions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name || `SCN-${s.id.substring(0, 8)}`}
                  </option>
                ))}
              </select>
            </div>

            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2 pt-2 border-t border-slate-100">
              <Thermometer size={18} /> Tolerance Legend
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-emerald-500"></div>
                  <span className="text-sm text-slate-600 font-medium">
                    In Tolerance
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">±5mm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-400"></div>
                  <span className="text-sm text-slate-600 font-medium">
                    Minor Variance
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">&gt; 5mm</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-sm text-slate-600 font-medium">
                    Major Variance
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  &gt; {tolerance}mm
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-600 animate-pulse"></div>
                  <span className="text-sm text-slate-600 font-medium">
                    Critical
                  </span>
                </div>
                <span className="text-xs font-bold text-slate-400">
                  &gt; {tolerance + 5}mm
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100">
              <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">
                Global Tolerance Threshold: ±{tolerance}mm
              </label>
              <input
                type="range"
                className="w-full accent-orange-500 cursor-pointer"
                value={tolerance}
                onChange={(e) => setTolerance(parseInt(e.target.value))}
                min="1"
                max="50"
              />
              <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-mono">
                <span>1mm</span>
                <span>±{tolerance}mm</span>
                <span>50mm</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#022C4F] flex items-center gap-2">
                <AlertTriangle size={18} /> Critical Hotspots
              </h3>
              {loadingData && (
                <Loader2 size={14} className="animate-spin text-slate-400" />
              )}
            </div>
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {visibleHotspots.map((spot) => (
                <div
                  key={spot.displayId}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-slate-500">
                      {spot.displayId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${severityBadge(spot.severity)}`}
                    >
                      {formatDev(spot.deviation_mm)}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
                    {spot.location || spot.element}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {spot.type} {spot.deviation_mm !== null ? "Deviation" : "Anomaly"}
                  </p>
                  {spot.description && (
                    <p className="text-[10px] text-slate-400 mt-1 truncate">
                      {spot.description}
                    </p>
                  )}
                </div>
              ))}

              {!loadingData && visibleHotspots.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  {typeFilter !== "all"
                    ? `No ${typeFilter} hotspots in this session.`
                    : deviationData?.message || "No deviations found for this session."}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Heatmap Viewer */}
        <div ref={viewerRef} className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col border border-slate-800">
          {/* Viewer Toolbar */}
          <div className="p-3 bg-slate-800/80 backdrop-blur-md border-b border-slate-700 flex items-center justify-between z-20">
            <div className="flex gap-2">
              <select
                className="bg-slate-700 text-white text-xs font-medium rounded px-2 py-1.5 outline-none cursor-pointer"
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
              >
                <option>Floor Plan View</option>
                <option>Elevation View</option>
                <option>Section Box</option>
              </select>
              <div className="relative">
                <button
                  onClick={() => setLayersOpen(o => !o)}
                  title="Filter hotspot layers"
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors flex items-center gap-1.5 ${
                    typeFilter !== "all"
                      ? "bg-blue-600 text-white hover:bg-blue-500"
                      : "bg-slate-700 hover:bg-slate-600 text-white"
                  }`}
                >
                  <Layers size={14} />
                  {typeFilter !== "all" && <span className="max-w-[90px] truncate">{typeFilter}</span>}
                  <ChevronDown size={12} />
                </button>
                {layersOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setLayersOpen(false)} />
                    <div className="absolute left-0 mt-2 z-20 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 min-w-[170px]">
                      <button
                        onClick={() => { setTypeFilter("all"); setLayersOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2"
                      >
                        All layers
                        {typeFilter === "all" && <CheckCircle size={14} className="text-blue-500" />}
                      </button>
                      {availableTypes.map(t => (
                        <button
                          key={t}
                          onClick={() => { setTypeFilter(t); setLayersOpen(false); }}
                          className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{t}</span>
                          {typeFilter === t && <CheckCircle size={14} className="text-blue-500 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={toggleFullscreen}
                title="Toggle fullscreen"
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Maximize size={18} />
              </button>
            </div>
          </div>

          {/* Heatmap Canvas */}
          <div className="flex-1 relative bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-slate-900/50 z-0"></div>

            {loadingData ? (
              <div className="relative z-10 flex flex-col items-center gap-3">
                <Loader2 size={40} className="animate-spin text-orange-400" />
                <span className="text-slate-400 text-sm font-medium">
                  Loading heatmap data...
                </span>
              </div>
            ) : visibleHotspots.length === 0 ? (
              <div className="relative z-10 flex flex-col items-center gap-3 text-center px-8">
                <Map size={48} className="text-slate-600" />
                <span className="text-slate-400 text-sm font-medium">
                  {typeFilter !== "all"
                    ? `No ${typeFilter} hotspots in this session.`
                    : deviationData?.message ||
                      "No deviation data available for the selected session."}
                </span>
                {typeFilter === "all" && (
                  <span className="text-slate-500 text-xs">
                    Run a BIM alignment or AI analysis to generate heatmap data.
                  </span>
                )}
              </div>
            ) : (
              /* Dynamic grid based on real backend hotspots */
              <div
                className={`relative z-10 w-3/4 h-3/4 border-2 border-slate-700 grid gap-1 p-1 transition-all duration-500 ${getGridClasses()}`}
              >
                {visibleHotspots.map((spot, i) => (
                  <div
                    key={spot.displayId}
                    className="border border-slate-600 relative overflow-hidden group"
                  >
                    {/* Base green (in-tolerance) layer */}
                    <div className="absolute inset-0 bg-emerald-500/20"></div>

                    {/* Severity-based overlay from backend data */}
                    {cellOverlay(spot.severity)}

                    {/* Hover detail panel */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900/70 backdrop-blur-sm p-2 text-center">
                      <span className="text-white text-xs font-bold font-mono">
                        {spot.element}
                      </span>
                      <span className="text-[10px] text-slate-300 mt-0.5">
                        {spot.location}
                      </span>
                      <span
                        className={`text-[10px] font-mono mt-1 px-1.5 py-0.5 rounded ${
                          spot.severity === "critical"
                            ? "bg-red-500/50 text-white"
                            : spot.severity === "high"
                              ? "bg-orange-500/50 text-white"
                              : spot.severity === "medium"
                                ? "bg-yellow-500/50 text-white"
                                : "bg-emerald-500/50 text-white"
                        }`}
                      >
                        {formatDev(spot.deviation_mm)}
                      </span>
                      {spot.level && (
                        <span className="text-[9px] text-slate-400 mt-1">
                          {spot.level}
                        </span>
                      )}
                    </div>

                    {/* Always-visible label */}
                    <div className="absolute bottom-1 left-1 right-1 flex items-end justify-between pointer-events-none">
                      <span className="text-[9px] text-slate-300/70 font-mono truncate">
                        {spot.element}
                      </span>
                      {spot.deviation_mm !== null && (
                        <span className="text-[9px] text-slate-300/70 font-mono whitespace-nowrap">
                          {formatDev(spot.deviation_mm)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-slate-800/90 border border-slate-600 text-white px-3 py-2 rounded shadow-xl text-xs font-mono">
              {visibleHotspots.length} hotspot{visibleHotspots.length !== 1 ? "s" : ""} · Tolerance ±{tolerance}mm
            </div>

            {deviationData &&
            deviationData.mean_deviation !== undefined &&
            deviationData.mean_deviation !== null ? (
              <div className="absolute top-4 right-4 bg-slate-800/90 border border-slate-600 text-white px-3 py-2 rounded shadow-xl text-xs font-mono">
                Mean Dev: {Number(deviationData.mean_deviation).toFixed(2)}mm
                <br />
                Max Dev:{" "}
                {Number(deviationData.max_deviation || 0).toFixed(2)}mm
              </div>
            ) : (
              <div className="absolute top-4 right-4 bg-slate-800/90 border border-slate-600 text-white px-3 py-2 rounded shadow-xl text-xs font-mono">
                Mean Dev: N/A
                <br />
                Max Dev: N/A
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
