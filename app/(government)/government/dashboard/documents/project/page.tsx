"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Folder, FolderOpen, FileText, Search, Plus, MoreVertical, LayoutGrid, 
  List as ListIcon, Star, Clock, Share2, Download, Trash2, ChevronRight, 
  AlertTriangle, RefreshCw, Stamp, UploadCloud, Eye
} from "lucide-react";
import { 
  Document, DocumentFolder, getDocuments, getDocumentFolders, 
  toggleStarDocument, getDocumentStats 
} from "@/services/documents";
import UploadDocumentDrawer from "@/components/dashboard/UploadDocumentDrawer";
import UploadDocumentVersionModal from "@/components/dashboard/UploadDocumentVersionModal";
import DigitalSignatureStampModal from "@/components/dashboard/DigitalSignatureStampModal";

export default function ProjectDocuments() {
  const [view, setView] = useState<'grid' | 'list'>('grid');
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

      const [docsData, foldersData] = await Promise.all([
        getDocuments(params),
        getDocumentFolders()
      ]);
      setDocuments(docsData);

      setFolders(foldersData);
    } catch (err) {
      console.error("Failed to load documents", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, activeTab]);

  useEffect(() => {
    fetchDocumentData();
  }, [fetchDocumentData]);

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
      detail: { message: `Downloading ${doc.title} (${doc.file_size})...`, type: 'info' } 
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
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FolderOpen className="text-blue-500" />
            Project Documents Repository
          </h1>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Cloudflare R2 Bucket: nexucondocument</span>
            <ChevronRight size={14} />
            <span className="font-semibold text-gray-800">Downtown Metro Station</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search documents by title, discipline..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-64 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button 
            onClick={fetchDocumentData}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsUploadDrawerOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
          >
            <Plus size={16} />
            Upload Document
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
        
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'all' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Files
            </button>
            <button 
              onClick={() => setActiveTab('shared')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'shared' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Shared with Agency
            </button>
            <button 
              onClick={() => setActiveTab('starred')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'starred' ? 'bg-[#022C4F] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Starred
            </button>
          </div>
          
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
            <button 
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button 
              onClick={() => setView('list')}
              className={`p-1.5 rounded-lg transition-colors ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              <ListIcon size={16} />
            </button>
          </div>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          
          {/* Folders Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Folder size={16} className="text-gray-400" /> Destination Folders
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 mb-8">
            {folders.map((folder, idx) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.04 }}
                key={folder.id || idx}
                className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <Folder size={32} className="text-blue-500 fill-blue-500/20 group-hover:scale-110 transition-transform" />
                  <button className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <h4 className="font-semibold text-gray-800 text-sm truncate group-hover:text-blue-600 transition-colors">{folder.name}</h4>
                <div className="flex items-center justify-between mt-2 text-[11px] text-gray-500 font-medium">
                  <span>{folder.files_count} files</span>
                  <span>{folder.total_size}</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Recent Files Section */}
          <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Clock size={16} className="text-gray-400" /> Active Documents & Drawings ({documents.length})
          </h3>

          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs">Loading documents from Cloudflare R2...</div>
          ) : documents.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <FileText size={40} className="mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-bold text-slate-700">No documents found matching query.</p>
              <button onClick={() => setIsUploadDrawerOpen(true)} className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700">
                Upload First Document
              </button>
            </div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {documents.map((file, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  key={file.id}
                  className="bg-white border border-gray-200 rounded-2xl p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-4">
                    {getFileIcon(file.file_format)}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleToggleStar(file); }}
                        className={`p-1.5 rounded-lg transition-colors ${file.is_starred ? 'text-amber-400' : 'text-gray-300 hover:text-amber-400'}`}
                      >
                        <Star size={16} className={file.is_starred ? "fill-amber-400" : ""} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedDocument(file); setIsStampModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                        title="Digital Stamp"
                      >
                        <Stamp size={16} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedDocument(file); setIsVersionModalOpen(true); }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Push Revision"
                      >
                        <UploadCloud size={16} />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-semibold text-gray-800 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors mb-2" title={file.title}>
                    {file.title}
                  </h4>

                  {file.expiry_status === 'expired' && (
                    <div className="flex items-center gap-1 text-[10px] text-red-700 font-bold bg-red-100 border border-red-200 px-2 py-0.5 rounded-lg mb-2 w-fit">
                      <AlertTriangle size={12} /> Expired: {file.expiry_date}
                    </div>
                  )}
                  {file.expiry_status === 'expiring_soon' && (
                    <div className="flex items-center gap-1 text-[10px] text-orange-700 font-bold bg-orange-100 border border-orange-200 px-2 py-0.5 rounded-lg mb-2 w-fit">
                      <AlertTriangle size={12} /> Expiring: {file.expiry_date}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-auto pt-3 border-t border-slate-100">
                    <span className="truncate max-w-[80px]">{file.uploader_name}</span>
                    <span>•</span>
                    <span className="font-mono font-bold text-blue-600">{file.current_version}</span>
                    <span>•</span>
                    <span>{file.file_size}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-200">
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Name</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Owner</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Version</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs text-gray-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {documents.map((file) => (
                    <tr key={file.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {getFileIcon(file.file_format)}
                          <div>
                            <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors block">{file.title}</span>
                            <span className="text-xs text-gray-400">{file.document_reference} • {file.file_size}</span>
                          </div>
                          {file.is_starred && <Star size={14} className="text-amber-400 fill-amber-400 ml-1" />}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{file.uploader_name}</td>
                      <td className="py-3 px-4 text-xs font-mono font-bold text-gray-700">{file.current_version}</td>
                      <td className="py-3 px-4">
                        {file.expiry_status === 'expired' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-red-700 text-xs font-bold border border-red-200">
                            <AlertTriangle size={12} /> Expired ({file.expiry_date})
                          </span>
                        ) : file.expiry_status === 'expiring_soon' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200">
                            <AlertTriangle size={12} /> Expiring ({file.expiry_date})
                          </span>
                        ) : (
                          <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg">Valid ({file.status})</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => { setSelectedDocument(file); setIsStampModalOpen(true); }}
                            className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Digital Stamp"
                          >
                            <Stamp size={16} />
                          </button>
                          <button 
                            onClick={() => handleDownload(file)}
                            className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download size={16} />
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

      <UploadDocumentDrawer
        isOpen={isUploadDrawerOpen}
        onClose={() => setIsUploadDrawerOpen(false)}
        onSuccess={fetchDocumentData}
      />

      <UploadDocumentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        document={selectedDocument}
        onSuccess={fetchDocumentData}
      />

      <DigitalSignatureStampModal
        isOpen={isStampModalOpen}
        onClose={() => setIsStampModalOpen(false)}
        document={selectedDocument}
        onSuccess={fetchDocumentData}
      />
    </div>
  );
}
