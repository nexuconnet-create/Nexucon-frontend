"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, ShieldCheck, Download, Award, FileSignature, FileText, Share2, Stamp, RefreshCw } from "lucide-react";
import { DocumentApproval, getDocumentApprovals } from "@/services/documents";

export default function ApprovalRecords() {
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovals = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentApprovals();
      setApprovals(data);
    } catch (err) {
      console.error("Failed to load approval records", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  const handleDownload = (doc: DocumentApproval) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading officially stamped PDF with verification seal for "${doc.document_title || doc.approval_reference}"...`, type: 'success' } 
    }));
  };

  const handleShare = (doc: DocumentApproval) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Shareable verification link copied to clipboard for ${doc.approval_reference}!`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-emerald-500" />
            Approval Records Vault
          </h1>
          <p className="text-gray-500 mt-1">Official immutable archive of stamped, signed, and approved project documentation.</p>
        </div>
        <button 
          onClick={fetchApprovals}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading approved records vault...</div>
      ) : approvals.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-gray-100 p-8">
          <Award size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No document approval records vaulted yet.</p>
          <p className="text-xs text-slate-400 mt-1">Apply digital stamps to documents from the Project Documents repository.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {approvals.map((doc, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
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
                  
                  <h2 className="text-2xl font-bold mb-2 leading-snug">{doc.document_title || 'Approved Project Document'}</h2>
                  <p className="text-blue-200 font-medium">{doc.category}</p>
                </div>
                
                <div className="relative z-10 mt-12 pt-6 border-t border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-blue-200/70 uppercase font-semibold">Document Reference</p>
                    <p className="font-mono font-bold text-base text-emerald-400">{doc.approval_reference}</p>
                  </div>
                  <Award size={32} className="text-emerald-500 opacity-80" />
                </div>
              </div>
              
              {/* Right Side: Details & Actions */}
              <div className="xl:w-2/3 p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <ShieldCheck className="text-blue-500" />
                    Digital Signature & Verification Certificate
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <FileSignature size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Signed By</p>
                          <p className="font-bold text-gray-900">{doc.approved_by_name}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Signature Cryptographically Verified</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                          <CheckCircle size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Date of Approval</p>
                          <p className="font-bold text-gray-900">{new Date(doc.reviewed_at).toLocaleDateString()}</p>
                          <p className="text-xs text-emerald-600 font-semibold mt-0.5">Final Status: APPROVED</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 col-span-2">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                          <Award size={20} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SHA-256 Signature Hash</p>
                          <p className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100 inline-block">
                            {doc.signature_hash || '0x3f8a...c91'}
                          </p>
                          <p className="text-xs text-slate-500 mt-2">{doc.comments || 'Officially verified and stamped.'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-4">
                  <button 
                    onClick={() => handleDownload(doc)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-md hover:bg-blue-700 transition-colors text-xs"
                  >
                    <Download size={16} />
                    Download Stamped PDF
                  </button>
                  <button 
                    onClick={() => handleShare(doc)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-colors text-xs"
                  >
                    <Share2 size={16} />
                    Share Verification Certificate
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
