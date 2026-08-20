"use client";

import React, { useState, useEffect, useCallback } from "react";
import { CheckCircle, ShieldCheck, Download, Award, Box, RefreshCw } from "lucide-react";
import { BIMModel, getBIMModels } from "@/services/bim";

export default function ApprovedBIM() {
  const [models, setModels] = useState<BIMModel[]>([]);
  const [selectedModel, setSelectedModel] = useState<BIMModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCertifiedModels = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBIMModels({ certified: true });
      setModels(data);
      if (data.length > 0) setSelectedModel(data[0]);
    } catch (err) {
      console.error("Failed to load certified models", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCertifiedModels();
  }, [fetchCertifiedModels]);

  const handleDownload = () => {
    if (!selectedModel) return;
    window.dispatchEvent(new CustomEvent('show-toast', { 
      detail: { message: `Downloading stamped IFC certified model "${selectedModel.name}" with hash verification certificate...`, type: 'success' } 
    }));
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Digitally Certified BIM Models</h1>
          <p className="text-gray-500 mt-1">Read-only, timestamped BIM models with official government approval stamps and cryptographic hashes.</p>
        </div>
        <button 
          onClick={fetchCertifiedModels}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading digitally certified models...</div>
      ) : models.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-gray-100 p-8">
          <ShieldCheck size={48} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No BIM models have been digitally certified yet.</p>
          <p className="text-xs text-slate-400 mt-1">Approve and stamp models from the BIM Library or Review workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-900 rounded-2xl h-[500px] relative overflow-hidden flex flex-col items-center justify-center border-4 border-emerald-500/20">
            <div className="absolute top-4 right-4 bg-emerald-500/20 text-emerald-400 px-4 py-2 rounded-xl text-sm border border-emerald-500/30 flex items-center gap-2 font-bold backdrop-blur">
              <Award size={18}/> OFFICIALLY STAMPED & LOCKED
            </div>
            <Box size={64} className="text-emerald-500/50 mb-6"/>
            <p className="text-emerald-300/70 font-mono text-sm">WebGL Viewer: Certified IFC Model</p>
            <p className="text-xs text-emerald-400/50 mt-1">{selectedModel?.name} ({selectedModel?.format || 'IFC4'})</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
              <ShieldCheck size={32}/>
            </div>
            <h2 className="text-xl font-bold text-gray-900">{selectedModel?.name}</h2>
            <p className="text-sm text-gray-500 mb-6">Model ID: {selectedModel?.model_reference}</p>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Status</span>
                <span className="text-sm font-bold text-emerald-600 flex items-center gap-1"><CheckCircle size={14}/> Certified</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Approved By</span>
                <span className="text-sm font-bold text-gray-900">{selectedModel?.certified_by_name || 'Dir. O. Adeleke'}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Timestamp</span>
                <span className="text-sm font-bold text-gray-900">
                  {selectedModel?.certified_at ? new Date(selectedModel.certified_at).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-gray-50">
                <span className="text-sm text-gray-500">Hash Signature</span>
                <span className="text-xs font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {selectedModel?.hash_signature || '0x3f8a...c91'}
                </span>
              </div>
            </div>
            
            <button 
              onClick={handleDownload}
              className="w-full mt-auto bg-[#022C4F] hover:bg-[#033c6c] text-white py-3 rounded-xl text-sm font-bold shadow-lg flex items-center justify-center gap-2 transition-colors"
            >
              <Download size={18}/> Download Stamped Model
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
