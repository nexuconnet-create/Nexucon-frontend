"use client";

import React, { useState } from 'react';
import { X, FileText, Download, Calendar, CheckCircle2, Circle, FileType2, LayoutTemplate } from 'lucide-react';
import { createGeneratedReport } from '@/services/analytics';

interface ReportBuilderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ReportBuilderDrawer({
  isOpen,
  onClose,
  onSuccess
}: ReportBuilderDrawerProps) {
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState<'PDF' | 'CSV'>('PDF');
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-09-30');
  const [selectedModules, setSelectedModules] = useState<string[]>([
    "Project Performance",
    "Compliance & Regulatory",
    "Inspection Analytics"
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableModules = [
    "Project Performance",
    "Construction Progress & EVM",
    "Inspection Analytics",
    "Compliance & Regulatory",
    "Financial Overview",
    "Agency Performance SLAs",
    "Detailed Approval Logs",
    "BIM Clash Summaries",
    "Structural Risk Assessment",
    "Inspector Performance",
    "Annual Building Safety Report",
    "Emergency Response Report"
  ];

  if (!isOpen) return null;

  const toggleModule = (moduleName: string) => {
    if (selectedModules.includes(moduleName)) {
      setSelectedModules(selectedModules.filter(m => m !== moduleName));
    } else {
      setSelectedModules([...selectedModules, moduleName]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedModules.length === 0) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Select at least one module', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const rep = await createGeneratedReport({
        title: title || `Custom Leadership Report (${format})`,
        format,
        modules_included: selectedModules,
        period_start: startDate,
        period_end: endDate
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Report "${rep.report_reference}" successfully generated! Downloading...`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to generate report';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[560px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        <div className="flex items-center justify-between pb-6 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-black text-[#022C4F] flex items-center gap-2">
              <FileText className="text-blue-500" size={22} /> Report Builder & Export
            </h2>
            <p className="text-xs text-slate-500 mt-1">Configure and export custom agency summaries.</p>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleGenerate} className="flex-1 overflow-y-auto py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Report Title</label>
            <input
              type="text"
              placeholder="e.g. Q3 Executive Compliance & Safety Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Date Range</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Export Format</label>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => setFormat('PDF')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  format === 'PDF' ? 'border-red-500 bg-red-50/50' : 'border-slate-200 bg-white hover:border-red-200'
                }`}
              >
                <FileType2 size={24} className={format === 'PDF' ? 'text-red-600' : 'text-slate-400'} />
                <div>
                  <p className={`text-xs font-bold ${format === 'PDF' ? 'text-red-700' : 'text-slate-700'}`}>PDF Document</p>
                  <p className="text-[10px] text-slate-400">Charts & summaries</p>
                </div>
              </div>
              <div 
                onClick={() => setFormat('CSV')}
                className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-center gap-3 ${
                  format === 'CSV' ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 bg-white hover:border-emerald-200'
                }`}
              >
                <LayoutTemplate size={24} className={format === 'CSV' ? 'text-emerald-600' : 'text-slate-400'} />
                <div>
                  <p className={`text-xs font-bold ${format === 'CSV' ? 'text-emerald-700' : 'text-slate-700'}`}>CSV Data</p>
                  <p className="text-[10px] text-slate-400">Raw Excel tables</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Include Data Modules ({selectedModules.length} selected)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {availableModules.map(module => (
                <div 
                  key={module}
                  onClick={() => toggleModule(module)}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer text-xs transition-colors ${
                    selectedModules.includes(module) ? 'bg-blue-50/50 border-blue-200 font-bold text-blue-900' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    selectedModules.includes(module) ? 'bg-blue-500 text-white' : 'text-slate-300'
                  }`}>
                    {selectedModules.includes(module) ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                  </div>
                  <span className="truncate">{module}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
            >
              <Download size={16} /> {isSubmitting ? 'Building...' : 'Generate & Download'}
            </button>
          </div>

        </form>
      </div>
    </>
  );
}
