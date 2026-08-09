"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck, Download, Award, FileSignature, FileText, Share2, Stamp } from "lucide-react";

export default function ApprovalRecords() {
  const approvals = [
    { 
      id: "APP-DOC-2026-104", 
      title: "Master Schedule Phase 2", 
      category: "Project Planning", 
      approvalDate: "Oct 12, 2026",
      approvedBy: "Gov. Planning Comm.",
      status: "Approved",
      pages: 45
    },
    { 
      id: "APP-DOC-2026-103", 
      title: "Structural Load Permit", 
      category: "Engineering Permits", 
      approvalDate: "Oct 05, 2026",
      approvedBy: "Dept. of Building",
      status: "Approved",
      pages: 12
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            Approval Records Vault
          </h1>
          <p className="text-gray-500 mt-1">Official archive of stamped, signed, and approved project documentation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {approvals.map((doc, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={doc.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col xl:flex-row"
          >
            {/* Left Side: Visual / Lock Status */}
            <div className="xl:w-1/3 bg-gradient-to-br from-[#022C4F] to-[#01182E] p-8 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold text-sm mb-6">
                  <Stamp size={14} />
                  Officially Stamped
                </div>
                
                <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center mb-6">
                  <FileText size={40} className="text-blue-300" />
                </div>
                
                <h2 className="text-2xl font-bold mb-2 leading-snug">{doc.title}</h2>
                <p className="text-blue-200 font-medium">{doc.category}</p>
              </div>
              
              <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-200/70 uppercase font-semibold">Document ID</p>
                  <p className="font-mono font-bold text-lg text-emerald-400">{doc.id}</p>
                </div>
                <Award size={32} className="text-emerald-500 opacity-80" />
              </div>
            </div>
            
            {/* Right Side: Details & Actions */}
            <div className="xl:w-2/3 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-blue-500" />
                  Digital Signature & Verification
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileSignature size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed By</p>
                        <p className="font-bold text-gray-900">{doc.approvedBy}</p>
                        <p className="text-sm text-emerald-600 font-semibold mt-0.5">Signature Verified</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Approval</p>
                        <p className="font-bold text-gray-900">{doc.approvalDate}</p>
                        <p className="text-sm text-emerald-600 font-semibold mt-0.5">Final Status</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Approval Reference</p>
                        <p className="font-mono font-bold text-gray-900">REF-{doc.id.split('-').pop()}-X9</p>
                        <a href="#" className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block">View Audit Trail</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <FileText size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Document Properties</p>
                        <p className="font-bold text-gray-900">PDF Document</p>
                        <p className="text-sm text-gray-500 mt-0.5">Pages: {doc.pages}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">
                  <Download size={18} />
                  Download Stamped PDF
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Share2 size={18} />
                  Share Approved Record
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
