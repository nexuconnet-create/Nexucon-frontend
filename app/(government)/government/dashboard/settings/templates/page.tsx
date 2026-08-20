"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Settings, CheckSquare, Search, Copy, Trash2, Edit3, RefreshCw } from "lucide-react";
import { InspectionTemplate, getInspectionTemplates, addChecklistItem, deleteInspectionTemplate } from "@/services/settings";
import CreateTemplateModal from "@/components/dashboard/CreateTemplateModal";

export default function InspectionTemplates() {
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInspectionTemplates();
      setTemplates(data);
    } catch (err) {
      console.error("Failed to load templates", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

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
      fetchTemplates();
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
      fetchTemplates();
      setSelectedIdx(0);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to delete template", type: "error" } }));
    }
  };

  const filteredTemplates = templates.filter(t => 
    !search.trim() || t.name.toLowerCase().includes(search.toLowerCase()) || t.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckSquare className="text-blue-500" />
            Inspection Templates
          </h1>
          <p className="text-gray-500 mt-1">Manage standard checklists and data-collection forms for field inspectors.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTemplates}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold"
          >
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

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
                   placeholder="Search templates..." 
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
              className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex flex-col"
            >
              {/* Builder Header */}
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                 <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{activeTemplate.name}</h2>
                    <p className="text-xs font-semibold text-gray-500 font-mono">ID: {activeTemplate.id} • Department: {activeTemplate.department}</p>
                 </div>
                 <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleDeleteTemplate(activeTemplate.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors border border-transparent hover:border-red-200"
                      title="Delete Template"
                    >
                       <Trash2 size={18} />
                    </button>
                 </div>
              </div>

              {/* Builder Body */}
              <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
                 <div className="max-w-2xl mx-auto space-y-4">
                    {activeTemplate.items?.map((item, iIdx) => (
                      <div key={item.id || iIdx} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex items-start gap-4">
                         <div className="mt-1 text-gray-400">
                            <Settings size={16} />
                         </div>
                         <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                               <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item {iIdx + 1} • {item.field_type}</span>
                               <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                 item.is_required ? 'bg-red-50 text-red-600 border-red-100' : 'bg-gray-50 text-gray-500 border-gray-200'
                               }`}>
                                 {item.is_required ? 'Required' : 'Optional'}
                               </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900 mb-2">{item.title}</p>
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs text-gray-400 font-mono">
                               [ {item.field_type} ]
                            </div>
                         </div>
                      </div>
                    ))}

                    <button 
                      onClick={handleAddItem}
                      className="w-full py-4 border-2 border-dashed border-blue-200 rounded-2xl text-blue-600 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                    >
                       <Plus size={16} /> Add New Check Item
                    </button>
                 </div>
              </div>
            </motion.div>
          ) : (
            <div className="h-[600px] bg-white rounded-3xl border border-gray-100 flex items-center justify-center text-xs text-gray-400">
              Select a template to view checklist items
            </div>
          )}
        </div>
      </div>

      <CreateTemplateModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchTemplates}
      />
    </div>
  );
}
