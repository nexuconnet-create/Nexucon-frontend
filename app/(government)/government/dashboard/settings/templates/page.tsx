"use client";

import React from "react";
import { motion } from "framer-motion";
import { FileText, Plus, Settings, CheckSquare, Search, Copy, Trash2, Edit3 } from "lucide-react";

export default function InspectionTemplates() {
  const templates = [
    {
      id: "TPL-091",
      name: "Deep Foundation Pour Checklist",
      department: "Structural",
      items: 12,
      lastUpdated: "Oct 01, 2026",
      status: "Active"
    },
    {
      id: "TPL-088",
      name: "Environmental Site Perimeter Check",
      department: "Environmental",
      items: 8,
      lastUpdated: "Sep 15, 2026",
      status: "Active"
    },
    {
      id: "TPL-045",
      name: "HVAC Rough-In Inspection",
      department: "MEP",
      items: 24,
      lastUpdated: "Aug 22, 2026",
      status: "Draft"
    }
  ];

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
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Plus size={16} />
            New Template
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Col: Template List */}
        <div className="w-full lg:w-[400px] shrink-0 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
               <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                 <input 
                   type="text" 
                   placeholder="Search templates..." 
                   className="pl-9 pr-4 py-2 w-full bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                 />
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {templates.map((tpl, idx) => (
                <div key={idx} className={`p-5 cursor-pointer transition-colors ${idx === 0 ? 'bg-blue-50/50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className={`text-sm font-bold leading-tight ${idx === 0 ? 'text-blue-700' : 'text-gray-900'}`}>{tpl.name}</h3>
                    <span className={`shrink-0 ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                      tpl.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {tpl.status}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3">
                    <span className="font-mono bg-white px-1 py-0.5 rounded border border-gray-200">{tpl.id}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{tpl.department}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-400 font-semibold">
                     <span>{tpl.items} Check Items</span>
                     <span>Updated: {tpl.lastUpdated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Template Builder Mockup */}
        <div className="flex-1">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex flex-col"
          >
            {/* Builder Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
               <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-1">Deep Foundation Pour Checklist</h2>
                  <p className="text-sm font-semibold text-gray-500">ID: TPL-091 • Department: Structural</p>
               </div>
               <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                     <Edit3 size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-transparent hover:border-gray-200">
                     <Copy size={18} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200">
                     <Trash2 size={18} />
                  </button>
               </div>
            </div>

            {/* Builder Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50">
               <div className="max-w-2xl mx-auto space-y-4">
                  {/* Checklist Item 1 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                     <div className="mt-1 text-gray-400 cursor-move">
                        <Settings size={16} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item 1 • Number Input</span>
                           <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">Required</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Record concrete slump measurement (inches)</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-400 font-mono">
                           [ Number Input Field ]
                        </div>
                     </div>
                  </div>

                  {/* Checklist Item 2 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                     <div className="mt-1 text-gray-400 cursor-move">
                        <Settings size={16} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item 2 • Pass/Fail Toggle</span>
                           <span className="text-[10px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded border border-red-100">Required</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Are all rebar ties secure and spaced according to plan?</p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-sm text-gray-400 font-mono flex gap-2">
                           <span className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-500">Pass</span>
                           <span className="px-3 py-1 bg-white border border-gray-200 rounded text-gray-500">Fail</span>
                        </div>
                     </div>
                  </div>

                  {/* Checklist Item 3 */}
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4">
                     <div className="mt-1 text-gray-400 cursor-move">
                        <Settings size={16} />
                     </div>
                     <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                           <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Item 3 • Photo Upload</span>
                           <span className="text-[10px] font-bold text-gray-500 px-2 py-0.5 rounded border border-gray-200 bg-gray-50">Optional</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mb-2">Upload wide-angle photo of trench before pour</p>
                        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg p-6 text-sm text-gray-400 font-mono text-center">
                           [ Image Upload Area ]
                        </div>
                     </div>
                  </div>

                  <button className="w-full py-4 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-bold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2">
                     <Plus size={16} /> Add New Check Item
                  </button>
               </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
