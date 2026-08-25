"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Download, Calendar, CheckCircle2, Circle, 
  FileType2, Search, LayoutTemplate, RefreshCw, ExternalLink, 
  ShieldCheck, Eye, Printer, Sparkles 
} from "lucide-react";
import { 
  GeneratedReport, getGeneratedReports, 
  createGeneratedReport, downloadGeneratedReport 
} from "@/services/analytics";
import { 
  generateAndDownloadDocument, 
  compileReportData, 
  generatePDFReport, 
  generateCSVReport, 
  ReportConfig, 
  GeneratedDocumentResult 
} from "@/utils/documentGenerator";
import ReportPreviewModal from "@/components/dashboard/ReportPreviewModal";

export default function ExportReports() {
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [selectedModules, setSelectedModules] = useState<string[]>([
    'Project Performance', 'Compliance & Regulatory', 'Structural Risk Assessment'
  ]);
  const [format, setFormat] = useState<'PDF' | 'CSV' | 'XLSX' | 'JSON'>('PDF');
  const [reportTitle, setReportTitle] = useState('Comprehensive Statutory Executive Audit Report');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Preview Modal States
  const [previewResult, setPreviewResult] = useState<GeneratedDocumentResult | null>(null);
  const [activeConfig, setActiveConfig] = useState<ReportConfig | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const availableModules = [
    "Project Performance",
    "Construction Progress & EVM",
    "Inspection Analytics",
    "Compliance & Regulatory",
    "Financial Overview",
    "Agency Performance SLAs",
    "Structural Risk Assessment",
    "Inspector Performance",
    "Annual Building Safety Report"
  ];

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGeneratedReports();
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const toggleModule = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  const handleGenerateAndDownload = async () => {
    if (selectedModules.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Select at least one module', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    const reportRef = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const config: ReportConfig = {
      title: reportTitle || `Statutory Government Intelligence Report (${format})`,
      reportReference: reportRef,
      format,
      modules: selectedModules,
      startDate,
      endDate,
      generatedBy: "Director General / Agency Head"
    };

    try {
      // 1. Generate & trigger file download directly in browser
      const docResult = await generateAndDownloadDocument(config);

      // 2. Persist in backend archive
      await createGeneratedReport({
        title: config.title,
        report_reference: reportRef,
        format,
        modules_included: selectedModules,
        period_start: startDate,
        period_end: endDate,
        file_size: docResult.fileSize
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Report "${reportRef}" generated and downloaded successfully!`, type: 'success' } 
      }));

      fetchReports();
    } catch (err: any) {
      console.error("Failed to generate report", err);
      const msg = err.response?.data?.message || 'Failed to generate report';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreviewReport = async () => {
    if (selectedModules.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Select at least one module', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    const reportRef = `REP-2026-${Math.floor(100 + Math.random() * 900)}`;
    const config: ReportConfig = {
      title: reportTitle || `Statutory Government Intelligence Report (${format})`,
      reportReference: reportRef,
      format,
      modules: selectedModules,
      startDate,
      endDate,
      generatedBy: "Director General / Agency Head"
    };

    try {
      const data = await compileReportData(config.modules);
      const docResult = format === 'PDF' 
        ? generatePDFReport(config, data)
        : generateCSVReport(config, data);

      setPreviewResult(docResult);
      setActiveConfig(config);
      setIsPreviewOpen(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadArchivedReport = async (rep: GeneratedReport) => {
    const config: ReportConfig = {
      title: rep.title,
      reportReference: rep.report_reference,
      format: (rep.format as any) || 'PDF',
      modules: rep.modules_included || selectedModules,
      startDate: rep.period_start || startDate,
      endDate: rep.period_end || endDate,
      generatedBy: rep.generated_by_name || "Agency Officer"
    };

    try {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Downloading report "${rep.report_reference}"...`, type: 'info' } 
      }));
      await generateAndDownloadDocument(config);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Download className="text-blue-500" />
            Statutory Analytics Export &amp; Custom Report Generator
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Build and export custom statutory intelligence reports in PDF, CSV, Excel, or JSON formats with digital verification stamps.
          </p>
        </div>

        <button 
          onClick={fetchReports}
          className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors self-start md:self-auto cursor-pointer"
          title="Refresh Archive"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Document Generator Configuration Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 mb-8 space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Custom Report Title
          </label>
          <input 
            type="text"
            value={reportTitle}
            onChange={(e) => setReportTitle(e.target.value)}
            placeholder="e.g. Q3 Comprehensive Safety & Compliance Report"
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 mb-3">
            <LayoutTemplate size={18} className="text-blue-600" />
            <span>Select Analytics Modules to Include in Document</span>
          </h2>

          {/* Module Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableModules.map((moduleName, i) => {
              const isSelected = selectedModules.includes(moduleName);
              return (
                <div 
                  key={i}
                  onClick={() => toggleModule(moduleName)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected 
                      ? 'bg-blue-50/70 border-blue-300 text-blue-900 font-bold shadow-sm' 
                      : 'bg-slate-50/70 border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs">{moduleName}</span>
                  {isSelected ? (
                    <CheckCircle2 size={16} className="text-blue-600" />
                  ) : (
                    <Circle size={16} className="text-slate-300" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Filter & Format Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Start Period Date
            </label>
            <input 
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              End Period Date
            </label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Export File Format
            </label>
            <div className="flex gap-2">
              {(['PDF', 'CSV', 'XLSX', 'JSON'] as const).map(fmt => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    format === fmt 
                      ? 'bg-[#022C4F] text-white shadow-sm' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Sparkles size={15} className="text-blue-500" />
            <span>Includes cryptographic verification hash &amp; government executive seal</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePreviewReport}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Eye size={14} />
              <span>Preview Document</span>
            </button>

            <button
              onClick={handleGenerateAndDownload}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download size={14} />
              <span>{isSubmitting ? 'Generating Document...' : `Generate & Export ${format}`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Generated Reports Archive */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-black text-slate-900">Generated Reports Archive</h2>
          <span className="text-xs font-bold text-slate-400">Stored with Immutable Audit Log</span>
        </div>

        {reports.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-bold text-slate-700">No generated reports archive yet.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[750px]">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <th className="py-4 px-6">Report Title &amp; Ref</th>
                <th className="py-4 px-6">Format</th>
                <th className="py-4 px-6">Author / Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {reports.map((rep, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={rep.id || idx}
                  className="hover:bg-blue-50/30 transition-colors"
                >
                  <td className="py-4 px-6">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm">{rep.title}</h4>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100 mt-1 inline-block">
                        {rep.report_reference}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-1 rounded text-[10px] font-mono font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                      {rep.format}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-800">{rep.generated_by_name}</span>
                      <span className="text-slate-400 text-[10px]">{new Date(rep.created_at).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {rep.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleDownloadArchivedReport(rep)}
                      className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors border border-slate-200 hover:border-blue-200 cursor-pointer"
                      title="Download Generated Report"
                    >
                      <Download size={15} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Document Preview Modal */}
      <ReportPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        result={previewResult}
        config={activeConfig}
      />
    </div>
  );
}
