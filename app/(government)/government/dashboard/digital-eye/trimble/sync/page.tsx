"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, CheckCircle2, Box, Activity, Clock, ShieldCheck } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import { TrimbleConnection, getTrimbleConnectionStatus, triggerTrimbleSync } from "@/services/digitalEye";

export default function TrimbleSyncPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [trimbleStatus, setTrimbleStatus] = useState<TrimbleConnection | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    getTrimbleConnectionStatus(selectedProjectId).then(setTrimbleStatus);
  }, [selectedProjectId]);

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const res = await triggerTrimbleSync(selectedProjectId || "proj-eko-01");
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: res.message, type: "success" } }));
      getTrimbleConnectionStatus(selectedProjectId).then(setTrimbleStatus);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Sync failed", type: "error" } }));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="Trimble Connect: CDE Model Sync"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Box size={24} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">Trimble Connect CDE Bi-Directional Bridge</h2>
                <p className="text-xs text-gray-500 mt-0.5">Automated synchronization of structural IFC models and site observations.</p>
              </div>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw size={13} className={isSyncing ? "animate-spin" : ""} />
              <span>{isSyncing ? "Synchronizing..." : "Trigger Manual Sync"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Synced Models</span>
              <span className="text-xl font-bold text-gray-900 font-mono mt-1">{trimbleStatus?.synced_models_count || 6}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">BIM Elements</span>
              <span className="text-xl font-bold text-gray-900 font-mono mt-1">{trimbleStatus?.synced_elements_count || 14250}</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-gray-400 block text-[10px] uppercase font-bold">BCF Topics</span>
              <span className="text-xl font-bold text-blue-600 font-mono mt-1">{trimbleStatus?.bcf_topics_count || 18}</span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-700 block text-[10px] uppercase font-bold">Bridge Status</span>
              <span className="text-xs font-bold text-emerald-800 uppercase font-mono mt-1 flex items-center gap-1">
                <CheckCircle2 size={12} /> {trimbleStatus?.status || "CONNECTED"}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-[#022C4F]">CDE Configuration</h3>
          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex justify-between"><span>Region:</span><strong>{trimbleStatus?.region || "EU-West"}</strong></div>
            <div className="flex justify-between"><span>Project ID:</span><span className="font-mono">{trimbleStatus?.trimble_project_id || "TC-PRJ-99201"}</span></div>
            <div className="flex justify-between"><span>Last Sync:</span><span>{trimbleStatus?.last_sync_at ? new Date(trimbleStatus.last_sync_at).toLocaleTimeString() : "Just now"}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
