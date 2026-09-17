"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  RefreshCw,
  Upload,
  Layers,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Wifi,
  HardDrive,
  Trash2,
  Sparkles,
  ArrowUpRight,
  Send,
} from "lucide-react";
import {
  getSyncQueue,
  syncAllPending,
  removeSyncItem,
  SyncQueueItem,
  getPendingSyncCount,
  getVerifiedEvidenceCount,
} from "@/lib/offline-sync";

export default function SyncStatusPage() {
  const router = useRouter();
  const [queue, setQueue] = useState<SyncQueueItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setQueue(getSyncQueue());
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleUpdate = () => setQueue(getSyncQueue());

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("nexucon_sync_updated", handleUpdate);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("nexucon_sync_updated", handleUpdate);
    };
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    await syncAllPending();
    setIsSyncing(false);
    setQueue(getSyncQueue());
  };

  const handleRemove = (id: string) => {
    removeSyncItem(id);
    setQueue(getSyncQueue());
  };

  const pendingCount = queue.filter((i) => i.status === "PENDING").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Command Center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              SYNC CENTER &bull; DUAL-PATH INGESTION ENGINE
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              SYNC STATUS &amp; QUEUE
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/inspector/dashboard/sync/import"
            className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-[#022C4F] text-xs font-bold font-mono transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Upload size={14} />
            <span>Manual Import</span>
          </Link>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncing || pendingCount === 0}
            className={`px-5 py-2 rounded-xl text-xs font-bold font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-md cursor-pointer ${
              pendingCount > 0
                ? "bg-[#022C4F] hover:bg-[#022C4F]/90 text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            <RefreshCw size={14} className={isSyncing ? "animate-spin" : ""} />
            <span>{isSyncing ? "Syncing Queue..." : `Sync All (${pendingCount})`}</span>
          </button>
        </div>
      </div>

      {/* Sync Layer Diagnostic Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Network Connection */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500">
            <span>NETWORK STATUS</span>
            <Wifi size={16} className={isOnline ? "text-emerald-500" : "text-rose-500"} />
          </div>
          <div className="text-lg font-black text-gray-900 font-mono">
            {isOnline ? "Connected 🟢" : "Offline Cache ⚠️"}
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            {isOnline ? "WebSocket / MQTT Live Stream Active" : "Changes cached locally in IndexedDB"}
          </p>
        </div>

        {/* Local Storage Cache */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500">
            <span>INDEXEDDB CACHE</span>
            <HardDrive size={16} className="text-[#0284C7]" />
          </div>
          <div className="text-lg font-black text-[#022C4F] font-mono">
            {queue.length} Records
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            Persistent client-side offline storage
          </p>
        </div>

        {/* Pending Sync Queue */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-gray-500">
            <span>PENDING SYNC</span>
            <Layers size={16} className="text-amber-500" />
          </div>
          <div className="text-lg font-black text-amber-600 font-mono">
            {pendingCount} Items Queued
          </div>
          <p className="text-[11px] text-gray-500 font-mono">
            Auto-dispatches upon network reconnect
          </p>
        </div>
      </div>

      {/* Batch Sync Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase">
            BATCH SYNC QUEUE
          </h2>
          <span className="text-xs font-mono text-gray-500">
            FIFO Dispatch Order
          </span>
        </div>

        {queue.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-200 text-gray-500 font-bold">
                  <th className="pb-2.5 px-3">Item / Type</th>
                  <th className="pb-2.5 px-3">Source</th>
                  <th className="pb-2.5 px-3">SHA-256 Checksum</th>
                  <th className="pb-2.5 px-3">Status</th>
                  <th className="pb-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{item.title}</div>
                      <div className="text-[10px] text-gray-400">{item.timestamp}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.source}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      {item.hash.slice(0, 10)}...{item.hash.slice(-6)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        item.status === "SYNCED"
                          ? "bg-emerald-100 text-emerald-800"
                          : item.status === "SYNCING"
                          ? "bg-blue-100 text-blue-800 animate-pulse"
                          : item.status === "FAILED"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id)}
                        className="p-1 rounded hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition-colors"
                        title="Delete from Queue"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-400 text-xs font-mono">
            No items currently queued. All records synchronized.
          </div>
        )}
      </div>
    </div>
  );
}
