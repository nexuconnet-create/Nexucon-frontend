"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Box, Eye, Settings, Download, Share2, MoreVertical, Layers } from "lucide-react";

export default function BIMModels() {
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const models = [
    { id: 1, name: "Downtown Metro Station - Architecture", discipline: "Architecture", size: "345 MB", date: "Oct 12, 2026", version: "v2.4", status: "Active" },
    { id: 2, name: "Riverside Commercial - MEP", discipline: "MEP", size: "1.2 GB", date: "Oct 10, 2026", version: "v1.1", status: "Review" },
    { id: 3, name: "Highway Bridge A4 - Structural", discipline: "Structural", size: "850 MB", date: "Oct 09, 2026", version: "v3.0", status: "Approved" },
    { id: 4, name: "City Hospital Annex - Full Facility", discipline: "Multi-Disciplinary", size: "4.5 GB", date: "Oct 08, 2026", version: "v5.2", status: "Active" },
  ];

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Architecture': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'MEP': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Structural': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-purple-600 bg-purple-50 border-purple-100';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">BIM Models</h1>
          <p className="text-gray-500 mt-1">Repository of all active Building Information Models.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search models by name or discipline..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          <button 
            onClick={() => setView('grid')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Grid
          </button>
          <button 
            onClick={() => setView('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
          >
            List
          </button>
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={model.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer"
            >
              {/* 3D Model Placeholder */}
              <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm transform group-hover:scale-110 transition-transform duration-500">
                  <Box size={48} className="text-[#022C4F]/40" />
                </div>
                
                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button className="p-1.5 bg-white hover:bg-gray-50 rounded-lg text-gray-600 shadow-md transition-colors"><Eye size={14} /></button>
                  <button className="p-1.5 bg-white hover:bg-gray-50 rounded-lg text-gray-600 shadow-md transition-colors"><Download size={14} /></button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {model.name}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 shrink-0"><MoreVertical size={16} /></button>
                </div>
                
                <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getDisciplineColor(model.discipline)} mb-4`}>
                  {model.discipline}
                </span>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase">Version</span>
                    <span className="text-gray-700">{model.version}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase">Size</span>
                    <span className="text-gray-700">{model.size}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-gray-400 text-[10px] uppercase">Last Updated</span>
                    <span className="text-gray-700">{model.date}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Model Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Discipline</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Version</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Last Updated</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Box size={20} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{model.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getDisciplineColor(model.discipline)}`}>
                      {model.discipline}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold font-mono">
                      {model.version}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm text-gray-600 font-medium">{model.date}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Eye size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><Download size={16} /></button>
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"><MoreVertical size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
