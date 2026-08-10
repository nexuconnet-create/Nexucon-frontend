"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Lock, ShieldCheck, Download, Award, FileSignature, HardDrive, Share2, Box, QrCode, AlertOctagon } from "lucide-react";

export default function ApprovedModel() {
  const approvedModels = [
    { 
      id: "M-A-101", 
      name: "Highway Bridge A4 - Master", 
      discipline: "Integrated (Multi)", 
      version: "v3.0 - FINAL",
      approvalDate: "Oct 09, 2026",
      expiryDate: "Oct 09, 2027",
      approvedBy: "Eng. Samuel K.",
      agency: "FMW (Federal Ministry of Works)",
      certificateRef: "CERT-2026-HB-A4",
      size: "850 MB"
    },
    { 
      id: "M-A-100", 
      name: "Riverside Park Phase 1", 
      discipline: "Landscape & Civil", 
      version: "v4.2 - FINAL",
      approvalDate: "Sep 22, 2026",
      expiryDate: "Sep 22, 2028",
      approvedBy: "Arch. Maria V.",
      agency: "LABCA (Lagos State Building Control Agency)",
      certificateRef: "CERT-2026-RS-P1",
      size: "1.2 GB"
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            Approved Models Vault
          </h1>
          <p className="text-gray-500 mt-1">Immutable, signed, and certified models ready for construction or archiving.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {approvedModels.map((model, idx) => (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={model.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col xl:flex-row"
          >
            {/* Left Side: Visual / Lock Status */}
            <div className="xl:w-1/3 bg-gradient-to-br from-slate-800 to-slate-900 p-8 flex flex-col justify-between relative overflow-hidden text-white">
              <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 mix-blend-overlay"></div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-lg border border-emerald-500/30 font-semibold text-sm mb-4">
                  <Lock size={14} />
                  Read-Only & Immutable
                </div>
                
                <div className="flex gap-4 mb-6">
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center">
                    <Box size={40} className="text-blue-300" />
                  </div>
                  <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-emerald-500/30 flex flex-col items-center justify-center relative overflow-hidden group">
                    <QrCode size={36} className="text-emerald-400 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <span className="text-[10px] font-bold uppercase text-white text-center">Scan Stamp</span>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">{model.name}</h2>
                <p className="text-slate-400 font-medium">{model.discipline}</p>
              </div>
              
              <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Version ID</p>
                  <p className="font-mono font-bold text-lg text-emerald-400">{model.version}</p>
                </div>
                <Award size={32} className="text-emerald-500 opacity-80" />
              </div>
            </div>
            
            {/* Right Side: Details & Actions */}
            <div className="xl:w-2/3 p-8 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <ShieldCheck className="text-blue-500" />
                  Approval Certification Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                        <FileSignature size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Digital Signature</p>
                        <p className="font-bold text-gray-900 text-sm">{model.approvedBy}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{model.agency}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Validity Period</p>
                        <p className="font-bold text-gray-900 text-sm">{model.approvalDate}</p>
                        <p className="text-xs text-emerald-600 font-semibold mt-0.5">Expires: {model.expiryDate}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                        <Award size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Official Stamp Ref</p>
                        <p className="font-mono font-bold text-gray-900 text-sm">{model.certificateRef}</p>
                        <a href="#" className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block">Verify Stamp</a>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                        <HardDrive size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Storage Node (Read-Only)</p>
                        <p className="font-bold text-gray-900 text-sm">Vault 04</p>
                        <p className="text-xs text-gray-500 mt-0.5">Size: {model.size}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-start gap-3 bg-red-50 p-4 rounded-xl border border-red-100">
                  <AlertOctagon size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-700 font-medium leading-relaxed">
                    <strong>Enforcement Active:</strong> This model is digitally stamped and read-only. Any unauthorized modification to this BIM model or divergence during construction without an approved resubmission will automatically flag the project for a Stop-Work Order.
                  </p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors">
                  <Download size={18} />
                  Download Certified IFC
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors">
                  <Share2 size={18} />
                  Generate Secure Share Link
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
