"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, ArrowRight, FileText, UploadCloud, FileDiff, GitBranch, Download, Eye, RefreshCw } from "lucide-react";
import { Document, DocumentVersion, getDocuments, getDocumentVersions } from "@/services/documents";
import UploadDocumentVersionModal from "@/components/dashboard/UploadDocumentVersionModal";

export default function DocumentVersions() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const fetchVersionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const docsData = await getDocuments();
      setDocuments(docsData);
      
      const active = docsData.length > 0 ? docsData[0] : null;
      setSelectedDocument(active);

      if (active) {
        const vList = await getDocumentVersions({ document: active.id });
        setVersions(vList);
        if (vList.length > 0) setSelectedVersion(vList[0]);
      }
    } catch (err) {
      console.error("Failed to load versions data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVersionsData();
  }, [fetchVersionsData]);

  const handleDocumentChange = async (docId: string) => {
    const found = documents.find(d => d.id === docId) || null;
    setSelectedDocument(found);
    if (found) {
      const vList = await getDocumentVersions({ document: found.id });
      setVersions(vList);
      if (vList.length > 0) setSelectedVersion(vList[0]);
    }
  };

  const handleDownload = (v: DocumentVersion) => {
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading revision ${v.version_label} (${v.file_size})...`, type: 'info' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>Project Documents</span>
            <ArrowRight size={14} />
            <span>{selectedDocument?.folder || 'Contracts'}</span>
            <ArrowRight size={14} />
            <span className="font-semibold text-blue-600">{selectedDocument?.title || 'Loading...'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Document Version History
          </h1>
          <p className="text-gray-500 mt-1">Track revisions, author provenance, and download previous document states from Cloudflare R2.</p>
        </div>
        
        <div className="flex items-center gap-3">
          {documents.length > 1 && (
            <select
              value={selectedDocument?.id}
              onChange={(e) => handleDocumentChange(e.target.value)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>{d.title}</option>
              ))}
            </select>
          )}
          <button 
            onClick={() => setIsVersionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
          >
            <UploadCloud size={16} />
            Upload New Revision
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <GitBranch size={20} className="text-gray-400" />
                Revision Timeline ({versions.length} versions)
              </h2>
              <button onClick={fetchVersionsData} className="text-gray-400 hover:text-blue-600 p-1">
                <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 text-xs">Loading revision history...</div>
            ) : versions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No revisions logged for this document.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                {versions.map((version, idx) => {
                  const isSelected = selectedVersion?.id === version.id;
                  return (
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      key={version.id} 
                      className="relative pl-8"
                    >
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                        version.status === 'Current' 
                          ? 'bg-blue-600 border-blue-200 shadow-[0_0_0_4px_rgba(37,99,235,0.1)]' 
                          : 'bg-white border-gray-300'
                      }`}></div>
                      
                      <div 
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-blue-200 bg-blue-50/30 shadow-md' 
                            : 'border-gray-100 hover:border-gray-200 hover:shadow-sm bg-white'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-sm font-bold font-mono px-2 py-0.5 rounded ${
                                version.status === 'Current' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {version.version_label}
                              </span>
                              {version.status === 'Current' && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  Current Master
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 font-medium">{version.changes_summary}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-500">{new Date(version.uploaded_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{version.author_name}</p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Selected Version Info */}
        <div className="lg:col-span-1">
          {selectedVersion && (
            <motion.div 
              key={selectedVersion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6"
            >
              <div className="h-32 bg-gray-50 border-b border-gray-100 flex items-center justify-center relative">
                <FileText size={48} className="text-blue-500/40" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-blue-700 font-mono font-bold text-lg bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl shadow-sm">
                    {selectedVersion.version_label}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Document Commit Details</h3>
                
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Author / Submitter</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {selectedVersion.author_name.charAt(0)}
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{selectedVersion.author_name}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">File Size</span>
                    <p className="text-sm font-semibold text-gray-700">{selectedVersion.file_size || '12.4 MB'} (PDF)</p>
                  </div>

                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Cloudflare Storage</span>
                    <p className="text-xs text-blue-600 font-mono bg-blue-50 p-2 rounded-xl border border-blue-100">
                      r2://nexucondocument/{selectedDocument?.document_reference}/{selectedVersion.version_label}
                    </p>
                  </div>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <button 
                    onClick={() => handleDownload(selectedVersion)}
                    className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download Revision PDF
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <UploadDocumentVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        document={selectedDocument}
        onSuccess={fetchVersionsData}
      />
    </div>
  );
}
