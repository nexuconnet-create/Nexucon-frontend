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
      const params: Record<string, any> = {};
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
      case 'Geotechnical': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Environmental': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Structural': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'Civil': return 'text-purple-700 bg-purple-50 border-purple-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
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

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileBarChart className="text-blue-500" />
            Technical Reports
          </h1>
          <p className="text-gray-500 mt-1">Access detailed engineering studies, assessments, and analyses.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search reports by title, ID or author..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="border border-gray-200 rounded-lg text-sm px-3 py-2 text-gray-600 bg-white focus:outline-none focus:border-blue-500">
            <option>All Report Types</option>
            <option>Geotechnical</option>
            <option>Environmental</option>
            <option>Structural</option>
            <option>Civil</option>
          </select>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Advanced Filter
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Report Details</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Type</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date & Author</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(reports.length > 0 ? reports.map(r => ({
              id: r.document_reference,
              title: r.title,
              type: r.discipline,
              date: new Date(r.created_at).toLocaleDateString(),
              author: r.uploader_name,
              size: r.file_size,
              status: r.status === 'APPROVED' ? 'Final' : r.status === 'UNDER_REVIEW' ? 'Under Review' : 'Draft'
            })) : [
              { id: "REP-204", title: "Geotechnical Soil Analysis - Zone C", type: "Geotechnical", date: "Oct 12, 2026", author: "Dr. H. Rahman", size: "4.2 MB", status: "Final" },
              { id: "REP-203", title: "Environmental Impact Assessment", type: "Environmental", date: "Oct 09, 2026", author: "EcoSolve Ltd.", size: "12.5 MB", status: "Final" },
              { id: "REP-202", title: "Structural Load Testing Results", type: "Structural", date: "Oct 05, 2026", author: "A. Rivera", size: "3.1 MB", status: "Draft" },
            ]).map((report, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={report.id} 
                className="hover:bg-blue-50/30 transition-colors group cursor-pointer"
              >
                <td className="py-4 px-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={20} className="text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{report.title}</h4>
                      <p className="text-xs font-mono font-semibold text-gray-500 mt-1">{report.id} • {report.size}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-md border ${getTypeStyle(report.type)}`}>
                    {report.type}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-gray-700 font-medium">
                      <Calendar size={14} className="text-gray-400" /> {report.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <User size={14} className="text-gray-400" /> {report.author}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    {getStatusIndicator(report.status)}
                    <span className={`text-sm font-semibold ${report.status === 'Final' ? 'text-emerald-700' : report.status === 'Under Review' ? 'text-amber-700' : 'text-gray-500'}`}>
                      {report.status}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Preview">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors" title="Download">
                      <Download size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors">
                      <MoreVertical size={18} />
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
