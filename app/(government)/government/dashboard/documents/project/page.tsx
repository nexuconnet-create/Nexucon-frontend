"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Folder, FolderOpen, FileText, Search, Plus, MoreVertical, LayoutGrid, 
  List as ListIcon, Star, Clock, Share2, Download, Trash2, ChevronRight, 
  AlertTriangle, RefreshCw, Stamp, UploadCloud, Eye, ArrowLeft, Building2,
  MapPin, ShieldCheck, Layers, HardDrive, Check, Award, Filter
} from "lucide-react";
import { 
  Document, DocumentFolder, getDocuments, getDocumentFolders, 
  toggleStarDocument, getDocumentStats 
} from "@/services/documents";
import { getProjects, Project } from "@/services/projects";
import UploadDocumentDrawer from "@/components/dashboard/UploadDocumentDrawer";
import UploadDocumentVersionModal from "@/components/dashboard/UploadDocumentVersionModal";
import DigitalSignatureStampModal from "@/components/dashboard/DigitalSignatureStampModal";

export default function ProjectDocuments() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeFolderProjectId, setActiveFolderProjectId] = useState<string | null>(null);
  const [activeSubFolder, setActiveSubFolder] = useState<string | null>(null);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'shared' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modals
  const [isUploadDrawerOpen, setIsUploadDrawerOpen] = useState(false);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const [isStampModalOpen, setIsStampModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  const fetchDocumentData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (searchQuery) params.search = searchQuery;
      if (activeTab === 'starred') params.starred = 'true';
      if (activeFolderProjectId) params.project = activeFolderProjectId;
      if (activeSubFolder) params.folder = activeSubFolder;

      const [docsData, foldersData, projectsData] = await Promise.all([
        getDocuments(params),
        getDocumentFolders(activeFolderProjectId ? { project: activeFolderProjectId } : undefined),
        getProjects()
      ]);
      setDocuments(docsData);
      setFolders(foldersData);
      const pList = Array.isArray(projectsData) ? projectsData : ((projectsData as any).results || []);
      setProjects(pList);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab, activeFolderProjectId, activeSubFolder]);

  useEffect(() => {
    fetchDocumentData();
  }, [fetchDocumentData]);

  // Group project directories
  const projectDirectories = useMemo(() => {
    return projects.map(proj => {
      const projDocs = documents.filter(d => d.project === proj.id || (d.project_name && d.project_name.toLowerCase() === proj.name.toLowerCase()));
      const stampedCount = projDocs.filter(d => d.is_digitally_stamped).length;
      const disciplines = Array.from(new Set(projDocs.map(d => d.discipline).filter(Boolean)));
      
      return {
        project: proj,
        docsCount: projDocs.length,
        stampedCount,
        disciplines
      };
    });
  }, [projects, documents]);

  const activeProject = useMemo(() => {
    if (!activeFolderProjectId) return null;
    return projects.find(p => p.id === activeFolderProjectId) || null;
  }, [activeFolderProjectId, projects]);

  const handleToggleStar = async (doc: Document) => {
    try {
      await toggleStarDocument(doc.id);
      fetchDocumentData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = (doc: Document) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading ${doc.title} (${doc.file_size}) from Cloudflare R2...`, type: 'info' } 
    }));
  };

  const getFileIcon = (format: string) => {
    const f = (format || 'pdf').toLowerCase();
    switch (f) {
      case 'pdf': return <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">PDF</div>;
      case 'xlsx':
      case 'excel': return <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px]">XLS</div>;
      case 'docx':
      case 'word': return <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">DOC</div>;
      default: return <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center"><FileText size={20} /></div>;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1.5 text-xs text-slate-500">
            <button 
              onClick={() => { setActiveFolderProjectId(null); setActiveSubFolder(null); }}
              className="hover:text-blue-600 font-bold flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Folder size={14} className="text-amber-500" />
              <span>Project Documents</span>
            </button>
            {activeProject && (
              <>
                <ChevronRight size={13} className="text-slate-400" />
                <button
                  onClick={() => setActiveSubFolder(null)}
                  className="font-black text-[#022C4F] hover:text-blue-600 flex items-center gap-1 cursor-pointer"
                >
                  <Building2 size={13} className="text-blue-600" />
                  {activeProject.name}
                </button>
              </>
            )}
            {activeSubFolder && (
              <>
                <ChevronRight size={13} className="text-slate-400" />
                <span className="font-mono text-blue-700 font-bold">
                  {activeSubFolder}
                </span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F]">
            {activeProject ? activeProject.name : 'Project Documents Repository'}
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {activeProject 
              ? `Project Folder • Cloudflare R2 Storage (nexucondocument) • ${documents.length} Files`
              : 'Multi-project regulatory documentation, architectural blueprints, and engineering studies.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {activeFolderProjectId && (
            <button
              onClick={() => { setActiveFolderProjectId(null); setActiveSubFolder(null); }}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors text-xs font-bold shadow-sm cursor-pointer"
            >
              <ArrowLeft size={15} />
              <span>All Project Directories</span>
            </button>
          )}
          <button 
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 text-xs sm:text-sm font-bold cursor-pointer"
          >
            <Plus size={17} />
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Files
            </button>
            <button 
              onClick={() => setActiveTab('shared')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'shared' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Shared with Agency
            </button>
            <button 
              onClick={() => setActiveTab('starred')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                activeTab === 'starred' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Starred
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input 
                type="text" 
                placeholder={activeProject ? "Search files in this project..." : "Search project directories..."} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-56 sm:w-64 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
              />
            </div>
            
            <button 
              onClick={fetchDocumentData}
              className="p-2 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              title="Refresh"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </button>

            <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
              <button 
                onClick={() => setView('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${view === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button 
                onClick={() => setView('list')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${view === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                <ListIcon size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
          
          {/* VIEW 1: TOP-LEVEL PROJECT FOLDERS HIERARCHY */}
          {!activeFolderProjectId && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FolderOpen size={16} className="text-amber-500" />
                  Project Document Directories ({projectDirectories.length} Projects)
                </h3>
                <span className="text-xs font-bold text-slate-400">
                  Total Files: {documents.length}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectDirectories.map((dir, idx) => (
                  <motion.div
                    key={dir.project.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    onClick={() => setActiveFolderProjectId(dir.project.id)}
                    className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      {/* Top Row */}
                      <div className="flex items-center justify-between">
                        <div className="w-13 h-13 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 group-hover:bg-amber-100 group-hover:scale-105 transition-all shadow-sm">
                          <Folder size={26} className="fill-amber-500/20 text-amber-600" />
                        </div>
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-xs font-black flex items-center gap-1.5">
                          <FileText size={13} />
                          {dir.docsCount} {dir.docsCount === 1 ? 'Document' : 'Documents'}
                        </span>
                      </div>

                      {/* Project Meta */}
                      <div>
                        <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                          {dir.project.reference_number || 'PRJ-2026'}
                        </span>
                        <h4 className="text-base font-black text-[#022C4F] group-hover:text-blue-600 transition-colors line-clamp-1">
                          {dir.project.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-1">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{dir.project.site_address || dir.project.lga || 'Lagos State'}</span>
                        </p>
                      </div>

                      {/* Discipline Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {dir.disciplines.length > 0 ? (
                          dir.disciplines.map(d => (
                            <span key={d} className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {d}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-400 font-semibold italic">
                            Empty directory • Click to upload
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
                      <div className="flex items-center gap-2">
                        {dir.stampedCount > 0 && (
                          <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Stamp size={12} className="text-emerald-600" />
                            {dir.stampedCount} Stamped
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

          {/* VIEW 2: INSIDE PROJECT FOLDER WITH SUB-FOLDERS & FILES */}
          {activeFolderProjectId && (
            <div className="space-y-8">
              
              {/* Destination Sub-Folders Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Folder size={15} className="text-amber-500" />
                    Project Sub-Folders
                  </h3>
                  {activeSubFolder && (
                    <button
                      onClick={() => setActiveSubFolder(null)}
                      className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Show All Folders
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    "01_Architectural",
                    "02_Structural",
                    "03_MEP_Systems",
                    "04_Permits_Legal",
                    "05_Geotechnical",
                    "06_Site_Inspections"
                  ].map((subName) => {
                    const count = documents.filter(d => d.folder === subName).length;
                    const isSelected = activeSubFolder === subName;

                    return (
                      <div
                        key={subName}
                        onClick={() => setActiveSubFolder(isSelected ? null : subName)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Folder size={22} className={isSelected ? "text-blue-600 fill-blue-600/30" : "text-amber-500 fill-amber-500/20"} />
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {count}
                          </span>
                        </div>
                        <div>
                          <h5 className={`text-xs font-bold truncate ${isSelected ? 'text-blue-700' : 'text-slate-800'}`}>
                            {subName.replace(/_/g, ' ')}
                          </h5>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Documents in Selected Folder */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Clock size={15} className="text-slate-400" />
                    {activeSubFolder ? `Files in ${activeSubFolder.replace(/_/g, ' ')}` : 'All Documents in Project'} ({documents.length})
                  </h3>
                </div>

                {isLoading ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    Loading project documents from Cloudflare R2...
                  </div>
                ) : documents.length === 0 ? (
                  <div className="py-16 text-center text-slate-400 bg-slate-50 rounded-3xl border border-slate-200 p-8 space-y-3">
                    <FileText size={42} className="mx-auto text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">No documents found in this sub-folder.</p>
                    <button 
                      onClick={() => setIsUploadDrawerOpen(true)} 
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Upload File to this Folder
                    </button>
                  </div>
                ) : view === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {documents.map((file, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        key={file.id}
                        className="bg-white border border-slate-200 rounded-3xl p-5 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-200 cursor-pointer group flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            {getFileIcon(file.file_format)}
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleToggleStar(file); }}
                                className={`p-1.5 rounded-lg transition-colors ${file.is_starred ? 'text-amber-400' : 'text-slate-300 hover:text-amber-400'}`}
                                title={file.is_starred ? "Starred" : "Star document"}
                              >
                                <Star size={16} className={file.is_starred ? "fill-amber-400" : ""} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedDocument(file); setIsStampModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                                title="Apply Digital Stamp"
                              >
                                <Stamp size={16} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedDocument(file); setIsVersionModalOpen(true); }}
                                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                                title="Push Revision"
                              >
                                <UploadCloud size={16} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <span className="text-[10px] font-mono font-bold text-slate-400 block mb-0.5">
                              {file.folder} • {file.document_reference || 'DOC-2026'}
                            </span>
                            <h4 className="font-bold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                              {file.title}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between text-xs pt-1">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                              {file.discipline}
                            </span>
                            <span className="font-mono text-blue-700 font-black text-xs">
                              {file.current_version}
                            </span>
                          </div>

                          {file.is_digitally_stamped && (
                            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-xl">
                              <ShieldCheck size={13} className="text-emerald-600" />
                              <span>Officially Stamped ({file.stamp_reference})</span>
                            </div>
                          )}
                        </div>

                        {/* Card Footer */}
                        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                          <span>{file.file_size}</span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(file); }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors flex items-center gap-1 font-bold text-[11px]"
                            title="Download from Cloudflare R2"
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  /* Tabular List View */
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                          <th className="py-4 px-6">Document Title & Ref</th>
                          <th className="py-4 px-6">Folder</th>
                          <th className="py-4 px-6">Discipline</th>
                          <th className="py-4 px-6">Version</th>
                          <th className="py-4 px-6">Size / Format</th>
                          <th className="py-4 px-6">Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {documents.map((file) => (
                          <tr key={file.id} className="hover:bg-slate-50 transition-colors group">
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-3">
                                {getFileIcon(file.file_format)}
                                <div>
                                  <span className="font-bold text-[#022C4F] block group-hover:text-blue-600">
                                    {file.title}
                                  </span>
                                  <span className="font-mono text-[10px] text-slate-400">
                                    {file.document_reference || 'DOC-2026'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-6 font-semibold text-slate-600">
                              {file.folder}
                            </td>
                            <td className="py-4 px-6">
                              <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                                {file.discipline}
                              </span>
                            </td>
                            <td className="py-4 px-6 font-mono font-bold text-blue-700">
                              {file.current_version}
                            </td>
                            <td className="py-4 px-6 text-slate-600">
                              {file.file_size} • {file.file_format}
                            </td>
                            <td className="py-4 px-6">
                              {file.is_digitally_stamped ? (
                                <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-full text-[10px] font-extrabold uppercase flex items-center gap-1 w-fit">
                                  <ShieldCheck size={12} /> Stamped
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full text-[10px] font-extrabold uppercase">
                                  {file.status}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button 
                                  onClick={() => handleToggleStar(file)}
                                  className={`p-2 rounded-xl border border-slate-200 transition-colors ${file.is_starred ? 'text-amber-400 bg-amber-50' : 'text-slate-400 hover:bg-slate-50'}`}
                                >
                                  <Star size={14} className={file.is_starred ? "fill-amber-400" : ""} />
                                </button>
                                <button 
                                  onClick={() => handleDownload(file)}
                                  className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors"
                                  title="Download File"
                                >
                                  <Download size={14} />
                                </button>
                                <button 
                                  onClick={() => { setSelectedDocument(file); setIsStampModalOpen(true); }}
                                  className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-colors"
                                  title="Apply Digital Stamp"
                                >
                                  <Stamp size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Drawers & Modals */}
      <UploadDocumentDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSuccess={() => fetchDocumentData()}
        defaultProjectId={activeFolderProjectId || undefined}
        defaultFolder={activeSubFolder || undefined}
      />

      <UploadDocumentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        document={selectedDocument}
        onSuccess={() => fetchDocumentData()}
      />

      <DigitalSignatureStampModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        document={selectedDocument}
        onSuccess={() => fetchDocumentData()}
      />
    </div>
  );
}
