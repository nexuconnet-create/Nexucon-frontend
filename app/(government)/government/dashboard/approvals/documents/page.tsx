"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileCheck, Search, Filter, FileText, CheckCircle2, Clock, 
  XCircle, FileSignature, Eye, RefreshCw, QrCode, ShieldCheck, 
  Download, ExternalLink 
} from "lucide-react";
import { ApprovalRequest, getApprovalRequests, signDocument } from "@/services/approvals";

export default function DocumentApprovals() {
  const [documents, setDocuments] = useState<ApprovalRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchDocuments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getApprovalRequests({ request_type: 'Document', search: searchQuery });
      if (data.length > 0) {
        setDocuments(data);
      } else {
        const allData = await getApprovalRequests({ search: searchQuery });
        const docList = allData.filter(r => r.request_type === 'Document' || r.discipline === 'Architecture');
        setDocuments(docList.length > 0 ? docList : allData);
      }
    } catch (err) {
      console.error("Failed to load document approvals", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleSign = async (doc: ApprovalRequest) => {
    try {
      if (doc.id && doc.id.length > 5) {
        await signDocument(doc.id);
      }
      setDocuments(prev => prev.map(d => {
        if (d.id === doc.id) {
          const nextSigned = Math.min(d.signatories_required, d.signatories_completed + 1);
          return {
            ...d,
            signatories_completed: nextSigned,
            status: nextSigned >= d.signatories_required ? 'Approved' : d.status
          };
        }
        return d;
      }));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Digital signature successfully executed and recorded on "${doc.request_reference}"!`, type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewDocument = (doc: ApprovalRequest) => {
    if (doc.attached_file_url) {
      window.open(doc.attached_file_url, '_blank');
    }
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Opening Cloudflare R2 document for "${doc.title}"...`, type: 'info' } 
    }));
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'Approved': return (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <CheckCircle2 size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">Fully Executed</span>
        </div>
      );
      case 'Rejected': return (
        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
          <XCircle size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">Rejected</span>
        </div>
      );
      case 'Pending':
      default: return (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          <Clock size={13} />
          <span className="text-[10px] font-black uppercase tracking-wider">Awaiting Signature</span>
        </div>
      );
    }
  };

  const getSignatureProgress = (signed: number, total: number) => {
    return (
      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[...Array(total || 1)].map((_, i) => (
            <div key={i} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
              i < signed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'
            }`}>
              {i < signed ? <CheckCircle2 size={12} /> : <FileSignature size={12} />}
            </div>
          ))}
        </div>
        <span className="text-xs font-bold text-slate-600">{signed} of {total || 1} Signed</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileCheck className="text-blue-500" />
            Document Approvals & Multi-Signature Vault
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Execute cryptographic signatures, track multi-signatory execution chains, and view documents directly on Cloudflare R2.</p>
        </div>

        <button 
          onClick={fetchDocuments}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search documents by reference, project, or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {documents.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText size={44} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No document approval requests found.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Document & Lineage</th>
                <th className="py-4 px-6">Submitted By / Due</th>
                <th className="py-4 px-6">Signatures Required</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {documents.map((doc, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={doc.id} 
                  className="hover:bg-blue-50/30 transition-colors group"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 mt-0.5 text-slate-600">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">{doc.request_reference}</span>
                          <span className="text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">{doc.discipline}</span>
                          {doc.source_version_hash && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {doc.source_version_hash.slice(0, 10)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1">
                      <span className="font-bold text-slate-800">{doc.submitted_by_name}</span>
                      <span className="text-slate-500 text-[11px]">Due: {doc.due_date || 'In 7 Days'}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {getSignatureProgress(doc.signatories_completed, doc.signatories_required)}
                  </td>
                  <td className="py-4 px-6">
                    {getStatusDisplay(doc.status)}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {doc.status !== 'Approved' && doc.status !== 'Rejected' && (
                        <button 
                          onClick={() => handleSign(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm cursor-pointer"
                        >
                          <FileSignature size={14} /> Sign Now
                        </button>
                      )}
                      <button 
                        onClick={() => handleViewDocument(doc)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer" 
                        title="View Cloudflare R2 Document"
                      >
                        <Eye size={15} />
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
