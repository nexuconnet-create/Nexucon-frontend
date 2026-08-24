"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, Download, Eye, MoreVertical, Calendar, User, FileBarChart, RefreshCw } from "lucide-react";
import { Document, getDocuments } from "@/services/documents";

export default function TechnicalReports() {
  const [reports, setReports] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { type: 'TECHNICAL_REPORT' };
      if (searchQuery) params.search = searchQuery;
      if (selectedDiscipline !== 'All') params.discipline = selectedDiscipline;
      const data = await getDocuments(params);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDiscipline]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'Geotechnical':
      case 'Environmental': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Structural': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Civil': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'MEP': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-slate-700 bg-slate-100 border-slate-200';
    }
  };

  const getStatusIndicator = (status: string) => {
    switch(status) {
      case 'Final': return <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>;
      case 'Under Review': return <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)] animate-pulse"></div>;
      case 'Draft': return <div className="w-2 h-2 rounded-full bg-gray-400"></div>;
      default: return null;
    }
  };

  const handleDownload = (docTitle: string, docSize: string) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading report "${docTitle}" (${docSize}) from Cloudflare R2...`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] flex items-center gap-3">
            <FileBarChart className="text-blue-600" />
            Technical Reports & Engineering Studies
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Access detailed geotechnical studies, EIA assessments, and structural calculations.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search reports by title, ID or author..." 
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
        
        <div className="flex items-center gap-3">
          <select 
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="border border-slate-200 rounded-xl text-xs font-bold px-3.5 py-2.5 text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Disciplines</option>
            <option value="Environmental">Environmental & Geotechnical</option>
            <option value="Structural">Structural Engineering</option>
            <option value="MEP">MEP & HVAC</option>
            <option value="Civil">Civil Infrastructure</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="py-24 text-center text-slate-400 text-xs font-bold">
            Loading technical studies from Cloudflare R2...
          </div>
        ) : reports.length === 0 ? (
          <div className="py-16 text-center text-slate-400 p-8 space-y-2">
            <FileText size={44} className="mx-auto text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No technical reports found matching filters.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px] text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Report Title & Reference</th>
                <th className="py-4 px-6">Project / Type</th>
                <th className="py-4 px-6">Date & Author</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {reports.map((report, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={report.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                >
                  <td className="py-4 px-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText size={19} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{report.title}</h4>
                        <p className="text-[10px] font-mono font-semibold text-slate-400 mt-0.5">{report.document_reference || 'REP-2026'} • {report.file_size}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold tracking-wide rounded border ${getTypeStyle(report.discipline)}`}>
                      {report.discipline}
                    </span>
                    <span className="text-[10px] text-slate-400 block font-semibold mt-1 truncate max-w-[180px]">
                      {report.project_name || 'Lagos State'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-1 text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar size={13} className="text-slate-400" /> {new Date(report.created_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <User size={13} className="text-slate-400" /> {report.uploader_name}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {getStatusIndicator(report.status === 'APPROVED' ? 'Final' : 'Under Review')}
                      <span className={`text-xs font-bold ${report.status === 'APPROVED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {report.status === 'APPROVED' ? 'Final' : 'Under Review'}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => handleDownload(report.title, report.file_size)}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors" 
                        title="Download from Cloudflare R2"
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
