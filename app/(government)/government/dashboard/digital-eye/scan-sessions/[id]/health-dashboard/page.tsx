"use client";

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { 
  CheckCircle, AlertTriangle, AlertOctagon, Activity, Layers, ArrowLeft, Loader2, MapPin, Thermometer, Box, FileSignature
} from 'lucide-react';
import Link from 'next/link';

export default function SiteHealthDashboard() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [scan, setScan] = useState<any>(null);
  const [defects, setDefects] = useState<any[]>([]);
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [deviations, setDeviations] = useState<any[]>([]);
  const [clashes, setClashes] = useState<any[]>([]);
  const [files, setFiles] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // For the interactive map
  const imageRef = useRef<HTMLImageElement>(null);

  const fetchDetails = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/scans/${id}/`), 
      api.get(`/scans/${id}/defects/`),
      api.get(`/scans/${id}/thermal-anomalies/`),
      api.get(`/scans/${id}/deviation/`),
      api.get(`/scans/${id}/clash/`),
      api.get(`/scans/${id}/files/`),
      api.get(`/scans/${id}/progress/`).catch(() => ({ data: null }))
    ])
      .then(([sessionRes, defectsRes, anomaliesRes, deviationRes, clashRes, filesRes, progressRes]) => {
        setScan(sessionRes.data);
        setDefects(defectsRes.data);
        setAnomalies(anomaliesRes.data);
        
        // Handle BIM Deviation
        const devs: any[] = [];
        if (deviationRes.data && deviationRes.data.id) {
            const align = deviationRes.data;
            if (align.mean_deviation !== null && align.mean_deviation !== undefined) {
                devs.push({ 
                    id: 'mean', 
                    deviation_amount_mm: align.mean_deviation, 
                    bim_element_id: 'Mean Overall Deviation', 
                    severity: align.mean_deviation > 1.0 ? 'critical' : 'low' 
                });
            }
        }
        setDeviations(devs);
        setClashes(clashRes.data.clashes || []);
        setFiles(filesRes.data);
        setProgress(progressRes.data);
      })
      .catch(err => {
        console.error(err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!scan) {
    return <div className="p-8 text-red-600">Scan not found</div>;
  }

  const hasCriticalBim = deviations.some(d => d.severity === 'critical');
  const meanDeviation = deviations.length > 0 ? deviations[0].deviation_amount_mm : null;
  const hasUrgentAnomalies = anomalies.length > 0;
  const hasUrgentDefects = defects.some(d => d.severity === 'critical' || d.severity === 'high');
  const hasMediumDefects = defects.some(d => d.severity === 'medium');
  const hasClashes = clashes.length > 0;
  const criticalDefectsCount = defects.filter(d => d.severity === 'critical').length;

  // Determine Overall Status
  let overallStatus = 'PASSED - STRUCTURE IS GENERALLY SOUND AND COMPLIANT';
  let overallColor = 'bg-green-50 text-green-700 border-green-200';
  let statusIcon = <CheckCircle className="w-8 h-8 text-green-600" />;

  if (hasCriticalBim || criticalDefectsCount > 0) {
    overallStatus = 'FAILED - CRITICAL ISSUES REQUIRE IMMEDIATE ACTION';
    overallColor = 'bg-red-50 text-red-700 border-red-200';
    statusIcon = <AlertOctagon className="w-8 h-8 text-red-600" />;
  } else if (hasUrgentAnomalies || hasUrgentDefects || hasClashes) {
    overallStatus = 'CONDITIONAL - URGENT ACTIONS REQUIRED';
    overallColor = 'bg-amber-50 text-amber-700 border-amber-200';
    statusIcon = <AlertTriangle className="w-8 h-8 text-amber-600" />;
  }

  // Find RGB image for the interactive map
  const rgbFile = files.find(f => f.file_type === 'rgb');
  let rgbUrl = scan.rgb_url || (rgbFile ? rgbFile.file_url : null);
  
  if (rgbUrl && rgbUrl.startsWith('/media/')) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nexucon-backend.onrender.com';
    rgbUrl = baseUrl + rgbUrl;
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 bg-slate-50 min-h-screen text-slate-800">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200">
        <Link 
          href={`/government/dashboard/digital-eye/scan-sessions/${id}`}
          className="p-2 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SITE INSPECTION REPORT</h1>
          <p className="text-slate-500 font-medium font-mono text-sm mt-1">DWG NXC-{new Date().toISOString().slice(0,10).replace(/-/g, '')}-{id.split('-')[0].toUpperCase()} | SHEET 01/10</p>
        </div>
      </div>

      {/* 1. Executive Summary */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">1</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Site Inspection - Quick Summary (Site Health Dashboard)</h2>
        </div>
        
        <div className="text-sm font-mono text-slate-500 mb-6 flex gap-8">
          <span>PROJECT: {scan.project_name || scan.project || 'Site Survey'}</span>
          <span>DATE: {new Date(scan.created_at || Date.now()).toLocaleDateString()}</span>
          <span>AI CONFIDENCE: {scan.overall_ai_confidence ? Math.round(scan.overall_ai_confidence * 100) : 'N/A'}%</span>
        </div>

        <div className={`p-6 rounded-xl border flex items-center gap-6 mb-8 ${overallColor}`}>
          <div className="p-2 bg-white rounded-full shadow-sm">{statusIcon}</div>
          <h3 className="text-xl font-black">STATUS: {overallStatus}</h3>
        </div>

        <h4 className="font-bold text-slate-700 uppercase mb-4 border-b pb-2">Site Health Check - At A Glance</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="p-4 border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Structural Integrity</p>
            <div className="flex justify-between items-start">
              <span className={`font-bold ${criticalDefectsCount > 0 ? 'text-red-600' : 'text-green-600'}`}>{criticalDefectsCount > 0 ? 'FAILED' : 'PASSED'}</span>
              <span className="text-sm text-slate-600 text-right max-w-[200px]">{criticalDefectsCount > 0 ? `${criticalDefectsCount} critical issue(s) detected.` : 'Main structure is sound.'}</span>
            </div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Compliance with Design (BIM)</p>
            <div className="flex justify-between items-start">
              <span className={`font-bold ${hasCriticalBim ? 'text-red-600' : 'text-green-600'}`}>{hasCriticalBim ? 'FAILED - CRITICAL' : 'PASSED'}</span>
              <span className="text-sm text-slate-600 text-right max-w-[200px]">{hasCriticalBim ? `Position error of ${meanDeviation?.toFixed(2)}m.` : 'Building position is within tolerance.'}</span>
            </div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Building Envelope (Thermal)</p>
            <div className="flex justify-between items-start">
              <span className={`font-bold ${hasUrgentAnomalies ? 'text-amber-600' : 'text-green-600'}`}>{hasUrgentAnomalies ? 'CONDITIONAL' : 'PASSED'}</span>
              <span className="text-sm text-slate-600 text-right max-w-[200px]">{hasUrgentAnomalies ? `${anomalies.length} anomaly/anomalies found.` : 'No thermal anomalies detected.'}</span>
            </div>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">3D Model Conflicts (Clashes)</p>
            <div className="flex justify-between items-start">
              <span className={`font-bold ${hasClashes ? 'text-amber-600' : 'text-green-600'}`}>{hasClashes ? 'FOUND' : 'CLEAR'}</span>
              <span className="text-sm text-slate-600 text-right max-w-[200px]">{hasClashes ? `${clashes.length} design conflict(s) found.` : 'No design conflicts detected.'}</span>
            </div>
          </div>
        </div>

        <h4 className="font-bold text-red-600 uppercase mb-4 border-b border-red-200 pb-2">&gt;&gt; PRIORITY ACTIONS REQUIRED</h4>
        <div className="space-y-3">
          {hasCriticalBim && (
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="font-bold text-red-700 text-sm">URGENT: BUILDING POSITION ERROR -- {meanDeviation?.toFixed(2)} m SHIFT DETECTED</p>
              <p className="text-sm text-red-900 mt-1">ACTION: Surveyor must re-check site coordinates IMMEDIATELY. Do NOT pour any more concrete until resolved.</p>
            </div>
          )}
          {hasUrgentAnomalies && (
            <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
              <p className="font-bold text-amber-700 text-sm">URGENT: THERMAL LOSS DETECTED</p>
              <p className="text-sm text-amber-900 mt-1">ACTION: Check roof insulation and seal any gaps around windows/doors.</p>
            </div>
          )}
          {hasMediumDefects && (
            <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
              <p className="font-bold text-cyan-700 text-sm">ROUTINE: NON-STRUCTURAL DEFECT ON SURFACE</p>
              <p className="text-sm text-cyan-900 mt-1">ACTION: Monitor at next site visit. Mark with pencil and note if it grows.</p>
            </div>
          )}
          {hasClashes && (
            <div className="bg-slate-100 p-4 rounded-lg border border-slate-200">
              <p className="font-bold text-slate-700 text-sm">PLANNING: {clashes.length} DESIGN CONFLICT(S) IN BIM MODEL</p>
              <p className="text-sm text-slate-700 mt-1">ACTION: Design team must review and resolve before construction reaches those floors.</p>
            </div>
          )}
          {!hasCriticalBim && !hasUrgentAnomalies && !hasMediumDefects && !hasClashes && (
            <p className="text-sm text-slate-500 italic">No priority actions required.</p>
          )}
        </div>
      </section>

      {/* 2. Interactive Map of Issues */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">2</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Scan Overview & Site Map of Issues</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">The image below shows the survey view of your building. Each coloured target marks the exact location of an issue we found:</p>
        
        <div className="flex gap-4 mb-6">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200"></div><span className="text-sm font-bold text-slate-700">RED: Urgent (Structural/Position)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500 ring-2 ring-orange-200"></div><span className="text-sm font-bold text-slate-700">ORANGE: High Concern (Thermal)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-cyan-500 ring-2 ring-cyan-200"></div><span className="text-sm font-bold text-slate-700">CYAN: Routine (Defects)</span></div>
        </div>

        <div className="relative border border-slate-300 rounded-xl overflow-hidden bg-slate-100 min-h-[400px] flex items-center justify-center">
          {rgbUrl ? (
            <>
              <img ref={imageRef} src={rgbUrl} alt="Site Map" className="w-full h-auto object-contain max-h-[700px]" />
              
              {/* Plot Defects */}
              {defects.map(d => {
                if (d.location_x === null || d.location_y === null) return null;
                const x = Math.max(10, Math.min(90, d.location_x * 100 || 50));
                const y = Math.max(10, Math.min(90, d.location_y * 100 || 50));
                let color = 'bg-cyan-500';
                if (d.severity === 'critical') color = 'bg-red-500';
                if (d.severity === 'high') color = 'bg-orange-500';
                
                return (
                  <a href={`#defect-${d.id}`} key={`d-${d.id}`} className="absolute group transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                    <div className={`w-4 h-4 border-2 border-slate-900 rounded-sm ${color} shadow-lg ring-2 ring-white animate-pulse group-hover:scale-125 transition-transform cursor-pointer flex items-center justify-center`}>
                    </div>
                    <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-xs p-2 rounded shadow-xl z-10 text-center">
                      Click to view {d.type.replace('_', ' ')}
                    </div>
                  </a>
                );
              })}

              {/* Plot Anomalies */}
              {anomalies.map(a => {
                if (a.location_x === null || a.location_y === null) return null;
                const x = Math.max(10, Math.min(90, a.location_x * 100 || 60));
                const y = Math.max(10, Math.min(90, a.location_y * 100 || 40));
                let color = 'bg-orange-500';
                if (a.severity === 'critical') color = 'bg-red-500';

                return (
                  <a href={`#anomaly-${a.id}`} key={`a-${a.id}`} className="absolute group transform -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
                    <div className={`w-4 h-4 border-2 border-slate-900 rounded-sm ${color} shadow-lg ring-2 ring-white animate-pulse group-hover:scale-125 transition-transform cursor-pointer flex items-center justify-center`}>
                    </div>
                    <div className="absolute hidden group-hover:block bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 text-white text-xs p-2 rounded shadow-xl z-10 text-center">
                      Click to view Thermal Anomaly ({a.temperature_variance}°C)
                    </div>
                  </a>
                );
              })}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 py-20">
              <MapPin className="w-12 h-12 mb-4 opacity-50" />
              <p>No Site Image Available for Mapping</p>
            </div>
          )}
        </div>
      </section>

      {/* 3. Defect Findings & Evidence */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">3</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Defect Findings & Evidence - Structured Action Cards</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">Each finding below is a drafted detail callout: what the problem is, where it is, how serious it is, what to do, and who is responsible.</p>
        
        {defects.length === 0 ? (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-green-700 font-bold">
            NO VISUAL DEFECTS DETECTED IN THIS SCAN.
          </div>
        ) : (
          <div className="space-y-6">
            {defects.map((d, idx) => {
              const borderCol = d.severity === 'critical' ? 'border-red-500' : d.severity === 'high' ? 'border-orange-500' : 'border-cyan-500';
              const textCol = d.severity === 'critical' ? 'text-red-600' : d.severity === 'high' ? 'text-orange-600' : 'text-cyan-600';
              return (
              <div id={`defect-${d.id}`} key={`d-${d.id}`} className={`bg-white border-2 border-dashed ${borderCol} rounded-xl overflow-hidden shadow-sm scroll-mt-24`}>
                <div className={`px-6 py-3 border-b ${borderCol} flex justify-between items-center`}>
                  <h3 className={`font-black flex items-center gap-2 tracking-wide uppercase ${textCol}`}>
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${d.severity === 'critical' ? 'bg-red-500' : d.severity === 'high' ? 'bg-orange-500' : 'bg-cyan-500'}`}>{idx + 1}</span>
                    FINDING #{idx + 1}: {d.type.replace('_', ' ')}
                  </h3>
                  <span className={`px-3 py-1 rounded-sm text-xs font-bold text-white uppercase ${d.severity === 'critical' ? 'bg-red-500' : d.severity === 'high' ? 'bg-orange-500' : 'bg-cyan-500'}`}>
                    {d.severity} RISK
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                    <div className="border-b pb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">SLA</p>
                      <p className="font-mono font-bold text-slate-800">{d.severity === 'critical' ? '2 DAYS' : d.severity === 'high' ? '7 DAYS' : '14 DAYS'}</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Responsible</p>
                      <p className="font-mono font-bold text-slate-800">{d.severity === 'critical' ? 'Site Surveyor' : 'Site Supervisor'}</p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Location</p>
                      <p className="font-mono font-bold text-slate-800">
                        X{d.location_x?.toFixed(2)||'0.00'} Y{d.location_y?.toFixed(2)||'0.00'} Z{d.location_z?.toFixed(2)||'0.00'}
                      </p>
                    </div>
                    <div className="border-b pb-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">AI Confidence</p>
                      <p className="font-mono font-bold text-slate-800">{d.confidence_score ? `${Math.round(d.confidence_score*100)}%` : 'N/A'}</p>
                    </div>
                  </div>
                  
                  <div className="mb-4 pl-4 border-l-2 border-slate-200">
                    <p className="text-xs font-bold text-slate-900 uppercase mb-1">ENGINEERING ASSESSMENT</p>
                    <p className="text-slate-600 font-medium text-sm">{d.description || `AI detected a ${d.type.replace('_', ' ')} in this area.`}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-cyan-400">
                    <p className="text-xs font-bold text-cyan-600 uppercase mb-1">RECOMMENDED ACTION</p>
                    <p className="text-slate-600 font-medium text-sm italic">
                      {d.severity === 'critical' || d.severity === 'high' 
                        ? 'This is a serious safety concern. DO NOT proceed with construction until resolved.'
                        : 'Monitor this area during the next routine inspection. If it worsens, report it immediately.'}
                    </p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>

      {/* 4. 3D Point Cloud & Progress Validation */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">4</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">3D Point Cloud & Progress Validation</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">LiDAR point cloud data creates a precise 3D map of the site at the time of scanning, compared against the approved BIM design model to calculate the percentage of planned construction physically completed.</p>
        
        {progress ? (
          <div>
            <div className="mb-4">
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>CONSTRUCTION PROGRESS:</span>
                <span>{Math.round((progress.progress_score || 0) * 100)}%</span>
              </div>
              <div className="w-full bg-slate-200 h-4 border border-slate-300">
                <div className="bg-green-600 h-full" style={{ width: `${Math.round((progress.progress_score || 0) * 100)}%` }}></div>
              </div>
            </div>
            <div className="flex gap-12 font-mono text-sm border-t pt-4">
              <div><span className="text-slate-400">Mapped Area:</span> <strong>{progress.covered_area_sqm || 0} m²</strong></div>
              <div><span className="text-slate-400">Progress Score:</span> <strong>{Math.round((progress.progress_score || 0) * 100)}%</strong></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">No Point Cloud progress metrics are available for this scan session.</p>
        )}
      </section>

      {/* 5. Thermal Analysis - Heat-Loss Map */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">5</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Thermal Analysis - Heat-Loss Map</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">Thermal imaging detects heat differences across surfaces. Unusual temperature patterns often indicate hidden moisture, missing insulation, or gaps around openings. Applicable standard: SON NIS 412.</p>
        
        {anomalies.length === 0 ? (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-green-700 font-bold">
            NO THERMAL ANOMALIES DETECTED IN THIS SCAN.
          </div>
        ) : (
          <div className="space-y-6">
            {anomalies.map((a, idx) => {
              const borderCol = a.severity === 'critical' ? 'border-red-500' : 'border-orange-500';
              const textCol = a.severity === 'critical' ? 'text-red-600' : 'text-orange-600';
              return (
              <div id={`anomaly-${a.id}`} key={`a-${a.id}`} className={`bg-white border-2 border-solid ${borderCol} rounded-xl overflow-hidden shadow-sm scroll-mt-24`}>
                <div className={`px-6 py-3 border-b ${borderCol} flex justify-between items-center bg-slate-50`}>
                  <h3 className={`font-black flex items-center gap-2 tracking-wide uppercase ${textCol}`}>
                    THERMAL ANOMALY #{idx + 1} -- {a.temperature_variance}°C VARIANCE
                  </h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 font-mono text-sm mb-6">
                    <div><span className="text-slate-400">Severity:</span> <strong>{a.severity.toUpperCase()}</strong></div>
                    <div><span className="text-slate-400">SLA:</span> <strong>{a.severity === 'critical' ? '2 DAYS' : '7 DAYS'}</strong></div>
                    <div><span className="text-slate-400">Responsible:</span> <strong>Site Supervisor / Contractor</strong></div>
                    <div><span className="text-slate-400">Location:</span> <strong>X{a.location_x?.toFixed(2)||'0.00'} Y{a.location_y?.toFixed(2)||'0.00'} Z{a.location_z?.toFixed(2)||'0.00'}</strong></div>
                    <div><span className="text-slate-400">AI Confidence:</span> <strong>{a.confidence_score ? `${Math.round(a.confidence_score*100)}%` : 'N/A'}</strong></div>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-xs font-bold text-slate-900 uppercase mb-1">AI FINDING</p>
                    <p className="text-slate-600 font-medium text-sm">{a.description || `A thermal anomaly of ${a.temperature_variance}°C was detected.`}</p>
                  </div>
                  
                  <div className="pl-4 border-l-2 border-cyan-400">
                    <p className="text-xs font-bold text-cyan-600 uppercase mb-1">WHAT THIS MEANS</p>
                    <p className="text-slate-600 font-medium text-sm italic">
                      Check insulation in this area and seal any gaps around windows or doors to prevent heat loss/gain.
                    </p>
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </section>

      {/* 6. BIM Comparison & Deviation Analysis */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">6</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">BIM Comparison & Deviation Analysis</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">BIM (Building Information Modelling) is the approved 3D design model for this project. Nexucon compares the real-world scan against the BIM to find where construction differs from design ('deviations'). Ref: ISO 19650.</p>
        
        {meanDeviation !== null ? (
          <div>
            {hasCriticalBim ? (
              <div className="mb-8">
                <div className="bg-red-600 text-white text-center font-black py-2 tracking-widest text-lg rounded-t-lg border-2 border-red-600">
                  STOP WORK -- MAJOR POSITION ERROR DETECTED
                </div>
                <div className="bg-red-50 p-6 border-x-2 border-b-2 border-red-600 rounded-b-lg">
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">WHAT IS THE PROBLEM?</p>
                  <p className="text-sm font-medium text-red-900 mb-4">The AI has discovered that the building is NOT in the right place. According to the design plans, the building should be in its designated position. Our scan shows it is actually {meanDeviation.toFixed(2)} metres away from where it should be.</p>
                  
                  <p className="text-xs font-bold text-red-600 uppercase mb-1">WHAT MUST HAPPEN NOW (NEXT 24 HOURS):</p>
                  <p className="text-sm font-medium text-red-900">
                    1. Contact the site surveyor to re-check the project control points immediately.<br/>
                    2. Do NOT proceed: no further concrete pours or wall construction until the surveyor confirms the correct position.<br/>
                    3. Re-scan the building once coordinates are confirmed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="border-2 border-green-500 rounded-lg py-3 text-center text-green-700 font-bold mb-8">
                PASS - BUILDING POSITION WITHIN ACCEPTABLE TOLERANCE
              </div>
            )}
            
            <div className="space-y-4 font-mono text-sm border-t border-slate-200 pt-6">
              <div className="flex"><span className="w-64 text-slate-500">Mean Deviation (Scan vs BIM)</span><span className="font-bold text-slate-900">{meanDeviation.toFixed(4)} M</span></div>
              <div className="flex"><span className="w-64 text-slate-500">Tolerance Threshold</span><span className="font-bold text-slate-900">0.010 M (NIS 87 / ISO 19650)</span></div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic">BIM Alignment analysis has not yet been completed for this scan session.</p>
        )}
      </section>

      {/* 7. Clash Detection */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">7</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Clash Detection - Building Element Conflicts</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">Our AI checks whether building elements are fighting for the same space in the design model. When two walls, beams, or pipes are designed to occupy the same physical spot, it is a 'clash'. Catching these before construction prevents costly rework.</p>
        
        {clashes.length > 0 ? (
          <div>
            <div className="border-2 border-amber-500 text-amber-700 text-center font-bold py-3 rounded-lg mb-6">
              {clashes.length} BUILDING ELEMENT CONFLICT(S) FOUND
            </div>
            
            <div className="pl-4 border-l-2 border-cyan-400 mb-6">
              <p className="text-xs font-bold text-cyan-600 uppercase mb-1">WHAT TO DO NEXT:</p>
              <p className="text-slate-600 font-medium text-sm italic">
                design team must review the 3D model and resolve these conflicts before construction reaches the specified floors.
              </p>
            </div>
            
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-sm text-slate-700 font-mono">
                <thead className="bg-slate-800 text-white text-xs font-bold">
                  <tr>
                    <th className="px-6 py-3">CLASH ID</th>
                    <th className="px-6 py-3">SEVERITY</th>
                    <th className="px-6 py-3">ELEMENT 1</th>
                    <th className="px-6 py-3">ELEMENT 2</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clashes.map((c, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-6 py-3">{c.id || 'N/A'}</td>
                      <td className={`px-6 py-3 font-bold ${c.severity === 'high' || c.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}`}>{c.severity.toUpperCase()}</td>
                      <td className="px-6 py-3">{c.element1_id}</td>
                      <td className="px-6 py-3">{c.element2_id}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-green-50 p-6 rounded-xl border border-green-200 text-green-700 font-bold">
            NO DESIGN CONFLICTS DETECTED IN THE BIM MODEL.
          </div>
        )}
      </section>

      {/* 8. Engineering Recommendations */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">8</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Engineering Recommendations - Prioritised To-Do List</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">This is the project's To-Do list. Each item has a Priority, Risk level, Recommended Action, and who is Accountable. SLA: CRITICAL=2 days, URGENT/HIGH=7 days, ROUTINE/MEDIUM=10 days, LOW=14 days.</p>
        
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-800 text-white text-xs font-bold font-mono">
              <tr>
                <th className="px-6 py-3">PRIORITY</th>
                <th className="px-6 py-3">RISK</th>
                <th className="px-6 py-3">RECOMMENDED ACTION</th>
                <th className="px-6 py-3">ACCOUNTABILITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {hasCriticalBim && (
                <tr className="bg-red-50">
                  <td className="px-6 py-4 font-bold text-red-700 font-mono">CRITICAL</td>
                  <td className="px-6 py-4 font-medium">Structural & Safety</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    Re-survey Site Coordinates: The building is {meanDeviation?.toFixed(2)}m out of position. Immediate surveyor action required.
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">Site Surveyor / Project Manager</td>
                </tr>
              )}
              {hasUrgentAnomalies && (
                <tr className="bg-amber-50">
                  <td className="px-6 py-4 font-bold text-amber-700 font-mono">URGENT</td>
                  <td className="px-6 py-4 font-medium">Safety & Quality</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    Inspect Roof/Walls for Heat Loss: The thermal image shows severe heat loss. Check for insulation gaps.
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">Site Supervisor / Contractor</td>
                </tr>
              )}
              {hasMediumDefects && (
                <tr className="bg-white">
                  <td className="px-6 py-4 font-bold text-cyan-700 font-mono">ROUTINE</td>
                  <td className="px-6 py-4 font-medium">Low</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    Monitor Surface Defects: Observe small cracks on the facade during next visit. Note if they grow.
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">Site Supervisor</td>
                </tr>
              )}
              {hasClashes && (
                <tr className="bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-700 font-mono">PLANNING</td>
                  <td className="px-6 py-4 font-medium">Low</td>
                  <td className="px-6 py-4 font-medium text-slate-900">
                    Resolve Design Conflicts: The design team must check and fix {clashes.length} wall conflicts found by AI.
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-600">Design Team</td>
                </tr>
              )}
              {!hasCriticalBim && !hasUrgentAnomalies && !hasMediumDefects && !hasClashes && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 font-medium">
                    No immediate actions required. Continue routine monitoring.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* 9. Final Site Health Check */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">9</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Final Site Health Check & Conclusion</h2>
        </div>
        <p className="text-slate-600 mb-6 font-medium italic">This is the verdict. The Project Manager should assign the recommended actions and schedule a follow-up scan after the surveyor and contractor complete their work.</p>
        
        <div className="space-y-4 mb-8">
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <span className="font-bold text-slate-800">STRUCTURAL INTEGRITY</span>
            <span className={`font-bold px-3 py-1 rounded text-sm ${criticalDefectsCount > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{criticalDefectsCount > 0 ? 'FAILED' : 'PASSED'}</span>
            <span className="text-sm text-slate-600 md:w-1/2">{criticalDefectsCount > 0 ? `${criticalDefectsCount} critical structural issue(s) detected - see Defect Findings section.` : 'The main structure is sound. No major cracks or weaknesses found.'}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <span className="font-bold text-slate-800">BUILDING ENVELOPE</span>
            <span className={`font-bold px-3 py-1 rounded text-sm ${hasUrgentAnomalies ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{hasUrgentAnomalies ? 'CONDITIONAL' : 'PASSED'}</span>
            <span className="text-sm text-slate-600 md:w-1/2">{hasUrgentAnomalies ? 'Well-sealed except for areas identified in the thermal analysis. Urgent to fix.' : 'No thermal anomalies detected. Building envelope is intact.'}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <span className="font-bold text-slate-800">COMPLIANCE WITH DESIGN</span>
            <span className={`font-bold px-3 py-1 rounded text-sm ${hasCriticalBim ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{hasCriticalBim ? 'FAILED - CRITICAL' : 'PASSED'}</span>
            <span className="text-sm text-slate-600 md:w-1/2">{hasCriticalBim ? `Position error of ${meanDeviation?.toFixed(2)}m is a serious safety risk that must be corrected immediately.` : 'Building is in the correct position as per design.'}</span>
          </div>
          <div className="p-4 border border-slate-200 rounded-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <span className="font-bold text-slate-800">3D MODEL CONFLICTS</span>
            <span className={`font-bold px-3 py-1 rounded text-sm ${hasClashes ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{hasClashes ? 'FOUND' : 'CLEAR'}</span>
            <span className="text-sm text-slate-600 md:w-1/2">{hasClashes ? `${clashes.length} conflict(s) found - fix the designs before construction reaches those floors.` : 'No design conflicts detected.'}</span>
          </div>
        </div>

        <h4 className="font-bold text-slate-800 uppercase mb-4 border-b pb-2 text-lg">RECOMMENDED OVERALL ACTION</h4>
        <div className="space-y-3 font-medium text-slate-700">
          {hasCriticalBim && <p><span className="text-blue-600 font-bold font-mono w-24 inline-block">1. URGENT:</span> Have the site surveyor re-verify the building's coordinates immediately.</p>}
          {hasUrgentAnomalies && <p><span className="text-blue-600 font-bold font-mono w-24 inline-block">2. URGENT:</span> Contact the roofing/building contractor to address the thermal heat loss.</p>}
          {hasMediumDefects && <p><span className="text-blue-600 font-bold font-mono w-24 inline-block">3. ROUTINE:</span> Monitor the crack(s) and resolve any surface defects at the next site visit.</p>}
          {hasClashes && <p><span className="text-blue-600 font-bold font-mono w-24 inline-block">4. PLANNING:</span> Design team must fix the BIM model conflicts before work reaches those floors.</p>}
          {!hasCriticalBim && !hasUrgentAnomalies && !hasMediumDefects && !hasClashes && <p><span className="text-blue-600 font-bold font-mono w-24 inline-block">1. ROUTINE:</span> Continue scheduled monitoring as per the project quality plan.</p>}
        </div>
      </section>

      {/* 10. Professional Engineer Sign-Off */}
      <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold">10</div>
          <h2 className="text-xl font-bold text-slate-800 uppercase">Professional Engineer Sign-Off</h2>
        </div>
        <p className="text-slate-600 mb-8 font-medium italic">This report was prepared using AI-assisted analysis under the Nexucon Digital Eye platform. All AI findings carry a confidence score and must be reviewed and validated by a COREN-registered structural engineer before any remedial works are commissioned.</p>
        
        <h4 className="font-bold text-slate-700 uppercase mb-6 border-b pb-2">Engineer Review & Sign-Off</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 max-w-4xl font-mono text-sm">
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">REVIEWED BY (NAME):</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">SIGNATURE:</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">PROFESSIONAL QUALIFICATION:</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">DATE OF REVIEW:</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">COREN REGISTRATION NO.:</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
          <div className="flex border-b border-slate-300 pb-2">
            <span className="w-64 text-blue-800 font-bold">COMPANY / FIRM:</span>
            <span className="flex-1 border-b border-dashed border-slate-400"></span>
          </div>
        </div>
        <p className="text-xs font-mono text-slate-400 mt-12 pt-4 border-t border-slate-100">
          GENERATED BY NEXUCON-AI v1.2. AI FINDINGS ARE INDICATIVE ONLY. PROFESSIONAL ENGINEERING VALIDATION IS REQUIRED BEFORE ACTION IS TAKEN.
        </p>
      </section>

    </div>
  );
}
