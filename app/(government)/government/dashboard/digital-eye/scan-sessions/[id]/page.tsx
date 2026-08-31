"use client";

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import api, { getApiUrl } from '@/lib/api';
import {
  CheckCircle, AlertTriangle, Upload, Activity, Layers, FileText, Clock,
  Download, Loader2, Plus, X, Terminal, Camera, Thermometer, MapPin, Box,
  Building2, Boxes, FileUp
} from 'lucide-react';

/* ---------------------------------------------------------------------------
   Presentation-only helpers (no logic): severity pills + file-type icons,
   mapped to the app-wide Digital Eye palette (brand #022C4F, soft severity
   backgrounds) so every card on this page matches the other dashboards.
--------------------------------------------------------------------------- */
const SEVERITY_BADGE: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  critical: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-emerald-100 text-emerald-700',
};
const sevBadge = (s?: string) => SEVERITY_BADGE[(s || '').toLowerCase()] || 'bg-gray-100 text-gray-600';

const SEVERITY_ROW: Record<string, string> = {
  high: 'border-red-100 bg-red-50/70',
  critical: 'border-red-100 bg-red-50/70',
  medium: 'border-amber-100 bg-amber-50/70',
  low: 'border-emerald-100 bg-emerald-50/70',
};
const sevRow = (s?: string) => SEVERITY_ROW[(s || '').toLowerCase()] || 'border-gray-100 bg-gray-50';

const FILE_TYPE_META: Record<string, { icon: any; chip: string }> = {
  lidar: { icon: Layers, chip: 'bg-blue-50 text-blue-600' },
  rgb: { icon: Camera, chip: 'bg-emerald-50 text-emerald-600' },
  thermal: { icon: Thermometer, chip: 'bg-orange-50 text-orange-600' },
  gps: { icon: MapPin, chip: 'bg-violet-50 text-violet-600' },
  gaussian_splat: { icon: Box, chip: 'bg-cyan-50 text-cyan-600' },
  bim: { icon: Building2, chip: 'bg-blue-50 text-blue-600' },
  other: { icon: Boxes, chip: 'bg-gray-100 text-gray-600' },
};
const fileTypeMeta = (t?: string) => FILE_TYPE_META[(t || '').toLowerCase()] || FILE_TYPE_META.other;

const ScanDetail = () => {
  const params = useParams();
  const id = params.id as string;
  const [scan, setScan] = useState<any>(null);

  // Results States
  const [defects, setDefects] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [deviationLoading, setDeviationLoading] = useState(true);
  const [clashes, setClashes] = useState<any[]>([]);
  const [clashLoading, setClashLoading] = useState(true);
  const [clashMessage, setClashMessage] = useState<string>('');
  const [progress, setProgress] = useState<any>(null);

  // New States
  const [files, setFiles] = useState<any[]>([]);
  const [timeline, setTimeline] = useState<any[]>([]);
  const [processingStatus, setProcessingStatus] = useState<any>(null);

  // Streaming Modal State
  const [streamModal, setStreamModal] = useState<{ isOpen: boolean, type: 'ai' | 'bim', logs: string[], done: boolean }>({
    isOpen: false,
    type: 'ai',
    logs: [],
    done: false
  });

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showMetadataModal, setShowMetadataModal] = useState(false);
  const [metadataForm, setMetadataForm] = useState({ gps_coordinates: '', operator_notes: '' });

  const [showDefectModal, setShowDefectModal] = useState(false);
  const [defectForm, setDefectForm] = useState({ type: 'crack', severity: 'medium', description: '', bim_element_id: '' });
  const [defectImage, setDefectImage] = useState<File | null>(null);

  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [anomalyForm, setAnomalyForm] = useState({ temperature_variance: '', severity: 'medium', description: '' });
  const [anomalyImage, setAnomalyImage] = useState<File | null>(null);

  const fetchDetails = () => {
    if (!id) return;
    setLoading(true);
    // Explicitly use getScanStatus and getScanSession
    Promise.all([api.get(`/scans/${id}/`), api.get(`/scans/${id}/status/`)])
      .then(([sessionRes, statusRes]) => {
        setScan({ ...sessionRes.data, status: statusRes.data.status });
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load scan details.");
      })
      .finally(() => setLoading(false));

    api.get(`/scans/${id}/defects/`).then(res => setDefects(res.data)).catch(() => {});
    api.get(`/scans/${id}/thermal-anomalies/`).then(res => setAnomalies(res.data)).catch(() => {});
    setDeviationLoading(true);
    api.get(`/scans/${id}/deviation/`).then(res => {
      if (res.data && res.data.id) {
        const align = res.data;
        const devs: any[] = [];
        if (align.max_deviation !== null && align.max_deviation !== undefined) devs.push({ id: 'max', type: 'Deviation', deviation_amount_mm: align.max_deviation, bim_element_id: 'Max Overall Deviation', severity: align.max_deviation > 20 ? 'high' : 'medium' });
        if (align.mean_deviation !== null && align.mean_deviation !== undefined) devs.push({ id: 'mean', type: 'Deviation', deviation_amount_mm: align.mean_deviation, bim_element_id: 'Mean Overall Deviation', severity: 'low' });

        // Top hotspots: real per-point deviations (DEV-xx) and clash
        // intrusions (CLASH-xx) with their measured values and locations.
        if (align.top_deviations && Array.isArray(align.top_deviations)) {
          align.top_deviations.forEach((td: any) => {
            const isClash = (td.type || '').toLowerCase() === 'clash';
            const where = td.location ? ` @ ${td.location}` : '';
            devs.push({
              id: td.id || Math.random().toString(),
              type: isClash ? 'Clash' : 'Deviation',
              deviation_amount_mm: td.deviation_mm,
              bim_element_id: isClash
                ? `${td.id || 'Clash'}: ${td.element || 'BIM element'}${where}`
                : `${td.element || 'As-built point'} ${td.level || ''}${where}`.trim(),
              severity: td.severity || 'medium'
            });
          });
        }

        setDeviations(devs);
      } else {
        setDeviations([]);
      }
    }).catch(() => setDeviations([])).finally(() => setDeviationLoading(false));
    api.get(`/scans/${id}/progress/`).then(res => setProgress(res.data ? res.data : null)).catch(() => {});
    setClashLoading(true);
    api.get(`/scans/${id}/clash/`).then(res => { setClashes(res.data.clashes || []); setClashMessage(res.data.message || ''); }).catch(() => {}).finally(() => setClashLoading(false));
    api.get(`/scans/${id}/files/`).then(res => setFiles(res.data)).catch(() => {});
    api.get(`/scans/${id}/timeline/`).then(res => setTimeline(res.data)).catch(() => {});
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!id || scan?.status !== 'processing') return;

    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    const wsUrl = baseUrl.replace(/^http/, 'ws') + `/ws/processing/${id}/`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.status === 'completed' || data.status === 'failed') {
          fetchDetails(); // Refresh all details when done
        } else {
          setProcessingStatus((prev: any) => ({
             ...prev,
             status: data.status,
             status_message: data.message || (prev ? prev.status_message : '')
          }));
        }
      } catch (e) {
        console.error("Error parsing WS message", e);
      }
    };

    const interval = setInterval(() => {
      api.get(`/scans/${id}/processing-status/`).then(res => {
        setProcessingStatus(res.data && res.data.length > 0 ? res.data[0] : null);
        api.get(`/scans/${id}/status/`).then(statusRes => {
          if (statusRes.data.status !== 'processing') {
            fetchDetails();
          }
        });
      }).catch(() => {});
    }, 10000); // reduced polling frequency since WS is active

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, [id, scan?.status]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fileType: 'lidar' | 'rgb' | 'thermal' | 'gps' | 'gaussian_splat' | 'bim') => {
    if (!e.target.files || !e.target.files[0] || !id) return;
    setActionLoading(true);
    try {
      await api.post(`/scans/${id}/upload/${fileType}/`, (() => { const fd = new FormData(); fd.append("file", e.target.files[0]); return fd; })(), { headers: { "Content-Type": "multipart/form-data" } });
      alert(`${fileType.toUpperCase()} file uploaded successfully!`);
      fetchDetails();
    } catch (err) {
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteFile = async (fileId: string, fileName: string) => {
    if (!id || !fileId) return;
    if (!window.confirm(`Are you sure you want to delete ${fileName}?`)) return;
    setActionLoading(true);
    try {
      await api.delete(`/scans/${id}/files/${fileId}/`);
      fetchDetails();
    } catch (err) {
      alert("Failed to delete file.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAction = async (actionFn: (id: string) => Promise<any>, successMsg: string) => {
    if (!id) return;
    setActionLoading(true);
    try {
      await actionFn(id);
      alert(successMsg);
      fetchDetails();
    } catch (err) {
      alert("Action failed. Ensure previous steps are completed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStreamAction = async (type: 'ai' | 'bim') => {
    if (!id) return;
    setStreamModal({ isOpen: true, type, logs: [], done: false });

    try {
      const url = getApiUrl(`/scans/${id}/${type === 'ai' ? 'process' : 'align-bim'}/stream/`);
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.replace('data: ', '').trim();
            if (data === '[DONE]') {
              setStreamModal(prev => ({ ...prev, done: true }));
              setTimeout(() => {
                setStreamModal(prev => ({ ...prev, isOpen: false }));
                fetchDetails();
              }, 2000);
            } else if (data) {
              setStreamModal(prev => ({ ...prev, logs: [...prev.logs, data] }));
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setStreamModal(prev => ({ ...prev, logs: [...prev.logs, "Error connecting to stream."], done: true }));
    }
  };

  const handleMetadataSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const payload: any = {
        notes: metadataForm.operator_notes,
      };
      if (metadataForm.gps_coordinates && metadataForm.gps_coordinates.trim() !== '') {
        const parts = metadataForm.gps_coordinates.split(',');
        if (parts.length >= 2) {
          const latStr = parts[0].replace(/[^\d.-]/g, '');
          const lonStr = parts[1].replace(/[^\d.-]/g, '');
          const isSouth = parts[0].toUpperCase().includes('S');
          const isWest = parts[1].toUpperCase().includes('W');
          let lat = parseFloat(latStr);
          let lon = parseFloat(lonStr);
          if (!isNaN(lat) && !isNaN(lon)) {
            if (isSouth && lat > 0) lat = -lat;
            if (isWest && lon > 0) lon = -lon;
            payload.latitude = lat;
            payload.longitude = lon;
            payload.location = { latitude: lat, longitude: lon };
          }
        }
      } else {
        payload.latitude = null;
        payload.longitude = null;
        payload.location = null;
      }

      await api.post(`/scans/${id}/metadata/`, payload);
      alert("Metadata saved successfully!");
      setShowMetadataModal(false);
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to save metadata");
    }
  };

  const handleCreateDefect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const data: any = { ...defectForm };
      if (defectImage) data.image = defectImage;
      await api.post(`/scans/${id}/defects/`, (() => { const fd = new FormData(); Object.keys(data).forEach(k => fd.append(k, data[k])); return fd; })(), {headers: {"Content-Type": "multipart/form-data"}});
      setShowDefectModal(false);
      setDefectForm({ type: 'crack', severity: 'medium', description: '', bim_element_id: '' });
      setDefectImage(null);
      fetchDetails();
    } catch (err) {
      alert("Failed to create defect");
    }
  };

  const handleCreateAnomaly = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      const data: any = { ...anomalyForm };
      if (anomalyImage) data.image = anomalyImage;
      await api.post(`/scans/${id}/thermal-anomalies/`, (() => { const fd = new FormData(); Object.keys(data).forEach(k => fd.append(k, data[k])); return fd; })(), {headers: {"Content-Type": "multipart/form-data"}});
      setShowAnomalyModal(false);
      setAnomalyForm({ temperature_variance: '', severity: 'medium', description: '' });
      setAnomalyImage(null);
      fetchDetails();
    } catch (err) {
      alert("Failed to create anomaly");
    }
  };

  const handleGenerateReport = async () => {
    if (!id) return;
    setReportLoading(true);
    try {
      await api.post(`/scans/${id}/report/`);
      alert("Report generated successfully!");
      fetchDetails();
    } catch (err) {
      alert("Failed to generate report.");
    } finally {
      setReportLoading(false);
    }
  };

  const handleDownloadReport = async (format: string) => {
    if (!id) return;
    try {
      const res = await api.get(`/scans/${id}/report/pdf/`, {responseType: 'blob'});
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report_${id}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download report.");
    }
  };

  const handleSyncTrimble = async () => {
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await api.post(`/scans/${id}/sync-trimble/`);
      alert(res.data.message || "Successfully synced with Trimble Connect!");
      fetchDetails();
    } catch (err: any) {
      const responseData = err.response?.data;
      if (responseData?.error === "authorization_required" && responseData?.authorization_url) {
        const doAuthorize = window.confirm(
          "Trimble Connect integration is not authorized yet. Would you like to open the Trimble Authorization Page now to connect your account?"
        );
        if (doAuthorize) {
          window.open(responseData.authorization_url, "_blank");
        }
      } else {
        alert(responseData?.error || responseData?.message || "Failed to sync with Trimble Connect.");
      }
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !scan) return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#022C4F]" />
      <p className="text-sm font-medium text-gray-500">Loading scan session…</p>
    </div>
  );
  if (error || !scan) return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <AlertTriangle className="w-8 h-8 text-red-500" />
      <p className="text-sm font-medium text-red-600">{error || "Scan not found"}</p>
    </div>
  );

  const hasSplat = files.some(f => f.file_type === 'gaussian_splat');
  const hasBim = files.some(f => f.file_type === 'bim');
  const hasThermal = files.some(f => f.file_type === 'thermal');

  const statusPill = scan.status === 'completed'
    ? 'bg-emerald-100 text-emerald-700'
    : scan.status === 'processing'
      ? 'bg-blue-100 text-blue-700'
      : 'bg-gray-100 text-gray-600';

  const score = progress ? Math.round(progress.progress_score * 100) : 0;

  const cardShell = 'bg-white rounded-2xl border border-gray-100 shadow-sm p-6';
  const cardTitle = 'text-lg font-bold text-gray-900 flex items-center gap-2.5';
  const secondaryBtn = 'flex items-center gap-2 px-4 py-2.5 border border-gray-200 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed';
  const primaryBtn = 'flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors text-sm font-medium shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed';
  const inputCls = 'w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow';

  return (
    <div className="w-full space-y-8">

      {/* ===================== Page Header ===================== */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">{scan.name || 'Unnamed Session'}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusPill}`}>
              {scan.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1.5">
            Session ID: {scan.id} | Project: {scan.project_name || scan.project}
          </p>
          {scan.overall_ai_confidence !== null && scan.overall_ai_confidence !== undefined && (
            <span className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              <CheckCircle className="w-3.5 h-3.5" />
              Total AI Confidence: {Math.round(scan.overall_ai_confidence * 100)}%
            </span>
          )}
          {scan?.metadata && (
            <div className="mt-3 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-xl border border-gray-100 max-w-xl">
              <div className="flex flex-wrap gap-2">
                <span className="font-semibold text-gray-700 flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-gray-400" /> GPS:</span>
                <span>
                  {scan.metadata.latitude !== null && scan.metadata.latitude !== undefined && scan.metadata.latitude !== ''
                    ? `${scan.metadata.latitude}, ${scan.metadata.longitude}`
                    : scan.metadata.location && scan.metadata.location.latitude !== null && scan.metadata.location.latitude !== undefined
                    ? `${scan.metadata.location.latitude}, ${scan.metadata.location.longitude}`
                    : 'Not specified'}
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="font-semibold text-gray-700">Notes:</span>
                <span>{scan.metadata.notes || 'No operator notes provided'}</span>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => {
              if (scan?.metadata) {
                const lat = scan.metadata.latitude;
                const lon = scan.metadata.longitude;
                setMetadataForm({
                  gps_coordinates: (lat !== null && lat !== undefined && lon !== null && lon !== undefined) ? `${lat}, ${lon}` : '',
                  operator_notes: scan.metadata.notes || ''
                });
              } else {
                setMetadataForm({ gps_coordinates: '', operator_notes: '' });
              }
              setShowMetadataModal(true);
            }}
            className={secondaryBtn}
          >
            <Plus className="w-4 h-4" /> {scan?.metadata ? 'Edit Metadata' : 'Add Metadata'}
          </button>
          <button
            onClick={handleSyncTrimble}
            disabled={actionLoading || scan.status !== 'completed'}
            className={secondaryBtn}
          >
            <Upload className="w-4 h-4" /> Sync Trimble
          </button>
          <a
            href={`/government/dashboard/digital-eye/scan-sessions/${id}/health-dashboard`}
            className="flex items-center gap-2 px-4 py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 transition-colors text-sm font-medium shadow-sm"
          >
            <Activity className="w-4 h-4" /> Health Dashboard
          </a>
          <button
            onClick={() => handleDownloadReport('pdf')}
            disabled={scan.status !== 'completed'}
            className={secondaryBtn}
          >
            <Download className="w-4 h-4" /> PDF
          </button>
          <button
            onClick={handleGenerateReport}
            disabled={reportLoading || scan.status !== 'completed'}
            className={primaryBtn}
          >
            {reportLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
            Generate Report
          </button>
        </div>
      </div>

      {/* ===================== Processing Banner ===================== */}
      {scan.status === 'processing' && processingStatus && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin shrink-0" />
            <div>
              <p className="font-semibold text-blue-900">Processing in progress...</p>
              <p className="text-sm text-blue-700">{processingStatus.status_message}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <p className="text-sm font-bold text-blue-900">{Math.round((processingStatus.progress_percentage || 0) * 100)}%</p>
            <p className="text-xs text-blue-700">Estimated time left: {processingStatus.estimated_time_remaining_seconds}s</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* ===================== Left Column: Uploads & Actions & Audit ===================== */}
        <div className="space-y-8 lg:col-span-1">

          {/* Uploaded Files */}
          <div className={cardShell}>
            <h2 className={`${cardTitle} mb-5`}>
              <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Upload className="w-4.5 h-4.5 text-blue-600" size={18} />
              </span>
              Uploaded Files
            </h2>

            {files.length > 0 ? (
              <ul className="space-y-2 mb-5">
                {files.map(f => {
                  const meta = fileTypeMeta(f.file_type);
                  const TypeIcon = meta.icon;
                  return (
                    <li key={f.id} className="text-sm flex justify-between items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.chip}`}>
                          <TypeIcon size={15} />
                        </span>
                        <div className="min-w-0">
                          <span className="font-semibold text-gray-700 capitalize block leading-tight">{f.file_type.replace('_', ' ')}</span>
                          <span className="text-gray-500 text-xs break-all">
                            {f.file_name || (f.file_url ? f.file_url.split('/').pop() : 'Unknown file')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(f.id, f.file_name || f.file_type)}
                        disabled={actionLoading}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors shrink-0"
                        title="Delete file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-500 italic mb-5">No files uploaded yet.</p>
            )}

            <div className="space-y-4 pt-5 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <FileUp className="w-4 h-4 text-blue-600" /> Upload New Files
              </p>
              {(['lidar', 'rgb', 'thermal', 'gps', 'gaussian_splat', 'bim'] as const).map(type => {
                let exts = "";
                if (type === 'lidar') exts = "(.las, .laz, .pcd, .ply)";
                else if (type === 'rgb' || type === 'thermal') exts = "(Images)";
                else if (type === 'gps') exts = "(.csv, .txt, .json, .log)";
                else if (type === 'gaussian_splat') exts = "(.ply, .splat)";
                else if (type === 'bim') exts = "(.ifc, .rvt, .dwg)";
                return (
                <div key={type} className="flex flex-col">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                    {type.replace('_', ' ')} <span className="text-gray-400 font-normal normal-case">{exts}</span>
                  </label>
                  <input
                    type="file"
                    accept={type === 'lidar' ? '.las,.laz,.pcd,.ply' : type === 'rgb' || type === 'thermal' ? 'image/*' : type === 'gps' ? '.csv,.txt,.json,.log' : type === 'bim' ? '.ifc,.rvt,.dwg' : '.ply,.splat'}
                    onChange={e => handleFileUpload(e, type)}
                    disabled={actionLoading}
                    className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer"
                  />
                </div>
              )})}
            </div>
          </div>

          {/* Actions (pipeline steps) */}
          <div className={cardShell}>
            <h2 className={`${cardTitle} mb-5`}>
              <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                <Activity className="w-4.5 h-4.5 text-blue-600" size={18} />
              </span>
              Actions
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => handleAction((scanId) => api.post(`/scans/${scanId}/finalize/`), "Uploads finalized!")}
                disabled={actionLoading || scan?.status !== 'initialized'}
                className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 text-xs font-bold flex items-center justify-center shrink-0">1</span>
                Finalize Uploads
              </button>
              <button
                onClick={() => handleStreamAction('ai')}
                disabled={actionLoading || scan?.status === 'initialized'}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium text-[#022C4F] border border-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#022C4F] text-white text-xs font-bold flex items-center justify-center shrink-0">2</span>
                  Process AI Data
                </span>
                <Terminal className="w-4 h-4 shrink-0" />
              </button>
              <button
                onClick={() => handleStreamAction('bim')}
                disabled={actionLoading || scan?.status === 'initialized'}
                className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-xl text-sm font-medium text-[#022C4F] border border-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-between gap-3"
              >
                <span className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#022C4F] text-white text-xs font-bold flex items-center justify-center shrink-0">3</span>
                  Align to BIM
                </span>
                <Terminal className="w-4 h-4 shrink-0" />
              </button>
            </div>
          </div>

          {/* Audit Timeline */}
          <div className={`${cardShell} h-72 overflow-y-auto`}>
            <h2 className={`${cardTitle} mb-5`}>
              <span className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center shrink-0">
                <Clock className="w-4.5 h-4.5 text-gray-500" size={18} />
              </span>
              Audit Timeline
            </h2>
            {timeline.length > 0 ? (
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-5">
                {timeline.map((event: any, idx: number) => (
                  <div key={idx} className="pl-5 relative">
                    <div className="absolute w-2.5 h-2.5 bg-[#022C4F] rounded-full -left-[6px] top-1.5 ring-4 ring-white"></div>
                    <p className="text-sm font-semibold text-gray-900 capitalize">{event.event_type.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-500">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.details && <p className="text-xs text-gray-600 mt-1 break-words">{JSON.stringify(event.details)}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No events recorded.</p>
            )}
          </div>
        </div>

        {/* ===================== Right Column: Results ===================== */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Progress Validation */}
            <div className={`${cardShell} h-72 flex flex-col`}>
              <h2 className={`${cardTitle} mb-4`}>
                <span className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                  <CheckCircle className="w-4.5 h-4.5 text-emerald-600" size={18} />
                </span>
                Progress Validation
              </h2>
              {progress && hasSplat && hasBim ? (
                <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto">
                  <div className="relative w-28 h-28 flex items-center justify-center mb-3 shrink-0">
                    <svg viewBox="0 0 100 100" className="w-28 h-28 -rotate-90">
                      <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" className="text-emerald-100" strokeWidth="9" />
                      <circle
                        cx="50" cy="50" r="42" fill="none"
                        stroke="currentColor"
                        className={score >= 80 ? 'text-emerald-500' : score >= 50 ? 'text-amber-500' : 'text-red-500'}
                        strokeWidth="9" strokeLinecap="round"
                        pathLength={100}
                        strokeDasharray={`${score} 100`}
                      />
                    </svg>
                    <span className="absolute text-xl font-bold text-gray-900">{score}%</span>
                  </div>
                  <div className="text-center text-sm w-full space-y-1">
                    <p className="text-gray-500">Completion vs BIM</p>
                    {progress.covered_area_sqm ? (
                      <div className="flex justify-between border-t border-gray-100 pt-2 mt-2 px-2">
                        <span className="text-gray-500">Mapped Area:</span>
                        <span className="font-semibold text-gray-900">{progress.covered_area_sqm} m²</span>
                      </div>
                    ) : null}
                    {progress.volume_metrics?.total_volume_m3 ? (
                      <div className="flex justify-between px-2">
                        <span className="text-gray-500">Volume:</span>
                        <span className="font-semibold text-gray-900">{progress.volume_metrics.total_volume_m3} m³</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No progress validation results available yet.</p>
              )}
            </div>

            {/* Clashes */}
            <div className={`${cardShell} h-72 overflow-y-auto`}>
              <h2 className={`${cardTitle} mb-4`}>
                <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4.5 h-4.5 text-red-600" size={18} />
                </span>
                Clash Detection
                {clashes.length > 0 && (
                  <span className="ml-auto text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">{clashes.length}</span>
                )}
              </h2>
              {clashLoading ? (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Running clash detection against the BIM model...
                </p>
              ) : clashes.length > 0 ? (
                <ul className="space-y-2.5">
                  {clashes.map((clash: any) => (
                    <li key={clash.id} className={`p-3 rounded-xl border text-sm ${sevRow(clash.severity)}`}>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="text-gray-800"><span className="text-gray-500 font-medium">El 1: </span>{clash.element1_id}</p>
                          <p className="text-gray-800"><span className="text-gray-500 font-medium">El 2: </span>{clash.element2_id}</p>
                        </div>
                        <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold shrink-0 ${sevBadge(clash.severity)}`}>{clash.severity}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono mt-1.5">Loc: {clash.location}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  {clashMessage && clashes.length === 0 ? clashMessage : 'No clashes detected.'}
                </p>
              )}
            </div>

            {/* AI Defects */}
            <div className={`${cardShell} h-72 flex flex-col`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={cardTitle}>
                  <span className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600" size={18} />
                  </span>
                  Detected Defects
                  {defects.length > 0 && (
                    <span className="ml-1 text-xs font-bold text-red-700 bg-red-100 px-2.5 py-1 rounded-full">{defects.length}</span>
                  )}
                </h2>
                <button onClick={() => setShowDefectModal(true)} className="p-2 hover:bg-blue-50 rounded-lg text-gray-400 hover:text-blue-600 transition-colors" title="Add Defect">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {defects.length > 0 ? (
                  <ul className="space-y-2.5">
                    {defects.map((defect: any) => (
                      <li key={defect.id} className={`p-3 rounded-xl flex flex-col text-sm border gap-2 ${defect.is_false_positive ? 'bg-gray-50 text-gray-500 border-gray-200 opacity-60' : sevRow(defect.severity)}`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className={`font-bold capitalize flex items-center gap-2 ${defect.is_false_positive ? 'line-through' : 'text-gray-900'}`}>
                            {defect.type}
                            {defect.is_false_positive && (
                              <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded no-underline font-medium">False Positive</span>
                            )}
                          </span>
                          <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold shrink-0 ${defect.is_false_positive ? 'bg-gray-200 text-gray-500' : sevBadge(defect.severity)}`}>
                            {defect.severity}
                          </span>
                        </div>
                        {defect.description && (
                          <p className={`text-xs leading-relaxed ${defect.is_false_positive ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{defect.description}</p>
                        )}
                        <div className={`flex flex-wrap justify-between gap-1 text-[10px] font-medium ${defect.is_false_positive ? 'text-gray-400' : 'text-gray-600'}`}>
                          <span className="font-mono">Loc: {defect.location_x?.toFixed(2) || '0.00'}, {defect.location_y?.toFixed(2) || '0.00'}, {defect.location_z?.toFixed(2) || '0.00'}</span>
                          <span className="font-semibold">
                            {defect.confidence_score ? `Conf: ${Math.round(defect.confidence_score * 100)}% | ` : ''}
                            {defect.status}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No defects detected.</p>
                )}
              </div>
            </div>

            {/* Thermal Anomalies */}
            <div className={`${cardShell} h-72 flex flex-col`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={cardTitle}>
                  <span className="w-9 h-9 rounded-lg bg-orange-50 flex items-center justify-center shrink-0">
                    <Thermometer className="w-4.5 h-4.5 text-orange-600" size={18} />
                  </span>
                  Thermal Anomalies
                  {anomalies.length > 0 && (
                    <span className="ml-1 text-xs font-bold text-orange-700 bg-orange-100 px-2.5 py-1 rounded-full">{anomalies.length}</span>
                  )}
                </h2>
                <button onClick={() => setShowAnomalyModal(true)} className="p-2 hover:bg-orange-50 rounded-lg text-gray-400 hover:text-orange-600 transition-colors" title="Add Thermal Anomaly">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {anomalies.length > 0 && hasThermal ? (
                  <ul className="space-y-2.5">
                    {anomalies.map((anomaly: any) => (
                      <li key={anomaly.id} className={`p-3 rounded-xl flex flex-col text-sm border gap-2 ${sevRow(anomaly.severity)}`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-gray-900">
                            Variance: {anomaly.temperature_variance}°C
                          </span>
                          <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold shrink-0 ${sevBadge(anomaly.severity)}`}>{anomaly.severity}</span>
                        </div>
                        {anomaly.description && (
                          <p className="text-xs text-gray-700 leading-relaxed">{anomaly.description}</p>
                        )}
                        <div className="flex flex-wrap justify-between gap-1 text-[10px] font-medium text-gray-600">
                          <span className="font-mono">Location: {anomaly.location_x?.toFixed(2) || '0.00'}, {anomaly.location_y?.toFixed(2) || '0.00'}, {anomaly.location_z?.toFixed(2) || '0.00'}</span>
                          <span className="font-semibold">
                            {anomaly.confidence_score ? `Conf: ${Math.round(anomaly.confidence_score * 100)}%` : 'Conf: N/A'}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500 italic">No thermal anomalies detected.</p>
                )}
              </div>
            </div>

            {/* BIM Deviations — full width */}
            <div className={`${cardShell} md:col-span-2 lg:col-span-2`}>
              <h2 className={`${cardTitle} mb-4`}>
                <span className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Layers className="w-4.5 h-4.5 text-blue-600" size={18} />
                </span>
                BIM Deviations
                {deviations.length > 0 && hasSplat && hasBim && !deviationLoading && (
                  <span className="ml-auto text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">{deviations.length}</span>
                )}
              </h2>
              {deviationLoading ? (
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading BIM deviation analysis...
                </p>
              ) : deviations.length > 0 && hasSplat && hasBim ? (
                <div className="max-h-72 overflow-y-auto pr-1">
                  <ul className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                    {deviations.map((dev: any) => (
                      <li key={dev.id} className={`p-3 rounded-xl border flex flex-col text-sm gap-1.5 ${sevRow(dev.severity)}`}>
                        <div className="flex justify-between items-start gap-2">
                          <span className="font-bold text-gray-900">
                            {dev.type === 'Clash' ? 'Clash penetration' : 'Deviation'}: {dev.deviation_amount_mm} mm
                          </span>
                          <span className={`text-[10px] uppercase px-2 py-1 rounded-full font-bold shrink-0 ${sevBadge(dev.severity)}`}>{dev.severity}</span>
                        </div>
                        <span className="text-xs text-gray-600 break-words">Element ID: {dev.bim_element_id}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">No BIM deviations detected.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ===================== MODALS ===================== */}
      {showMetadataModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-[#022C4F]">{scan?.metadata ? 'Edit Metadata' : 'Add Metadata'}</h2>
              <button onClick={() => setShowMetadataModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors" title="Close" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleMetadataSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">GPS Coordinates</label>
                <input
                  type="text" value={metadataForm.gps_coordinates}
                  onChange={e => setMetadataForm({...metadataForm, gps_coordinates: e.target.value})}
                  className={inputCls} placeholder="e.g. 40.7128° N, 74.0060° W"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Operator Notes</label>
                <textarea
                  value={metadataForm.operator_notes}
                  onChange={e => setMetadataForm({...metadataForm, operator_notes: e.target.value})}
                  className={`${inputCls} min-h-[90px] resize-y`} placeholder="Any additional notes"
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowMetadataModal(false)} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors text-sm font-medium shadow-lg shadow-blue-900/20">
                  {scan?.metadata ? 'Update Metadata' : 'Save Metadata'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDefectModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-[#022C4F]">Add Defect</h2>
              <button onClick={() => setShowDefectModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors" title="Close" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateDefect} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Defect Type</label>
                <input type="text" required value={defectForm.type} onChange={e => setDefectForm({...defectForm, type: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Severity</label>
                <select value={defectForm.severity} onChange={e => setDefectForm({...defectForm, severity: e.target.value})} className={inputCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Image <span className="text-gray-400 font-normal">(Optional, .jpg, .png)</span></label>
                <input type="file" accept="image/*" onChange={e => setDefectImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowDefectModal(false)} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors text-sm font-medium shadow-lg shadow-blue-900/20">Create Defect</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAnomalyModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-[#022C4F]">Add Thermal Anomaly</h2>
              <button onClick={() => setShowAnomalyModal(false)} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1.5 rounded-lg transition-colors" title="Close" aria-label="Close"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAnomaly} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Temperature Variance</label>
                <input type="number" required value={anomalyForm.temperature_variance} onChange={e => setAnomalyForm({...anomalyForm, temperature_variance: e.target.value})} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Severity</label>
                <select value={anomalyForm.severity} onChange={e => setAnomalyForm({...anomalyForm, severity: e.target.value})} className={inputCls}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Thermal Image <span className="text-gray-400 font-normal">(Optional, .jpg, .png)</span></label>
                <input type="file" accept="image/*" onChange={e => setAnomalyImage(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAnomalyModal(false)} className="px-4 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-colors text-sm font-medium shadow-lg shadow-blue-900/20">Create Anomaly</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {streamModal.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700 flex flex-col h-[60vh]">
            <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800/50 rounded-t-2xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-400" />
                {streamModal.type === 'ai' ? 'AI Analysis Pipeline' : 'BIM Alignment Engine'}
              </h2>
              {streamModal.done && (
                <button onClick={() => setStreamModal(prev => ({...prev, isOpen: false}))} className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-700 transition-colors" title="Close"><X className="w-5 h-5" /></button>
              )}
            </div>
            <div className="flex-1 p-6 overflow-y-auto font-mono text-sm space-y-3">
              {streamModal.logs.map((log, idx) => (
                <div key={idx} className="text-emerald-400 flex gap-3 animate-fade-in-up">
                  <span className="text-slate-500 select-none">❯</span>
                  <span className="leading-relaxed">{log}</span>
                </div>
              ))}
              {!streamModal.done && (
                <div className="text-emerald-400 flex gap-3 opacity-70">
                  <span className="text-slate-500">❯</span>
                  <span className="animate-pulse">_</span>
                </div>
              )}
              {streamModal.done && (
                <div className="mt-6 pt-4 border-t border-slate-700 text-blue-400 font-semibold text-center animate-pulse">
                  Processing Complete. Updating Dashboard...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScanDetail;
