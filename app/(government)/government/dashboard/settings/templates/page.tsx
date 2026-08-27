"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileText, Plus, Settings, CheckSquare, Search, Trash2, 
  RefreshCw, Sparkles, CheckCircle2, Eye, ShieldCheck, Palette, Layers, Award
} from "lucide-react";
import { 
  InspectionTemplate, getInspectionTemplates, addChecklistItem, 
  deleteInspectionTemplate, ReportTemplate, getReportTemplates, 
  setActiveReportTemplate 
} from "@/services/settings";
import CreateInspectionTemplateDrawer from "@/components/dashboard/CreateInspectionTemplateDrawer";
import ReportTemplatePreviewDrawer from "@/components/dashboard/ReportTemplatePreviewDrawer";

export default function TemplatesPage() {
  const [activeTab, setActiveTab] = useState<'inspection' | 'report'>('report');
  
  // Inspection Templates State
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateInspectionOpen, setIsCreateInspectionOpen] = useState(false);

  // Report Templates State
  const [reportTemplates, setReportTemplates] = useState<ReportTemplate[]>([]);
  const [selectedReportTemplate, setSelectedReportTemplate] = useState<ReportTemplate | null>(null);
  const [isPreviewReportOpen, setIsPreviewReportOpen] = useState(false);

  const fetchInspectionTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInspectionTemplates();
      setTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load inspection templates", err);
      setTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchReportTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getReportTemplates();
      setReportTemplates(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load report templates", err);
      setReportTemplates([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInspectionTemplates();
    fetchReportTemplates();
  }, [fetchInspectionTemplates, fetchReportTemplates]);

  const activeTemplate = templates[selectedIdx] || null;

  const handleAddItem = async () => {
    if (!activeTemplate) return;
    const title = window.prompt("Enter new inspection question/directive:");
    if (!title?.trim()) return;

    try {
      await addChecklistItem(activeTemplate.id, {
        title: title.trim(),
        field_type: "Pass/Fail Toggle",
        is_required: true
      });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "New checklist item added!", type: "success" } 
      }));
      fetchInspectionTemplates();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to add item", type: "error" } }));
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm("Are you sure you want to delete this template?")) return;
    try {
      await deleteInspectionTemplate(templateId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Inspection template deleted.", type: "info" } 
      }));
      fetchInspectionTemplates();
      setSelectedIdx(0);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to delete template", type: "error" } }));
    }
  };

  const handleSetActiveReport = async (templateId: string, templateName: string) => {
    try {
      await setActiveReportTemplate(templateId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `"${templateName}" is now active! All exports across the dashboard will use this design.`, type: "success" } 
      }));
      fetchReportTemplates();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to set active report template", type: "error" } }));
    }
  };

  const filteredTemplates = templates.filter(t => 
    !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Inspection &amp; Report Templates
          </h1>
          <p className="text-gray-500 mt-1">Configure field inspection checklists and select executive report presentation templates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => { fetchInspectionTemplates(); fetchReportTemplates(); }}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          {activeTab === 'inspection' && (
            <button 
              onClick={() => setIsCreateInspectionOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold cursor-pointer"
            >
              <Plus size={16} />
              New Checklist
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-3">
        <button
          onClick={() => setActiveTab('report')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'report' 
              ? 'bg-[#022C4F] text-white shadow-md shadow-slate-900/10' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <Sparkles size={16} className={activeTab === 'report' ? 'text-amber-400' : 'text-gray-400'} />
          Executive Report Presentation Templates ({reportTemplates.length})
        </button>
        <button
          onClick={() => setActiveTab('inspection')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === 'inspection' 
              ? 'bg-[#022C4F] text-white shadow-md shadow-slate-900/10' 
              : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          <CheckSquare size={16} className={activeTab === 'inspection' ? 'text-blue-400' : 'text-gray-400'} />
          Field Inspection Checklists ({templates.length})
        </button>
      </div>

      {/* TAB 1: EXECUTIVE REPORT TEMPLATES */}
      {activeTab === 'report' && (
        <div className="space-y-6">
          <div className="p-6 bg-gradient-to-r from-blue-900 to-[#022C4F] rounded-3xl text-white shadow-md">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold uppercase px-3 py-1 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  Global Dashboard Impact
                </span>
                <h2 className="text-xl font-black mt-2">Executive Report Templates &amp; Nigerian Building Codes</h2>
                <p className="text-xs text-blue-100 mt-1 max-w-2xl leading-relaxed">
                  Selecting a default presentation template instantly reformats all report downloads and analytics exports across the dashboard with detailed cover pages, project-specific footers, and National Building Code / SON statutory standards.
                </p>
              </div>
              <Sparkles className="text-amber-400 shrink-0 hidden sm:block" size={36} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reportTemplates.map((tpl, idx) => (
              <motion.div
                key={tpl.id || idx}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all shadow-sm hover:shadow-md ${
                  tpl.is_active_default ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-gray-100'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          {tpl.id}
                        </span>
                        {tpl.is_active_default && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 size={12} /> Active Default
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-extrabold text-gray-900 mt-1">{tpl.name}</h3>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: tpl.header_color }} />
                      <span className="w-4 h-4 rounded-full border border-gray-200 shadow-sm" style={{ backgroundColor: tpl.accent_color }} />
                    </div>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-4">
                    {tpl.description}
                  </p>

                  {/* Attributes */}
                  <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-gray-50 border border-gray-100 rounded-2xl text-[11px]">
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Theme Style</span>
                      <strong className="text-gray-800">{tpl.theme_style}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[9px] uppercase font-bold">Cover Layout</span>
                      <strong className="text-gray-800">{tpl.cover_page_style}</strong>
                    </div>
                  </div>

                  {/* Referenced Codes */}
                  <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1.5 flex items-center gap-1">
                      <ShieldCheck size={13} className="text-emerald-600" /> Nigerian Building Codes &amp; SON References
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {tpl.building_code_citations?.slice(0, 2).map((code, cIdx) => (
                        <span key={cIdx} className="text-[10px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-lg truncate max-w-xs">
                          {code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                  <button
                    onClick={() => {
                      setSelectedReportTemplate(tpl);
                      setIsPreviewReportOpen(true);
                    }}
                    className="px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Eye size={14} /> Preview Layout
                  </button>

                  <button
                    onClick={() => handleSetActiveReport(tpl.id, tpl.name)}
                    disabled={tpl.is_active_default}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      tpl.is_active_default 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default' 
                        : 'bg-[#022C4F] hover:bg-[#033c6c] text-white shadow-sm'
                    }`}
                  >
                    <CheckCircle2 size={14} />
                    {tpl.is_active_default ? 'Active Default' : 'Set as Active'}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: INSPECTION CHECKLIST TEMPLATES */}
      {activeTab === 'inspection' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Col: Template List */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-4">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                   <input 
                     type="text" 
                     value={search}
                     onChange={(e) => setSearch(e.target.value)}
                     placeholder="Search checklists..." 
                     className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                   />
                 </div>
              </div>
              
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {filteredTemplates.map((tpl, idx) => (
                  <div 
                    key={tpl.id || idx} 
                    onClick={() => setSelectedIdx(idx)}
                    className={`p-5 cursor-pointer transition-colors ${
                      selectedIdx === idx ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className={`text-sm font-bold leading-tight ${selectedIdx === idx ? 'text-blue-700' : 'text-gray-900'}`}>{tpl.name}</h3>
                      <span className={`shrink-0 ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg border ${
                        tpl.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {tpl.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
                      <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-gray-200 text-[10px]">{tpl.id}</span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{tpl.department}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                       <span>{tpl.items?.length || 0} Check Items</span>
                       <span>{tpl.version}</span>
                    </div>
                  </div>
                ))}

                {filteredTemplates.length === 0 && !isLoading && (
                  <div className="p-12 text-center text-gray-400 text-xs">
                    No inspection templates found.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Col: Template Builder View */}
          <div className="flex-1">
            {activeTemplate ? (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-3">
                      {activeTemplate.name}
                      <span className="text-xs font-mono bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500">{activeTemplate.version}</span>
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Discipline: <span className="font-bold text-gray-700">{activeTemplate.department}</span></p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteTemplate(activeTemplate.id)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                      title="Delete Template"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button 
                      onClick={handleAddItem}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                    >
                      <Plus size={14} /> Add Item
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-3">
                    {activeTemplate.items?.map((item, idx) => (
                      <div key={item.id || idx} className="p-4 bg-gray-50/70 border border-gray-100 rounded-2xl flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div>
                            <p className="text-xs font-bold text-gray-900">{item.title}</p>
                            <span className="text-[10px] font-semibold text-gray-400 mt-0.5 block">{item.field_type}</span>
                          </div>
                        </div>

                        {item.is_required && (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold rounded-lg shrink-0">
                            Required
                          </span>
                        )}
                      </div>
                    ))}

                    {(!activeTemplate.items || activeTemplate.items.length === 0) && (
                      <div className="p-8 text-center text-gray-400 text-xs">
                        No checklist items in this template. Click &ldquo;Add Item&rdquo; to add questions.
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center bg-white rounded-3xl border border-gray-100 text-gray-400 text-xs">
                Select an inspection template to inspect checklist items.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Drawers */}
      <CreateInspectionTemplateDrawer
        isOpen={isCreateInspectionOpen}
        onClose={() => setIsCreateInspectionOpen(false)}
        onSuccess={fetchInspectionTemplates}
      />

      <ReportTemplatePreviewDrawer
        isOpen={isPreviewReportOpen}
        onClose={() => setIsPreviewReportOpen(false)}
        template={selectedReportTemplate}
        onSuccess={fetchReportTemplates}
      />
    </div>
  );
}
