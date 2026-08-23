import React, { useState, useEffect } from 'react';
import { 
  X, 
  Compass, 
  Radio, 
  MapPin, 
  CheckCircle, 
  AlertTriangle, 
  ShieldCheck, 
  Cpu, 
  Crosshair, 
  Plus, 
  Activity
} from 'lucide-react';
import { Project, getProjects } from '@/services/projects';
import { createSiteVerification, SiteVerification } from '@/services/monitoring';

interface RecordSiteVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newVerification: SiteVerification) => void;
  defaultProjectId?: string;
}

const SURVEY_METHODS = [
  { id: 'GNSS_RTK_SURVEY', label: 'Tersus Oscar GNSS RTK Rover', desc: 'Millimeter-grade dual-frequency RTK boundary survey' },
  { id: 'TERSU_ROVER', label: 'Tersus GNSS Rover Telemetry Sync', desc: 'Real-time CORS base station linked rover telemetry' },
  { id: 'DRONE_PHOTOGRAMMETRY', label: 'Aerial Drone Photogrammetry & LiDAR', desc: 'UAV photogrammetric 3D point cloud footprint validation' },
  { id: 'GPR_SCAN', label: 'Ground Penetrating Radar (GPR) Scan', desc: 'Subsurface utility clearance and void detection' },
  { id: 'TOTAL_STATION', label: 'Total Station Cadastral Survey', desc: 'Optical electronic distance measurement traverse' },
  { id: 'SETBACK_AUDIT', label: 'Statutory Building Setback Audit', desc: 'Road reserve and mandatory planning setback verification' },
  { id: 'LEVEL_ELEVATION', label: 'Foundation Datum Elevation Check', desc: 'Geodetic bench-mark vertical height transfer' }
];

export default function RecordSiteVerificationModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId
}: RecordSiteVerificationModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || '');
  const [method, setMethod] = useState('GNSS_RTK_SURVEY');
  const [deviceIdentifier, setDeviceIdentifier] = useState('Tersus Oscar GNSS RTK #042');
  const [surveyorName, setSurveyorName] = useState('');
  const [surveyorRole, setSurveyorRole] = useState('Directorate of Cadastral & Structural Survey');
  
  // Coordinates
  const [approvedLat, setApprovedLat] = useState('6.425310');
  const [approvedLng, setApprovedLng] = useState('3.421920');
  const [approvedElev, setApprovedElev] = useState('4.15');

  const [capturedLat, setCapturedLat] = useState('6.425318');
  const [capturedLng, setCapturedLng] = useState('3.421924');
  const [capturedElev, setCapturedElev] = useState('4.16');
  const [accuracyMm, setAccuracyMm] = useState('7.5');

  const [toleranceLimit, setToleranceLimit] = useState('0.05');
  const [calculatedVariance, setCalculatedVariance] = useState(0.015);
  const [beaconInput, setBeaconInput] = useState('');
  const [beacons, setBeacons] = useState<string[]>(['BC-LA-2026/089', 'BC-LA-2026/090']);
  
  const [notes, setNotes] = useState('');
  const [isSimulatingRover, setIsSimulatingRover] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getProjects().then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
          if (!selectedProjectId) {
            setSelectedProjectId(defaultProjectId || data[0].id);
          }
        }
      });

      // Default surveyor from current user session if available
      try {
        const userRaw = localStorage.getItem('nexucon_auth_user');
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u.first_name || u.name) {
            setSurveyorName(`${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name);
          }
        }
      } catch {}
    }
  }, [isOpen, defaultProjectId, selectedProjectId]);

  // Recalculate variance whenever coordinates change
  useEffect(() => {
    const lat1 = parseFloat(capturedLat) || 0;
    const lng1 = parseFloat(capturedLng) || 0;
    const lat2 = parseFloat(approvedLat) || 0;
    const lng2 = parseFloat(approvedLng) || 0;

    if (lat1 && lng1 && lat2 && lng2) {
      const dLat = (lat1 - lat2) * 111139.0;
      const dLng = (lng1 - lng2) * 111139.0 * Math.cos(((lat1 + lat2) / 2) * (Math.PI / 180));
      const variance = Math.round(Math.sqrt(dLat * dLat + dLng * dLng) * 1000) / 1000;
      setCalculatedVariance(variance);
    }
  }, [capturedLat, capturedLng, approvedLat, approvedLng]);

  if (!isOpen) return null;

  const handleSimulateRoverCapture = () => {
    setIsSimulatingRover(true);
    setTimeout(() => {
      const baseLat = parseFloat(approvedLat) || 6.425310;
      const baseLng = parseFloat(approvedLng) || 3.421920;
      const jitterLat = (Math.random() - 0.5) * 0.00015;
      const jitterLng = (Math.random() - 0.5) * 0.00015;
      
      setCapturedLat((baseLat + jitterLat).toFixed(6));
      setCapturedLng((baseLng + jitterLng).toFixed(6));
      setAccuracyMm((5 + Math.random() * 8).toFixed(1));
      setIsSimulatingRover(false);
      
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'RTK Fixed telemetry successfully acquired from Tersus Oscar Rover!', type: 'success' } 
      }));
    }, 650);
  };

  const handleAddBeacon = () => {
    if (beaconInput.trim() && !beacons.includes(beaconInput.trim())) {
      setBeacons([...beacons, beaconInput.trim()]);
      setBeaconInput('');
    }
  };

  const handleRemoveBeacon = (b: string) => {
    setBeacons(beacons.filter(item => item !== b));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Please select a construction project.', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const limit = parseFloat(toleranceLimit) || 0.05;
      const varianceDetected = calculatedVariance > limit;

      const payload: Partial<SiteVerification> = {
        project: selectedProjectId,
        method,
        device_identifier: deviceIdentifier.trim() || 'Tersus Oscar GNSS RTK #042',
        cadastral_beacon_numbers: beacons,
        approved_coordinates: {
          lat: parseFloat(approvedLat) || 6.425310,
          lng: parseFloat(approvedLng) || 3.421920,
          elevation: parseFloat(approvedElev) || 4.15
        },
        captured_coordinates: {
          lat: parseFloat(capturedLat) || 6.425318,
          lng: parseFloat(capturedLng) || 3.421924,
          elevation: parseFloat(capturedElev) || 4.16,
          accuracy_horizontal_mm: parseFloat(accuracyMm) || 7.5
        },
        variance_meters: calculatedVariance,
        elevation_variance_meters: Math.abs((parseFloat(capturedElev) || 0) - (parseFloat(approvedElev) || 0)),
        tolerance_limit_meters: limit,
        variance_detected: varianceDetected,
        status: varianceDetected ? 'VARIANCE_DETECTED' : 'PENDING_VERIFICATION',
        verified_by_name: surveyorName.trim() || 'Licensed Cadastral Surveyor',
        verified_by_role: surveyorRole.trim(),
        notes: notes.trim() || `Site survey conducted using ${method}. Spatial displacement measured at ${calculatedVariance}m.`
      };

      const result = await createSiteVerification(payload);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Site verification recorded successfully (${result.verification_reference || 'Ref Generated'})!`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to record site verification';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCompliant = calculatedVariance <= (parseFloat(toleranceLimit) || 0.05);

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 my-8 overflow-hidden">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-[#022C4F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-300">
              <Compass size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black tracking-tight">Record Site Verification</h3>
              <p className="text-xs text-blue-200 font-medium">
                Cadastral coordinate audit, GNSS RTK rover telemetry & setback compliance
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Section 1: Project & Method Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <MapPin size={14} className="text-blue-600" />
                Construction Project <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.reference_number || 'No Ref'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Radio size={14} className="text-blue-600" />
                Verification Method <span className="text-rose-500">*</span>
              </label>
              <select
                value={method}
                onChange={(e) => {
                  setMethod(e.target.value);
                  if (e.target.value === 'DRONE_PHOTOGRAMMETRY') setDeviceIdentifier('DJI Matrice 350 RTK + Zenmuse L2');
                  else if (e.target.value === 'GPR_SCAN') setDeviceIdentifier('Proceq GS8000 GPR Radar');
                  else if (e.target.value === 'TOTAL_STATION') setDeviceIdentifier('Leica TS16 Total Station');
                  else setDeviceIdentifier('Tersus Oscar GNSS RTK #042');
                }}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              >
                {SURVEY_METHODS.map(m => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 2: Survey Instrument & Surveyor Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Device Identifier / Instrument Model</label>
              <input
                type="text"
                value={deviceIdentifier}
                onChange={(e) => setDeviceIdentifier(e.target.value)}
                placeholder="e.g. Tersus Oscar GNSS RTK #042"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Surveyor / Verifying Authority</label>
              <input
                type="text"
                value={surveyorName}
                onChange={(e) => setSurveyorName(e.target.value)}
                placeholder="e.g. Surv. Olumide Balogun (Licensed Cadastral Surveyor)"
                className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
          </div>

          {/* Section 3: Cadastral Beacons */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Crosshair size={14} className="text-indigo-600" />
              Cadastral Boundary Beacons (Pillars)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={beaconInput}
                onChange={(e) => setBeaconInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddBeacon(); } }}
                placeholder="Enter beacon reference e.g. BC-LA-2026/093"
                className="flex-1 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleAddBeacon}
                className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus size={14} /> Add Beacon
              </button>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {beacons.map(b => (
                <span key={b} className="px-2.5 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5">
                  {b}
                  <button type="button" onClick={() => handleRemoveBeacon(b)} className="text-indigo-500 hover:text-rose-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Section 4: Spatial Coordinates & Live Telemetry Capture */}
          <div className="space-y-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-blue-900 flex items-center gap-1.5">
                <Cpu size={15} className="text-blue-600" /> Spatial Coordinates & GNSS RTK Fix
              </span>
              <button
                type="button"
                onClick={handleSimulateRoverCapture}
                disabled={isSimulatingRover}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Activity size={13} className={isSimulatingRover ? 'animate-spin' : ''} />
                {isSimulatingRover ? 'Acquiring RTK Fix...' : '🎯 Capture from RTK Rover'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Approved CAD / Masterplan Coordinates */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <p className="text-[11px] font-black text-slate-700 uppercase">1. Approved Masterplan Benchmark</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Latitude</span>
                    <input
                      type="text"
                      value={approvedLat}
                      onChange={(e) => setApprovedLat(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Longitude</span>
                    <input
                      type="text"
                      value={approvedLng}
                      onChange={(e) => setApprovedLng(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Elevation (m)</span>
                    <input
                      type="text"
                      value={approvedElev}
                      onChange={(e) => setApprovedElev(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Field Measured Coordinates */}
              <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-[11px] font-black text-slate-700 uppercase">2. Field Measured RTK Fix</p>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                    Accuracy: ±{accuracyMm}mm
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Latitude</span>
                    <input
                      type="text"
                      value={capturedLat}
                      onChange={(e) => setCapturedLat(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Longitude</span>
                    <input
                      type="text"
                      value={capturedLng}
                      onChange={(e) => setCapturedLng(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Elevation (m)</span>
                    <input
                      type="text"
                      value={capturedElev}
                      onChange={(e) => setCapturedElev(e.target.value)}
                      className="w-full p-1.5 bg-slate-50 border border-slate-200 rounded font-mono font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Calculated Spatial Variance Banner */}
            <div className={`p-3.5 rounded-2xl flex items-center justify-between border ${
              isCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2.5">
                {isCompliant ? <CheckCircle size={20} className="text-emerald-600" /> : <AlertTriangle size={20} className="text-rose-600" />}
                <div>
                  <div className="text-xs font-black">
                    Calculated Spatial Variance: <span className="font-mono text-sm">{calculatedVariance}m</span> ({Math.round(calculatedVariance * 1000)}mm)
                  </div>
                  <div className="text-[11px] font-medium opacity-80">
                    Regulatory Tolerance Limit: ≤ {toleranceLimit}m (50mm). Status: <strong>{isCompliant ? 'COMPLIANT (Within Tolerance)' : 'VARIANCE / ENCROACHMENT DETECTED'}</strong>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-black uppercase ${
                  isCompliant ? 'bg-emerald-200 text-emerald-800' : 'bg-rose-200 text-rose-800'
                }`}>
                  {isCompliant ? 'PASS' : 'EXCEEDS LIMIT'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 5: Statutory Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Surveyor Notes & Statutory Findings</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g. Setback lines conform 100% with Lagos State Urban Planning approval coordinates. Zero abnormal deviation detected on boundary beacons."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-900 text-white text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck size={16} />
              {isSubmitting ? 'Recording Verification...' : 'Save Site Verification to Database'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
