"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Folder, FolderOpen, FileText, Search, Plus, MoreVertical, LayoutGrid, List as ListIcon, Star, Clock, Share2, Download, Trash2, ChevronRight, AlertTriangle } from "lucide-react";

export default function ProjectDocuments() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  
  const folders = [
    { id: 1, name: "01_Architectural", count: 42, size: "1.2 GB", modified: "2 hrs ago", shared: true },
    { id: 2, name: "02_Structural", count: 18, size: "850 MB", modified: "Oct 12", shared: true },
    { id: 3, name: "03_MEP_Systems", count: 35, size: "2.1 GB", modified: "Oct 10", shared: false },
    { id: 4, name: "04_Site_Photos", count: 128, size: "4.5 GB", modified: "Oct 08", shared: true },
    { id: 5, name: "Contracts_&_Legal", count: 8, size: "25 MB", modified: "Sep 28", shared: false },
  ];

  const recentFiles = [
    { id: 1, name: "Structural_Calculations_V2.pdf", type: "pdf", size: "12.4 MB", modified: "10 mins ago", owner: "S. Jenkins", starred: true, status: 'expired', expiryDate: 'Oct 01, 2026' },
    { id: 2, name: "Environmental_Impact_Assessment.pdf", type: "pdf", size: "8.5 MB", modified: "1 hr ago", owner: "Enviro Dept", starred: false, status: 'valid', expiryDate: 'Dec 15, 2029' },
    { id: 3, name: "Site_Survey_Report.docx", type: "word", size: "1.2 MB", modified: "3 hrs ago", owner: "M. Chen", starred: false, status: 'valid', expiryDate: 'N/A' },
    { id: 4, name: "Fire_Safety_Certificate.pdf", type: "pdf", size: "450 KB", modified: "Yesterday", owner: "Admin", starred: true, status: 'expiring_soon', expiryDate: 'Oct 20, 2026' },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center font-bold text-[10px]">PDF</div>;
      case 'excel': return <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center font-bold text-[10px]">XLS</div>;
      case 'word': return <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[10px]">DOC</div>;
      default: return <div className="w-10 h-10 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center"><FileText size={20} /></div>;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FolderOpen className="text-blue-500" />
            Project Documents
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Nexucon Root</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-800">Downtown Metro Station</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search documents..." 
              className="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
            <Plus size={16} />
            New
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors">
              My Files
            </button>
            <button className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Shared with me
            </button>
            <button className="px-3 py-1.5 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
              Starred
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* Folders Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Folder size={16} className="text-gray-400" /> Folders
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {folders.map((folder, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={folder.id}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Folder size={32} className="text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">{folder.name}</h4>
                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-medium">
                  <span>{folder.count} files</span>
                  <span>{folder.size}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Files Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> Recent Files
          </h3>

          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentFiles.map((file, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={file.id}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    {getFileIcon(file.type)}
                    <div className="flex items-center gap-1">
                      <button className={`p-1 rounded-md transition-colors ${file.starred ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}>
                        <Star size={16} className={file.starred ? "fill-amber-400" : ""} />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                        <MoreVertical size={16} />
                      </button>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2" title={file.name}>{file.name}</h4>
                  {file.status === 'expired' && (
                    <div className="flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-100 border border-red-200 px-2 py-0.5 rounded mb-2 w-fit">
                      <AlertTriangle size={12} /> Expired: {file.expiryDate}
                    </div>
                  )}
                  {file.status === 'expiring_soon' && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-700 font-bold bg-orange-100 border border-orange-200 px-2 py-0.5 rounded mb-2 w-fit">
                      <AlertTriangle size={12} /> Expiring: {file.expiryDate}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-auto">
                    <span className="truncate max-w-[80px]">{file.owner}</span>
                    <span>•</span>
                    <span>{file.modified}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Name</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Owner</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Modified</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.type)}
                          <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{file.name}</span>
                          {file.starred && <Star size={14} className="text-amber-400 fill-amber-400 ml-1" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{file.owner}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{file.modified}</td>
                      <td className="py-3 px-4">
                        {file.status === 'expired' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                            <AlertTriangle size={12} /> Expired ({file.expiryDate})
                          </span>
                        ) : file.status === 'expiring_soon' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">
                            <AlertTriangle size={12} /> Expiring ({file.expiryDate})
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500">Valid</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Share2 size={16} /></button>
                          <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded-md transition-colors"><Download size={16} /></button>
                          <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded-md transition-colors"><Trash2 size={16} /></button>
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
    </div>
  );
}
