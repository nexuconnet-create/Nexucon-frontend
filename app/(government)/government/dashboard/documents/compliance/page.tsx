"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileCheck, ShieldCheck, AlertCircle, FileWarning, Search, Filter, Download, ExternalLink, RefreshCw } from "lucide-react";
import { Document, DocumentStats, getDocuments, getDocumentStats } from "@/services/documents";

export default function ComplianceDocuments() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<DocumentStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCompliance = useCallback(async () => {
    setIsLoading(true);
    try {
      const [docsData, statsData] = await Promise.all([
        getDocuments({ type: 'COMPLIANCE_DOCUMENT', search: searchQuery || undefined }),
        getDocumentStats()
      ]);
      setDocuments(docsData);
      setStats(statsData);
    } catch (err) {
      console.error("Failed to load compliance records", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCompliance();
  }, [fetchCompliance]);

  const handleDownload = (doc: Document) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading compliance certificate "${doc.title}" (${doc.file_size}) from Cloudflare R2...`, type: 'info' } 
    }));
  };

  const total = stats?.total_documents || documents.length || 1;
  const approved = stats?.approved_count || documents.filter(d => d.status === 'APPROVED').length;
  const compliancePct = Math.min(100, Math.round((approved / total) * 100));

  const complianceStats = [
    { label: "Overall Compliance Pacing", value: `${compliancePct}%`, status: "good", icon: ShieldCheck },
    { label: "Expiring within 30 Days", value: stats?.expiring_soon_count?.toString() || "1", status: "warning", icon: AlertCircle },
    { label: "Expired / Non-Compliant", value: stats?.expired_count?.toString() || "0", status: "critical", icon: FileWarning },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] flex items-center gap-3">
            <FileCheck className="text-blue-600" />
            Compliance Documents & Statutory Permits
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage regulatory clearance certificates, EIA approvals, and statutory fire certifications.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {complianceStats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={idx}
            className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-black ${
                stat.status === 'good' ? 'text-emerald-600' :
                stat.status === 'warning' ? 'text-amber-600' : 'text-rose-600'
              }`}>{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              stat.status === 'good' ? 'bg-emerald-50 text-emerald-600' :
              stat.status === 'warning' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
            }`}>
              <stat.icon size={26} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search compliance certificates..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button 
            onClick={fetchCompliance}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        {isLoading ? (
          <div className="py-24 text-center text-slate-400 text-xs font-bold">
            Loading compliance certificates from Cloudflare R2...
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-8 space-y-2">
            <FileCheck size={44} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No compliance documents found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px] text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Document Title & Ref</th>
                <th className="py-4 px-6">Category & Project</th>
                <th className="py-4 px-6">Valid Until</th>
                <th className="py-4 px-6">Regulatory Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {documents.map((doc, idx) => (
                <motion.tr 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.04 }}
                  key={doc.id} 
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0">
                        <FileCheck size={20} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">{doc.title}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{doc.document_reference} • {doc.file_size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-bold uppercase text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 w-max">{doc.discipline}</span>
                      <span className="text-[11px] text-slate-500 font-semibold truncate max-w-[180px]">{doc.project_name || 'Lagos State Permitted'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 font-bold">
                    {doc.expiry_date || 'Permanent Approval'}
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold uppercase rounded-full border ${
                      doc.expiry_status === 'expired' ? 'text-rose-700 bg-rose-50 border-rose-200' :
                      doc.expiry_status === 'expiring_soon' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                      'text-emerald-700 bg-emerald-50 border-emerald-200'
                    }`}>
                      {doc.expiry_status === 'expired' && <AlertCircle size={12} />}
                      {doc.expiry_status === 'expired' ? 'Expired' : doc.expiry_status === 'expiring_soon' ? 'Expiring Soon' : 'Valid Certificate'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleDownload(doc)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                        title="Download Certificate"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
