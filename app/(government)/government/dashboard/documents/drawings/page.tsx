"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, Download, Maximize, Share2, Layers, Plus, RefreshCw, Eye } from "lucide-react";
import { Document, getDocuments } from "@/services/documents";
import UploadDocumentDrawer from "@/components/dashboard/UploadDocumentDrawer";

export default function SubmittedDrawings() {
  const [drawings, setDrawings] = useState<Document[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);

  const fetchDrawings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { type: 'DRAWING' };
      if (selectedDiscipline !== 'All') params.discipline = selectedDiscipline;
      if (searchQuery) params.search = searchQuery;

      const data = await getDocuments(params);
      setDrawings(data);
    } catch (err) {
      console.error("Failed to load submitted drawings", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDiscipline, searchQuery]);

  useEffect(() => {
    fetchDrawings();
  }, [fetchDrawings]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-emerald-500 text-white border-emerald-600 shadow-emerald-500/20';
      case 'UNDER_REVIEW':
      case 'PENDING_REVIEW': return 'bg-amber-400 text-white border-amber-500 shadow-amber-500/20';
      case 'REJECTED': return 'bg-red-500 text-white border-red-600 shadow-red-500/20';
      default: return 'bg-blue-500 text-white border-blue-600 shadow-blue-500/20';
    }
  };

  const handleDownload = (dwg: Document) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading drawing "${dwg.title}" (${dwg.file_size})...`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Submitted 2D Drawings & Blueprints
          </h1>
          <p className="text-gray-500 mt-1">Review, approve, and manage official 2D architectural and structural plans.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Upload Drawing</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search drawing title, reference or author..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            onClick={fetchDrawings}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {['All', 'Architecture', 'Structural', 'MEP', 'Planning'].map(filter => (
            <button 
              key={filter} 
              onClick={() => setSelectedDiscipline(filter)}
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                selectedDiscipline === filter 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading blueprints from Cloudflare R2...</div>
      ) : drawings.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-gray-100 p-8">
          <FileText size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No submitted drawings found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {drawings.map((dwg, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.04 }}
              key={dwg.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer flex flex-col"
            >
              {/* Blueprint Thumbnail */}
              <div className="h-48 bg-[#0a192f] relative overflow-hidden flex items-center justify-center p-4">
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }}></div>
                
                <div className="w-full h-full border-2 border-blue-500/30 rounded-xl relative z-10 flex items-center justify-center">
                  <FileText size={48} className="text-blue-500/40" />
                  <div className="absolute inset-4 border border-blue-500/20 rounded"></div>
                </div>

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-20">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border shadow-sm ${getStatusColor(dwg.status)}`}>
                    {dwg.status}
                  </span>
                </div>

                {/* Action Overlay */}
                <div className="absolute inset-0 bg-blue-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity z-30 flex items-center justify-center gap-3">
                  <button 
                    onClick={() => handleDownload(dwg)} 
                    className="p-3 bg-white text-blue-600 rounded-full hover:scale-110 shadow-lg transition-transform" 
                    title="Download Drawing"
                  >
                    <Download size={20} />
                  </button>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
                    {dwg.title}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">{dwg.document_reference}</span>
                  <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{dwg.current_version}</span>
                  <span className="text-[10px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded bg-white">{dwg.file_format}</span>
                </div>

                <div className="mt-auto grid grid-cols-2 gap-y-3 border-t border-gray-100 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Discipline</span>
                    <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Layers size={14} className="opacity-70" /> {dwg.discipline}
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Author</span>
                    <span className="text-xs font-semibold text-gray-700">{dwg.uploader_name}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mb-0.5">Project</span>
                    <span className="text-xs font-semibold text-gray-700 truncate">{dwg.project_name || 'Downtown Metro'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <UploadDocumentDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSuccess={fetchDrawings}
      />
    </div>
  );
}
