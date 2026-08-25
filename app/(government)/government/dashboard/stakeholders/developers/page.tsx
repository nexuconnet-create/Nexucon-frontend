"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Users, Search, Filter, ShieldCheck, MapPin, Briefcase, 
  Mail, Phone, ExternalLink, Building2, RefreshCw, Plus, ShieldAlert 
} from "lucide-react";
import { Developer, getDevelopers, toggleBlacklist } from "@/services/stakeholders";
import CreateStakeholderModal from "@/components/dashboard/CreateStakeholderModal";
import PaginationBar from "@/components/dashboard/PaginationBar";

export default function DevelopersDirectory() {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const fetchDevelopers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDevelopers({ search: search.trim() || undefined });
      setDevelopers(data);
    } catch (err) {
      console.error("Failed to load developers", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDevelopers();
    setCurrentPage(1);
  }, [fetchDevelopers]);

  const handleToggleSanction = async (dev: Developer) => {
    const nextStatus = dev.is_blacklisted ? 'Monitoring' : 'Blacklisted';
    try {
      await toggleBlacklist({
        entity_type: 'Developer',
        entity_id: dev.developer_id,
        entity_name: dev.name,
        reason: dev.is_blacklisted ? 'Sanctions lifted after review' : 'Statutory audit non-compliance',
        status: nextStatus
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Developer status updated to ${nextStatus}`, type: 'success' }
      }));
      fetchDevelopers();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Failed to update developer status', type: 'error' }
      }));
    }
  };

  const paginatedDevelopers = developers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building2 className="text-blue-500" />
            Master Developers Directory
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Registry of verified property developers and parent sponsor organizations.
          </p>
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <button 
            onClick={fetchDevelopers}
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
            <span>Register Developer</span>
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
              placeholder="Search developers..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      {/* Developers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedDevelopers.map((dev, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={dev.id}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
          >
            {/* Header Area */}
            <div className="h-24 bg-slate-50 relative border-b border-gray-100">
              <div className="absolute top-4 right-4 flex items-center gap-1.5">
                {dev.is_blacklisted && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                    <ShieldAlert size={11} /> Sanctioned
                  </span>
                )}
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                  dev.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {dev.status === 'Verified' && <ShieldCheck size={12} />}
                  {dev.status}
                </span>
              </div>
              
              {/* Logo Badge */}
              <div className={`absolute -bottom-6 left-6 w-16 h-16 rounded-2xl text-white font-bold text-xl flex items-center justify-center shadow-md border-4 border-white ${dev.color_theme || 'bg-blue-600'}`}>
                {dev.name.charAt(0)}{dev.name.split(' ')[1]?.charAt(0)}
              </div>
            </div>

            <div className="pt-10 p-6 flex-1 flex flex-col">
              <h2 className="text-base font-bold text-gray-900 mb-1">{dev.name}</h2>
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-5">
                <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">{dev.developer_id}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="flex items-center gap-1"><MapPin size={12} /> {dev.hq_location}</span>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1 flex items-center gap-1"><Briefcase size={10} /> Active Projects</p>
                  <p className="text-base font-bold text-gray-900">{dev.active_projects_count}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Portfolio Value</p>
                  <p className="text-base font-bold text-emerald-600">{dev.portfolio_value}</p>
                </div>
              </div>

              <div className="mt-auto space-y-2 border-t border-gray-100 pt-4">
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Primary Contact</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                    {dev.primary_contact_name.charAt(0)}{dev.primary_contact_name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">{dev.primary_contact_name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-0.5">
                      <a href={`mailto:${dev.primary_contact_email || 'contact@nexucon.dev'}`} className="hover:text-blue-600 transition-colors flex items-center gap-1"><Mail size={10} /> Email</a>
                      <a href={`tel:${dev.primary_contact_phone || '+15550192034'}`} className="hover:text-blue-600 transition-colors flex items-center gap-1"><Phone size={10} /> Call</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
              <button 
                onClick={() => handleToggleSanction(dev)}
                className={`text-[11px] font-bold transition-colors cursor-pointer ${
                  dev.is_blacklisted ? 'text-emerald-700 hover:text-emerald-800' : 'text-red-600 hover:text-red-700'
                }`}
              >
                {dev.is_blacklisted ? 'Lift Sanction' : 'Flag / Sanction'}
              </button>

              <button 
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { 
                    detail: { message: `Opening developer dossier for ${dev.name}...`, type: 'info' } 
                  }));
                }}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1 cursor-pointer"
              >
                View Full Portfolio <ExternalLink size={12} />
              </button>
            </div>
          </motion.div>
        ))}

        {developers.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-3">
            No property developers found.
          </div>
        )}
      </div>

      {/* Pagination Bar */}
      {developers.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mt-6">
          <PaginationBar
            currentPage={currentPage}
            totalItems={developers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[3, 6, 12, 24]}
          />
        </div>
      )}

      {/* Create Developer Modal */}
      <CreateStakeholderModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchDevelopers}
        initialCategory="developer"
      />
    </div>
  );
}
