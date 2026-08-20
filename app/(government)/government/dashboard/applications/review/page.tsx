"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Search, Filter, CheckCircle, XCircle, Clock, Eye, AlertCircle,
  Building2, Calendar, User, ShieldCheck, ArrowUpRight, RefreshCw, AlertTriangle
} from 'lucide-react';
import Link from 'next/link';
import TopRightControls from "@/components/dashboard/TopRightControls";
import { getReviewQueue, Application } from '@/services/applications';
import ApplicationDetailSideDrawer from '@/components/dashboard/ApplicationDetailSideDrawer';
import RequestDocumentsModal from '@/components/dashboard/RequestDocumentsModal';

export default function ReviewQueue() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Drawer states
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [isRequestDocsModalOpen, setIsRequestDocsModalOpen] = useState(false);
  const [requestDocsTargetApp, setRequestDocsTargetApp] = useState<Application | null>(null);

  const fetchQueue = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getReviewQueue();
      setApplications(data);
    } catch (err) {
      console.error("Failed to load review queue", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const filteredApps = applications.filter(app => 
    (app.project_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (app.application_reference?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
    (app.applicant_name?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <FileText size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Review Applications Queue
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            Active regulatory review queue for pending submissions, engineering verifications, and permit sign-offs.
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Main Table Container */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by project name, reference, or applicant..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
            />
          </div>
          <button 
            onClick={fetchQueue}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh Queue
          </button>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-semibold">Loading review queue...</p>
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">Queue is Clear!</h3>
              <p className="text-xs text-slate-500 max-w-sm">
                There are no pending applications requiring review or sign-off at this time.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredApps.map((app) => (
                <div 
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setIsDetailDrawerOpen(true);
                  }}
                  className="p-6 bg-white border border-slate-200 rounded-3xl hover:border-blue-300 hover:shadow-lg transition-all cursor-pointer flex flex-col group justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{app.application_reference}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                        app.status === 'UNDER_REVIEW' ? 'bg-amber-100 text-amber-700' :
                        app.status === 'REVIEW_COMPLETED' ? 'bg-indigo-100 text-indigo-700' :
                        app.status === 'APPROVAL_REQUESTED' ? 'bg-purple-100 text-purple-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors mb-1">
                      {app.project_name || app.title}
                    </h4>
                    <p className="text-xs font-semibold text-slate-500 mb-4">{app.application_type}</p>

                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-600">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Applicant:</span>
                        <span className="font-bold text-slate-700">{app.applicant_name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Reviewer:</span>
                        <span className="font-bold text-slate-700">{app.assigned_reviewer_name || 'Unassigned'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Checklist Items:</span>
                        <span className="font-bold text-blue-600">
                          {(app.review_items || []).filter(i => i.status === 'PASSED').length} / {(app.review_items || []).length} Verified
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between mt-4">
                    <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                      <Calendar size={12} /> {new Date(app.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                        setIsDetailDrawerOpen(true);
                      }}
                      className="px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                    >
                      Audit & Decide <ArrowUpRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <ApplicationDetailSideDrawer
        isOpen={isDetailDrawerOpen}
        onClose={() => setIsDetailDrawerOpen(false)}
        application={selectedApp}
        onUpdated={fetchQueue}
        onRequestDocs={(app) => {
          setRequestDocsTargetApp(app);
          setIsRequestDocsModalOpen(true);
        }}
      />

      <RequestDocumentsModal
        isOpen={isRequestDocsModalOpen}
        onClose={() => setIsRequestDocsModalOpen(false)}
        application={requestDocsTargetApp}
        onSuccess={fetchQueue}
      />
    </div>
  );
}
