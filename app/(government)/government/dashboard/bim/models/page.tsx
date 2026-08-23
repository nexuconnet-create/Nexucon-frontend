"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, Box, Eye, Download, Award, UploadCloud, 
  Folder, FolderOpen, ChevronRight, ArrowLeft, Layers, 
  Building2, CheckCircle, ShieldCheck, Clock, HardDrive, 
  FileText, Plus, RefreshCw, LayoutGrid, List, ChevronDown, 
  MapPin, Check, Sparkles
} from "lucide-react";
import { useRouter } from "next/navigation";
import { BIMModel, getBIMModels } from "@/services/bim";
import { getProjects, Project } from "@/services/projects";
import UploadBIMModelDrawer from "@/components/dashboard/UploadBIMModelDrawer";
import CertifyBIMModelModal from "@/components/dashboard/CertifyBIMModelModal";
import UploadBIMVersionModal from "@/components/dashboard/UploadBIMVersionModal";

export default function BIMModelsRepository() {
  const router = useRouter();
  const [models, setModels] = useState<BIMModel[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFolderProjectId, setActiveFolderProjectId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'folders' | 'grid' | 'list'>('folders');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');

  // Modals & Drawers
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [modelsData, projectsData] = await Promise.all([
        getBIMModels(),
        getProjects()
      ]);
      setModels(modelsData);
      const pList = Array.isArray(projectsData) ? projectsData : ((projectsData as any).results || []);
      setProjects(pList);
    } catch (err) {
      console.error("Failed to load BIM models & projects", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Group models by Project Folder
  const projectFolders = useMemo(() => {
    return projects.map(proj => {
      const projModels = models.filter(m => m.project === proj.id || (m.project_name && m.project_name.toLowerCase() === proj.name.toLowerCase()));
      const totalElements = projModels.reduce((sum, m) => sum + (m.element_count || 0), 0);
      const certifiedCount = projModels.filter(m => m.is_digitally_certified).length;
      const disciplines = Array.from(new Set(projModels.map(m => m.discipline).filter(Boolean)));
      
      return {
        project: proj,
        models: projModels,
        modelsCount: projModels.length,
        totalElements,
        certifiedCount,
        disciplines
      };
    });
  }, [projects, models]);

  // Active project folder details
  const activeFolder = useMemo(() => {
    if (!activeFolderProjectId) return null;
    return projectFolders.find(f => f.project.id === activeFolderProjectId) || null;
  }, [activeFolderProjectId, projectFolders]);

  // Filtered models for current view
  const displayModels = useMemo(() => {
    let list = models;
    if (activeFolderProjectId) {
      list = list.filter(m => m.project === activeFolderProjectId || (m.project_name && activeFolder?.project.name && m.project_name.toLowerCase() === activeFolder.project.name.toLowerCase()));
    }
    if (selectedDiscipline !== 'all') {
      list = list.filter(m => (m.discipline || '').toLowerCase() === selectedDiscipline.toLowerCase());
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m => 
        (m.name || '').toLowerCase().includes(q) ||
        (m.discipline || '').toLowerCase().includes(q) ||
        (m.project_name || '').toLowerCase().includes(q) ||
        (m.model_reference || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [models, activeFolderProjectId, selectedDiscipline, searchQuery, activeFolder]);

  const getDisciplineColor = (discipline: string) => {
    switch (discipline) {
      case 'Architecture': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'MEP': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Structural': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-purple-700 bg-purple-50 border-purple-200';
    }
  };

  const handleDownload = (model: BIMModel) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading ${model.name} (${model.format} • ${model.file_size})...`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
            <button 
              onClick={() => { setActiveFolderProjectId(null); setViewMode('folders'); }}
              className="hover:text-blue-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Folder size={14} className="text-amber-500" />
              <span>BIM Repository</span>
            </button>
            {activeFolder && (
              <>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-black text-[#022C4F] flex items-center gap-1">
                  <Building2 size={13} className="text-blue-600" />
                  {activeFolder.project.name}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F]">
            {activeFolder ? activeFolder.project.name : 'BIM Models Repository'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {activeFolder 
              ? `Project Folder • ${activeFolder.modelsCount} Multi-Disciplinary BIM Models (${activeFolder.totalElements.toLocaleString()} Total Elements)`
              : 'Multi-disciplinary 3D building information models organized by project directories.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFolder && (
            <button
              onClick={() => { setActiveFolderProjectId(null); setViewMode('folders'); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold shadow-sm cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>All Project Folders</span>
            </button>
          )}
          <button 
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <Plus size={17} />
            <span>Upload BIM Model</span>
          </button>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder={activeFolder ? "Search models in this project folder..." : "Search project folders or model names..."} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2.5 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={selectedDiscipline}
            onChange={(e) => setSelectedDiscipline(e.target.value)}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Disciplines</option>
            <option value="Architecture">Architecture</option>
            <option value="MEP">MEP Services</option>
            <option value="Structural">Structural Frame</option>
            <option value="Multi-Disciplinary">Multi-Disciplinary</option>
          </select>
          <button 
            onClick={fetchData}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors shrink-0"
            title="Refresh Repository"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        {/* View Mode Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
          <button 
            onClick={() => { setActiveFolderProjectId(null); setViewMode('folders'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'folders' && !activeFolderProjectId ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <Folder size={14} className={viewMode === 'folders' && !activeFolderProjectId ? 'text-amber-500' : ''} />
            <span>Project Folders</span>
          </button>
          <button 
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <LayoutGrid size={14} />
            <span>Grid View</span>
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
          >
            <List size={14} />
            <span>Table View</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-xs font-bold text-slate-600">Loading BIM project repository...</p>
        </div>
      ) : (
        <>
          {/* VIEW 1: TOP-LEVEL PROJECT FOLDERS HIERARCHY */}
          {viewMode === 'folders' && !activeFolderProjectId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <FolderOpen size={16} className="text-amber-500" />
                  Project Directories ({projectFolders.length} Active Sites)
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Total Models: {models.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectFolders.map((folder, idx) => (
                  <motion.div
                    key={folder.project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => {
                      setActiveFolderProjectId(folder.project.id);
                    }}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Row: Folder Icon + Model Count Pill */}
                      <div className="flex items-center justify-between">
                        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 group-hover:scale-105 transition-all shadow-sm">
                          <Folder size={26} className="fill-amber-500/20 text-amber-600" />
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-black flex items-center gap-1.5">
                          <Box size={13} />
                          {folder.modelsCount} {folder.modelsCount === 1 ? 'Model' : 'Models'}
                        </span>
                      </div>

                      {/* Project Details */}
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                          {folder.project.reference_number || 'Lagos State Permitted'}
                        </span>
                        <h4 className="text-base font-black text-[#022C4F] group-hover:text-blue-600 transition-colors line-clamp-1">
                          {folder.project.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{folder.project.site_address || folder.project.lga || 'Lagos State'}</span>
                        </p>
                      </div>

                      {/* Discipline Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {folder.disciplines.length > 0 ? (
                          folder.disciplines.map(d => (
                            <span key={d} className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getDisciplineColor(d)}`}>
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            Empty folder • Click to upload model
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Metadata Strip */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-3">
                        <span title="Total Verified Elements" className="flex items-center gap-1">
                          <Layers size={13} className="text-slate-400" />
                          {folder.totalElements.toLocaleString()} elem
                        </span>
                        {folder.certifiedCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                            <ShieldCheck size={13} className="text-emerald-600" />
                            {folder.certifiedCount} Certified
                          </span>
                        )}
                      </div>
                      <ChevronRight size={16} className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW 2 & 3: GRID / LIST OF MODELS (INSIDE FOLDER OR ALL MODELS) */}
          {(viewMode !== 'folders' || activeFolderProjectId) && (
            <div className="space-y-6">
              {/* Folder Banner if Inside a Project Directory */}
              {activeFolder && (
                <div className="p-6 bg-gradient-to-r from-[#022C4F] to-[#044377] text-white rounded-3xl shadow-md space-y-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-white/20 text-white rounded text-[10px] font-mono font-bold">
                          {activeFolder.project.reference_number || 'PRJ-FOLDER'}
                        </span>
                        <span className="text-xs text-blue-200 font-bold">
                          {activeFolder.project.project_type || 'Commercial Development'}
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black">{activeFolder.project.name}</h2>
                      <p className="text-xs text-blue-200/90 font-medium">
                        {activeFolder.project.site_address || 'Lagos State Master Development Plan'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-xs">
                      <div>
                        <span className="block text-[10px] text-blue-200 uppercase font-bold">Models</span>
                        <span className="text-lg font-black">{activeFolder.modelsCount}</span>
                      </div>
                      <div className="w-px h-8 bg-white/20"></div>
                      <div>
                        <span className="block text-[10px] text-blue-200 uppercase font-bold">Total Elements</span>
                        <span className="text-lg font-black">{activeFolder.totalElements.toLocaleString()}</span>
                      </div>
                      <div className="w-px h-8 bg-white/20"></div>
                      <div>
                        <span className="block text-[10px] text-blue-200 uppercase font-bold">Certified</span>
                        <span className="text-lg font-black text-emerald-400">{activeFolder.certifiedCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Models List / Grid */}
              {displayModels.length === 0 ? (
                <div className="py-16 text-center text-slate-400 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
                  <Box size={48} className="mx-auto text-slate-300" />
                  <p className="text-sm font-bold text-slate-700">No BIM models match this directory or filter.</p>
                  <button 
                    onClick={() => setIsUploadDrawerOpen(true)} 
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    Upload Model to this Folder
                  </button>
                </div>
              ) : viewMode === 'list' ? (
                /* Tabular Table View */
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <th className="py-4 px-6">Model Name & Reference</th>
                        <th className="py-4 px-6">Project Folder</th>
                        <th className="py-4 px-6">Discipline</th>
                        <th className="py-4 px-6">Revision</th>
                        <th className="py-4 px-6">Elements / Size</th>
                        <th className="py-4 px-6">Regulatory Status</th>
                        <th className="py-4 px-6 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {displayModels.map((model) => (
                        <tr key={model.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0">
                                <Box size={20} />
                              </div>
                              <div>
                                <span className="font-bold text-[#022C4F] block hover:text-blue-600 cursor-pointer" onClick={() => router.push('/government/dashboard/bim/review')}>
                                  {model.name}
                                </span>
                                <span className="font-mono text-[10px] text-slate-400">
                                  {model.model_reference || 'MDL-2026'}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-700">
                            {model.project_name || 'Lagos Project'}
                          </td>
                          <td className="py-4 px-6">
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase border ${getDisciplineColor(model.discipline)}`}>
                              {model.discipline}
                            </span>
                          </td>
                          <td className="py-4 px-6 font-mono font-bold text-blue-700">
                            {model.current_version}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            <span className="font-bold">{model.element_count?.toLocaleString() || '12,500'}</span> elem • {model.file_size}
                          </td>
                          <td className="py-4 px-6">
                            {model.is_digitally_certified ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 w-fit">
                                <ShieldCheck size={12} /> Certified
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold uppercase">
                                {model.status}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => router.push('/government/dashboard/bim/review')}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                                title="Open 3D Viewer"
                              >
                                <Eye size={15} />
                              </button>
                              <button 
                                onClick={() => handleDownload(model)}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                                title="Download IFC Model"
                              >
                                <Download size={15} />
                              </button>
                              <button 
                                onClick={() => { setSelectedModel(model); setIsCertifyModalOpen(true); }}
                                className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                title="Digital Certification Seal"
                              >
                                <Award size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                /* Grid View of Models */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {displayModels.map((model, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={model.id}
                      className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between"
                    >
                      <div>
                        {/* 3D Model Thumbnail Viewport */}
                        <div 
                          onClick={() => router.push(`/government/dashboard/bim/review`)}
                          className="h-44 bg-gradient-to-br from-slate-900 to-[#022C4F] flex items-center justify-center relative overflow-hidden cursor-pointer"
                        >
                          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay"></div>
                          
                          {/* Central 3D Box Hologram */}
                          <div className="relative z-10 p-5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md transform group-hover:scale-110 transition-transform duration-500">
                            <Box size={40} className="text-white/80" />
                          </div>

                          {/* Top Left Project Code */}
                          <div className="absolute top-3 left-3 z-20">
                            <span className="px-2 py-0.5 bg-black/50 backdrop-blur-md text-white rounded text-[9px] font-mono font-bold">
                              {model.format || 'IFC4'} • {model.lod || 'LOD 350'}
                            </span>
                          </div>
                          
                          {/* Actions Overlay Top Right */}
                          <div className="absolute top-3 right-3 flex gap-1 z-20">
                            <button 
                              onClick={(e) => { e.stopPropagation(); router.push('/government/dashboard/bim/review'); }} 
                              className="p-1.5 bg-black/50 hover:bg-white hover:text-slate-900 text-white rounded-lg backdrop-blur-md shadow transition-colors"
                              title="Open in 3D Viewer"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                              onClick={(e) => { e.stopPropagation(); handleDownload(model); }} 
                              className="p-1.5 bg-black/50 hover:bg-white hover:text-slate-900 text-white rounded-lg backdrop-blur-md shadow transition-colors"
                              title="Download Model"
                            >
                              <Download size={14} />
                            </button>
                          </div>
                        </div>
                        
                        {/* Card Content */}
                        <div className="p-5 space-y-3">
                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                              {model.project_name || 'Project Model'}
                            </span>
                            <h3 
                              onClick={() => router.push(`/government/dashboard/bim/review`)}
                              className="font-black text-[#022C4F] text-sm line-clamp-2 group-hover:text-blue-600 transition-colors cursor-pointer"
                            >
                              {model.name}
                            </h3>
                          </div>
                          
                          <div className="flex items-center justify-between gap-2">
                            <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded border ${getDisciplineColor(model.discipline)}`}>
                              {model.discipline}
                            </span>
                            {model.is_digitally_certified ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <ShieldCheck size={12} /> Certified
                              </span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-slate-100 text-slate-600">
                                {model.status}
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 text-[10px] font-bold uppercase block">Revision</span>
                              <span className="text-blue-700 font-mono font-black">{model.current_version}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-[10px] font-bold uppercase block">Elements</span>
                              <span className="text-slate-800 font-bold">{model.element_count?.toLocaleString() || '14,200'}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button
                          onClick={() => { setSelectedModel(model); setIsVersionModalOpen(true); }}
                          className="text-slate-600 hover:text-blue-600 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <UploadCloud size={14} />
                          <span>Push Version</span>
                        </button>
                        <button
                          onClick={() => { setSelectedModel(model); setIsCertifyModalOpen(true); }}
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Award size={14} />
                          <span>Certify</span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Upload Model Drawer */}
      <UploadBIMModelDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSuccess={() => fetchData()}
        defaultProjectId={activeFolderProjectId || undefined}
      />

      {/* Certify Model Modal */}
      <CertifyBIMModelModal
        isOpen={isCertifyModalOpen}
        onClose={() => setIsCertifyModalOpen(false)}
        model={selectedModel}
        onSuccess={() => fetchData()}
      />

      {/* Upload Version Modal */}
      <UploadBIMVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        model={selectedModel}
        onSuccess={() => fetchData()}
      />
    </div>
  );
}
