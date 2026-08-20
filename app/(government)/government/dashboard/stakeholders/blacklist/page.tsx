"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AlertOctagon, UserX, ShieldCheck, History, Clock, Plus, RefreshCw } from "lucide-react";
import { BlacklistRecord, getBlacklistRecords } from "@/services/stakeholders";
import BlacklistEntityModal from "@/components/dashboard/BlacklistEntityModal";

export default function RecurringOffenders() {
  const [records, setRecords] = useState<BlacklistRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlacklistModalOpen, setIsBlacklistModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBlacklistRecords();
      setRecords(data);
    } catch (err) {
      console.error("Failed to load blacklist records", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <UserX className="text-rose-500" />
            Blacklist & Verification Center
          </h1>
          <p className="text-gray-500 mt-1">Track recurring offenders, apply regulatory sanctions, and monitor license expiries.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchRecords}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsBlacklistModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-500/20 transition-all text-xs"
          >
            <Plus size={14} /> Add Regulatory Sanction
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recurring Offenders */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <UserX className="text-rose-500" size={18} /> Active Regulatory Sanctions ({records.length})
          </h3>
          <div className="space-y-3">
            {records.map((rec) => (
              <div 
                key={rec.id} 
                className={`p-4 border rounded-2xl flex justify-between items-center ${
                  rec.status === 'Blacklisted' ? 'border-rose-100 bg-rose-50/70' :
                  rec.status === 'Suspended' ? 'border-red-100 bg-red-50/70' :
                  'border-amber-100 bg-amber-50/70'
                }`}
              >
                <div>
                  <h4 className="font-bold text-gray-900 text-xs">{rec.entity_name}</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">{rec.reason}</p>
                  <span className="text-[10px] font-mono text-gray-400">ID: {rec.entity_id} • {rec.incident_count} Incidents</span>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase shrink-0 ${
                  rec.status === 'Blacklisted' ? 'bg-rose-600 text-white' :
                  rec.status === 'Suspended' ? 'bg-red-600 text-white' :
                  'bg-amber-500 text-white'
                }`}>
                  {rec.status}
                </span>
              </div>
            ))}

            {records.length === 0 && !isLoading && (
              <div className="p-8 text-center text-xs text-gray-400">
                No active blacklist sanctions logged.
              </div>
            )}
          </div>
        </div>

        {/* License Expiry Tracking */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
            <Clock className="text-amber-500" size={18} /> Real-Time License Expiry Tracking
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-gray-100 hover:bg-slate-50 transition-colors rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-xs">Engr. David Rossi</h4>
                <p className="text-[11px] text-gray-500">COREN License • ID: CRN-99234</p>
              </div>
              <span className="text-rose-600 font-bold text-xs bg-rose-50 px-3 py-1 rounded-xl border border-rose-200">
                Expired 2 days ago
              </span>
            </div>
            <div className="p-4 border border-gray-100 hover:bg-slate-50 transition-colors rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-xs">BuildMax Corp</h4>
                <p className="text-[11px] text-gray-500">CAC Registration • RC-102934</p>
              </div>
              <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-emerald-200">
                <ShieldCheck size={12}/> Valid via API
              </span>
            </div>
            <div className="p-4 border border-gray-100 hover:bg-slate-50 transition-colors rounded-2xl flex justify-between items-center">
              <div>
                <h4 className="font-bold text-gray-900 text-xs">Vertex MEP Solutions</h4>
                <p className="text-[11px] text-gray-500">COREN Electrical Sub-License • CRN-44912</p>
              </div>
              <span className="text-amber-700 font-bold text-xs bg-amber-50 px-3 py-1 rounded-xl flex items-center gap-1 border border-amber-200">
                Expiring in 14 days
              </span>
            </div>
          </div>
        </div>
      </div>

      <BlacklistEntityModal
        isOpen={isBlacklistModalOpen}
        onClose={() => setIsBlacklistModalOpen(false)}
        onSuccess={fetchRecords}
      />
    </div>
  );
}
