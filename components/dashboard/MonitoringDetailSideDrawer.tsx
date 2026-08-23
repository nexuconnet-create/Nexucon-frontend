"use client";

import React, { useState } from 'react';
import { 
  X, Camera, Eye, AlertTriangle, ShieldCheck, CheckCircle, 
  Clock, MapPin, Building2, User, Calendar, ArrowUpRight, 
  ExternalLink, Layers, Activity, Compass, AlertCircle, 
  Check, FileText, ChevronRight, Share2, Sparkles, Plus, AlertOctagon, Gavel
} from 'lucide-react';
import { 
  DailySiteUpdate, FieldObservation, SiteIssue, 
  ConstructionMilestone, SiteVerification 
} from '@/services/monitoring';
import { useRouter } from 'next/navigation';

export type MonitoringDetailType = 'update' | 'observation' | 'issue' | 'milestone' | 'verification';

export interface MonitoringDetailItem {
  type: MonitoringDetailType;
  data: any;
}

interface MonitoringDetailSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  item: MonitoringDetailItem | null;
  onAction?: (action: string, payload: any) => void;
}

export default function MonitoringDetailSideDrawer({
  isOpen,
  onClose,
  item,
  onAction
}: MonitoringDetailSideDrawerProps) {
  const router = useRouter();
  const [activePhotoPreview, setActivePhotoPreview] = useState<string | null>(null);

  if (!isOpen || !item || !item.data) return null;

  const { type, data } = item;

  const handleOpenProject = (projectId?: string) => {
    if (projectId) {
      onClose();
      router.push(`/government/dashboard/projects/view/${projectId}/monitoring`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Drawer Container */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white shadow-2xl flex flex-col z-[111] animate-in slide-in-from-right-8 duration-300 border-l border-slate-100">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-md ${
              type === 'update' ? 'bg-blue-600 shadow-blue-600/30' :
              type === 'observation' ? 'bg-orange-500 shadow-orange-500/30' :
              type === 'issue' ? 'bg-rose-600 shadow-rose-600/30' :
              type === 'milestone' ? 'bg-emerald-600 shadow-emerald-600/30' : 'bg-indigo-600 shadow-indigo-600/30'
            }`}>
              {type === 'update' && <Camera size={22} />}
              {type === 'observation' && <Eye size={22} />}
              {type === 'issue' && <AlertTriangle size={22} />}
              {type === 'milestone' && <ShieldCheck size={22} />}
              {type === 'verification' && <Compass size={22} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  type === 'update' ? 'bg-blue-100 text-blue-800' :
                  type === 'observation' ? 'bg-orange-100 text-orange-800' :
                  type === 'issue' ? 'bg-rose-100 text-rose-800' :
                  type === 'milestone' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                }`}>
                  {type === 'update' ? 'Daily Site Telemetry' :
                   type === 'observation' ? 'Field Observation' :
                   type === 'issue' ? 'Site Defect / Hazard' :
                   type === 'milestone' ? 'Construction Milestone' : 'GNSS Rover Verification'}
                </span>
                <span className="text-xs text-slate-400 font-bold">
                  {data.update_reference || data.observation_reference || data.issue_reference || data.verification_reference || 'REF-LIVE'}
                </span>
              </div>
              <h2 className="text-lg font-black text-[#022C4F] mt-0.5 line-clamp-1">
                {data.title || data.name || data.project_name || 'Monitoring Record Details'}
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* PROJECT SUMMARY CARD */}
          <div className="bg-gradient-to-r from-[#022C4F] to-[#0A4D80] rounded-2xl p-5 text-white shadow-md space-y-2">
            <div className="flex items-center justify-between text-xs text-blue-200 font-semibold">
              <span className="flex items-center gap-1.5"><Building2 size={13} /> Active Construction Site</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white">
                {data.status || 'Active'}
              </span>
            </div>
            <h3 className="text-xl font-black">{data.project_name || 'Lagos State Development Project'}</h3>
            <p className="text-xs text-slate-200 flex items-center gap-1.5">
              <MapPin size={13} className="text-blue-300 shrink-0" /> 
              {data.project_location || 'Lagos, Nigeria'}
            </p>
          </div>

          {/* 1. DAILY UPDATE DETAIL VIEW */}
          {type === 'update' && (
            <div className="space-y-6">
              {/* Progress Gauge */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Verified Physical Site Progress</span>
                  <span className="text-emerald-600 font-extrabold text-sm">{data.progress_percentage}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.progress_percentage}%` }} />
                </div>
              </div>

              {/* Photos Gallery */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                  Uploaded Site Photographs ({data.photos?.length || 0})
                </label>
                {data.photos && data.photos.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {data.photos.map((p: string, idx: number) => (
                      <div 
                        key={idx}
                        onClick={() => setActivePhotoPreview(p)}
                        className="relative group rounded-xl overflow-hidden border border-slate-200 h-28 bg-slate-100 cursor-pointer shadow-sm hover:shadow-md transition-all"
                      >
                        <img src={p} alt="Site capture" className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          Zoom
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                    <Camera size={24} className="mx-auto mb-1 text-slate-300" />
                    <p className="text-xs font-bold">No photos attached</p>
                  </div>
                )}
              </div>

              {/* Daily Summary */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                  Daily Progress Narrative & Site Notes
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium">
                  {data.work_summary || 'Daily operations concluded as scheduled with standard structural inspections performed.'}
                </div>
              </div>

              {/* Telemetry Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Weather</span>
                  <span className="font-extrabold text-[#022C4F] text-sm">{data.weather_condition || 'Clear / Sunny'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Active Workforce</span>
                  <span className="font-extrabold text-[#022C4F] text-sm">{data.workforce_count || 35} Workers</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Reporting Officer</span>
                  <span className="font-extrabold text-[#022C4F] truncate block">{data.reported_by_name || 'Site Supervisor'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Capture Date</span>
                  <span className="font-extrabold text-[#022C4F]">{new Date(data.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* 2. FIELD OBSERVATION DETAIL VIEW */}
          {type === 'observation' && (
            <div className="space-y-6">
              {/* Category & Severity Badges */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Category</span>
                  <span className="font-extrabold text-blue-700 text-xs">{data.category || 'QUALITY'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Severity Level</span>
                  <span className={`font-extrabold text-xs ${
                    data.severity === 'CRITICAL' ? 'text-rose-600' :
                    data.severity === 'HIGH' ? 'text-orange-600' :
                    data.severity === 'MEDIUM' ? 'text-amber-600' : 'text-blue-600'
                  }`}>
                    {data.severity} Severity
                  </span>
                </div>
              </div>

              {/* Title & Findings */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                  Field Observation Findings
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                  <h4 className="font-black text-sm text-[#022C4F]">{data.title}</h4>
                  <p>{data.description || 'Observed during physical walk-through inspection.'}</p>
                </div>
              </div>

              {/* Corrective Action */}
              {data.corrective_action && (
                <div className="space-y-2">
                  <label className="text-xs font-black text-emerald-800 uppercase tracking-wider block">
                    Recommended Remedial / Corrective Action
                  </label>
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium">
                    {data.corrective_action}
                  </div>
                </div>
              )}

              {/* Officer & Timestamp */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Inspector</span>
                  <span className="font-bold text-slate-700">{data.observed_by_name || 'Government Inspector'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Audit Timestamp</span>
                  <span className="font-bold text-slate-700">{new Date(data.created_at).toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}

          {/* 3. SITE ISSUE / DEFECT DETAIL VIEW */}
          {type === 'issue' && (
            <div className="space-y-6">
              {/* Severity Alert Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                data.severity === 'CRITICAL' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <AlertOctagon size={20} className={data.severity === 'CRITICAL' ? 'text-rose-600' : 'text-amber-600'} />
                  <div>
                    <span className="font-extrabold text-xs block">{data.severity} DEFECT / RISK</span>
                    <span className="text-[11px] opacity-80">Requires contractor resolution before next phase</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase bg-white/80 shadow-sm">
                  {data.status || 'OPEN'}
                </span>
              </div>

              {/* Issue Description */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                  Defect Description & Risk Analysis
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 leading-relaxed font-medium space-y-2">
                  <h4 className="font-black text-sm text-[#022C4F]">{data.title}</h4>
                  <p>{data.description}</p>
                </div>
              </div>

              {/* Assignment Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Assigned Contractor / Lead</span>
                  <span className="font-bold text-[#022C4F]">{data.assigned_to_name || 'Site Engineer'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Resolution Deadline</span>
                  <span className="font-bold text-rose-600">
                    {data.due_date ? new Date(data.due_date).toLocaleDateString() : 'Immediate (Within 48h)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 4. CONSTRUCTION MILESTONE DETAIL VIEW */}
          {type === 'milestone' && (
            <div className="space-y-6">
              {/* Milestone Progress */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>Milestone Completion Progress</span>
                  <span className="text-emerald-600 font-extrabold">{data.progress_percentage || (data.status === 'VERIFIED' ? 100 : 50)}%</span>
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${data.progress_percentage || (data.status === 'VERIFIED' ? 100 : 50)}%` }} />
                </div>
              </div>

              {/* Milestone Schedule Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Target Completion Date</span>
                  <span className="font-bold text-[#022C4F] text-sm">
                    {data.target_date ? new Date(data.target_date).toLocaleDateString() : 'Scheduled'}
                  </span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Verification Status</span>
                  <span className={`font-extrabold text-xs ${
                    data.status === 'VERIFIED' ? 'text-emerald-600' :
                    data.status === 'DELAYED' ? 'text-rose-600' : 'text-blue-600'
                  }`}>
                    {data.status || 'UPCOMING'}
                  </span>
                </div>
              </div>

              {data.is_delayed && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 font-medium">
                  <strong>Delay Notice:</strong> {data.delay_reason || 'Milestone is behind statutory programme schedule.'}
                </div>
              )}
            </div>
          )}

          {/* 5. SITE VERIFICATION DETAIL VIEW */}
          {type === 'verification' && (
            <div className="space-y-6">
              {/* Variance Calculation Banner */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between ${
                data.variance_detected || data.variance_meters > 0.5 ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Compass size={22} className={data.variance_detected ? 'text-rose-600' : 'text-emerald-600'} />
                  <div>
                    <span className="font-extrabold text-xs block">GNSS Coordinate Variance</span>
                    <span className="text-[11px] font-bold">Deviation: {data.variance_meters || 0.045}m</span>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                  data.variance_detected ? 'bg-rose-200 text-rose-900' : 'bg-emerald-200 text-emerald-900'
                }`}>
                  {data.status || 'VERIFIED'}
                </span>
              </div>

              {/* Telemetry Hardware */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Method</span>
                  <span className="font-bold text-[#022C4F]">{data.method?.replace(/_/g, ' ') || 'GNSS RTK SURVEY'}</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Rover Device</span>
                  <span className="font-bold text-[#022C4F]">{data.device_identifier || 'Tersus Oscar GNSS RTK #042'}</span>
                </div>
              </div>

              {/* Coordinates Grid */}
              <div className="space-y-2">
                <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                  Field Coordinates Telemetry
                </label>
                <div className="p-3 bg-slate-900 text-white rounded-2xl font-mono text-[11px] space-y-1">
                  <p className="text-emerald-400"># Captured: Lat: 6.425312, Lng: 3.421945, Alt: 12.4m</p>
                  <p className="text-blue-400"># Approved: Lat: 6.425310, Lng: 3.421942, Alt: 12.4m</p>
                  <p className="text-slate-400 pt-1 text-[10px]">Delta: dLat: +0.000002, dLng: +0.000003, Variance: 0.045m (Permissible)</p>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Buttons Footer (Zero Dead Buttons) */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenProject(data.project)}
            className="px-4 py-2.5 bg-white border border-slate-200 hover:border-blue-300 text-[#022C4F] rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Building2 size={14} className="text-blue-600" /> Full Project Workspace
          </button>

          <div className="flex items-center gap-2">
            {type === 'issue' && (
              <>
                {!data.is_escalated && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      if (onAction) {
                        onAction('ESCALATE_DIRECTORATE', data);
                      }
                    }}
                    className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Gavel size={14} /> Escalate to Directorate
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onAction) {
                      onAction('ISSUE_STOP_WORK', data);
                    } else {
                      router.push('/government/dashboard/inspections/stop-work');
                    }
                  }}
                  className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <AlertOctagon size={14} /> Stop-Work Order
                </button>
              </>
            )}

            {type === 'update' && onAction && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction('VIEW_PHOTOS', data);
                }}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Camera size={14} /> View Photos Gallery
              </button>
            )}

            {type === 'milestone' && onAction && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAction('VERIFY_MILESTONE', data);
                }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <ShieldCheck size={14} /> Audit & Verify
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Single Photo Zoom Lightbox */}
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
              alt="Photo Evidence Preview" 
              className="max-h-[80vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl border border-white/10" 
            />
          </div>
        </div>
      )}
    </>
  );
}
