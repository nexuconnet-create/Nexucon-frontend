"use client";

import React, { useState } from 'react';
import { 
  X, Activity, CheckCircle, XCircle, Clock, AlertTriangle, 
  Calendar, User, Building2, MapPin, ShieldCheck, ArrowRight,
  AlertOctagon, Plus, Camera, Send, FileText, Check, Navigation
} from 'lucide-react';
import { 
  Inspection, checkinInspection, completeInspection, 
  issueStopWorkOrder, createReInspection, assignInspection 
} from '@/services/inspections';
import { useRouter } from 'next/navigation';

interface InspectionDetailSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  onUpdated?: () => void;
  onLogFinding?: (inspection: Inspection) => void;
  onIssueStopWork?: (inspection: Inspection) => void;
  onAssignInspector?: (inspection: Inspection) => void;
}

export default function InspectionDetailSideDrawer({
  isOpen,
  onClose,
  inspection,
  onUpdated,
  onLogFinding,
  onIssueStopWork,
  onAssignInspector
}: InspectionDetailSideDrawerProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'findings' | 'telemetry'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [outcomeModal, setOutcomeModal] = useState<'PASSED' | 'CONDITIONAL_PASS' | 'FAILED' | null>(null);

  if (!isOpen || !inspection) return null;

  const handleCheckin = async () => {
    setIsSubmitting(true);
    try {
      // Simulate getting geolocation
      const lat = 6.4281;
      const lng = 3.4219;
      await checkinInspection(inspection.id, { latitude: lat, longitude: lng });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'GPS Check-in Verified. Inspection is now In Progress.', type: 'success' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Check-in failed';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async (outcome: 'PASSED' | 'CONDITIONAL_PASS' | 'FAILED') => {
    setIsSubmitting(true);
    try {
      await completeInspection(inspection.id, {
        outcome,
        checklist_results: inspection.checklist_results,
        summary_notes: summaryNotes || inspection.summary_notes
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Inspection completed with outcome: ${outcome}`, type: 'success' } 
      }));
      setOutcomeModal(null);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Completion failed';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateReInspection = async () => {
    setIsSubmitting(true);
    try {
      await createReInspection(inspection.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Follow-up Re-Inspection scheduled successfully', type: 'success' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to schedule re-inspection';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">Completed</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase animate-pulse">In Progress</span>;
      case 'SCHEDULED': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase">Scheduled</span>;
      case 'REQUESTED': return <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase">Requested</span>;
      case 'FAILED': return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase">Stop-Work Issued</span>;
      case 'RE_INSPECTION_REQUIRED': return <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold uppercase">Re-Inspection Req.</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[720px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300 overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{inspection.inspection_reference}</span>
              {getStatusBadge(inspection.status)}
            </div>
            <h2 className="text-2xl font-black text-[#022C4F]">{inspection.inspection_type}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" /> {inspection.project_name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-100 py-3 text-xs font-bold">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'checklist', label: `Checklist (${(inspection.checklist_results || []).length})` },
            { id: 'findings', label: `Findings (${(inspection.findings || []).length})` },
            { id: 'telemetry', label: 'GPS Telemetry' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 border-b-2 transition-colors ${
                activeTab === tab.id 
                  ? 'border-blue-600 text-blue-600' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Primary Details Grid */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Assigned Inspector</span>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                      <User size={14} className="text-slate-400" /> {inspection.inspector_name || 'Unassigned'}
                    </p>
                    {onAssignInspector && (
                      <button
                        onClick={() => onAssignInspector(inspection)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {inspection.inspector_name && inspection.inspector_name !== 'Unassigned' ? 'Reassign' : 'Assign'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Scheduled Date</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {inspection.scheduled_date ? new Date(inspection.scheduled_date).toLocaleString() : 'Not Scheduled'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                    inspection.priority === 'High' || inspection.priority === 'Critical'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}>
                    {inspection.priority} Priority
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Inspection Outcome</span>
                  <span className={`text-xs font-black uppercase ${
                    inspection.outcome === 'PASSED' ? 'text-emerald-600' :
                    inspection.outcome === 'FAILED' ? 'text-rose-600' :
                    inspection.outcome === 'CONDITIONAL_PASS' ? 'text-teal-600' : 'text-slate-500'
                  }`}>
                    {inspection.outcome}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-2xl">
                <h4 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Summary & Scope of Inspection</h4>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {inspection.summary_notes || 'Verify foundation excavation depth, steel reinforcement spacing, and adherence to approved structural drawings.'}
                </p>
              </div>

              {/* Action Banner for Check-in */}
              {inspection.status === 'SCHEDULED' && (
                <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-indigo-900 uppercase tracking-wider">Field Verification Ready</h4>
                    <p className="text-xs text-indigo-700 mt-0.5">Inspector has arrived on site. Execute GPS verification to start.</p>
                  </div>
                  <button
                    disabled={isSubmitting}
                    onClick={handleCheckin}
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                  >
                    <Navigation size={14} /> GPS Check-in
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#022C4F]">Standard Verification Checklist</h4>
                <span className="text-xs text-slate-400 font-semibold">Field Audit Rubric</span>
              </div>
              
              <div className="space-y-3">
                {(inspection.checklist_results && inspection.checklist_results.length > 0) ? (
                  inspection.checklist_results.map((item: any, idx: number) => (
                    <div key={idx} className="p-4 bg-white border border-slate-200 rounded-2xl flex items-center justify-between hover:shadow-sm transition-all">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{item.item || item.name}</p>
                        {item.notes && <p className="text-xs text-slate-500 mt-1">{item.notes}</p>}
                      </div>
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
                        item.status === 'PASSED' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'FAILED' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.status || 'PENDING'}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    No checklist attached to this inspection.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'findings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#022C4F]">Recorded Non-Conformances & Findings</h4>
                {onLogFinding && (
                  <button 
                    onClick={() => onLogFinding(inspection)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Plus size={14} /> Log Finding
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {(inspection.findings && inspection.findings.length > 0) ? (
                  inspection.findings.map((f: any) => (
                    <div key={f.id} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase">{f.finding_reference}</span>
                        <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                          f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                          f.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                          f.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {f.severity} Severity
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-slate-800">{f.title}</h5>
                      <p className="text-xs text-slate-600">{f.description}</p>
                      {f.corrective_action_required && (
                        <p className="text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-xl font-medium">
                          <span className="font-bold">Action:</span> {f.corrective_action_required}
                        </p>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                    No defects or non-conformances logged for this inspection.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'telemetry' && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-[#022C4F]">GNSS / GPS Field Telemetry</h4>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">GPS Verified Status:</span>
                  <span className="font-bold text-emerald-600">{inspection.gps_verified ? 'Verified on Site' : 'Pending Verification'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Check-in Timestamp:</span>
                  <span className="font-bold text-slate-800">{inspection.checkin_time ? new Date(inspection.checkin_time).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Site Coordinates:</span>
                  <span className="font-bold text-slate-800">
                    {inspection.gps_latitude ? `${inspection.gps_latitude.toFixed(4)}° N, ${inspection.gps_longitude?.toFixed(4)}° E` : 'Pending Check-in'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Bottom Action Footer */}
        <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            {onLogFinding && (
              <button 
                onClick={() => onLogFinding(inspection)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Log Finding
              </button>
            )}
            {onIssueStopWork && (
              <button 
                onClick={() => onIssueStopWork(inspection)}
                className="px-4 py-2.5 border border-rose-200 text-rose-700 bg-rose-50/50 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1"
              >
                <AlertOctagon size={14} /> Issue Stop-Work
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {inspection.status === 'REQUESTED' && onAssignInspector && (
              <button
                type="button"
                onClick={() => onAssignInspector(inspection)}
                className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033b6a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> Assign Inspector
              </button>
            )}

            {inspection.status === 'IN_PROGRESS' && (
              <>
                <button
                  disabled={isSubmitting}
                  onClick={() => setOutcomeModal('CONDITIONAL_PASS')}
                  className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors"
                >
                  Conditional Pass
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setOutcomeModal('PASSED')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle size={14} /> Complete (Pass)
                </button>
              </>
            )}

            {(inspection.status === 'COMPLETED' || inspection.status === 'FAILED' || inspection.status === 'RE_INSPECTION_REQUIRED') && (
              <button
                disabled={isSubmitting}
                onClick={handleCreateReInspection}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
              >
                <Calendar size={14} /> Schedule Re-Inspection
              </button>
            )}
          </div>
        </div>

        {/* Modal for Outcome Remarks */}
        {outcomeModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-bold text-[#022C4F] mb-2">Finalize Inspection Outcome</h3>
              <p className="text-xs text-slate-500 mb-4">
                Marking inspection as <span className="font-bold text-slate-800">{outcomeModal}</span>. Enter any closing remarks for the record.
              </p>

              <div className="mb-5">
                <label className="text-xs font-bold text-slate-700 block mb-1">Inspector Closing Notes</label>
                <textarea
                  value={summaryNotes}
                  onChange={(e) => setSummaryNotes(e.target.value)}
                  placeholder="e.g. All reinforcement bars verified against structural specifications..."
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setOutcomeModal(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleComplete(outcomeModal)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
                >
                  {isSubmitting ? 'Finalizing...' : 'Confirm & Sign Off'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}
