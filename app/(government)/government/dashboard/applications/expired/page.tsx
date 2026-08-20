"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Clock, AlertTriangle, FileWarning, Search, RefreshCw, 
  Building2, Calendar, User, ArrowUpRight, Send, CheckCircle, RotateCw
} from 'lucide-react';
import { getPermits, getPermitStats, renewPermit, sendPermitExpiryNotice, Permit, PermitStats } from '@/services/permits';
import { useRouter } from 'next/navigation';
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function DocumentExpiryTracking() {
  const router = useRouter();
  const [permits, setPermits] = useState<Permit[]>([]);
  const [stats, setStats] = useState<PermitStats>({
    total: 0,
    active: 0,
    expiring_soon: 0,
    expired: 0,
    suspended: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'expired' | 'expiring_soon'>('all');

  // Renewal Modal State
  const [selectedPermitForRenewal, setSelectedPermitForRenewal] = useState<Permit | null>(null);
  const [renewalMonths, setRenewalMonths] = useState(12);
  const [renewalNotes, setRenewalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchPermitsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [permitsData, statsData] = await Promise.all([
        getPermits({ search: searchQuery }),
        getPermitStats()
      ]);
      setPermits(permitsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load permits", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchPermitsData();
  }, [fetchPermitsData]);

  const handleSendNotice = async (permit: Permit) => {
    try {
      await sendPermitExpiryNotice(permit.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Expiry reminder notice dispatched for ${permit.permit_number}`, type: 'success' } 
      }));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to dispatch notice';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    }
  };

  const handleRenewPermit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPermitForRenewal) return;

    setIsSubmitting(true);
    try {
      await renewPermit(selectedPermitForRenewal.id, {
        extension_months: renewalMonths,
        notes: renewalNotes
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Permit ${selectedPermitForRenewal.permit_number} renewed successfully!`, type: 'success' } 
      }));
      setSelectedPermitForRenewal(null);
      setRenewalNotes('');
      fetchPermitsData();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to renew permit';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayedPermits = permits.filter(p => {
    if (filterType === 'expired') return p.status === 'EXPIRED' || (p.days_until_expiry !== undefined && p.days_until_expiry !== null && p.days_until_expiry < 0);
    if (filterType === 'expiring_soon') return p.is_expiring_soon;
    return true;
  });

  return (
    <div className="w-full min-h-screen pb-16 pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <Clock size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Expiry & Validity Tracking</h1>
          </div>
          <p className="text-gray-500 text-sm ml-[52px]">Track permits, licenses, and authorizations approaching expiration or requiring renewal.</p>
        </div>
        <TopRightControls />
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div 
          onClick={() => setFilterType('expired')}
          className={`bg-white rounded-3xl border p-6 flex items-center justify-between shadow-sm cursor-pointer transition-all ${
            filterType === 'expired' ? 'border-rose-400 ring-2 ring-rose-200' : 'border-slate-100 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertTriangle size={28}/>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#022C4F]">{stats.expired} Permits Expired</h2>
              <p className="text-xs font-semibold text-rose-600 mt-0.5">Enforcement or renewal action required</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">View List</span>
        </div>

        <div 
          onClick={() => setFilterType('expiring_soon')}
          className={`bg-white rounded-3xl border p-6 flex items-center justify-between shadow-sm cursor-pointer transition-all ${
            filterType === 'expiring_soon' ? 'border-amber-400 ring-2 ring-amber-200' : 'border-slate-100 hover:shadow-md'
          }`}
        >
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={28}/>
            </div>
            <div>
              <h2 className="text-3xl font-black text-[#022C4F]">{stats.expiring_soon} Approaching Expiry</h2>
              <p className="text-xs font-semibold text-amber-600 mt-0.5">Expiring within the next 30 days</p>
            </div>
          </div>
          <span className="text-xs font-bold text-slate-400">View List</span>
        </div>
      </div>
      
      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Search permits by number, project, or applicant..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs w-full focus:ring-2 focus:ring-blue-500 focus:outline-none" 
              />
            </div>
            <button 
              onClick={fetchPermitsData}
              className="p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Permits' },
              { id: 'expired', label: 'Expired Only' },
              { id: 'expiring_soon', label: 'Expiring Soon' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setFilterType(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filterType === tab.id 
                    ? 'bg-[#022C4F] text-white shadow-sm' 
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-xs font-semibold">Loading permits registry...</p>
            </div>
          ) : displayedPermits.length === 0 ? (
            <div className="py-20 text-center text-slate-400 flex flex-col items-center">
              <FileWarning size={48} className="text-slate-300 mb-4"/>
              <p className="text-sm font-bold text-slate-700">No permits found matching criteria.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50">
                  <th className="py-3.5 px-6">Permit Details</th>
                  <th className="py-3.5 px-6">Project & Applicant</th>
                  <th className="py-3.5 px-6">Issue / Expiry Date</th>
                  <th className="py-3.5 px-6">Validity Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayedPermits.map((permit) => {
                  const isExpired = permit.status === 'EXPIRED' || (permit.days_until_expiry !== undefined && permit.days_until_expiry !== null && permit.days_until_expiry < 0);
                  
                  return (
                    <tr key={permit.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="font-bold text-[#022C4F] block">{permit.permit_number}</span>
                        <span className="text-[11px] text-slate-400">{permit.application_type}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-800 block">{permit.project_name}</span>
                        <span className="text-[11px] text-slate-500">{permit.applicant_name}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-slate-600 block">Issued: {new Date(permit.issue_date).toLocaleDateString()}</span>
                        <span className={`font-bold block ${isExpired ? 'text-rose-600' : 'text-slate-800'}`}>
                          Expires: {new Date(permit.expiry_date).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          isExpired 
                            ? 'bg-rose-100 text-rose-700' 
                            : permit.is_expiring_soon 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {isExpired ? 'EXPIRED' : permit.is_expiring_soon ? 'EXPIRING SOON' : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleSendNotice(permit)}
                            title="Dispatch Expiry Notice"
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                          >
                            <Send size={15} />
                          </button>
                          <button
                            onClick={() => setSelectedPermitForRenewal(permit)}
                            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1"
                          >
                            <RotateCw size={13} /> Renew
                          </button>
                          <button
                            onClick={() => router.push(`/government/dashboard/projects/view/${permit.project}/monitoring`)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
                          >
                            <ArrowUpRight size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Renewal Confirmation Modal */}
      {selectedPermitForRenewal && (
        <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#022C4F] mb-1">Process Permit Renewal</h3>
            <p className="text-xs text-slate-500 mb-5">
              Renewing <span className="font-bold text-slate-700">{selectedPermitForRenewal.permit_number}</span> for {selectedPermitForRenewal.project_name}.
            </p>

            <form onSubmit={handleRenewPermit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Extension Period</label>
                <select
                  value={renewalMonths}
                  onChange={(e) => setRenewalMonths(parseInt(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value={6}>6 Months Extension</option>
                  <option value={12}>12 Months (1 Year) Extension</option>
                  <option value={24}>24 Months (2 Years) Extension</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Renewal Notes / Justification</label>
                <textarea
                  value={renewalNotes}
                  onChange={(e) => setRenewalNotes(e.target.value)}
                  placeholder="e.g. Verified ongoing construction meets safety criteria; extension granted per annual renewal inspection..."
                  className="w-full h-24 p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedPermitForRenewal(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
                >
                  <RotateCw size={14} /> {isSubmitting ? 'Processing...' : 'Confirm Renewal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
