"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileCheck, Search, Filter, FileText, CheckCircle2, Clock, XCircle, FileSignature, Eye, RefreshCw } from "lucide-react";
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
        detail: { message: `Digital signature successfully executed on "${doc.request_reference}"!`, type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'Approved': return (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          <CheckCircle2 size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Fully Executed</span>
        </div>
      );
      case 'Rejected': return (
        <div className="flex items-center gap-1.5 text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200">
          <XCircle size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Rejected</span>
        </div>
      );
      case 'Pending':
      default: return (
        <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
          <Clock size={14} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Awaiting Signature</span>
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
              i < signed ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'
            }`}>
              {i < signed ? <CheckCircle2 size={12} /> : <FileSignature size={12} />}
            </div>
          ))}
        </div>
        <span className="text-xs font-semibold text-gray-500">{signed} of {total || 1}</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileCheck className="text-blue-500" />
            Document Approvals & Signatures
          </h1>
          <p className="text-gray-500 mt-1">Review, sign, and authorize official project documentation.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search documents by reference or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchDocuments}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Document</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Submitted By / Date</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Signatures Required</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {documents.map((doc, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={doc.id} 
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{doc.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{doc.request_reference}</p>
                        <p className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">{doc.discipline}</p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="font-semibold text-gray-700">{doc.submitted_by_name}</span>
                    <span className="text-gray-500">{doc.due_date || 'Oct 15, 2026'}</span>
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
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-sm"
                      >
                        <FileSignature size={14} /> Sign Now
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                          detail: { message: `Opening viewer for document "${doc.title}"...`, type: 'info' } 
                        }));
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-colors shadow-sm border border-transparent hover:border-blue-200" 
                      title="Review Document"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
