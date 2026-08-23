"use client";

import React, { useState } from 'react';
import { 
  X, Box, Flag, ShieldCheck, CheckCircle2, AlertTriangle, 
  Layers, MapPin, Activity, FileText, Lock, Calendar, RefreshCw, ExternalLink
} from 'lucide-react';
import { 
  BIMConstructionMilestone, 
  requestMilestoneReVerification 
} from '@/services/bim';

interface BIMMilestoneDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: BIMConstructionMilestone | null;
  onVerifyClick?: () => void;
  onFlagDeviationClick?: () => void;
  onRefresh?: () => void;
}

export default function BIMMilestoneDetailDrawer({
  isOpen,
  onClose,
  milestone,
  onVerifyClick,
  onFlagDeviationClick,
  onRefresh
}: BIMMilestoneDetailDrawerProps) {
  const [isReVerifying, setIsReVerifying] = useState(false);

  if (!isOpen || !milestone) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'VERIFIED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5"><CheckCircle2 size={13} /> Verified & Stamped</span>;
      case 'DEVIATION_FLAGGED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5"><AlertTriangle size={13} /> Deviation Flagged</span>;
      case 'RE_VERIFICATION_REQUIRED':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5"><RefreshCw size={13} /> Re-Verification Required</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5"><Activity size={13} /> Pending Review</span>;
    }
  };

  const handleRequestReVerification = async () => {
    setIsReVerifying(true);
    try {
      await requestMilestoneReVerification(milestone.id, { reason: 'Re-verification initiated from detail drawer.' });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Milestone re-verification workflow initialized.', type: 'info' } 
      }));
      if (onRefresh) onRefresh();
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to request re-verification';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsReVerifying(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white p-6 sm:p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-black text-blue-600 tracking-wider uppercase">{milestone.milestone_code}</span>
              {getStatusBadge(milestone.verification_status)}
            </div>
            <h2 className="text-xl font-black text-[#022C4F]">{milestone.name}</h2>
            <p className="text-xs text-slate-500 mt-1">{milestone.project_name || 'Project'} • {milestone.phase.replace('_', ' ')}</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Approved BIM Model Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                <Box size={15} className="text-blue-600" /> Associated Approved BIM Model
              </h4>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                {milestone.bim_model_discipline || 'Discipline'}
              </span>
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200/80">
              <p className="text-sm font-bold text-slate-800">{milestone.bim_model_name}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1.5">
                <span>Release: <strong>{milestone.model_version_label || 'Current'}</strong></span>
                {milestone.model_version_hash && (
                  <span>Commit: <code className="text-blue-600">{milestone.model_version_hash.slice(0, 8)}</code></span>
                )}
                <span>Certification: <strong className={milestone.bim_model_certified ? 'text-emerald-600' : 'text-amber-600'}>
                  {milestone.bim_model_certified ? 'Digitally Certified' : 'Pending Certification'}
                </strong></span>
              </div>
            </div>
          </div>

          {/* Spatial Tolerances & Measured Deviations */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5">
              <Activity size={14} className="text-indigo-600" /> Spatial Tolerances & Survey Metrics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Max Allowed</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{milestone.tolerance_max_mm} mm</p>
              </div>
              <div className={`p-3 border rounded-xl ${
                milestone.bim_deviation_mm > milestone.tolerance_max_mm
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <p className="text-[10px] font-bold uppercase opacity-80">LiDAR Deviation</p>
                <p className="text-sm font-black mt-0.5">{milestone.bim_deviation_mm} mm</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <p className="text-[10px] font-bold text-slate-400 uppercase">GNSS RTK Variance</p>
                <p className="text-sm font-black text-slate-800 mt-0.5">{milestone.gnss_survey_variance_mm} mm</p>
              </div>
            </div>
          </div>

          {/* Associated BIM Elements */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-blue-600" /> BIM Elements & LOD Specification
            </h4>
            {milestone.bim_elements && milestone.bim_elements.length > 0 ? (
              <div className="space-y-2">
                {milestone.bim_elements.map((elem, idx) => (
                  <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{elem.name || elem.id}</p>
                      <p className="text-[11px] text-slate-500">Discipline: {elem.discipline || 'Structural'} • Count: {elem.count || 1}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-100">
                      {elem.lod || 'LOD 400'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No specific element GUIDs mapped.</p>
            )}
          </div>

          {/* GPR & Subsurface Clearance */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-600" /> GPR & Subsurface Clearance
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                milestone.gpr_clearance_status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-700' :
                milestone.gpr_clearance_status === 'ANOMALY_DETECTED' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-600'
              }`}>
                {milestone.gpr_clearance_status}
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {milestone.gpr_evidence_notes || 'Subsurface utilities and slab rebar clearance recorded prior to penetration work.'}
            </p>
          </div>

          {/* Linked Field Inspections & GNSS Surveys */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-600" /> Linked Statutory Inspections & Surveys
            </h4>
            <div className="space-y-2">
              {milestone.linked_inspections?.map((ins, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{ins.ref || ins.id} - {ins.type || 'Field Inspection'}</p>
                    <p className="text-[11px] text-slate-500">Date: {ins.date || 'Recent'}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                    {ins.outcome || 'PASSED'}
                  </span>
                </div>
              ))}
              {milestone.linked_site_verifications?.map((sv, idx) => (
                <div key={idx} className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-slate-800">{sv.code} - {sv.type}</p>
                    <p className="text-[11px] text-slate-500">Spatial Variance: {sv.variance_mm}mm</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">
                    {sv.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Evidence Vault */}
          {milestone.evidence_vault && milestone.evidence_vault.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-1.5">
                <FileText size={14} className="text-blue-600" /> Evidence Vault & Point Clouds
              </h4>
              <div className="space-y-2">
                {milestone.evidence_vault.map((ev, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{ev.name}</p>
                      <p className="text-[11px] text-slate-500">{ev.file_type} • {ev.category}</p>
                    </div>
                    <a 
                      href={ev.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-1"
                    >
                      <span>View</span> <ExternalLink size={12} />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Official Digital Certification Seal */}
          {milestone.digital_stamp_reference && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Lock size={16} className="text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Cryptographic Seal Applied</span>
                </div>
                <ShieldCheck size={18} className="text-emerald-400" />
              </div>
              <p className="text-xs font-mono bg-slate-800/80 px-3 py-2 rounded-xl text-emerald-300 break-all">
                {milestone.digital_stamp_reference}
              </p>
              <div className="text-[11px] text-slate-400 flex flex-wrap justify-between pt-1">
                <span>Verified By: <strong>{milestone.verified_by_name || 'Review Directorate'}</strong></span>
                <span>Date: <strong>{milestone.actual_verified_date || 'Verified'}</strong></span>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button 
              onClick={handleRequestReVerification}
              disabled={isReVerifying}
              className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isReVerifying ? 'animate-spin' : ''} />
              <span>Request Re-Verification</span>
            </button>
          </div>
          <div className="flex items-center gap-2">
            {onFlagDeviationClick && (
              <button 
                onClick={onFlagDeviationClick}
                className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition-colors border border-amber-200"
              >
                Flag Deviation
              </button>
            )}
            {onVerifyClick && milestone.verification_status !== 'COMPLETED' && (
              <button 
                onClick={onVerifyClick}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <ShieldCheck size={14} />
                <span>Assess Gate & Verify</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </>
  );
}
