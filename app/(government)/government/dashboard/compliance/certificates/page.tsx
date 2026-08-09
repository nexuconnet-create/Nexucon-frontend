"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileCheck, ShieldCheck, Download, Search, Filter, Award, ExternalLink, CalendarDays } from "lucide-react";

export default function ComplianceCertificates() {
  const certificates = [
    { 
      id: "CERT-ENV-2026", 
      title: "Environmental Clearance Certificate", 
      authority: "Environmental Protection Agency (EPA)", 
      issueDate: "Jan 15, 2026",
      expiryDate: "Dec 31, 2027",
      status: "Active",
      category: "Environmental"
    },
    { 
      id: "CERT-SAF-2025", 
      title: "Site Fire Safety Approval", 
      authority: "National Fire Dept", 
      issueDate: "Nov 01, 2025",
      expiryDate: "Nov 01, 2026",
      status: "Expiring Soon",
      category: "Safety"
    },
    { 
      id: "CERT-ISO-9001", 
      title: "ISO 9001: Quality Management", 
      authority: "ISO Certification Board", 
      issueDate: "Mar 10, 2024",
      expiryDate: "Mar 09, 2027",
      status: "Active",
      category: "Quality"
    },
    { 
      id: "CERT-STR-008", 
      title: "Structural Design Compliance", 
      authority: "City Planning Comm.", 
      issueDate: "Aug 22, 2026",
      expiryDate: "Aug 22, 2028",
      status: "Active",
      category: "Building Code"
    }
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Expiring Soon': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Expired': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Award className="text-blue-500" />
            Compliance Certificates Vault
          </h1>
          <p className="text-gray-500 mt-1">Official repository for awarded regulatory certificates and permits.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search certificates by title, ID or authority..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Active', 'Expiring Soon', 'Expired'].map(filter => (
            <button key={filter} className="px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 bg-gray-100 hover:bg-gray-200 hover:text-gray-700 rounded-md transition-colors">
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
        {certificates.map((cert, idx) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.1 }}
            key={cert.id}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer relative"
          >
            {/* Certificate Header / Seal Area */}
            <div className="h-32 bg-gradient-to-br from-[#022C4F] to-[#01182E] relative flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
              
              {/* Decorative Seal */}
              <div className="w-24 h-24 rounded-full border border-blue-500/30 bg-blue-500/10 flex items-center justify-center relative z-10">
                <div className="w-20 h-20 rounded-full border border-blue-400/40 bg-blue-400/20 flex items-center justify-center">
                  <ShieldCheck size={32} className="text-blue-300" />
                </div>
              </div>
              
              {/* Status Badge Overlaid */}
              <div className="absolute top-4 right-4 z-20">
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded border shadow-sm backdrop-blur-sm ${
                  cert.status === 'Active' ? 'bg-emerald-500/90 text-white border-emerald-400' :
                  'bg-amber-500/90 text-white border-amber-400'
                }`}>
                  {cert.status}
                </span>
              </div>
            </div>

            <div className="p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{cert.id}</span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">{cert.category}</span>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-snug group-hover:text-blue-600 transition-colors">
                {cert.title}
              </h3>
              <p className="text-sm font-semibold text-gray-500 mb-6">{cert.authority}</p>

              <div className="grid grid-cols-2 gap-4 mt-auto border-t border-gray-100 pt-5">
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Issued On</span>
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                    <CalendarDays size={14} className="text-gray-400" /> {cert.issueDate}
                  </div>
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-bold text-gray-400 mb-1 tracking-wider">Valid Until</span>
                  <div className={`flex items-center gap-1.5 text-sm font-bold ${cert.status === 'Active' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    <CalendarDays size={14} /> {cert.expiryDate}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Actions Overlay (Appears on Hover) */}
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-30">
              <button className="flex items-center justify-center gap-2 w-48 py-2.5 bg-blue-600 text-white rounded-lg font-semibold text-sm shadow-md hover:bg-blue-700 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300">
                <FileCheck size={16} /> View Certificate
              </button>
              <button className="flex items-center justify-center gap-2 w-48 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-semibold text-sm shadow-sm hover:bg-gray-50 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-75">
                <Download size={16} /> Download PDF
              </button>
              <button className="flex items-center justify-center gap-2 w-48 py-2.5 bg-white text-gray-700 border border-gray-200 rounded-lg font-semibold text-sm shadow-sm hover:bg-gray-50 transition-colors transform translate-y-4 group-hover:translate-y-0 duration-300 delay-150">
                <ExternalLink size={16} /> Verify Authenticity
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
