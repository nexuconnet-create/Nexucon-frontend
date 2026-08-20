"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Filter, Box, Eye, Settings, Download, Share2, MoreVertical, Layers, Plus, RefreshCw, Award, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { BIMModel, getBIMModels } from "@/services/bim";
import UploadBIMModelDrawer from "@/components/dashboard/UploadBIMModelDrawer";
import CertifyBIMModelModal from "@/components/dashboard/CertifyBIMModelModal";
import UploadBIMVersionModal from "@/components/dashboard/UploadBIMVersionModal";

export default function BIMModels() {
  const router = useRouter();
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [models, setModels] = useState<BIMModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');

  // Modals
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);

  const fetchModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedDiscipline !== 'all') params.discipline = selectedDiscipline;
      const data = await getBIMModels(params);
      setModels(data);
    } catch (err) {
      console.error("Failed to load BIM models", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedDiscipline]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Architecture': return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'MEP': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'Structural': return 'text-amber-600 bg-amber-50 border-amber-100';
      default: return 'text-purple-600 bg-purple-50 border-purple-100';
    }
  };

  const handleDownload = (model: BIMModel) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading ${model.name} (${model.format} • ${model.file_size})...`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">BIM Models Repository</h1>
          <p className="text-gray-500 mt-1">Multi-disciplinary 3D building information models and IFC schemas.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Upload BIM Model</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search models by name or discipline..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="p-2 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 focus:outline-none"
          >
            <option value="all">All Disciplines</option>
            <option value="Architecture">Architecture</option>
            <option value="MEP">MEP</option>
            <option value="Structural">Structural</option>
            <option value="Multi-Disciplinary">Multi-Disciplinary</option>
          </select>
          <button 
            onClick={fetchModels}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
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

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-semibold">Loading BIM models...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-gray-100 p-8">
          <Box size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No BIM models registered yet.</p>
          <button onClick={() => setIsUploadDrawerOpen(true)} className="mt-3 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
            Upload Initial Model
          </button>
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {models.map((model, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={model.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-xl hover:-translate-y-1 transition-all"
            >
              {/* 3D Model Placeholder */}
              <div 
                onClick={() => router.push(`/government/dashboard/bim/review`)}
                className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden cursor-pointer"
              >
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
                <div className="relative z-10 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/40 shadow-sm transform group-hover:scale-110 transition-transform duration-500">
                  <Box size={48} className="text-[#022C4F]/40" />
                </div>
                
                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <button 
                    onClick={(e) => { e.stopPropagation(); router.push('/government/dashboard/bim/review'); }} 
                    className="p-1.5 bg-white hover:bg-gray-50 rounded-lg text-gray-600 shadow-md transition-colors"
                    title="Open in Viewer"
                  >
                    <Eye size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDownload(model); }} 
                    className="p-1.5 bg-white hover:bg-gray-50 rounded-lg text-gray-600 shadow-md transition-colors"
                    title="Download Model"
                  >
                    <Download size={14} />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); setSelectedModel(model); setIsCertifyModalOpen(true); }} 
                    className="p-1.5 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-emerald-700 shadow-md transition-colors"
                    title="Certify Model"
                  >
                    <Award size={14} />
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 
                    onClick={() => router.push(`/government/dashboard/bim/review`)}
                    className="font-bold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                  >
                    {model.name}
                  </h3>
                  <button 
                    onClick={() => { setSelectedModel(model); setIsVersionModalOpen(true); }}
                    className="text-gray-400 hover:text-blue-600 shrink-0 p-1"
                    title="Push Revision"
                  >
                    <UploadCloud size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 mb-4">
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getDisciplineColor(model.discipline)}`}>
                    {model.discipline}
                  </span>
                  {model.is_digitally_certified && (
                    <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Certified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-y-2 text-xs text-gray-500 font-medium">
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase">Version</span>
                    <span className="text-gray-700 font-mono font-bold">{model.current_version}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400 text-[10px] uppercase">Size</span>
                    <span className="text-gray-700">{model.file_size}</span>
                  </div>
                  <div className="flex flex-col col-span-2">
                    <span className="text-gray-400 text-[10px] uppercase">Project</span>
                    <span className="text-gray-700 truncate">{model.project_name || 'Downtown Metro'}</span>
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
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {models.map((model) => (
                <tr key={model.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                        <Box size={20} className="text-gray-400" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors block">{model.name}</span>
                        <span className="text-xs text-gray-400">{model.model_reference} • {model.file_size}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getDisciplineColor(model.discipline)}`}>
                      {model.discipline}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-bold font-mono">
                      {model.current_version}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                      model.is_digitally_certified ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {model.is_digitally_certified ? 'Certified' : model.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => router.push('/government/dashboard/bim/review')}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Open Review"
                      >
                        <Eye size={16} />
                      </button>
                      <button 
                        onClick={() => handleDownload(model)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                        title="Download"
                      >
                        <Download size={16} />
                      </button>
                      <button 
                        onClick={() => { setSelectedModel(model); setIsCertifyModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded"
                        title="Certify"
                      >
                        <Award size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals & Drawers */}
      <UploadBIMModelDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSuccess={fetchModels}
      />

      <CertifyBIMModelModal
        isOpen={isCertifyModalOpen}
        onClose={() => setIsCertifyModalOpen(false)}
        model={selectedModel}
        onSuccess={fetchModels}
      />

      <UploadBIMVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        model={selectedModel}
        onSuccess={fetchModels}
      />
    </div>
  );
}
