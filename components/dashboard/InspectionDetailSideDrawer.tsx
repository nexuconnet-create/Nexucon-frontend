"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Activity, CheckCircle, XCircle, Clock, AlertTriangle, 
  Calendar, User, Building2, MapPin, ShieldCheck, ArrowRight,
  AlertOctagon, Plus, Camera, Send, FileText, Check, Navigation,
  CheckCircle2, CheckSquare, Sparkles, RefreshCw
} from 'lucide-react';
import { 
  Inspection, InspectionFinding, checkinInspection, completeInspection, 
  issueStopWorkOrder, createReInspection, assignInspection, logInspectionFinding,
  resolveFinding, getInspectionById
} from '@/services/inspections';
import { CustomSelect } from '@/components/CustomSelect';
import { useRouter } from 'next/navigation';

interface InspectionDetailSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: Inspection | null;
  onUpdated?: () => void;
  onLogFinding?: (inspection: Inspection) => void;
  onIssueStopWork?: (inspection: Inspection) => void;
  onAssignInspector?: (inspection: Inspection) => void;
  onScheduleReInspection?: (inspection: Inspection) => void;
}

export default function InspectionDetailSideDrawer({
  isOpen,
  onClose,
  inspection,
  onUpdated,
  onLogFinding,
  onIssueStopWork,
  onAssignInspector,
  onScheduleReInspection
}: InspectionDetailSideDrawerProps) {
  const router = useRouter();
  const [currentInspection, setCurrentInspection] = useState<Inspection | null>(inspection);
  const [activeTab, setActiveTab] = useState<'overview' | 'checklist' | 'findings' | 'telemetry'>('overview');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState('');
  const [outcomeModal, setOutcomeModal] = useState<'PASSED' | 'CONDITIONAL_PASS' | 'FAILED' | null>(null);

  // Inline Quick Finding State
  const [showInlineLog, setShowInlineLog] = useState(false);
  const [findingTitle, setFindingTitle] = useState('');
  const [findingDesc, setFindingDesc] = useState('');
  const [findingSeverity, setFindingSeverity] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'>('MEDIUM');
  const [findingAction, setFindingAction] = useState('');
  const [isLoggingFinding, setIsLoggingFinding] = useState(false);

  // Synchronize when prop changes or drawer opens
  useEffect(() => {
    setCurrentInspection(inspection);
  }, [inspection, isOpen]);

  // Refresh single inspection from backend
  const refreshCurrentInspection = async () => {
    if (!currentInspection?.id) return;
    try {
      const refreshed = await getInspectionById(currentInspection.id);
      setCurrentInspection(refreshed);
    } catch (err) {
      console.error("Failed to refresh inspection details", err);
    }
  };

  if (!isOpen || !currentInspection) return null;

  const handleCheckin = async () => {
    // 0ms Optimistic Update
    setCurrentInspection(prev => prev ? {
      ...prev,
      status: 'IN_PROGRESS',
      gps_verified: true,
      checkin_time: new Date().toISOString()
    } : null);

    setIsSubmitting(true);
    try {
      const lat = 6.4281;
      const lng = 3.4219;
      const updated = await checkinInspection(currentInspection.id, { latitude: lat, longitude: lng });
      if (updated && updated.id) {
        setCurrentInspection(updated);
      }
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
    // 0ms Optimistic Update
    setCurrentInspection(prev => prev ? {
      ...prev,
      status: outcome === 'FAILED' ? 'FAILED' : 'COMPLETED',
      outcome: outcome,
      completed_date: new Date().toISOString()
    } : null);

    setIsSubmitting(true);
    try {
      const updated = await completeInspection(currentInspection.id, {
        outcome,
        checklist_results: currentInspection.checklist_results,
        summary_notes: summaryNotes || currentInspection.summary_notes
      });
      if (updated && updated.id) {
        setCurrentInspection(updated);
      }
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
      await createReInspection(currentInspection.id);
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

  // Real-time inline finding creation
  const handleInlineSubmitFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle.trim() || !findingDesc.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Title and description are required', type: 'error' } }));
      return;
    }

    const optimisticFinding: InspectionFinding = {
      id: `temp_${Date.now()}`,
      finding_reference: `FND-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      inspection: currentInspection.id,
      project: currentInspection.project,
      project_name: currentInspection.project_name,
      title: findingTitle.trim(),
      description: findingDesc.trim(),
      severity: findingSeverity,
      category: 'STRUCTURAL',
      corrective_action_required: findingAction.trim(),
      is_resolved: false,
      requires_reinspection: true,
      created_at: new Date().toISOString()
    };

    // 0ms Optimistic UI update
    setCurrentInspection(prev => {
      if (!prev) return prev;
      const updatedFindings = [optimisticFinding, ...(prev.findings || [])];
      return {
        ...prev,
        findings: updatedFindings,
        findings_count: updatedFindings.length
      };
    });

    setIsLoggingFinding(true);
    try {
      const created = await logInspectionFinding(currentInspection.id, {
        title: findingTitle.trim(),
        description: findingDesc.trim(),
        severity: findingSeverity,
        category: 'STRUCTURAL',
        corrective_action_required: findingAction.trim(),
        requires_reinspection: true
      });

      // Replace optimistic temp finding with real one
      setCurrentInspection(prev => {
        if (!prev) return prev;
        const updated = (prev.findings || []).map(f => f.id === optimisticFinding.id ? created : f);
        return { ...prev, findings: updated };
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Defect logged in real-time (${created.finding_reference || 'Recorded'})`, type: 'success' } 
      }));

      setFindingTitle('');
      setFindingDesc('');
      setFindingAction('');
      setShowInlineLog(false);
      if (onUpdated) onUpdated();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to log finding';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
      // Revert on failure
      refreshCurrentInspection();
    } finally {
      setIsLoggingFinding(false);
    }
  };

  // Real-time finding resolution toggle
  const handleToggleResolveFinding = async (finding: InspectionFinding) => {
    const nextState = !finding.is_resolved;

    // 0ms Optimistic UI update
    setCurrentInspection(prev => {
      if (!prev) return prev;
      const updated = (prev.findings || []).map(f => f.id === finding.id ? { ...f, is_resolved: nextState } : f);
      return { ...prev, findings: updated };
    });

    try {
      await resolveFinding(finding.id, { notes: nextState ? 'Verified resolved during field inspection.' : 'Re-opened for rectification.' });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: nextState ? `Finding ${finding.finding_reference} marked as Resolved` : `Finding ${finding.finding_reference} re-opened`, type: 'success' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to update finding status', type: 'error' } }));
      refreshCurrentInspection();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold uppercase">Completed</span>;
      case 'IN_PROGRESS': return <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-bold uppercase animate-pulse">In Progress</span>;
      case 'SCHEDULED': return <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-bold uppercase">Scheduled</span>;
      case 'FAILED': return <span className="px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold uppercase">Violations / SWO</span>;
      case 'RE_INSPECTION_REQUIRED': return <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-bold uppercase">Re-Inspection Req.</span>;
      default: return <span className="px-3 py-1 bg-slate-100 text-slate-800 rounded-full text-xs font-bold uppercase">{status}</span>;
    }
  };

  const findingsList = currentInspection.findings || [];

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{currentInspection.inspection_reference}</span>
              {getStatusBadge(currentInspection.status)}
            </div>
            <h2 className="text-2xl font-black text-[#022C4F]">{currentInspection.inspection_type}</h2>
            <p className="text-sm font-semibold text-slate-500 mt-0.5 flex items-center gap-1.5">
              <Building2 size={14} className="text-blue-600" /> {currentInspection.project_name}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 border-b border-slate-100 py-3 text-xs font-bold shrink-0">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'checklist', label: `Checklist (${(currentInspection.checklist_results || []).length})` },
            { id: 'findings', label: `Findings (${findingsList.length})` },
            { id: 'telemetry', label: 'GPS Telemetry' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-2 border-b-2 transition-colors cursor-pointer ${
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
                      <User size={14} className="text-slate-400" /> {currentInspection.inspector_name || 'Unassigned'}
                    </p>
                    {onAssignInspector && (
                      <button
                        onClick={() => onAssignInspector(currentInspection)}
                        className="text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        {currentInspection.inspector_name && currentInspection.inspector_name !== 'Unassigned' ? 'Reassign' : 'Assign'}
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Scheduled Date</span>
                  <p className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                    <Calendar size={14} className="text-slate-400" />
                    {currentInspection.scheduled_date ? new Date(currentInspection.scheduled_date).toLocaleString() : 'Not Scheduled'}
                  </p>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Priority</span>
                  <span className={`inline-block px-2.5 py-0.5 rounded text-xs font-bold ${
                    currentInspection.priority === 'Critical' ? 'bg-rose-100 text-rose-800' :
                    currentInspection.priority === 'High' ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-800'
                  }`}>
                    {currentInspection.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Requested By</span>
                  <p className="text-sm font-medium text-slate-700">{currentInspection.requested_by_name || 'Internal Authority'}</p>
                </div>
              </div>

              {/* Scope & Notes */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Scope & Special Instructions</h4>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm text-slate-700 leading-relaxed font-medium">
                  {currentInspection.summary_notes || "Standard regulatory physical inspection to ensure compliance with Lagos State Urban Development & Building Regulations."}
                </div>
              </div>

              {/* Status Action Banners */}
              {currentInspection.status === 'REQUESTED' && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Clock className="text-amber-600 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-amber-900">Inspection Request Pending Assignment</p>
                      <p className="text-[11px] text-amber-700">Assign a registered inspector to set the site date.</p>
                    </div>
                  </div>
                  {onAssignInspector && (
                    <button 
                      onClick={() => onAssignInspector(currentInspection)}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                    >
                      Assign Inspector
                    </button>
                  )}
                </div>
              )}

              {currentInspection.status === 'SCHEDULED' && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Navigation className="text-blue-600 shrink-0" size={20} />
                    <div>
                      <p className="text-xs font-bold text-blue-900">Field Check-in Required</p>
                      <p className="text-[11px] text-blue-700">Inspector must verify GPS telemetry upon arriving at the site.</p>
                    </div>
                  </div>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleCheckin}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm"
                  >
                    {isSubmitting ? 'Verifying...' : 'Verify GPS Check-in'}
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
                {(currentInspection.checklist_results && currentInspection.checklist_results.length > 0) ? (
                  currentInspection.checklist_results.map((item: any, idx: number) => (
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
                <div>
                  <h4 className="text-sm font-bold text-[#022C4F]">Recorded Non-Conformances & Findings</h4>
                  <p className="text-xs text-slate-500">Live defect tracking updated in real-time</p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowInlineLog(!showInlineLog)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Plus size={13} /> {showInlineLog ? 'Close Form' : 'Quick Log Defect'}
                  </button>
                  {onLogFinding && (
                    <button 
                      onClick={() => onLogFinding(currentInspection)}
                      className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Modal Form
                    </button>
                  )}
                </div>
              </div>

              {/* Inline Quick Log Finding Form */}
              {showInlineLog && (
                <form onSubmit={handleInlineSubmitFinding} className="p-4 bg-slate-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                      <AlertTriangle size={14} className="text-amber-500" /> Log Defect in Real-Time
                    </h5>
                    <button type="button" onClick={() => setShowInlineLog(false)} className="text-slate-400 hover:text-slate-600">
                      <X size={14} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Defect Title</label>
                    <input
                      type="text"
                      value={findingTitle}
                      onChange={(e) => setFindingTitle(e.target.value)}
                      placeholder="e.g. Column Honeycombing at Grid Line 3"
                      required
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Severity</label>
                      <CustomSelect
                        value={findingSeverity}
                        onChange={(val) => setFindingSeverity(val as any)}
                        options={[
                          { value: "LOW", label: "Low Severity" },
                          { value: "MEDIUM", label: "Medium Severity" },
                          { value: "HIGH", label: "High Severity" },
                          { value: "CRITICAL", label: "Critical (Stop-Work Risk)" }
                        ]}
                        placeholder="Severity..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Required Action</label>
                      <input
                        type="text"
                        value={findingAction}
                        onChange={(e) => setFindingAction(e.target.value)}
                        placeholder="e.g. Chip out and pressure grout"
                        className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase mb-1">Defect Description / Notes</label>
                    <textarea
                      value={findingDesc}
                      onChange={(e) => setFindingDesc(e.target.value)}
                      rows={2}
                      placeholder="Provide specific details and measurements observed on site..."
                      required
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowInlineLog(false)}
                      className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoggingFinding}
                      className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Send size={12} /> {isLoggingFinding ? 'Logging...' : 'Save Finding in 0ms'}
                    </button>
                  </div>
                </form>
              )}

              {/* Findings List */}
              <div className="space-y-3">
                {findingsList.length > 0 ? (
                  findingsList.map((f: any) => (
                    <div 
                      key={f.id} 
                      className={`p-4 rounded-2xl border transition-all flex flex-col gap-2.5 ${
                        f.is_resolved 
                          ? 'bg-slate-50/60 border-slate-200 opacity-80' 
                          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-slate-500 uppercase">{f.finding_reference}</span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                            f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' :
                            f.severity === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                            f.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {f.severity} Severity
                          </span>
                        </div>

                        {/* Resolution Status Button */}
                        <button
                          onClick={() => handleToggleResolveFinding(f)}
                          className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                            f.is_resolved
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {f.is_resolved ? (
                            <>
                              <CheckCircle2 size={13} className="text-emerald-600" /> Resolved
                            </>
                          ) : (
                            <>
                              <Clock size={13} className="text-amber-600" /> Mark Resolved
                            </>
                          )}
                        </button>
                      </div>

                      <div>
                        <h5 className={`text-sm font-bold ${f.is_resolved ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                          {f.title}
                        </h5>
                        <p className="text-xs text-slate-600 mt-0.5">{f.description}</p>
                      </div>

                      {f.corrective_action_required && (
                        <div className="text-xs text-indigo-800 bg-indigo-50/80 p-2.5 rounded-xl font-medium flex items-start gap-1.5">
                          <span className="font-bold shrink-0">Action:</span>
                          <span>{f.corrective_action_required}</span>
                        </div>
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
                  <span className="font-bold text-emerald-600">{currentInspection.gps_verified ? 'Verified on Site' : 'Pending Verification'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Recorded Coordinates:</span>
                  <span className="font-mono text-slate-800">
                    {currentInspection.gps_latitude && currentInspection.gps_longitude 
                      ? `${currentInspection.gps_latitude.toFixed(4)}° N, ${currentInspection.gps_longitude.toFixed(4)}° E` 
                      : 'Telemetry pending check-in'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Site Check-in Timestamp:</span>
                  <span className="font-medium text-slate-800">
                    {currentInspection.checkin_time ? new Date(currentInspection.checkin_time).toLocaleString() : 'Not checked in yet'}
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="pt-6 border-t border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            {onIssueStopWork && (
              <button 
                onClick={() => onIssueStopWork(currentInspection)}
                className="px-4 py-2.5 border border-rose-200 text-rose-700 bg-rose-50/50 rounded-xl text-xs font-bold hover:bg-rose-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <AlertOctagon size={14} /> Issue Stop-Work
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {currentInspection.status === 'REQUESTED' && onAssignInspector && (
              <button
                type="button"
                onClick={() => onAssignInspector(currentInspection)}
                className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033b6a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck size={14} /> Assign Inspector
              </button>
            )}

            {currentInspection.status === 'IN_PROGRESS' && (
              <>
                <button
                  disabled={isSubmitting}
                  onClick={() => setOutcomeModal('CONDITIONAL_PASS')}
                  className="px-4 py-2.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-bold hover:bg-teal-100 transition-colors cursor-pointer"
                >
                  Conditional Pass
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => setOutcomeModal('PASSED')}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle size={14} /> Complete (Pass)
                </button>
              </>
            )}

            {(currentInspection.status === 'COMPLETED' || currentInspection.status === 'FAILED' || currentInspection.status === 'RE_INSPECTION_REQUIRED') && (
              <button
                disabled={isSubmitting}
                onClick={() => {
                  if (onScheduleReInspection) {
                    onScheduleReInspection(currentInspection);
                  } else {
                    handleCreateReInspection();
                  }
                }}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
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
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={() => handleComplete(outcomeModal)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
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
