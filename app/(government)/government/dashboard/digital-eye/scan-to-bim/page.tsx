"use client";

import React, { useState, useEffect } from "react";
import { 
  Box,
  Layers,
  Settings,
  Download,
  AlertTriangle,
  CheckCircle,
  Crosshair,
  Loader2,
  Play
} from "lucide-react";
import api, { notify } from "@/lib/api";
import { API_BASE_URL } from "@/lib/api";
import BimViewer from "@/components/dashboard/BimViewer";

export default function ScanToBIMPage() {
  const [selectedScan, setSelectedScan] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [files, setFiles] = useState<any[]>([]);
  // The session the current `files` were fetched under. Content URLs must be
  // built from this — not selectedScan — so a session switch can never pair
  // the old session's file IDs with the new session's ID mid-render.
  const [filesSession, setFilesSession] = useState("");
  const [alignmentResult, setAlignmentResult] = useState<any>(null);
  const [aligning, setAligning] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [bimOpacity, setBimOpacity] = useState(40);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/scans/sessions/');
        const data = res.data;
        setSessions(data);
        if (data.length > 0) {
          const params = new URLSearchParams(window.location.search);
          const sessionParam = params.get('session_id');
          if (sessionParam && data.find((s:any) => s.id === sessionParam)) {
            setSelectedScan(sessionParam);
          } else {
            setSelectedScan(data[0].id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedScan) return;
    const fetchDetails = async () => {
      try {
        setFetchingDetails(true);
        // Drop the previous session's files immediately so a slow refetch
        // can't mix old file IDs into the new session's content URLs.
        setFiles([]);
        setFilesSession("");
        setAlignmentResult(null);
        const [filesRes, devRes] = await Promise.all([
          api.get(`/scans/${selectedScan}/files/`),
          api.get(`/scans/${selectedScan}/deviation/`).catch(() => ({ data: null }))
        ]);
        setFiles(filesRes.data || []);
        setFilesSession(selectedScan);
        setAlignmentResult(devRes.data || null);
      } catch (err) {
        console.error("Failed to fetch details", err);
      } finally {
        setFetchingDetails(false);
      }
    };
    fetchDetails();
  }, [selectedScan]);

  const handleAlign = async () => {
    if (!selectedScan) return;
    try {
      setAligning(true);
      await api.post(`/scans/${selectedScan}/align-bim/`);
      notify("Alignment triggered successfully", "success");
      
      // Re-fetch deviations after a brief pause
      setTimeout(async () => {
        const devRes = await api.get(`/scans/${selectedScan}/deviation/`).catch(() => ({ data: null }));
        if (devRes.data) setAlignmentResult(devRes.data);
        setAligning(false);
      }, 3000);
      
    } catch (err) {
      notify("Failed to trigger alignment", "error");
      setAligning(false);
    }
  };

  const plyFile = files.find(f => f.file_type === 'gaussian_splat' || f.file_type === 'raw_scan');
  const bimFile = files.find(f => f.file_type === 'bim');

  // Stored file URLs are presigned R2 links that (a) expire ~1h after upload
  // and (b) cannot be fetched cross-origin from the browser. Route the viewer
  // through the same-origin backend streaming proxy instead. Keyed on
  // filesSession so the URL always matches the session the files came from.
  const contentUrl = (f: any) =>
    f && filesSession ? `${API_BASE_URL}/scans/${filesSession}/files/${f.id}/content/` : undefined;
  
  const meanDeviation = alignmentResult ? alignmentResult.mean_deviation : null;
  const maxDeviation = alignmentResult ? alignmentResult.max_deviation : null;
  const hasDeviation = meanDeviation !== null && meanDeviation > 20; // Example threshold

  const handleExportReport = async () => {
    if (!selectedScan) {
      notify("Please select a scan session first.", "error");
      return;
    }
    setExportingReport(true);
    try {
      notify("Generating report, please wait...", "info");
      const res = await api.get(`/scans/${selectedScan}/report/pdf/`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `scan-report-${selectedScan}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      notify("Report exported successfully", "success");
    } catch (error) {
      console.error("Failed to export report", error);
      notify("Failed to export report", "error");
    } finally {
      setExportingReport(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Box className="text-blue-600" size={32} />
            Scan-to-BIM Comparison
          </h1>
          <p className="text-gray-500 mt-1">
            Phase 2: Fusion of Tersus S1 GNSS absolute positioning with Geosun SLAM point clouds overlaid on the approved IFC/BIM model.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAlign}
            disabled={aligning || !plyFile || !bimFile}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            {aligning ? <Loader2 size={18} className="animate-spin" /> : <Play size={18} />} 
            Run Alignment
          </button>
          <button
            onClick={handleExportReport}
            disabled={exportingReport}
            className="px-4 py-2 bg-white border border-gray-200 text-[#022C4F] rounded-xl hover:bg-slate-50 transition-colors font-medium flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
            {exportingReport ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
            {exportingReport ? 'Downloading PDF…' : 'Export Report'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        {/* Left Panel - Controls & Selection */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Layers size={18} /> Overlay Selection
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block flex items-center gap-2">
                  Scan Session {loading && <Loader2 size={12} className="animate-spin text-blue-500" />}
                </label>
                <select 
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 outline-none"
                  value={selectedScan}
                  onChange={(e) => setSelectedScan(e.target.value)}
                  disabled={loading || sessions.length === 0}
                >
                  {sessions.length === 0 && !loading && <option>No scan sessions available</option>}
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name || `SCN-${s.id.substring(0,8)}`} ({new Date(s.created_at).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>

              {fetchingDetails ? (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-2"><Loader2 size={14} className="animate-spin"/> Fetching files...</div>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">BIM Model (IFC)</label>
                    <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 truncate">
                      {bimFile ? bimFile.file_name : "No BIM file attached"}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Point Cloud</label>
                    <div className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 truncate">
                      {plyFile ? plyFile.file_name : "No scan file attached"}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex-1">
            <h3 className="font-bold text-[#022C4F] mb-4 flex items-center gap-2">
              <Settings size={18} /> Display Controls
            </h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-xs font-bold text-slate-500">BIM Opacity</label>
                  <span className="text-xs font-medium text-slate-400">{bimOpacity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  className="w-full accent-blue-600"
                  value={bimOpacity}
                  onChange={(e) => setBimOpacity(Number(e.target.value))}
                />
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2">
                    <Crosshair size={16} className="text-blue-600" />
                    <span className="text-sm font-semibold text-blue-900">GNSS Lock (±2cm)</span>
                  </div>
                  {alignmentResult ? (
                    <CheckCircle size={16} className="text-emerald-500" />
                  ) : (
                    <AlertTriangle size={16} className="text-amber-500" />
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-2 text-center">
                  {alignmentResult ? "Coordinates anchored via Tersus MVP S1" : "Run alignment to lock coordinates"}
                </p>
              </div>

              {alignmentResult && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Mean Deviation</span>
                      <span className="font-bold text-slate-800">{meanDeviation} mm</span>
                   </div>
                   <div className="flex justify-between text-sm">
                      <span className="text-slate-500 font-medium">Max Deviation</span>
                      <span className="font-bold text-slate-800">{maxDeviation} mm</span>
                   </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Real 3D Viewer */}
        <div className="lg:col-span-3 bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg flex flex-col border border-slate-800">
          <BimViewer plyUrl={contentUrl(plyFile)} bimUrl={contentUrl(bimFile)} bimOpacity={bimOpacity / 100} />

          {/* Tooltips Overlay */}
          {alignmentResult && hasDeviation && (
            <div className="absolute bottom-6 right-6 bg-red-900/90 border border-red-500 text-white px-4 py-3 rounded shadow-xl text-xs flex items-start gap-3 z-20">
              <AlertTriangle size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-sm mb-1">Deviation Detected</span>
                Max deviation of {maxDeviation}mm exceeds tolerance.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
