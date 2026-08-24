"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ClipboardList, Search, Filter, AlertTriangle, CheckCircle2, Calendar, FileText, User, RefreshCw, Download, Building2 } from "lucide-react";
import { Document, getDocuments } from "@/services/documents";

export default function InspectionReports() {
  const [reports, setReports] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { type: 'INSPECTION_REPORT' };
      if (searchQuery) params.search = searchQuery;
      if (selectedDiscipline !== 'All') params.discipline = selectedDiscipline;
      const data = await getDocuments(params);
      setReports(data);
    } catch (err) {
      console.error("Failed to load inspection reports", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDiscipline]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDownload = (doc: Document) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading inspection report "${doc.title}" (${doc.file_size}) from Cloudflare R2...`, type: 'info' } 
    }));
  };

  const getStatusDisplay = (status: string, issues: number) => {
    if (status === 'Passed' || status === 'APPROVED') {
      return (
        <div className="flex items-center gap-1.5 text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200 w-max">
          <CheckCircle2 size={13} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Passed Inspection</span>
        </div>
      );
    }
    if (status === 'Failed' || status === 'REJECTED') {
      return (
        <div className="flex items-center gap-1.5 text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 w-max">
          <AlertTriangle size={13} />
          <span className="text-[10px] font-extrabold uppercase tracking-wider">Defects Identified ({issues} Critical)</span>
        </div>
      );
    }
    return (
      <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200 w-max">
        <AlertTriangle size={13} />
        <span className="text-[10px] font-extrabold uppercase tracking-wider">Action Required</span>
      </div>
    );
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] flex items-center gap-3">
            <ClipboardList className="text-blue-600" />
            Inspection Reports & QA/QC Findings
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Review on-site audit findings, structural QA/QC verification sign-offs, and safety reports.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search by inspector or title..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchReports}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          {['All', 'Structural', 'Safety', 'MEP', 'Environmental'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setSelectedDiscipline(filter)}
              className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                selectedDiscipline === filter ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 text-center text-slate-400 text-xs font-bold">
          Loading statutory inspection reports from Cloudflare R2...
        </div>
      ) : reports.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8 space-y-2">
          <ClipboardList size={44} className="mx-auto text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No inspection reports found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={report.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div className={`p-6 border-b ${
                report.status === 'APPROVED' ? 'border-emerald-100 bg-emerald-50/40' :
                report.status === 'REJECTED' ? 'border-rose-100 bg-rose-50/40' : 'border-amber-100 bg-amber-50/40'
              }`}>
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-black text-slate-900 leading-snug flex-1 text-sm">{report.title}</h3>
                  <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm shrink-0">
                    {report.document_reference || 'INSP-2026'}
                  </span>
                </div>
                {getStatusDisplay(report.status === 'APPROVED' ? 'Passed' : report.status === 'REJECTED' ? 'Failed' : 'Action Required', report.status === 'REJECTED' ? 1 : 0)}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Building2 size={14} className="text-slate-400 shrink-0" />
                    <span className="font-bold text-slate-700 truncate">{report.project_name || 'Lagos State'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <User size={14} className="text-slate-400 shrink-0" />
                    <span>{report.uploader_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 font-medium">
                    <Calendar size={14} className="text-slate-400 shrink-0" />
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {report.discipline} Audit
                  </span>
                  <button 
                    onClick={() => handleDownload(report)}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <Download size={14} /> Download PDF
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
