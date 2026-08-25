"use client";

import React, { useState } from 'react';
import { 
  X, Download, FileText, FileSpreadsheet, Code2, 
  ShieldCheck, CheckCircle2, Clock, Filter, Eye, 
  Layers, Check, Sparkles, AlertTriangle, Printer 
} from 'lucide-react';
import { AuditEvent } from '@/services/audit';
import { 
  AuditExportConfig, GeneratedAuditDoc, 
  generateAuditDocument 
} from '@/utils/auditDocumentGenerator';

interface AuditExportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  events: AuditEvent[];
  defaultModule?: string;
}

export default function AuditExportDrawer({
  isOpen,
  onClose,
  events,
  defaultModule = 'All Activities'
}: AuditExportDrawerProps) {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'CSV' | 'XLSX' | 'JSON'>('PDF');
  const [moduleScope, setModuleScope] = useState<string>(defaultModule);
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [includeHashes, setIncludeHashes] = useState<boolean>(true);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedDoc, setGeneratedDoc] = useState<GeneratedAuditDoc | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState<boolean>(false);

  if (!isOpen) return null;

  // Filter events based on active drawer configurations
  const filteredEvents = events.filter(e => {
    if (severityFilter !== 'ALL' && e.severity.toUpperCase() !== severityFilter.toUpperCase()) return false;
    return true;
  });

  const formats = [
    {
      id: 'PDF' as const,
      name: 'Official Audit Certificate (PDF / Printable)',
      description: 'Formal regulatory transcript with government seal, watermark, and signing block.',
      icon: FileText,
      badge: 'Statutory PDF',
      color: 'border-blue-500 bg-blue-50/40 text-blue-700'
    },
    {
      id: 'XLSX' as const,
      name: 'Excel Workbook (XLSX)',
      description: 'Formatted multi-column spreadsheet for auditing, pivot tables, and analysis.',
      icon: FileSpreadsheet,
      badge: 'Spreadsheet',
      color: 'border-emerald-500 bg-emerald-50/40 text-emerald-700'
    },
    {
      id: 'CSV' as const,
      name: 'Standard Ledger CSV',
      description: 'Raw RFC-4180 comma-separated values for database import and ERP pipelines.',
      icon: Download,
      badge: 'Raw CSV',
      color: 'border-amber-500 bg-amber-50/40 text-amber-700'
    },
    {
      id: 'JSON' as const,
      name: 'Cryptographic JSON Ledger',
      description: 'Machine-readable blockchain blocks with SHA-256 signatures for API compliance.',
      icon: Code2,
      badge: 'API JSON',
      color: 'border-purple-500 bg-purple-50/40 text-purple-700'
    },
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const config: AuditExportConfig = {
        title: `Nexucon Statutory Audit Ledger — ${moduleScope}`,
        reportReference: `EXP-AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        format: selectedFormat,
        module: moduleScope,
        severity: severityFilter,
        dateRange: dateRange,
        includeHashes: includeHashes,
        includeSignatures: includeSignatures,
        officerName: 'Director of Technical Review',
        officerRole: 'Director General / Agency Lead'
      };

      const doc = await generateAuditDocument(filteredEvents, config);
      setGeneratedDoc(doc);

      // Trigger automatic browser download
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = doc.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Audit Ledger downloaded successfully (${doc.fileName})!`, type: 'success' } 
      }));
    } catch (err) {
      console.error("Export error:", err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Failed to generate document export', type: 'error' } 
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintPreview = () => {
    if (selectedFormat === 'PDF') {
      const config: AuditExportConfig = {
        title: `Nexucon Statutory Audit Ledger — ${moduleScope}`,
        reportReference: `EXP-AUD-${Math.floor(1000 + Math.random() * 9000)}`,
        format: 'PDF',
        module: moduleScope,
        severity: severityFilter,
        dateRange: dateRange,
        includeHashes: includeHashes,
        includeSignatures: includeSignatures,
        officerName: 'Director of Technical Review',
        officerRole: 'Director General / Agency Lead'
      };
      generateAuditDocument(filteredEvents, config).then(doc => {
        const printWindow = window.open('', '_blank');
        if (printWindow && doc.previewHtml) {
          printWindow.document.write(doc.previewHtml);
          printWindow.document.close();
          printWindow.focus();
        }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Sidepop Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-blue-50/40">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
                <Download size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-lg border border-blue-200">
                    STATUTORY EXPORT
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Multi-Format Generator</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Export Audit &amp; Traceability Records
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* Format Selection Section */}
            <div>
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block mb-3">
                1. Select Export Document Format
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {formats.map((fmt) => {
                  const Icon = fmt.icon;
                  const isSelected = selectedFormat === fmt.id;
                  return (
                    <button
                      key={fmt.id}
                      onClick={() => setSelectedFormat(fmt.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer ${
                        isSelected 
                          ? `${fmt.color} ring-2 ring-blue-500/20 shadow-md` 
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100 text-slate-600'}`}>
                            <Icon size={18} />
                          </div>
                          {isSelected && (
                            <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                              <Check size={12} />
                            </span>
                          )}
                        </div>

                        <h3 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                          {fmt.name}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {fmt.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                          {fmt.badge}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scope & Filter Configuration */}
            <div className="space-y-4 pt-2">
              <label className="text-xs font-black uppercase tracking-wider text-slate-700 block">
                2. Audit Ledger Scope &amp; Filters
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Minimum Severity
                  </label>
                  <select
                    value={severityFilter}
                    onChange={(e) => setSeverityFilter(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Severities (Normal, High, Critical)</option>
                    <option value="Warning">Warning &amp; Above</option>
                    <option value="High">High Priority &amp; Critical Only</option>
                    <option value="Critical">Critical Issues Only</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                    Date Horizon
                  </label>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ALL">All Historical Records</option>
                    <option value="24H">Past 24 Hours</option>
                    <option value="7D">Past 7 Days</option>
                    <option value="30D">Past 30 Days (Current Month)</option>
                    <option value="QUARTER">Current Quarter</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2.5 pt-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck size={16} className="text-emerald-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Include SHA-256 Block Signature Hashes</span>
                      <span className="text-[10px] text-slate-500 block">Appends full cryptographic proof block to every event record</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeHashes}
                    onChange={(e) => setIncludeHashes(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/70 transition-colors cursor-pointer">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-blue-600" />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Include Digital Ministerial Signature &amp; Watermark</span>
                      <span className="text-[10px] text-slate-500 block">Attaches digital government authority stamp and non-repudiation notice</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={includeSignatures}
                    onChange={(e) => setIncludeSignatures(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Document Generation Summary Card */}
            <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Target Records for Generation</span>
                <span className="text-xs font-black text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  {filteredEvents.length} Events Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Exporting in <strong className="text-white">{selectedFormat}</strong> format. All downloaded files contain sequential tamper-evident ledger proofs.
              </p>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-3">
            {selectedFormat === 'PDF' && (
              <button
                onClick={handlePrintPreview}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>Print / Preview</span>
              </button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={onClose}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleGenerate}
                disabled={isGenerating || filteredEvents.length === 0}
                className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#022C4F]/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download size={14} />
                <span>{isGenerating ? "Compiling..." : `Download ${selectedFormat} Ledger`}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
