"use client";

import React, { useState } from 'react';
import { X, Sparkles, CheckCircle2, FileText, ShieldCheck, Download, Layers, Palette } from 'lucide-react';
import { ReportTemplate, setActiveReportTemplate } from '@/services/settings';

interface ReportTemplatePreviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate | null;
  onSuccess?: () => void;
}

export default function ReportTemplatePreviewDrawer({
  isOpen,
  onClose,
  template,
  onSuccess
}: ReportTemplatePreviewDrawerProps) {
  const [isActivating, setIsActivating] = useState(false);

  if (!isOpen || !template) return null;

  const handleSetActive = async () => {
    setIsActivating(true);
    try {
      await setActiveReportTemplate(template.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `"${template.name}" is now the active default report template across the entire dashboard!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to set active template', type: 'error' } }));
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[680px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100 shrink-0">
              <Sparkles size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                {template.name}
              </h2>
              <p className="text-xs text-gray-500 font-medium">Executive Formatting, Cover Layout & Footer Preview</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mb-6 leading-relaxed">
            {template.description || "Executive layout engineered for clear communication with non-technical stakeholders, ministerial boards, and civic authorities."}
          </p>

          {/* Theme Palette Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Theme Style</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{template.theme_style}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">Cover Layout</span>
              <span className="text-xs font-bold text-slate-900 mt-0.5 block">{template.cover_page_style}</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase text-slate-400 block">Color Palette</span>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: template.header_color }} />
                  <span className="w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: template.accent_color }} />
                </div>
              </div>
            </div>
          </div>

          {/* Mock Document Visual Rendering */}
          <div className="p-5 border border-slate-200 rounded-3xl bg-slate-100 shadow-inner space-y-4 mb-6">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Palette size={14} /> Real-Time Document Visual Sample
            </div>

            {/* Cover Page Header Mock */}
            <div 
              className="p-5 rounded-2xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${template.header_color} 0%, #031e36 100%)` }}
            >
              <div className="flex items-center justify-between border-b border-white/20 pb-2 mb-3">
                <span 
                  className="text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: template.accent_color }}
                >
                  {template.name}
                </span>
                <span className="text-[9px] opacity-80 font-mono">NEXUCON STATUTORY SUITE</span>
              </div>
              <h3 className="text-base font-black tracking-tight">Statewide Infrastructure &amp; Structural Safety Audit</h3>
              <p className="text-[11px] text-slate-300 mt-0.5">Central Regulatory Enforcement &amp; Built-Environment Authority</p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t border-white/10 text-[9px]">
                <div><span className="opacity-60 block">Reference:</span><strong>NX-STAT-2026-B1</strong></div>
                <div><span className="opacity-60 block">Period:</span><strong>Q3 2026</strong></div>
                <div><span className="opacity-60 block">Officer:</span><strong>Engr. Director</strong></div>
                <div><span className="opacity-60 block">Status:</span><strong>Certified</strong></div>
              </div>
            </div>

            {/* Statutory Building Codes Box */}
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
                <ShieldCheck size={16} className="text-emerald-700" />
                Nigerian Building Code &amp; SON Standards Citations
              </h4>
              <ul className="text-[11px] text-emerald-900 space-y-1 list-disc pl-4">
                {template.building_code_citations?.map((c, i) => (
                  <li key={i}><strong>{c}</strong></li>
                ))}
              </ul>
            </div>

            {/* Project & Client Custom Footer */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] text-slate-700">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Client / Procuring Entity:</span>
                  <strong>Lagos State Ministry of Physical Planning &amp; Urban Development</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Project &amp; LGA Zone:</span>
                  <strong>Lekki Coastal Expressway (Ibeju-Lekki Zone B)</strong>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 italic text-center">
                {template.footer_config?.disclaimer || "Confidential statutory document issued under the National Building Code of Nigeria & SON regulations."}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            {template.is_active_default ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                <CheckCircle2 size={16} /> Currently Active Default Template
              </span>
            ) : (
              <span className="text-xs text-gray-500">
                Clicking apply will set this as the default style for all exported PDF / HTML reports.
              </span>
            )}

            <button
              onClick={handleSetActive}
              disabled={isActivating || template.is_active_default}
              className="px-8 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-slate-900/10 flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 size={15} />
              {template.is_active_default ? 'Active Template' : 'Set as Active Dashboard Template'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
