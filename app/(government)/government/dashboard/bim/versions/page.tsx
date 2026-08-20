"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { History, ArrowRight, UploadCloud, GitCommit, FileDiff, Box, GitBranch, Eye, Download, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { BIMModel, BIMModelVersion, getBIMModels, getBIMVersions, compareBIMVersions } from "@/services/bim";
import UploadBIMVersionModal from "@/components/dashboard/UploadBIMVersionModal";

export default function ModelVersions() {
  const router = useRouter();
  const [models, setModels] = useState<BIMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [versions, setVersions] = useState<BIMModelVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<BIMModelVersion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const fetchVersionsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const modelsData = await getBIMModels();
      setModels(modelsData);
      
      const active = modelsData.length > 0 ? modelsData[0] : null;
      setSelectedModel(active);

      if (active) {
        const vList = await getBIMVersions({ model: active.id });
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

  const handleModelChange = async (modelId: string) => {
    const found = models.find(m => m.id === modelId) || null;
    setSelectedModel(found);
    if (found) {
      const vList = await getBIMVersions({ model: found.id });
      setVersions(vList);
      if (vList.length > 0) setSelectedVersion(vList[0]);
    }
  };

  const handleCompare = async () => {
    if (versions.length < 2) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'At least 2 revisions are required to run differential comparison.', type: 'warning' } 
      }));
      return;
    }
    try {
      const res = await compareBIMVersions(versions[0].id, versions[1].id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Compared ${versions[0].version_label} vs ${versions[1].version_label}: ${res.elements_modified} elements modified, ${res.elements_added} added.`, type: 'info' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <span>BIM Models</span>
            <ArrowRight size={14} />
            <span className="font-semibold text-blue-600">{selectedModel?.name || 'Loading...'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <History className="text-blue-500" />
            Model Version History & Diffs
          </h1>
          <p className="text-gray-500 mt-1">Track revision provenance, commit metadata, and element delta statistics.</p>
        </div>

        <div className="flex items-center gap-3">
          {models.length > 1 && (
            <select
              value={selectedModel?.id}
              onChange={(e) => handleModelChange(e.target.value)}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700"
            >
              {models.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          )}
          <button 
            onClick={handleCompare}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <FileDiff size={16} />
            Compare Versions
          </button>
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
              <div className="py-20 text-center text-slate-400 text-xs">Loading revision timeline...</div>
            ) : versions.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Box size={40} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-700">No revisions logged for this model.</p>
              </div>
            ) : (
              <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                {versions.map((version, idx) => {
                  const isSelected = selectedVersion?.id === version.id;
                  return (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      key={version.id}
                      className="relative pl-8"
                    >
                      {/* Timeline Dot */}
                      <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 ${
                        version.is_current
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
                                version.is_current ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {version.version_label}
                              </span>
                              {version.is_current && (
                                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                                  Current Master
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-800 font-medium">{version.changes_summary}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-semibold text-gray-500">{new Date(version.created_at).toLocaleDateString()}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{version.author_name} • {version.author_role}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100/50">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                            <span>+</span>{version.stats_added} added
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-1 rounded">
                            <span>~</span>{version.stats_modified} modified
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 px-2 py-1 rounded">
                            <span>-</span>{version.stats_removed} removed
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
          {selectedVersion ? (
            <motion.div
              key={selectedVersion.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6"
            >
              <div className="h-40 bg-gradient-to-br from-blue-900 to-[#022C4F] relative flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20 mix-blend-overlay"></div>
                <Box size={64} className="text-white/20" />
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                  <span className="text-white font-mono font-bold text-lg bg-black/30 px-3 py-1 rounded backdrop-blur-sm">
                    {selectedVersion.version_label}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">Version Commit Details</h3>

                <div className="space-y-4">
                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Author</span>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                        {selectedVersion.author_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{selectedVersion.author_name}</p>
                        <p className="text-xs text-gray-500">{selectedVersion.author_role}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">Commit Hash</span>
                    <div className="flex items-center gap-2 text-sm font-mono text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                      <GitCommit size={14} className="text-gray-400" />
                      {selectedVersion.commit_hash}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs uppercase text-gray-400 font-semibold mb-1">File Size</span>
                    <p className="text-sm font-semibold text-gray-700">{selectedVersion.file_size} ({selectedModel?.format || 'IFC4'})</p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
                  <button 
                    onClick={() => router.push('/government/dashboard/bim/review')}
                    className="w-full py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Eye size={16} />
                    Open in Viewer
                  </button>
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: `Downloading IFC file for ${selectedVersion.version_label}...`, type: 'info' } }))}
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download IFC File
                  </button>
                </div>
              </div>
            </motion.div>
          ) : null}
        </div>
      </div>

      <UploadBIMVersionModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        model={selectedModel}
        onSuccess={fetchVersionsData}
      />
    </div>
  );
}
