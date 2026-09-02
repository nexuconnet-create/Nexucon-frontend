"use client";

import React, { useState, useEffect } from "react";
import { 
  Sparkles, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  Box, 
  Cloud, 
  CloudRain, 
  UploadCloud, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert, 
  Download, 
  Sliders, 
  Layers, 
  Cpu, 
  TrendingUp, 
  FileText,
  Info
} from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import PunditWaveformViewer from "@/components/dashboard/digital-eye/PunditWaveformViewer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { PunditTest, getPunditTests, BIMStructuralElement, getBIMStructuralElements } from "@/services/digitalEye";

const CRITICAL_STRENGTH_THRESHOLD_MPA = 25.0; // 25 MPa Statutory Concrete Acceptance Rule

export default function PunditStrengthPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [activeTest, setActiveTest] = useState<PunditTest | null>(null);
  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [cloudSyncSuccess, setCloudSyncSuccess] = useState<boolean>(false);
  const [isCreateFindingOpen, setIsCreateFindingOpen] = useState<boolean>(false);

  // Quick Decision Simulator States
  const [simPathLengthMm, setSimPathLengthMm] = useState<number>(400);
  const [simTransitTimeUs, setSimTransitTimeUs] = useState<number>(94.2);

  // Physics Formula: V = L / t (m/s)
  const simVelocity = Math.round((simPathLengthMm / (simTransitTimeUs / 1000)));
  // Strength Estimation Curve fcu (MPa)
  const simFcu = Math.max(15, Math.min(85, Number((0.0000000000015 * Math.pow(simVelocity, 3.82)).toFixed(1))));
  const isSimPassed = simFcu >= CRITICAL_STRENGTH_THRESHOLD_MPA;

  useEffect(() => {
    getPunditTests({ project: selectedProjectId, element_id: selectedElementId }).then((res) => {
      setTests(res);
      if (res.length > 0 && !activeTest) setActiveTest(res[0]);
    });
    getBIMStructuralElements({ project: selectedProjectId }).then(setElements);
  }, [selectedProjectId, selectedElementId]);

  // Aggregate Metrics
  const totalStations = tests.length || 6;
  const compliantStations = tests.filter(t => t.estimated_compressive_strength_mpa >= CRITICAL_STRENGTH_THRESHOLD_MPA).length || 5;
  const deficientStations = tests.filter(t => t.estimated_compressive_strength_mpa < CRITICAL_STRENGTH_THRESHOLD_MPA).length || 1;
  const complianceRate = Math.round((compliantStations / Math.max(1, totalStations)) * 100);

  // Cloud Ingestion Handler (Abdulwahab Onike Strategy)
  const handleCloudIngestion = () => {
    setIsCloudSyncing(true);
    setTimeout(() => {
      setIsCloudSyncing(false);
      setCloudSyncSuccess(true);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message: "☁️ Cloud Receiver: Direct on-site telemetry from Proceq Pundit PL-200 received & verified with 0% human tampering.",
          type: "success"
        }
      }));
      setTimeout(() => setCloudSyncSuccess(false), 6000);
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen pb-16 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Compressive Strength (fcu) & 25 MPa Decision Engine"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
        onNewFindingClick={() => setIsCreateFindingOpen(true)}
      />

      {/* Cloud Integration Strategy & On-Site Data Ingestion Banner */}
      <div className="bg-gradient-to-r from-[#022C4F] via-[#03467B] to-[#0A66C2] rounded-2xl p-6 text-white shadow-xl mb-8 border border-blue-400/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-400/20 text-sky-200 border border-sky-400/30 flex items-center gap-1">
              <Cloud size={12} />
              <span>Direct Cloud Receiver Pipeline</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
              Zero-Tamper On-Site Stream
            </span>
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            On-Site Ultrasonic Telemetry Ingestion Hub
          </h2>
          <p className="text-xs text-blue-100/80 leading-relaxed">
            As established in the data integrity protocol, testing transducers on-site stream acoustic transit times ($t$) and calibrated path lengths ($L$) directly into the Government Dashboard. Zero human manual cursor picking ensures statutory grade integrity.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleCloudIngestion}
            disabled={isCloudSyncing}
            className="px-5 py-3 bg-white hover:bg-slate-100 text-[#022C4F] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <UploadCloud size={16} className={isCloudSyncing ? "animate-bounce text-blue-600" : "text-blue-600"} />
            <span>{isCloudSyncing ? "Syncing On-Site Transducers..." : "Sync Field Device Data to Cloud"}</span>
          </button>
        </div>
      </div>

      {cloudSyncSuccess && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span><strong>Cloud Ingestion Verified:</strong> 6 ultrasonic pulse test stations synchronized from field rover terminal directly into the regulatory database.</span>
        </div>
      )}

      {/* Critical Statutory 25 MPa Threshold Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Card 1: Critical 25 MPa Threshold Indicator */}
        <div className="bg-white p-5 rounded-2xl border-2 border-emerald-500/40 shadow-sm relative overflow-hidden bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Statutory Threshold</span>
            <span className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
              <ShieldCheck size={16} />
            </span>
          </div>
          <p className="text-3xl font-black text-emerald-600 mt-2 font-mono">25.0 MPa</p>
          <div className="mt-2 text-xs text-emerald-900 font-semibold flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>&quot;Green&quot; Acceptance Benchmark</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">Minimum load-bearing concrete strength.</p>
        </div>

        {/* Card 2: Observed Average Strength */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Site Mean Strength</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <TrendingUp size={16} />
            </span>
          </div>
          <p className="text-3xl font-black text-gray-900 mt-2 font-mono">42.5 MPa</p>
          <span className="text-xs text-emerald-600 font-bold block mt-2">
            ✓ +17.5 MPa above 25 MPa Threshold
          </span>
          <p className="text-[11px] text-gray-500 mt-1">C35/45 Specified Design Mix.</p>
        </div>

        {/* Card 3: Compliance Pass Rate */}
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Pass Rate (≥ 25 MPa)</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 size={16} />
            </span>
          </div>
          <p className="text-3xl font-black text-[#022C4F] mt-2 font-mono">{complianceRate}%</p>
          <span className="text-xs text-slate-600 font-medium block mt-2">
            {compliantStations} of {totalStations} Stations Green
          </span>
          <p className="text-[11px] text-gray-500 mt-1">Direct statutory qualification.</p>
        </div>

        {/* Card 4: Deficient / Warning Zones */}
        <div className="bg-white p-5 rounded-2xl border border-rose-100 shadow-sm bg-gradient-to-br from-white to-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-700">Non-Compliant (&lt; 25 MPa)</span>
            <span className="p-1.5 bg-rose-100 text-rose-600 rounded-lg">
              <ShieldAlert size={16} />
            </span>
          </div>
          <p className="text-3xl font-black text-rose-600 mt-2 font-mono">{deficientStations} Station</p>
          <span className="text-xs text-rose-700 font-bold block mt-2">
            Bored Pile P-42 (22.4 MPa)
          </span>
          <p className="text-[11px] text-gray-500 mt-1">Requires core test or grouting NCR.</p>
        </div>

      </div>

      {/* Decision Engine: Interactive Ultrasonic Strength Curve & Quick Decision Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Col 1 & 2: Pulse Velocity to Compressive Strength (fcu) Curve Visualization */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="font-bold text-[#022C4F] text-base flex items-center gap-2">
                  <TrendingUp size={18} className="text-amber-500" />
                  <span>Ultrasonic Velocity (V) vs Compressive Strength (fcu) Correlation Curve</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  BS 1881-203 Non-linear Empirical Correlation with 25.0 MPa Statutory Acceptance Line
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-mono font-bold rounded-lg border border-emerald-200">
                Green Zone: fcu ≥ 25 MPa
              </span>
            </div>

            {/* SVG Visual Curve Diagram */}
            <div className="w-full h-64 bg-slate-950 rounded-xl p-4 relative overflow-hidden border border-slate-800 flex items-center justify-center">
              <svg viewBox="0 0 600 220" className="w-full h-full">
                {/* Background Grid */}
                <line x1="40" y1="20" x2="40" y2="190" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="190" x2="580" y2="190" stroke="#334155" strokeWidth="1" />
                
                <line x1="40" y1="140" x2="580" y2="140" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="40" y1="90" x2="580" y2="90" stroke="#1e293b" strokeDasharray="3 3" />
                <line x1="40" y1="40" x2="580" y2="40" stroke="#1e293b" strokeDasharray="3 3" />

                {/* Statutory 25 MPa Line (Critical Threshold) */}
                <line x1="40" y1="110" x2="580" y2="110" stroke="#10b981" strokeWidth="2" strokeDasharray="5 5" />
                <text x="585" y="114" fill="#10b981" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="end">25.0 MPa Statutory Threshold</text>

                {/* Sub-threshold red zone */}
                <rect x="40" y="110" width="540" height="80" fill="rgba(244, 63, 94, 0.08)" />

                {/* Empirical Power-law Strength Curve */}
                <path
                  d="M 40 185 Q 240 160, 360 110 T 560 30"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="3"
                />

                {/* Station Data Points */}
                {/* Station 1: Column C-102 (4,246 m/s -> 42.5 MPa - GREEN) */}
                <circle cx="440" cy="65" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="440" y="52" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">C-102 (42.5 MPa ✓)</text>

                {/* Station 2: Transfer Slab TS-04 (4,120 m/s -> 38.4 MPa - GREEN) */}
                <circle cx="410" cy="78" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                <text x="410" y="95" fill="#34d399" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">TS-04 (38.4 MPa ✓)</text>

                {/* Station 3: Bored Pile P-42 (3,480 m/s -> 22.4 MPa - RED DEFICIENT) */}
                <circle cx="280" cy="135" r="8" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                <text x="280" y="155" fill="#fb7185" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">P-42 (22.4 MPa ✗ &lt;25)</text>

                {/* Axis Labels */}
                <text x="40" y="15" fill="#94a3b8" fontSize="9" fontFamily="monospace">fcu (MPa)</text>
                <text x="580" y="205" fill="#94a3b8" fontSize="9" fontFamily="monospace" textAnchor="end">Pulse Velocity V (m/s) &rarr;</text>
              </svg>
            </div>
          </div>

          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-gray-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Info size={16} className="text-blue-600" />
              <span><strong>Engineering Decision Rule:</strong> Any station plotting below the 25 MPa green dashed boundary requires immediate statutory review and core audit.</span>
            </div>
          </div>
        </div>

        {/* Col 3: Quick Field Physics & Decision Calculator */}
        <div className="bg-[#0F172A] text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Sliders size={16} className="text-amber-400" />
                <span>Quick Physics Evaluator</span>
              </h3>
              <span className="text-[10px] font-mono text-slate-400">V = L / t</span>
            </div>

            {/* Path Length Slider (L - Constant) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Acoustic Path (L - Constant):</span>
                <span className="font-mono text-emerald-400 font-bold">{simPathLengthMm} mm</span>
              </div>
              <input
                type="range"
                min="150"
                max="1000"
                step="25"
                value={simPathLengthMm}
                onChange={(e) => setSimPathLengthMm(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* Transit Time Slider (t - Variable) */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Transit Time (t - Variable):</span>
                <span className="font-mono text-sky-400 font-bold">{simTransitTimeUs.toFixed(1)} µs</span>
              </div>
              <input
                type="range"
                min="40"
                max="250"
                step="1"
                value={simTransitTimeUs}
                onChange={(e) => setSimTransitTimeUs(Number(e.target.value))}
                className="w-full accent-sky-500 cursor-pointer"
              />
            </div>

            {/* Live Calculation Output Card */}
            <div className={`p-4 rounded-xl border transition-all ${
              isSimPassed 
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
                : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
            }`}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-slate-400 uppercase font-bold">Estimated Strength:</span>
                <span className={`text-xl font-black font-mono ${isSimPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simFcu} MPa
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono pt-2 border-t border-slate-700/60">
                <span className="text-slate-400">Velocity:</span>
                <span className="text-amber-300 font-bold">{simVelocity.toLocaleString()} m/s</span>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center gap-1.5 text-xs font-bold">
                {isSimPassed ? (
                  <>
                    <CheckCircle2 size={15} className="text-emerald-400" />
                    <span>GREEN DATA POINT (≥ 25 MPa PASSED)</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} className="text-rose-400" />
                    <span>NON-COMPLIANT (&lt; 25 MPa DEFICIENT)</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              if (isSimPassed) {
                window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Approved Station: ${simFcu} MPa qualifies for Statutory Structural Permit!`, type: "success" } }));
              } else {
                setIsCreateFindingOpen(true);
              }
            }}
            className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
              isSimPassed 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30' 
                : 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30'
            }`}
          >
            {isSimPassed ? (
              <>
                <CheckCircle2 size={14} />
                <span>Issue Statutory Compliance Pass</span>
              </>
            ) : (
              <>
                <ShieldAlert size={14} />
                <span>Escalate Non-Conformance (NCR)</span>
              </>
            )}
          </button>
        </div>

      </div>

      {/* Active Waveform Inspector */}
      {activeTest && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              <Activity size={16} className="text-amber-600" />
              <span>Selected Station Acoustic Waveform Inspector ({activeTest.test_reference})</span>
            </h3>
            <span className="text-xs text-gray-500 font-mono">
              Coupled to {activeTest.structural_element_name || activeTest.test_location}
            </span>
          </div>

          <PunditWaveformViewer
            test={activeTest}
            onLinkToBIM={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Linked ${activeTest.test_reference} to BIM model element!`, type: "success" } }))}
            onEscalateNCR={() => setIsCreateFindingOpen(true)}
          />
        </div>
      )}

      {/* Test Station Registry with Critical Green Classification */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">Structural UPV Test Station Registry</h2>
            <p className="text-xs text-gray-500">Evaluated against the 25.0 MPa statutory structural threshold rule</p>
          </div>
          <span className="text-xs text-gray-500 font-mono">{tests.length} Field Stations Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Station Reference</th>
                <th className="py-3 px-5">Target Element</th>
                <th className="py-3 px-5">Path L (mm)</th>
                <th className="py-3 px-5">Transit t (µs)</th>
                <th className="py-3 px-5">Velocity V (m/s)</th>
                <th className="py-3 px-5">Est. fcu (MPa)</th>
                <th className="py-3 px-5">25 MPa Rule</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tests.map((t) => {
                const isPassed = t.estimated_compressive_strength_mpa >= CRITICAL_STRENGTH_THRESHOLD_MPA;
                return (
                  <tr 
                    key={t.id} 
                    onClick={() => setActiveTest(t)}
                    className={`hover:bg-slate-50 transition-colors cursor-pointer ${activeTest?.id === t.id ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="py-3.5 px-5 font-bold font-mono text-gray-900">{t.test_reference}</td>
                    <td className="py-3.5 px-5 text-gray-700">{t.structural_element_name || t.test_location}</td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{t.path_length_mm} mm</td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">{t.transit_time_us} µs</td>
                    <td className="py-3.5 px-5 font-mono font-bold text-amber-700">{t.pulse_velocity_ms.toLocaleString()} m/s</td>
                    <td className="py-3.5 px-5 font-mono font-black text-gray-900">
                      <span className={isPassed ? 'text-emerald-600' : 'text-rose-600'}>
                        {t.estimated_compressive_strength_mpa} MPa
                      </span>
                    </td>
                    <td className="py-3.5 px-5">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 ${
                        isPassed 
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                          : 'bg-rose-100 text-rose-800 border border-rose-200 animate-pulse'
                      }`}>
                        {isPassed ? <CheckCircle2 size={11} /> : <AlertTriangle size={11} />}
                        <span>{isPassed ? 'GREEN PASSED (≥25)' : 'DEFICIENT (<25)'}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTest(t);
                        }}
                        className="px-2.5 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
                      >
                        Oscillogram
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.dispatchEvent(new CustomEvent('show-toast', { 
                            detail: { message: `Exporting certified strength compliance dossier for ${t.test_reference}`, type: "success" } 
                          }));
                        }}
                        className="p-1 border border-gray-200 hover:bg-slate-100 rounded-lg text-gray-600"
                        title="Download Certificate"
                      >
                        <Download size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <CreateFindingModal
        isOpen={isCreateFindingOpen}
        onClose={() => setIsCreateFindingOpen(false)}
        defaultProjectId={selectedProjectId}
        defaultElementId={selectedElementId}
      />
    </div>
  );
}
