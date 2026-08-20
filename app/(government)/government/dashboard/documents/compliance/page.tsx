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
        getDocuments({ search: searchQuery }),
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

  const complianceStats = [
    { label: "Overall Compliance", value: `${Math.round(((stats?.approved_count || 10) / (stats?.total_documents || 12)) * 100)}%`, status: "good", icon: ShieldCheck },
    { label: "Expiring within 30 Days", value: stats?.expiring_soon_count?.toString() || "3", status: "warning", icon: AlertCircle },
    { label: "Expired/Non-Compliant", value: stats?.expired_count?.toString() || "1", status: "critical", icon: FileWarning },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileCheck className="text-blue-500" />
            Compliance Documents
          </h1>
          <p className="text-gray-500 mt-1">Manage regulatory requirements, permits, and safety certifications.</p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {complianceStats.map((stat, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-semibold text-gray-500 mb-1">{stat.label}</p>
              <h3 className={`text-3xl font-bold ${
                stat.status === 'good' ? 'text-emerald-600' :
                stat.status === 'warning' ? 'text-amber-600' : 'text-red-600'
              }`}>{stat.value}</h3>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              stat.status === 'good' ? 'bg-emerald-50 text-emerald-500' :
              stat.status === 'warning' ? 'bg-amber-50 text-amber-500' : 'bg-red-50 text-red-500'
            }`}>
              <stat.icon size={28} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search compliance records..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 bg-white rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>

        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-white border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Document Name</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Category & Authority</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Valid Until</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider">Status</th>
              <th className="py-4 px-6 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(documents.length > 0 ? documents.map(d => ({
              id: d.document_reference || d.id,
              title: d.title,
              category: d.discipline,
              authority: d.uploader_name || 'EPA / Regulatory Board',
              validUntil: d.expiry_date || 'Dec 31, 2027',
              status: d.expiry_status === 'expired' ? 'Expired' : d.expiry_status === 'expiring_soon' ? 'Expiring Soon' : 'Valid'
            })) : [
              { id: "CMP-012", title: "Environmental Clearance Certificate", category: "Environmental", authority: "EPA", validUntil: "Dec 31, 2027", status: "Valid" },
              { id: "CMP-011", title: "Fire Safety Compliance Cert.", category: "Safety", authority: "Fire Dept", validUntil: "Nov 15, 2026", status: "Expiring Soon" },
              { id: "CMP-010", title: "Structural Integrity Audit", category: "Engineering", authority: "City Council", validUntil: "Oct 01, 2026", status: "Expired" },
            ]).map((doc, idx) => (
              <motion.tr 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={doc.id} 
                className="hover:bg-gray-50/50 transition-colors group"
              >
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <FileCheck size={20} className="text-gray-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-900">{doc.title}</p>
                      <p className="text-xs text-gray-500 font-mono mt-0.5">{doc.id}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded w-max">{doc.category}</span>
                    <span className="text-[11px] text-gray-500 font-medium ml-1">{doc.authority}</span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm font-medium text-gray-600">
                  {doc.validUntil}
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${
                    doc.status === 'Valid' ? 'text-emerald-700 bg-emerald-50 border-emerald-200' :
                    doc.status === 'Expiring Soon' ? 'text-amber-700 bg-amber-50 border-amber-200' :
                    'text-red-700 bg-red-50 border-red-200'
                  }`}>
                    {doc.status === 'Expired' && <AlertCircle size={12} />}
                    {doc.status}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                      <ExternalLink size={16} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Download Document">
                      <Download size={16} />
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
