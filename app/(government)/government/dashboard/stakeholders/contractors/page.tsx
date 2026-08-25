"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  HardHat, Search, Filter, ShieldCheck, MapPin, AlertTriangle, 
  Shield, CheckCircle2, ChevronRight, CheckCircle, Database, 
  RefreshCw, Plus, ShieldAlert 
} from "lucide-react";
import { Contractor, getContractors, validateContractorLicense, toggleBlacklist } from "@/services/stakeholders";
import CreateStakeholderModal from "@/components/dashboard/CreateStakeholderModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function ContractorsDirectory() {
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

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
    setCurrentPage(1);
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

  const handleToggleSanction = async (con: Contractor) => {
    const nextStatus = con.is_blacklisted ? 'Monitoring' : 'Blacklisted';
    try {
      await toggleBlacklist({
        entity_type: 'Contractor',
        entity_id: con.contractor_id,
        entity_name: con.name,
        reason: con.is_blacklisted ? 'Sanctions lifted following compliance review' : 'Repeated non-compliance with safety codes',
        status: nextStatus
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Contractor status updated to ${nextStatus}`, type: 'success' }
      }));
      fetchContractors();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to update contractor status', type: 'error' }
      }));
    }
  };

  const paginatedContractors = contractors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <HardHat className="text-amber-500" />
            Contractors &amp; Prequalifications Directory
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Manage general contractors, specialty trades, track prequalifications, and monitor compliance scores.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchContractors}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl shadow-md transition-all text-xs font-bold cursor-pointer"
          >
            <Plus size={14} />
            <span>Register Contractor</span>
          </button>
          
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
            <input 
              type="text" 
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search contractors..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Contractors Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paginatedContractors.map((con, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={con.id}
            className={`bg-white rounded-3xl border transition-all flex flex-col md:flex-row overflow-hidden ${
              con.is_blacklisted ? 'border-red-200 shadow-md ring-1 ring-red-500/10' : 'border-gray-100 shadow-sm hover:shadow-md'
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
                     con.is_blacklisted ? 'text-red-600' : 'text-emerald-600'
                   }`}>
                     {con.is_blacklisted ? <AlertTriangle size={12} /> : <CheckCircle2 size={12} />}
                     {con.is_blacklisted ? 'Sanctioned' : con.status}
                   </span>
                 </div>
                 <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Agency License</p>
                   <button
                     onClick={() => handleValidateLicense(con.id, con.name)}
                     className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-left cursor-pointer ${
                       con.license_status === 'Valid' ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 hover:bg-emerald-100' :
                       con.license_status === 'Expiring Soon' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' :
                       'text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                     }`}
                     title="Click to verify against registry"
                   >
                     {con.license_status === 'Valid' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                     {con.license_status}
                   </button>
                 </div>
              </div>
            </div>

            {/* Right Col: Score Strip */}
            <div className="bg-slate-50 border-t md:border-t-0 md:border-l border-gray-100 p-6 flex flex-col justify-between items-center w-full md:w-36 text-center shrink-0">
              <div>
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Compliance Score</p>
                <div className="relative inline-flex items-center justify-center">
                  <span className={`text-2xl font-black ${
                    con.compliance_score >= 90 ? 'text-emerald-600' : con.compliance_score >= 75 ? 'text-amber-600' : 'text-red-600'
                  }`}>
                    {con.compliance_score}%
                  </span>
                </div>
              </div>

              <div className="w-full space-y-1.5 mt-4">
                <button
                  onClick={() => handleToggleSanction(con)}
                  className={`w-full py-1.5 rounded-xl text-[10px] font-bold border transition-colors cursor-pointer ${
                    con.is_blacklisted 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'
                  }`}
                >
                  {con.is_blacklisted ? 'Lift Sanction' : 'Sanction / Blacklist'}
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {contractors.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-2">
            No contractors found matching criteria.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {contractors.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalItems={contractors.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[4, 6, 12, 24]}
          />
        </div>
      )}

      {/* Create Contractor Modal */}
      <CreateStakeholderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchContractors}
        initialCategory="contractor"
      />
    </div>
  );
}
