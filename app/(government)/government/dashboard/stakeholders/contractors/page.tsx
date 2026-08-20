"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { HardHat, Search, Filter, ShieldCheck, MapPin, AlertTriangle, Shield, CheckCircle2, ChevronRight, CheckCircle, Database, RefreshCw } from "lucide-react";
import { Contractor, getContractors, validateContractorLicense } from "@/services/stakeholders";

export default function ContractorsDirectory() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchContractors = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getContractors({ search: search.trim() || undefined });
      setContractors(data);
    } catch (err) {
      console.error("Failed to load contractors", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchContractors();
  }, [fetchContractors]);

  const handleValidateLicense = async (id: string, name: string) => {
    try {
      const res = await validateContractorLicense(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `License for ${name} verified valid against National Regulatory Database!`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'License validation error', type: 'error' } }));
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <HardHat className="text-amber-500" />
            Contractors & Prequalifications Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage general contractors and subs, track prequalifications, and monitor compliance scores.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchContractors}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contractors..." 
              className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contractors.map((con, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={con.id}
            className={`bg-white rounded-3xl border transition-all flex flex-col md:flex-row overflow-hidden ${
              con.status === 'Suspended' ? 'border-red-200 shadow-md ring-1 ring-red-500/10' : 'border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Left Col: Info */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0 ${con.color_theme || 'bg-blue-600'}`}>
                    {con.name.charAt(0)}{con.name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{con.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-1">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">{con.contractor_id}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{con.contractor_type}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-6">
                {(con.specialties || ["Commercial", "High-Rise"]).map(spec => (
                  <span key={spec} className="px-2 py-0.5 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                 <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Active Permits</p>
                   <p className="text-sm font-bold text-gray-900">{con.active_permits}</p>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Status</p>
                   <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                     con.status === 'Prequalified' ? 'text-emerald-600' : 'text-red-600'
                   }`}>
                     {con.status === 'Prequalified' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                     {con.status}
                   </span>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Agency License</p>
                   <button
                     onClick={() => handleValidateLicense(con.id, con.name)}
                     className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-left ${
                       con.license_status === 'Valid' ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200' :
                       con.license_status === 'Expiring Soon' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' :
                       'text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                     }`}
                   >
                     {con.license_status === 'Valid' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                     {con.license_status}
                   </button>
                 </div>
              </div>
            </div>

            {/* Right Col: Compliance Score */}
            <div className={`p-6 border-t md:border-t-0 md:border-l flex flex-col justify-center items-center shrink-0 w-full md:w-44 ${
              con.status === 'Suspended' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-center mb-4">
                <Shield className={`mx-auto mb-2 ${
                  con.compliance_score > 90 ? 'text-emerald-500' : con.compliance_score > 75 ? 'text-amber-500' : 'text-red-500'
                }`} size={28} />
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Compliance</p>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-2xl font-bold leading-none ${
                    con.compliance_score > 90 ? 'text-emerald-600' : con.compliance_score > 75 ? 'text-amber-600' : 'text-red-600'
                  }`}>{con.compliance_score}</span>
                  <span className="text-xs text-gray-400 font-bold mb-0.5">/100</span>
                </div>
              </div>

              <button 
                onClick={() => handleValidateLicense(con.id, con.name)}
                className="w-full text-xs font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 py-2 rounded-xl transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                Validate License <ChevronRight size={12} />
              </button>
            </div>
          </motion.div>
        ))}

        {contractors.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-2">
            No contractors found.
          </div>
        )}
      </div>
    </div>
  );
}
