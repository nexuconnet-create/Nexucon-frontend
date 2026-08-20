"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Layers, AlertCircle, Maximize2, Minimize2, Plus, CheckCircle, RefreshCw, ArrowRight } from "lucide-react";
import { BIMClash, BIMModel, getBIMClashes, getBIMModels, convertClashToSiteIssue } from "@/services/bim";
import RunClashMatrixModal from "@/components/dashboard/RunClashMatrixModal";

export default function ClashDetection() {
  const [clashes, setClashes] = useState<BIMClash[]>([]);
  const [models, setModels] = useState<BIMModel[]>([]);
  const [selectedClash, setSelectedClash] = useState<BIMClash | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isClashMatrixModalOpen, setIsClashMatrixModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [clashList, modelList] = await Promise.all([
        getBIMClashes(),
        getBIMModels()
      ]);
      setClashes(clashList);
      setModels(modelList);
      if (clashList.length > 0) setSelectedClash(clashList[0]);
    } catch (err) {
      console.error("Failed to load clashes", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleConvertToIssue = async (clashId: string) => {
    try {
      const res = await convertClashToSiteIssue(clashId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Clash converted into active site defect issue in Site Monitoring!', type: 'success' } 
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to convert clash', type: 'error' } }));
    }
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 p-6 flex flex-col' : 'min-h-screen pb-12'}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F]">Clash Detection (BIM)</h1>
          <p className="text-gray-500 mt-1">Identify, manage, and convert multi-disciplinary model interferences into site defects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsClashMatrixModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-700 transition-colors shadow-lg shadow-rose-900/20 text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Run Clash Matrix</span>
          </button>
        </div>
      </div>

      <div className={`grid grid-cols-1 lg:grid-cols-3 gap-6 ${isFullscreen ? 'flex-1 overflow-hidden' : ''}`}>
        {/* 3D Clash Viewer */}
        <div className={`lg:col-span-2 bg-slate-900 rounded-2xl relative overflow-hidden flex flex-col ${isFullscreen ? 'h-full' : 'h-[600px]'}`}>
          <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur text-white px-4 py-2 rounded-xl text-xs flex items-center gap-2 border border-white/10">
            <Layers size={14} className="text-rose-400" />
            3D Clash Coordinate: {selectedClash ? `${selectedClash.title} (${selectedClash.clash_type})` : 'Interference Inspector'}
          </div>
          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 z-10 p-2 bg-black/60 backdrop-blur text-white rounded-xl border border-white/10 hover:bg-white/20 transition-colors"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
          
          <div className="flex-1 flex items-center justify-center flex-col text-slate-400 p-8 text-center">
            <div className="w-48 h-48 rounded-full border-4 border-rose-500/30 flex items-center justify-center animate-pulse mb-6 relative">
              <div className="w-24 h-24 rounded-full border-4 border-blue-500/30 absolute -translate-x-8 translate-y-4"></div>
              <AlertCircle size={40} className="text-rose-500 z-10" />
            </div>
            <p className="font-bold text-slate-200 text-base">{selectedClash ? selectedClash.title : 'WebGL Interference Visualizer'}</p>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              {selectedClash ? selectedClash.description : 'Highlighting hard intersections and MEP clearance violations.'}
            </p>
          </div>
        </div>

        {/* Identified Clashes List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 bg-slate-50 font-bold text-gray-900 flex justify-between items-center text-sm">
            Identified Clashes
            <span className="bg-rose-100 text-rose-600 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {clashes.length} Active
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading clash matrix...</div>
            ) : clashes.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle size={32} className="mx-auto mb-2 text-emerald-500" />
                <p className="font-bold text-slate-700">Zero model clashes detected.</p>
              </div>
            ) : (
              clashes.map((clash) => {
                const isSelected = selectedClash?.id === clash.id;
                return (
                  <div 
                    key={clash.id} 
                    onClick={() => setSelectedClash(clash)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected ? 'border-rose-300 bg-rose-50/50 shadow-sm' : 'border-gray-100 hover:border-blue-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold font-mono text-gray-500 uppercase">{clash.clash_reference}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        clash.status === 'CONVERTED_TO_ISSUE' ? 'bg-amber-100 text-amber-800' :
                        clash.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                      }`}>
                        {clash.status === 'CONVERTED_TO_ISSUE' ? 'Converted' : `${clash.severity} Clash`}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{clash.title}</h4>
                    <p className="text-xs text-gray-500 mb-3">{clash.description}</p>
                    
                    <div className="flex items-center gap-2">
                      {clash.status !== 'CONVERTED_TO_ISSUE' ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleConvertToIssue(clash.id); }}
                          className="w-full py-1.5 bg-white border border-gray-200 text-xs font-bold text-gray-700 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                        >
                          Convert to Site Issue
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle size={13} /> Active in Site Issues
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <RunClashMatrixModal
        isOpen={isClashMatrixModalOpen}
        onClose={() => setIsClashMatrixModalOpen(false)}
        models={models}
        onSuccess={fetchData}
      />
    </div>
  );
}
