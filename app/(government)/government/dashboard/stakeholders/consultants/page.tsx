"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Users, Search, Filter, ShieldCheck, MapPin, Scale, Leaf, Ear, Shield, RefreshCw } from "lucide-react";
import { Consultant, getConsultants } from "@/services/stakeholders";

export default function ConsultantsDirectory() {
  const [consultants, setConsultants] = useState<Consultant[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchConsultants = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getConsultants({ search: search.trim() || undefined });
      setConsultants(data);
    } catch (err) {
      console.error("Failed to load consultants", err);
    } finally {
      setIsLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchConsultants();
  }, [fetchConsultants]);

  const getConsultantIcon = (specialty: string) => {
    if (specialty.toLowerCase().includes('environmental') || specialty.toLowerCase().includes('soil')) return Leaf;
    if (specialty.toLowerCase().includes('legal') || specialty.toLowerCase().includes('zoning')) return Scale;
    return Ear;
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Users className="text-blue-500" />
            Third-Party Advisory & Consultants
          </h1>
          <p className="text-gray-500 mt-1">Directory of specialized advisory firms for environmental, legal, and safety oversight.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchConsultants}
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
              placeholder="Search consultants..." 
              className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm bg-white"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {consultants.map((firm, idx) => {
          const IconComponent = getConsultantIcon(firm.specialty);

          return (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              key={firm.id}
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow relative"
            >
              {/* Specialty Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${
                  firm.status === 'Verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {firm.status === 'Verified' && <ShieldCheck size={12} />}
                  {firm.status}
                </span>
              </div>

              <div className={`h-24 ${firm.color_theme || 'bg-emerald-600 text-white'} p-6 flex items-start`}>
                 <IconComponent size={32} className="opacity-80 text-white" />
              </div>

              <div className="p-6 flex-1 flex flex-col relative pt-8">
                {/* Overlapping ID Badge */}
                <div className="absolute -top-4 left-6 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-xl text-xs font-mono font-bold text-gray-700">
                  {firm.consultant_id}
                </div>

                <h2 className="text-lg font-bold text-gray-900 mb-1">{firm.name}</h2>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-4">
                  <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-700 uppercase tracking-wider font-bold">{firm.specialty}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="flex items-center gap-1"><MapPin size={12} /> {firm.hq_location}</span>
                </div>

                <p className="text-xs text-gray-600 mb-6 bg-gray-50 p-4 rounded-2xl border border-gray-100 leading-relaxed font-medium">
                  {firm.description || 'Specialized advisory services across environmental and structural engineering compliance.'}
                </p>

                <div className="mt-auto border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                     <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">Active Roles</p>
                     <p className="text-base font-bold text-gray-900">{firm.active_roles_count}</p>
                  </div>
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', { 
                        detail: { message: `Opening advisory dossier for ${firm.name}...`, type: 'info' } 
                      }));
                    }}
                    className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-blue-600 hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}

        {consultants.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center text-gray-500 text-sm col-span-3">
            No consultant advisory firms found.
          </div>
        )}
      </div>
    </div>
  );
}
