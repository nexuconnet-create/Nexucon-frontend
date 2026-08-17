"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, CheckCircle, XCircle, Clock, Eye, AlertCircle } from 'lucide-react';
import api from '@/services/api';
import Link from 'next/link';
import TopRightControls from "@/components/dashboard/TopRightControls";

interface Application {
  id: string;
  project_name: string;
  project_reference: string;
  applicant_name: string;
  application_type: string;
  status: string;
  submission_date: string;
}

export default function ReviewQueue() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states for reviewing an application
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  
  const fetchQueue = async () => {
    try {
      const res = await api.get('/applications/review-queue/');
      // The interceptor returns response.data, so res is the payload {success: true, data: [...]}
      setApplications(res.data || res || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDecision = async (status: string) => {
    if (!selectedApp) return;
    setIsReviewing(true);
    try {
      await api.post(`/applications/${selectedApp.id}/transition/`, { status });
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Application ${status.toLowerCase()} successfully`, type: 'success' } }));
      setSelectedApp(null);
      fetchQueue();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'An error occurred while transitioning application';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsReviewing(false);
    }
  };

  const filteredApps = applications.filter(app => 
    (app.project_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
    (app.project_reference?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-6">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <FileText size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Review Applications
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            Review pending project applications and permits.
          </p>
        </div>
        <TopRightControls />
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by project name or reference..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
            <Filter size={16} /> Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                <th className="p-4 font-bold">Project</th>
                <th className="p-4 font-bold">Applicant</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold">Submitted Date</th>
                <th className="p-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {isLoading ? (
                <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading queue...</td></tr>
              ) : filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <CheckCircle size={48} className="mb-4 text-gray-300" />
                      <p className="text-lg font-medium text-gray-900">All caught up!</p>
                      <p className="text-sm mt-1">No applications currently require review.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#022C4F]">{app.project_name || 'N/A'}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{app.project_reference || 'N/A'}</div>
                    </td>
                    <td className="p-4 font-medium text-gray-700">{app.applicant_name || 'N/A'}</td>
                    <td className="p-4 text-gray-600">{app.application_type || 'General'}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-700">
                        <Clock size={12} /> {app.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {app.submission_date ? new Date(app.submission_date).toLocaleDateString() : 'Pending'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedApp(app)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-bold transition-colors"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#022C4F]">Review Application</h2>
                <p className="text-sm text-gray-500 mt-1">{selectedApp.project_reference} • {selectedApp.project_name}</p>
              </div>
              <button onClick={() => setSelectedApp(null)} className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors">
                <XCircle size={24} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Applicant</h3>
                  <p className="font-medium text-gray-900">{selectedApp.applicant_name || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Application Type</h3>
                  <p className="font-medium text-gray-900">{selectedApp.application_type || 'General Construction Permit'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Submitted Date</h3>
                  <p className="font-medium text-gray-900">{selectedApp.submission_date ? new Date(selectedApp.submission_date).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Current Status</h3>
                  <p className="font-medium text-gray-900">{selectedApp.status.replace(/_/g, ' ')}</p>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-xl flex items-start gap-3 mb-6">
                <AlertCircle className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-blue-900">
                  Please review all attached documents before making a decision. Approving this application will transition the project to an active status.
                </p>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
              <button 
                disabled={isReviewing}
                onClick={() => handleDecision('REJECTED')}
                className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 text-sm"
              >
                Reject
              </button>
              <button 
                disabled={isReviewing}
                onClick={() => handleDecision('UNDER_REVIEW')}
                className="px-5 py-2.5 bg-amber-50 text-amber-700 font-bold rounded-xl hover:bg-amber-100 transition-colors disabled:opacity-50 text-sm"
              >
                Request Revision
              </button>
              <button 
                disabled={isReviewing}
                onClick={() => handleDecision('APPROVED')}
                className="px-5 py-2.5 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all disabled:opacity-50 text-sm"
              >
                {isReviewing ? 'Processing...' : 'Approve Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
