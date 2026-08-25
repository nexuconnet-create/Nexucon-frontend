"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { History, ArrowRight, FileText, UploadCloud, FileDiff, GitBranch, Download, Eye, RefreshCw, Building2 } from "lucide-react";
import { Document, DocumentVersion, getDocuments, getDocumentVersions } from "@/services/documents";
import UploadDocumentVersionModal from "@/components/dashboard/UploadDocumentVersionModal";
import { CustomSelect } from "@/components/CustomSelect";

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
      
      const active = docsData.length > 0 ? (selectedDocument ? docsData.find(d => d.id === selectedDocument.id) || docsData[0] : docsData[0]) : null;
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
  }, [selectedDocument]);

  useEffect(() => {
    fetchVersionsData();
  }, []);

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
    const targetUrl = v.file_url || selectedDocument?.file_url;
    if (targetUrl) {
      window.open(targetUrl, '_blank');
    }
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Opening revision ${v.version_label} (${v.file_size}) from Cloudflare R2...`, type: 'info' } 
    }));
  };

  const selectOptions = useMemo(() => {
    return documents.map(d => ({
      value: d.id,
      label: `${d.project_name ? `${d.project_name} • ` : ''}${d.title} (${d.current_version})`
    }));
  }, [documents]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1.5 font-bold">
            <span>Project Documents</span>
            <ArrowRight size={13} className="text-slate-400" />
            <span className="font-mono text-slate-700">{selectedDocument?.folder || '01_Architectural'}</span>
            <ArrowRight size={13} className="text-slate-400" />
            <span className="text-blue-600 truncate max-w-[240px]">{selectedDocument?.title || 'Loading...'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-600" />
            Document Version History
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Track revisions, author provenance, cryptographic SHA-256 hashes, and download previous document states from Cloudflare R2.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {documents.length > 0 && (
            <div className="w-full sm:w-72">
              <CustomSelect
                value={selectedDocument?.id || ''}
                onChange={handleDocumentChange}
                options={selectOptions}
                placeholder="Select target document..."
                searchable={true}
              />
            </div>
          )}
          <button 
            onClick={() => setIsVersionModalOpen(true)}
            className="flex items-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-xs font-bold cursor-pointer shrink-0"
          >
            <UploadCloud size={16} />
            <span>Upload New Revision</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <GitBranch size={16} className="text-slate-400" />
                Revision Timeline ({versions.length} versions logged)
              </h2>
              <button onClick={fetchVersionsData} className="text-slate-400 hover:text-blue-600 p-1.5 rounded-lg transition-colors">
                <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="py-24 text-center text-slate-400 text-xs font-bold">Loading revision history from Cloudflare R2...</div>
            ) : versions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No revisions logged for this document.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-slate-100 ml-4 space-y-8 pb-4">
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
                          ? 'bg-blue-600 border-blue-200 shadow-[0_0_0_4px_rgba(37,99,235,0.15)]' 
                          : 'bg-white border-slate-300'
                      }`}></div>
                      
                      <div 
                        className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected 
                            ? 'border-blue-300 bg-blue-50/40 shadow-md ring-2 ring-blue-500/10' 
                            : 'border-slate-100 hover:border-slate-200 hover:shadow-sm bg-white'
                        }`}
                        onClick={() => setSelectedVersion(version)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                              <span className={`text-xs font-black font-mono px-2 py-0.5 rounded ${
                                version.status === 'Current' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                              }`}>
                                {version.version_label}
                              </span>
                              {version.status === 'Current' && (
                                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                  Current Master Version
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-800 font-bold">{version.changes_summary}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[11px] font-bold text-slate-500">{new Date(version.uploaded_at).toLocaleDateString()}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{version.author_name} ({version.author_role})</p>
                          </div>
                        </div>

                        {version.signature_hash && (
                          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Hash: {version.signature_hash}</span>
                          </div>
                        )}
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
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden sticky top-6"
            >
              <div className="h-28 bg-slate-50 border-b border-slate-100 flex items-center justify-center relative">
                <FileText size={44} className="text-blue-500/40" />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <span className="text-blue-700 font-mono font-black text-sm bg-blue-100 border border-blue-200 px-3 py-1 rounded-xl shadow-sm">
                    {selectedVersion.version_label}
                  </span>
                </div>
              </div>
              
              <div className="p-6 space-y-4 text-xs">
                <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Document Version Details</h3>
                
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Author / Reviewer</span>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black text-xs">
                      {selectedVersion.author_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{selectedVersion.author_name}</p>
                      <p className="text-[10px] text-slate-400">{selectedVersion.author_role}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">File Size & Storage</span>
                  <p className="font-semibold text-slate-700">{selectedVersion.file_size || '12.4 MB'}</p>
                  <p className="text-[10px] text-blue-600 font-mono bg-blue-50 p-2 rounded-xl border border-blue-100 mt-1 break-all">
                    nexucondocument/{selectedDocument?.document_reference}/{selectedVersion.version_label}
                  </p>
                </div>

                {selectedVersion.signature_hash && (
                  <div>
                    <span className="block text-[10px] uppercase text-slate-400 font-bold mb-1">Digital Signature Hash</span>
                    <p className="font-mono text-[10px] text-emerald-700 bg-emerald-50 p-2 rounded-xl border border-emerald-100 break-all">
                      {selectedVersion.signature_hash}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-100">
                  <button 
                    onClick={() => handleDownload(selectedVersion)}
                    className="w-full py-2.5 bg-blue-600 text-white hover:bg-blue-700 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-blue-500/20"
                  >
                    <Download size={15} />
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
