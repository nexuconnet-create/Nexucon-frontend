"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  File,
  Image as ImageIcon,
  Download,
  Search,
  Layers,
  Box,
  Loader2,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  Share2,
  MoreVertical,
  Filter,
  ExternalLink,
  Link2,
  Trash2
} from "lucide-react";
import { motion } from "framer-motion";
import api, { notify } from "@/lib/api";

interface Asset {
  id: string | number;
  name: string;
  type: string;
  size: string;
  date: string;
  project: string;
  sessionId: string;
  sessionName: string;
  url?: string;
}

export default function ScanLibrary() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [filterOpen, setFilterOpen] = useState(false);
  const [menuOpenId, setMenuOpenId] = useState<string | number | null>(null);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  // Navigation State
  const [currentProject, setCurrentProject] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        // 1. Fetch all sessions
        const sessionsRes = await api.get('/scans/sessions/');
        const sessions = sessionsRes.data;
        
        let allAssets: Asset[] = [];
        
        // 2. For each session, fetch files
        for (const session of sessions) {
          try {
            const filesRes = await api.get(`/scans/${session.id}/files/`);
            const files = filesRes.data;
            
            const sessionAssets = files.map((f: any) => ({
              id: f.id,
              name: f.file_name || `${f.file_type} data`,
              type: f.file_type,
              size: f.file_size_bytes ? `${(f.file_size_bytes / (1024 * 1024)).toFixed(1)} MB` : 'Unknown',
              date: new Date(f.created_at).toLocaleDateString(),
              project: session.project_name || (session.project || 'Unknown Project'),
              sessionId: session.id,
              sessionName: session.name || `Session ${session.id.substring(0, 8)}`,
              url: f.file_url
            }));
            
            allAssets = [...allAssets, ...sessionAssets];
          } catch (e) {
            console.error(`Failed to fetch files for session ${session.id}`, e);
          }
        }
        
        setAssets(allAssets);
      } catch (error) {
        console.error("Failed to fetch assets", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
  }, []);

  const getIcon = (type: string, iconSize: number = 32) => {
    switch(type) {
      case 'lidar': 
      case 'gaussian_splat': return <Layers className="text-purple-500" size={iconSize} />;
      case 'rgb': return <ImageIcon className="text-blue-500" size={iconSize} />;
      case 'bim': 
      case 'mesh': return <Box className="text-emerald-500" size={iconSize} />;
      case 'thermal': return <ImageIcon className="text-amber-500" size={iconSize} />;
      case 'report': return <File className="text-red-500" size={iconSize} />;
      default: return <File className="text-gray-500" size={iconSize} />;
    }
  };

  const getBgColor = (type: string) => {
    switch(type) {
      case 'lidar':
      case 'gaussian_splat': return "bg-purple-50";
      case 'rgb': return "bg-blue-50";
      case 'bim':
      case 'mesh': return "bg-emerald-50";
      case 'thermal': return "bg-amber-50";
      case 'report': return "bg-red-50";
      default: return "bg-gray-50";
    }
  };

  const copyLink = async (asset: Asset) => {
    if (!asset.url) {
      notify("No file URL is available for this asset.", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(asset.url);
      notify(`Link copied: ${asset.name}`, "success");
    } catch {
      notify("Could not copy the link — clipboard access was blocked by the browser.", "error");
    }
  };

  const handleDeleteFile = async (asset: Asset) => {
    try {
      setDeletingId(asset.id);
      await api.delete(`/scans/${asset.sessionId}/files/${asset.id}/`);
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setMenuOpenId(null);
      notify(`Deleted ${asset.name}.`, "success");
    } catch (err) {
      console.error("Failed to delete file", err);
      notify("Failed to delete this file.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const renderFileMenu = (asset: Asset) => (
    menuOpenId === asset.id ? (
      <>
        <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setMenuOpenId(null); }} />
        <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20 text-left" onClick={(e) => e.stopPropagation()}>
          <a
            href={asset.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <ExternalLink size={14} className="text-gray-400" /> Open file
          </a>
          <button
            onClick={() => { copyLink(asset); setMenuOpenId(null); }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            <Link2 size={14} className="text-gray-400" /> Copy link
          </button>
          <button
            onClick={() => handleDeleteFile(asset)}
            disabled={deletingId === asset.id}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            {deletingId === asset.id
              ? <Loader2 size={14} className="animate-spin" />
              : <Trash2 size={14} />}
            Delete file
          </button>
        </div>
      </>
    ) : null
  );

  // Derived state for navigation
  const projects = Array.from(new Set(assets.map(a => a.project)));
  
  const sessionsInProject = currentProject 
    ? Array.from(new Set(assets.filter(a => a.project === currentProject).map(a => a.sessionId)))
        .map(id => {
          const asset = assets.find(a => a.sessionId === id);
          return { id, name: asset?.sessionName || `Session ${id}` };
        })
    : [];

  const availableTypes = Array.from(new Set(assets.map(a => a.type)));

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          asset.project.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || asset.type === typeFilter;

    // If not searching, strictly filter by folder navigation
    if (searchQuery === "") {
      if (currentSession) return asset.sessionId === currentSession.id && matchesType;
      if (currentProject) return asset.project === currentProject && matchesType;
      return matchesType;
    }
    return matchesSearch && matchesType;
  });

  return (
    <div className="w-full min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Scan Library</h1>
          <p className="text-gray-500 mt-1">Repository of raw scan data, processed point clouds, and generated meshes.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setFilterOpen(v => !v)}
              className={`flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors ${typeFilter !== 'all' ? 'border-blue-300 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
              title="Filter by file type"
            >
              <Filter size={16} />
              <span className="hidden sm:inline">{typeFilter === 'all' ? 'All Types' : typeFilter}</span>
              <ChevronDown size={14} className="text-gray-400" />
            </button>
            {filterOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setFilterOpen(false)} />
                <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                  <button
                    onClick={() => { setTypeFilter('all'); setFilterOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${typeFilter === 'all' ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                  >
                    All Types
                  </button>
                  {availableTypes.map(t => (
                    <button
                      key={t}
                      onClick={() => { setTypeFilter(t); setFilterOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 uppercase ${typeFilter === t ? 'text-blue-600 font-semibold' : 'text-gray-700'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
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

      {/* Breadcrumbs Navigation */}
      {!searchQuery && (
        <div className="flex items-center gap-2 mb-6 text-sm">
          <button 
            onClick={() => { setCurrentProject(null); setCurrentSession(null); }}
            className={`flex items-center gap-2 transition-colors ${currentProject ? 'text-gray-500 hover:text-blue-600' : 'text-blue-600 font-semibold'}`}
          >
            <FolderOpen size={16} />
            Projects
          </button>
          
          {currentProject && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <button 
                onClick={() => setCurrentSession(null)}
                className={`flex items-center gap-2 transition-colors ${currentSession ? 'text-gray-500 hover:text-blue-600' : 'text-blue-600 font-semibold'}`}
              >
                <Folder size={16} />
                {currentProject}
              </button>
            </>
          )}

          {currentSession && (
            <>
              <ChevronRight size={14} className="text-gray-400" />
              <span className="text-blue-600 font-semibold flex items-center gap-2">
                <Folder size={16} />
                {currentSession.name}
              </span>
            </>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : searchQuery === "" && currentProject === null ? (
        /* PROJECT FOLDERS VIEW */
        projects.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
            <p className="text-gray-500">There are no projects containing files yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={project}
                onClick={() => setCurrentProject(project)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <Folder className="text-blue-400 mb-4 group-hover:scale-110 transition-transform" size={56} fill="#93c5fd" />
                <h3 className="font-semibold text-gray-800 text-center">{project}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  {assets.filter(a => a.project === project).length} Files
                </p>
              </motion.div>
            ))}
          </div>
        )
      ) : searchQuery === "" && currentProject !== null && currentSession === null ? (
        /* SESSION FOLDERS VIEW */
        sessionsInProject.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Sessions Found</h3>
            <p className="text-gray-500">There are no sessions in this project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sessionsInProject.map((session) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                key={session.id}
                onClick={() => setCurrentSession(session)}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
              >
                <Folder className="text-amber-400 mb-4 group-hover:scale-110 transition-transform" size={56} fill="#fcd34d" />
                <h3 className="font-semibold text-gray-800 text-center">{session.name}</h3>
                <p className="text-xs text-gray-500 mt-2">
                  {assets.filter(a => a.sessionId === session.id).length} Files
                </p>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        /* FILES VIEW (Either inside a session or searching) */
        filteredAssets.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <File className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No files found</h3>
            <p className="text-gray-500">There are no files matching your criteria.</p>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAssets.map((asset, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={asset.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`h-40 ${getBgColor(asset.type)} flex items-center justify-center relative`}>
                  {getIcon(asset.type)}
                  <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <a href={asset.url || '#'} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 shadow-sm backdrop-blur block" title="Download / open file"><Download size={14} /></a>
                    <button onClick={() => copyLink(asset)} className="p-1.5 bg-white/80 hover:bg-white rounded text-gray-600 shadow-sm backdrop-blur" title="Copy file link"><Share2 size={14} /></button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors" title={asset.name}>
                      {asset.name}
                    </h3>
                    <div className="relative shrink-0">
                      <button
                        onClick={() => setMenuOpenId(menuOpenId === asset.id ? null : asset.id)}
                        className="text-gray-400 hover:text-gray-600"
                        title="File actions"
                      >
                        <MoreVertical size={16} />
                      </button>
                      {renderFileMenu(asset)}
                    </div>
                  </div>
                  {searchQuery && <p className="text-xs text-gray-500 mt-1 truncate">{asset.project} / {asset.sessionName}</p>}
                  <div className="flex items-center justify-between mt-4 text-xs font-medium text-gray-400">
                    <span className="uppercase tracking-wider px-2 py-0.5 bg-gray-100 rounded">{asset.type}</span>
                    <div className="flex items-center gap-2">
                      <span>{asset.size}</span>
                      <span>•</span>
                      <span>{asset.date}</span>
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
                <tr className="bg-gray-50/50">
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Asset Name</th>
                  {searchQuery && <th className="py-4 px-6 font-semibold text-sm text-gray-500">Location</th>}
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Type</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Size</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500">Date Added</th>
                  <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAssets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded flex items-center justify-center ${getBgColor(asset.type)}`}>
                          {getIcon(asset.type, 16)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{asset.name}</span>
                      </div>
                    </td>
                    {searchQuery && (
                      <td className="py-4 px-6 text-sm text-gray-600 truncate max-w-[200px]">
                        {asset.project} / {asset.sessionName}
                      </td>
                    )}
                    <td className="py-4 px-6">
                      <span className="uppercase tracking-wider px-2 py-1 bg-gray-100 text-gray-600 text-[10px] font-bold rounded">
                        {asset.type}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm text-gray-600">{asset.size}</td>
                    <td className="py-4 px-6 text-sm text-gray-600">{asset.date}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={asset.url || '#'} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors block" title="Download / open file"><Download size={16} /></a>
                        <button onClick={() => copyLink(asset)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors" title="Copy file link"><Share2 size={16} /></button>
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === asset.id ? null : asset.id)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                            title="File actions"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {renderFileMenu(asset)}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}
    </div>
  );
}
