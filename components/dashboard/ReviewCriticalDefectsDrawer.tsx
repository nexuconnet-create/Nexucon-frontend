"use client";

import React, { useState, useMemo } from 'react';
import { 
  X, AlertOctagon, AlertTriangle, ShieldAlert, CheckCircle, 
  Clock, Building2, User, Search, Filter, ExternalLink, 
  FileText, ArrowUpRight, Check, Send, Sparkles, ChevronRight,
  Gavel, Layers, MapPin, Eye, Camera
} from 'lucide-react';
import { SiteIssue, resolveSiteIssue } from '@/services/monitoring';
import { useRouter } from 'next/navigation';

interface ReviewCriticalDefectsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  issues: SiteIssue[];
  onEscalateIssue: (issue: SiteIssue) => void;
  onStopWorkOrder: (issue: SiteIssue) => void;
  onRefresh: () => void;
}

export default function ReviewCriticalDefectsDrawer({
  isOpen,
  onClose,
  issues,
  onEscalateIssue,
  onStopWorkOrder,
  onRefresh
}: ReviewCriticalDefectsDrawerProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CRITICAL' | 'ESCALATED' | 'OPEN' | 'RESOLVED'>('ALL');
  const [resolvingIssueId, setResolvingIssueId] = useState<string | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Filter defects (focusing primarily on Critical & High severity items)
  const criticalDefects = useMemo(() => {
    return issues.filter(issue => {
      const isCriticalOrHigh = issue.severity === 'CRITICAL' || issue.severity === 'HIGH' || issue.is_escalated;
      if (!isCriticalOrHigh && selectedFilter !== 'ALL') return false;

      // Filter tabs
      if (selectedFilter === 'CRITICAL' && issue.severity !== 'CRITICAL') return false;
      if (selectedFilter === 'ESCALATED' && !issue.is_escalated) return false;
      if (selectedFilter === 'OPEN' && issue.status === 'RESOLVED') return false;
      if (selectedFilter === 'RESOLVED' && issue.status !== 'RESOLVED') return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = issue.title?.toLowerCase().includes(q);
        const matchDesc = issue.description?.toLowerCase().includes(q);
        const matchRef = issue.issue_reference?.toLowerCase().includes(q);
        const matchProject = issue.project_name?.toLowerCase().includes(q);
        const matchAssignee = issue.assigned_to_name?.toLowerCase().includes(q);
        return matchTitle || matchDesc || matchRef || matchProject || matchAssignee;
      }
      return true;
    });
  }, [issues, selectedFilter, searchQuery]);

  // Statistics
  const stats = useMemo(() => {
    const totalCritical = issues.filter(i => i.severity === 'CRITICAL').length;
    const totalHigh = issues.filter(i => i.severity === 'HIGH').length;
    const totalEscalated = issues.filter(i => i.is_escalated).length;
    const totalResolved = issues.filter(i => i.status === 'RESOLVED').length;
    const totalOpen = issues.filter(i => i.status !== 'RESOLVED').length;
    return { totalCritical, totalHigh, totalEscalated, totalResolved, totalOpen };
  }, [issues]);

  if (!isOpen) return null;

  const handleResolveSubmit = async (issueId: string) => {
    if (!resolutionNotes.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Please provide defect resolution & inspection sign-off notes', type: 'error' } 
      }));
      return;
    }

    setIsSubmittingResolution(true);
    try {
      await resolveSiteIssue(issueId, {
        notes: resolutionNotes.trim()
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Defect successfully marked as rectified & resolved in database.', type: 'success' } 
      }));

      setResolvingIssueId(null);
      setResolutionNotes('');
      onRefresh();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to resolve issue';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Side Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-3xl bg-white shadow-2xl flex flex-col z-[111] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">
        
        {/* Header Bar */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-rose-900 via-rose-950 to-[#022C4F] text-white flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-rose-300 shrink-0 shadow-inner">
              <AlertOctagon size={24} className="animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-200 border border-rose-400/40">
                  Government Safety & Compliance Audit
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {stats.totalCritical} Critical • {stats.totalEscalated} Escalated
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-1">
                Review Critical Defects & Safety Hazards
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        {/* Top Stats Overview */}
        <div className="grid grid-cols-4 gap-3 p-4 bg-slate-50 border-b border-slate-200 shrink-0">
          <div 
            onClick={() => setSelectedFilter('CRITICAL')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              selectedFilter === 'CRITICAL' 
                ? 'bg-rose-50 border-rose-300 shadow-sm ring-1 ring-rose-300' 
                : 'bg-white border-slate-200 hover:border-rose-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block">Critical Severity</span>
            <span className="text-xl font-black text-rose-900">{stats.totalCritical}</span>
          </div>

          <div 
            onClick={() => setSelectedFilter('ESCALATED')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              selectedFilter === 'ESCALATED' 
                ? 'bg-amber-50 border-amber-300 shadow-sm ring-1 ring-amber-300' 
                : 'bg-white border-slate-200 hover:border-amber-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 block">Directorate Escalated</span>
            <span className="text-xl font-black text-amber-900">{stats.totalEscalated}</span>
          </div>

          <div 
            onClick={() => setSelectedFilter('OPEN')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              selectedFilter === 'OPEN' 
                ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-300' 
                : 'bg-white border-slate-200 hover:border-blue-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 block">Active / Pending</span>
            <span className="text-xl font-black text-[#022C4F]">{stats.totalOpen}</span>
          </div>

          <div 
            onClick={() => setSelectedFilter('RESOLVED')}
            className={`p-3 rounded-2xl border cursor-pointer transition-all ${
              selectedFilter === 'RESOLVED' 
                ? 'bg-emerald-50 border-emerald-300 shadow-sm ring-1 ring-emerald-300' 
                : 'bg-white border-slate-200 hover:border-emerald-200'
            }`}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">Rectified & Closed</span>
            <span className="text-xl font-black text-emerald-900">{stats.totalResolved}</span>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text"
              placeholder="Search by defect reference, project name, or hazard description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:bg-white focus:outline-none"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 text-[11px] font-bold">
            {(['ALL', 'CRITICAL', 'ESCALATED', 'OPEN', 'RESOLVED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedFilter === tab 
                    ? 'bg-white text-[#022C4F] shadow-sm font-black' 
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Items' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* List of Defects */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {criticalDefects.length === 0 ? (
            <div className="py-20 text-center text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-300">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-sm font-black text-slate-700">No Critical Defects Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No defect matching your current filter criteria is currently active. All high-risk safety items have been addressed.
              </p>
            </div>
          ) : (
            criticalDefects.map(defect => {
              const isResolving = resolvingIssueId === defect.id;
              const isResolved = defect.status === 'RESOLVED';

              return (
                <div 
                  key={defect.id}
                  className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                    defect.severity === 'CRITICAL'
                      ? 'border-rose-200 bg-rose-50/20 hover:border-rose-300 hover:shadow-lg hover:shadow-rose-500/5'
                      : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                  }`}
                >
                  {/* Defect Card Header */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-black text-[#022C4F] bg-slate-100 px-2.5 py-0.5 rounded-md">
                            {defect.issue_reference}
                          </span>
                          
                          <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                            defect.severity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' :
                            defect.severity === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            <AlertTriangle size={11} /> {defect.severity} Severity
                          </span>

                          {defect.is_escalated && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                              <Gavel size={10} /> Escalated to Directorate
                            </span>
                          )}

                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {defect.status}
                          </span>
                        </div>

                        <h3 className="text-base font-black text-[#022C4F] leading-snug pt-1">
                          {defect.title}
                        </h3>
                      </div>

                      {/* Project Link */}
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/government/dashboard/projects/view/${defect.project}/monitoring`);
                        }}
                        className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                      >
                        <Building2 size={12} /> {defect.project_name || 'Project Site'} <ArrowUpRight size={12} />
                      </button>
                    </div>

                    {/* Defect Description */}
                    <p className="text-xs text-slate-700 leading-relaxed font-medium bg-white/70 p-3 rounded-2xl border border-slate-100">
                      {defect.description}
                    </p>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">Assigned: <strong className="text-slate-800">{defect.assigned_to_name || 'Site Engineer'}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5 text-slate-600">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>Reported: {new Date(defect.created_at).toLocaleDateString()}</span>
                      </div>

                      {defect.due_date && (
                        <div className="flex items-center gap-1.5 text-rose-700 font-bold">
                          <AlertTriangle size={13} className="text-rose-500 shrink-0" />
                          <span>Deadline: {new Date(defect.due_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Resolution Evidence / Notes if resolved */}
                    {defect.resolution_notes && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs space-y-1">
                        <span className="font-bold text-emerald-900 flex items-center gap-1">
                          <CheckCircle size={13} className="text-emerald-600" /> Remediation Sign-Off Notes:
                        </span>
                        <p className="text-emerald-800">{defect.resolution_notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Inline Resolution Form */}
                  {isResolving && (
                    <div className="p-4 bg-emerald-50/70 border-t border-emerald-200 space-y-3 animate-in slide-in-from-top-2 duration-200">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle size={14} className="text-emerald-600" /> Sign-Off & Close Defect
                        </span>
                        <button 
                          onClick={() => setResolvingIssueId(null)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>

                      <textarea
                        rows={2}
                        value={resolutionNotes}
                        onChange={(e) => setResolutionNotes(e.target.value)}
                        placeholder="State structural remediation conducted, re-inspection certificate, and officer sign-off notes..."
                        className="w-full p-2.5 bg-white border border-emerald-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />

                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setResolvingIssueId(null)}
                          className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          disabled={isSubmittingResolution}
                          onClick={() => handleResolveSubmit(defect.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <Check size={13} /> {isSubmittingResolution ? 'Saving...' : 'Confirm Defect Rectification'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions Footer Bar */}
                  {!isResolving && (
                    <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        {!isResolved && (
                          <button
                            type="button"
                            onClick={() => {
                              setResolvingIssueId(defect.id);
                              setResolutionNotes('');
                            }}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle size={13} /> Mark Rectified & Close
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            router.push(`/government/dashboard/projects/view/${defect.project}/monitoring`);
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Eye size={13} /> Site Telemetry
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Escalate to Directorate */}
                        {!defect.is_escalated && (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onEscalateIssue(defect);
                            }}
                            className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Gavel size={13} /> Escalate to Directorate
                          </button>
                        )}

                        {/* Stop Work Order Enforcement */}
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onStopWorkOrder(defect);
                          }}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <AlertOctagon size={13} /> Stop-Work Order
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>Showing {criticalDefects.length} of {issues.length} total recorded site defects</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Close Audit Review
          </button>
        </div>

      </div>
    </>
  );
}
