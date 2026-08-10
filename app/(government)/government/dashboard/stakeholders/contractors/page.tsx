"use client";

import React from "react";
import { motion } from "framer-motion";
import { HardHat, Search, Filter, ShieldCheck, MapPin, AlertTriangle, Shield, CheckCircle2, ChevronRight, CheckCircle, Database } from "lucide-react";

export default function ContractorsDirectory() {
  const contractors = [
    {
      id: "CON-304",
      name: "Apex Construction Services",
      type: "General Contractor",
      status: "Prequalified",
      licenseStatus: "Valid",
      complianceScore: 94,
      activePermits: 12,
      specialties: ["Commercial", "High-Rise", "Civil"],
      color: "bg-blue-600"
    },
    {
      id: "CON-882",
      name: "Vertex MEP Solutions",
      type: "Subcontractor",
      status: "Prequalified",
      licenseStatus: "Expiring Soon",
      complianceScore: 88,
      activePermits: 4,
      specialties: ["HVAC", "Electrical", "Plumbing"],
      color: "bg-purple-600"
    },
    {
      id: "CON-912",
      name: "StoneBridge Foundations",
      type: "Subcontractor",
      status: "Suspended",
      licenseStatus: "Revoked",
      complianceScore: 62,
      activePermits: 0,
      specialties: ["Deep Foundation", "Concrete"],
      color: "bg-red-600"
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <HardHat className="text-amber-500" />
            Contractors Directory
          </h1>
          <p className="text-gray-500 mt-1">Manage general contractors and subs, track prequalifications, and monitor compliance scores.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="hidden lg:flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg border border-emerald-200 mr-2 shadow-sm">
             <Database size={16} />
             <span className="text-xs font-bold uppercase tracking-wider">Live Agency Validation</span>
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse ml-1"></div>
           </div>
           
           <div className="relative hidden md:block">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
             <input 
               type="text" 
               placeholder="Search contractors..." 
               className="pl-9 pr-4 py-2 w-64 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
             />
           </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {contractors.map((con, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={con.id}
            className={`bg-white rounded-2xl border transition-all flex flex-col md:flex-row overflow-hidden ${
              con.status === 'Suspended' ? 'border-red-200 shadow-md ring-1 ring-red-500/10' : 'border-gray-100 shadow-sm hover:shadow-md'
            }`}
          >
            {/* Left Col: Info */}
            <div className="flex-1 p-6 flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl text-white font-bold text-lg flex items-center justify-center shadow-sm shrink-0 ${con.color}`}>
                    {con.name.charAt(0)}{con.name.split(' ')[1]?.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{con.name}</h2>
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mt-1">
                      <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-gray-600">{con.id}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{con.type}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {con.specialties.map(spec => (
                  <span key={spec} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-md text-[10px] font-bold uppercase tracking-wider text-gray-500">
                    {spec}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 grid grid-cols-3 gap-2">
                 <div>
                   <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Active Permits</p>
                   <p className="text-sm font-bold text-gray-900">{con.activePermits}</p>
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
                   <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider ${
                     con.licenseStatus === 'Valid' ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200' :
                     con.licenseStatus === 'Expiring Soon' ? 'text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' :
                     'text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200'
                   }`}>
                     {con.licenseStatus === 'Valid' ? <ShieldCheck size={10} /> : <AlertTriangle size={10} />}
                     {con.licenseStatus}
                   </span>
                 </div>
              </div>
            </div>

            {/* Right Col: Compliance Score */}
            <div className={`p-6 border-t md:border-t-0 md:border-l flex flex-col justify-center items-center shrink-0 w-full md:w-48 ${
              con.status === 'Suspended' ? 'bg-red-50/50 border-red-100' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="text-center mb-4">
                <Shield className={`mx-auto mb-2 ${
                  con.complianceScore > 90 ? 'text-emerald-500' : con.complianceScore > 75 ? 'text-amber-500' : 'text-red-500'
                }`} size={32} />
                <p className="text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Compliance Score</p>
                <div className="flex items-end justify-center gap-1">
                  <span className={`text-3xl font-bold leading-none ${
                    con.complianceScore > 90 ? 'text-emerald-600' : con.complianceScore > 75 ? 'text-amber-600' : 'text-red-600'
                  }`}>{con.complianceScore}</span>
                  <span className="text-sm text-gray-400 font-bold mb-0.5">/100</span>
                </div>
              </div>

              <button className="w-full text-sm font-bold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 py-2 rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                View Profile <ChevronRight size={14} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
