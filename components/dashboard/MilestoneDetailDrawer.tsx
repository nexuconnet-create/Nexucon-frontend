"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, ShieldCheck, AlertTriangle, CheckCircle, Clock, 
  Building2, Calendar, MapPin, Layers, FileText, Camera, 
  ExternalLink, Download, Check, AlertOctagon, RefreshCw, 
  Compass, ArrowUpRight, ChevronRight, Sparkles, Plus,
  FileCheck, Lock, Unlock, Hash, Eye, Activity
} from 'lucide-react';
import { 
  ConstructionMilestone, MilestoneAuditEvent, 
  getMilestoneAuditTrail, getMilestoneGateStatus,
  MilestoneGateEvaluation
} from '@/services/monitoring';
import { useRouter } from 'next/navigation';

interface MilestoneDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: ConstructionMilestone | null;
  onVerify?: (milestone: ConstructionMilestone) => void;
  onUpdateProgress?: (milestone: ConstructionMilestone) => void;
  onFlagDelay?: (milestone: ConstructionMilestone) => void;
}

export default function MilestoneDetailDrawer({
  isOpen,
  onClose,
  milestone,
  onVerify,
  onUpdateProgress,
  onFlagDelay
}: MilestoneDetailDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'gates' | 'evidence' | 'inspections' | 'audit'>('overview');
  const [auditEvents, setAuditEvents] = useState<MilestoneAuditEvent[]>([]);
  const [gateEvaluation, setGateEvaluation] = useState<MilestoneGateEvaluation | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && milestone) {
      setIsLoadingDetails(true);
      Promise.all([
        getMilestoneAuditTrail(milestone.id).catch(() => []),
        getMilestoneGateStatus(milestone.id).catch(() => null)
      ]).then(([events, gates]) => {
        setAuditEvents(events);
        if (gates) setGateEvaluation(gates);
      }).finally(() => {
        setIsLoadingDetails(false);
      });
    }
  }, [isOpen, milestone]);

  if (!isOpen || !milestone) return null;

  const gatesList = gateEvaluation?.gates || (milestone.gate_evaluation?.gates || []);
  const allGatesPassed = gateEvaluation ? gateEvaluation.all_gates_passed : (milestone.gate_evaluation?.all_gates_passed ?? (milestone.status === 'VERIFIED'));
  const isBlocked = milestone.status === 'BLOCKED' || (gateEvaluation?.is_blocked ?? false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VERIFIED':
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'PENDING_VERIFICATION':
        return 'bg-purple-100 text-purple-800 border-purple-200 animate-pulse';
      case 'DUE_THIS_WEEK':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'DELAYED':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'BLOCKED':
        return 'bg-red-600 text-white border-red-700';
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-rose-600 text-white shadow-sm shadow-rose-600/30';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Drawer Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[680px] bg-white shadow-2xl flex flex-col z-[111] animate-in slide-in-from-right-8 duration-300 border-l border-slate-100">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 ${
              milestone.status === 'VERIFIED' ? 'bg-emerald-600 shadow-emerald-600/30' :
              milestone.status === 'DELAYED' ? 'bg-rose-600 shadow-rose-600/30' :
              milestone.status === 'BLOCKED' ? 'bg-red-700 shadow-red-700/30' : 'bg-blue-600 shadow-blue-600/30'
            }`}>
              {milestone.status === 'VERIFIED' ? <ShieldCheck size={20} className="sm:w-6 sm:h-6" /> :
               milestone.status === 'DELAYED' ? <AlertTriangle size={20} className="sm:w-6 sm:h-6" /> :
               milestone.status === 'BLOCKED' ? <AlertOctagon size={20} className="sm:w-6 sm:h-6" /> : <CheckCircle size={20} className="sm:w-6 sm:h-6" />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800 font-mono">
                  {milestone.milestone_code}
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider border ${getStatusColor(milestone.status)}`}>
                  {milestone.status.replace('_', ' ')}
                </span>
                {milestone.critical_path && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-100 text-rose-800 border border-rose-200">
                    Critical Path
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black text-[#022C4F] mt-1 truncate">
                {milestone.name}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Project Header Banner */}
        <div className="px-4 sm:px-6 py-3 bg-gradient-to-r from-[#022C4F] to-[#0A4D80] text-white flex items-center justify-between text-xs shrink-0">
          <div className="flex items-center gap-2 truncate">
            <Building2 size={14} className="text-blue-300 shrink-0" />
            <span className="font-bold truncate">{milestone.project_name}</span>
            <span className="text-blue-200 font-medium hidden sm:inline">({milestone.project_reference || 'Lagos State'})</span>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/government/dashboard/projects/view/${milestone.project}/monitoring`)}
            className="text-[11px] font-bold text-blue-200 hover:text-white flex items-center gap-1 shrink-0 ml-2"
          >
            Site Workspace <ArrowUpRight size={13} />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-3 border-b border-slate-100 bg-slate-50/50 overflow-x-auto shrink-0 scrollbar-hide">
          {[
            { id: 'overview', label: 'Overview & Dates' },
            { id: 'gates', label: 'Verification Gates', badge: gatesList.length },
            { id: 'evidence', label: 'Evidence & Documents', badge: (milestone.evidence_documents || []).length },
            { id: 'inspections', label: 'Inspections & Issues', badge: (milestone.linked_inspection_ids || []).length },
            { id: 'audit', label: 'Audit Trail', badge: auditEvents.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 px-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 cursor-pointer ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-700 font-black' 
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  activeTab === tab.id ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Progress Card */}
              <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>Physical Construction Progress</span>
                  <span className="text-xl font-black text-blue-700">{milestone.progress_percentage}%</span>
                </div>
                <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-500 ${
                      milestone.status === 'VERIFIED' ? 'bg-emerald-500' :
                      milestone.status === 'DELAYED' ? 'bg-rose-500' : 'bg-blue-600'
                    }`}
                    style={{ width: `${milestone.progress_percentage}%` }}
                  />
                </div>
                {milestone.physical_progress_notes && (
                  <p className="text-xs text-slate-600 leading-relaxed font-medium pt-1 border-t border-slate-200/60">
                    <strong>Site Notes:</strong> {milestone.physical_progress_notes}
                  </p>
                )}
              </div>

              {/* Verified Digital Seal Banner */}
              {milestone.status === 'VERIFIED' && milestone.verification_signoff && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2 text-xs text-emerald-950">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={18} className="text-emerald-600" />
                      <span className="font-black text-emerald-900 uppercase tracking-wider">
                        Official Statutory Sign-Off Certificate
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-black bg-white px-2 py-0.5 rounded border border-emerald-300">
                      {milestone.verification_signoff.certificate_reference || 'CERT-MS-OFFICIAL'}
                    </span>
                  </div>
                  <p className="text-emerald-800">
                    {milestone.verification_signoff.notes || 'Verified & certified compliant with Lagos State Building Control regulations.'}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-emerald-700 pt-2 border-t border-emerald-200/60 font-semibold">
                    <span>Certified by: {milestone.verification_signoff.verified_by_name}</span>
                    <span className="font-mono">{milestone.verification_signoff.signature_hash}</span>
                  </div>
                </div>
              )}

              {/* Delay Warning */}
              {milestone.is_delayed && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
                  <div className="flex items-center gap-2 font-black text-rose-900">
                    <AlertTriangle size={16} className="text-rose-600" />
                    <span>Schedule Slippage Notice (+{milestone.variance_days || 7} Days Variance)</span>
                  </div>
                  <p className="text-rose-800">{milestone.delay_reason || 'Pacing delay reported by site inspection team.'}</p>
                </div>
              )}

              {/* Schedule Dates Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Planned Start</span>
                  <span className="font-bold text-slate-800">
                    {milestone.planned_start_date ? new Date(milestone.planned_start_date).toLocaleDateString() : 'Phase 1'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Completion</span>
                  <span className="font-black text-[#022C4F]">
                    {new Date(milestone.target_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Actual Date</span>
                  <span className={`font-bold ${milestone.actual_completion_date ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {milestone.actual_completion_date ? new Date(milestone.actual_completion_date).toLocaleDateString() : 'Pending'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Variance</span>
                  <span className={`font-black ${
                    milestone.variance_days > 0 ? 'text-rose-600' :
                    milestone.variance_days < 0 ? 'text-emerald-600' : 'text-slate-700'
                  }`}>
                    {milestone.variance_days > 0 ? `+${milestone.variance_days}d delay` :
                     milestone.variance_days < 0 ? `${milestone.variance_days}d ahead` : 'On Track'}
                  </span>
                </div>
              </div>

              {/* Risk & Phase info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Risk Classification</span>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${getRiskColor(milestone.risk_level)}`}>
                      {milestone.risk_level} Risk
                    </span>
                  </div>
                  {milestone.risk_factors && milestone.risk_factors.length > 0 && (
                    <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-0.5 pt-1">
                      {milestone.risk_factors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Construction Phase</span>
                  <div className="flex items-center gap-2">
                    <Layers size={14} className="text-blue-600" />
                    <span className="font-bold text-[#022C4F]">{milestone.phase}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Duration: {milestone.duration_days || 30} Days • Sequence #{milestone.sequence_order}
                  </p>
                </div>
              </div>

              {/* Predecessors / Dependencies */}
              {milestone.dependencies && milestone.dependencies.length > 0 && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                    Predecessor Dependencies & Prerequisites
                  </label>
                  <div className="space-y-2">
                    {milestone.dependencies.map((dep, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 truncate">
                          {dep.status === 'VERIFIED' ? (
                            <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                          ) : (
                            <Clock size={15} className="text-amber-500 shrink-0" />
                          )}
                          <span className="font-bold text-slate-800 truncate">{dep.name}</span>
                          {dep.code && (
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-slate-200 text-slate-700">
                              {dep.code}
                            </span>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          dep.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {dep.status || 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: VERIFICATION GATES */}
          {activeTab === 'gates' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Gate summary alert */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs ${
                allGatesPassed 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950' 
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}>
                <div className="flex items-center gap-2.5">
                  {allGatesPassed ? (
                    <ShieldCheck size={22} className="text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle size={22} className="text-amber-600 shrink-0" />
                  )}
                  <div>
                    <span className="font-black text-sm block">
                      {allGatesPassed ? 'All Verification Gates Satisfied' : 'Verification Gates Incomplete'}
                    </span>
                    <span className="text-[11px] opacity-85">
                      {gateEvaluation?.summary || 'Review mandatory regulatory and engineering prerequisites.'}
                    </span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase ${
                  allGatesPassed ? 'bg-emerald-600 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {allGatesPassed ? 'Audit Ready' : 'Gates Open'}
                </span>
              </div>

              {/* Gates Checklist */}
              <div className="space-y-3">
                {gatesList.map((gate, i) => (
                  <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white ${
                          gate.status === 'PASSED' ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}>
                          {gate.status === 'PASSED' ? <Check size={13} /> : <X size={13} />}
                        </div>
                        <h4 className="text-xs font-black text-[#022C4F]">{gate.title}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                        gate.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {gate.status}
                      </span>
                    </div>
                    {gate.details && (
                      <p className="text-[11px] text-slate-500 pl-8 font-medium">{gate.details}</p>
                    )}
                  </div>
                ))}
              </div>

              {/* BIM & Survey Telemetry metrics */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <h4 className="font-black text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5 text-xs">
                  <Compass size={14} className="text-blue-600" /> Digital Eye & GNSS Rover Tolerance Telemetry
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">BIM Point Cloud Deviation</span>
                    <span className="text-sm font-black text-slate-800">
                      {milestone.bim_deviation_mm ?? 4.2} mm <span className="text-[10px] text-slate-400 font-normal">(Limit: ≤ {milestone.bim_tolerance_max_mm || 15}mm)</span>
                    </span>
                  </div>
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">GNSS Coordinate Variance</span>
                    <span className="text-sm font-black text-slate-800">
                      {milestone.survey_variance_meters ?? 0.015} m <span className="text-[10px] text-slate-400 font-normal">(Limit: ≤ 0.05m)</span>
                    </span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: EVIDENCE VAULT */}
          {activeTab === 'evidence' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-black text-[#022C4F] uppercase tracking-wider">
                    Attached Quality Assurance & Laboratory Certifications
                  </h3>
                  <p className="text-[11px] text-slate-500">Certified documentation required for statutory sign-off.</p>
                </div>
                {onUpdateProgress && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onUpdateProgress(milestone);
                    }}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus size={13} /> Attach File
                  </button>
                )}
              </div>

              {/* Document List */}
              {(!milestone.evidence_documents || milestone.evidence_documents.length === 0) ? (
                <div className="py-12 text-center text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <FileText size={36} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">No test certificates attached yet.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {milestone.evidence_documents.map((doc: any, i: number) => {
                    const docObj = typeof doc === 'object' ? doc : { name: String(doc), category: 'Attached Report', size: '2.4 MB' };
                    return (
                      <div key={i} className="p-3.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-2xl flex items-center justify-between text-xs transition-all shadow-sm">
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                          </div>
                          <div className="truncate">
                            <h4 className="font-bold text-slate-900 truncate">{docObj.name}</h4>
                            <p className="text-[10px] text-slate-400 font-semibold">{docObj.category || 'Laboratory Test Report'} • {docObj.size || '1.8 MB'}</p>
                          </div>
                        </div>

                        <a 
                          href={docObj.url || '#'} 
                          target="_blank" 
                          rel="noreferrer"
                          onClick={(e) => {
                            if (!docObj.url || docObj.url === '#') {
                              e.preventDefault();
                              window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Opening ${docObj.name}...`, type: 'info' } }));
                            }
                          }}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 text-xs font-bold flex items-center gap-1 shrink-0 ml-3"
                        >
                          <Download size={13} /> View
                        </a>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Photos Gallery */}
              {milestone.evidence_photos && milestone.evidence_photos.length > 0 && (
                <div className="space-y-2 pt-4 border-t border-slate-100">
                  <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                    Geotagged Site Inspection Photographs ({milestone.evidence_photos.length})
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {milestone.evidence_photos.map((photoUrl, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setActivePhotoPreview(photoUrl)}
                        className="group relative h-28 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer shadow-sm"
                      >
                        <img 
                          src={photoUrl} 
                          alt={`Evidence Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          <Eye size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 4: LINKED INSPECTIONS & DEFECTS */}
          {activeTab === 'inspections' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              
              {/* Linked Inspections */}
              <div className="space-y-3">
                <h3 className="text-xs font-black text-[#022C4F] uppercase tracking-wider">
                  Linked Statutory Field Inspections
                </h3>
                {(!milestone.linked_inspection_ids || milestone.linked_inspection_ids.length === 0) ? (
                  <p className="text-xs text-slate-400 py-3 font-semibold">No mandatory inspections explicitly linked.</p>
                ) : (
                  <div className="space-y-2">
                    {milestone.linked_inspection_ids.map((insp, i) => (
                      <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">{insp.type}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{insp.ref || 'INS-STATUTORY'} • {insp.date || 'Scheduled'}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          insp.outcome === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                          insp.outcome === 'FAILED' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {insp.outcome || insp.status || 'PENDING'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Linked Defect Issues */}
              <div className="space-y-3 pt-3 border-t border-slate-100">
                <h3 className="text-xs font-black text-[#022C4F] uppercase tracking-wider">
                  Linked Non-Conformances & Defect Tickets
                </h3>
                {(!milestone.linked_issue_ids || milestone.linked_issue_ids.length === 0) ? (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-800">
                    <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                    <span>No outstanding non-conformances or defects linked to this milestone.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {milestone.linked_issue_ids.map((iss, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                        <div>
                          <h4 className="font-bold text-slate-800">{iss.title}</h4>
                          <p className="text-[10px] text-slate-400 font-mono">{iss.ref}</p>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          iss.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {iss.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: IMMUTABLE AUDIT TRAIL */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black text-[#022C4F] uppercase tracking-wider">
                  Append-Only Immutable Event Trail
                </h3>
                <span className="text-[10px] font-bold text-slate-400 font-mono">
                  SHA-256 Tamper Proof
                </span>
              </div>

              {auditEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-400 border border-slate-100 rounded-2xl">
                  <Clock size={30} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-xs font-bold text-slate-600">Initial creation audit logged.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {auditEvents.map((evt, i) => (
                    <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 font-mono">
                          {evt.action.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(evt.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-700 font-medium">
                        <span>Officer: <strong>{evt.user_name}</strong></span>
                        <span className="text-slate-400 text-[10px]">{evt.user_role}</span>
                      </div>
                      {evt.signature_hash && (
                        <div className="text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-200/60 truncate">
                          Sig: {evt.signature_hash}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onFlagDelay && milestone.status !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onFlagDelay(milestone);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <AlertTriangle size={14} /> Flag Delay
              </button>
            )}

            {onUpdateProgress && milestone.status !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onUpdateProgress(milestone);
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Activity size={14} /> Update Progress
              </button>
            )}
          </div>

          <div>
            {onVerify && milestone.status !== 'VERIFIED' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onVerify(milestone);
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck size={15} /> Audit & Sign Off
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Lightbox photo zoom modal */}
      {activePhotoPreview && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-md z-[150] flex items-center justify-center p-4"
          onClick={() => setActivePhotoPreview(null)}
        >
          <div className="relative max-w-3xl w-full max-h-[85vh] flex items-center justify-center">
            <button 
              onClick={() => setActivePhotoPreview(null)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center cursor-pointer"
            >
              <X size={18} />
            </button>
            <img 
              src={activePhotoPreview} 
              alt="Site Photo Full Preview" 
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}
    </>
  );
}
