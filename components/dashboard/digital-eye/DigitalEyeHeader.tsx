"use client";

import React, { useState, useEffect } from "react";
import { 
  Building2, 
  Box, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink,
  Plus,
  Share2,
  Sliders,
  ChevronDown
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getProjects, Project } from "@/services/projects";
import {
  BIMStructuralElement,
  TrimbleConnection,
  getBIMImportStatus,
  getBIMStructuralElements,
  getTrimbleConnectionStatus,
  triggerTrimbleSync
} from "@/services/digitalEye";

interface DigitalEyeHeaderProps {
  activePillar: string;
  selectedProjectId?: string;
  onProjectChange?: (projectId: string) => void;
  selectedElementId?: string;
  onElementChange?: (elementId: string) => void;
  onNewScanClick?: () => void;
  onNewFindingClick?: () => void;
  onExportReportClick?: () => void;
}

export default function DigitalEyeHeader({
  activePillar,
  selectedProjectId,
  onProjectChange,
  selectedElementId,
  onElementChange,
  onNewScanClick,
  onNewFindingClick,
  onExportReportClick
}: DigitalEyeHeaderProps) {
  const { hasPermission } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [trimbleStatus, setTrimbleStatus] = useState<TrimbleConnection | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  // Display name of the currently imported BIM model (e.g. "test gps") —
  // shown beside the element selector so the model in view is always
  // named at the top of the workspace (7 Sep review follow-up).
  const [bimModelName, setBimModelName] = useState<string | null>(null);

  useEffect(() => {
    getProjects().then(res => {
      const pList = Array.isArray(res) ? res : ((res as any).results || []);
      setProjects(pList);
      if (!selectedProjectId && pList.length > 0 && onProjectChange) {
        onProjectChange(pList[0].id);
      }
    }).catch(() => {
      // Backend unavailable / route missing — leave the selector empty (honest).
      setProjects([]);
    });
  }, []);

  useEffect(() => {
    getBIMStructuralElements({ project: selectedProjectId }).then(res => {
      setElements(res);
      if (!selectedElementId && res.length > 0 && onElementChange) {
        onElementChange(res[0].id);
      }
      // A project switch invalidates the previous project's element selection —
      // snap to the new project's first element (or clear it) so pages that
      // filter by element never query with a stale id.
      if (selectedElementId && onElementChange && !res.some(el => el.id === selectedElementId)) {
        onElementChange(res.length > 0 ? res[0].id : "");
      }
    }).catch(() => {
      // Backend unavailable / route missing — leave the selector hidden (honest).
      setElements([]);
    });
    getBIMImportStatus(selectedProjectId || '').then(res => {
      setBimModelName(res?.currently_imported?.source_file ?? null);
    }).catch(() => {
      // No import status for this project — no model name to show (honest).
      setBimModelName(null);
    });
    getTrimbleConnectionStatus(selectedProjectId).then(res => {
      setTrimbleStatus(res);
    }).catch(() => {
      // Backend unavailable / route missing — no connection to report (honest).
      setTrimbleStatus(null);
    });
  }, [selectedProjectId]);

  const handleSyncTrimble = async () => {
    if (!trimbleStatus) return;
    setIsSyncing(true);
    try {
      const res = await triggerTrimbleSync(trimbleStatus.id);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: res.message, type: 'success' }
      }));
      getTrimbleConnectionStatus(selectedProjectId).then(setTrimbleStatus).catch(() => setTrimbleStatus(null));
    } catch (err: any) {
      const detail = err?.response?.data?.detail || err?.message || 'Failed to synchronize with Trimble Connect';
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `⚠️ ${detail}`, type: 'error' }
      }));
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Pillar Title & Breadcrumb Context */}
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
          <span>Digital Eye Workspace</span>
          <span>•</span>
          <span className="text-blue-600 font-bold">{activePillar}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-[#022C4F] flex items-center gap-2">
          {activePillar}
        </h1>
      </div>

      {/* Center: Context Selectors (Project + Structural Element) */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Project Selector */}
        <div className="relative">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs">
            <Building2 size={14} className="text-gray-500" />
            <select
              value={selectedProjectId || ""}
              onChange={(e) => onProjectChange && onProjectChange(e.target.value)}
              className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer max-w-[160px] sm:max-w-[200px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Imported BIM Model Name */}
        {bimModelName && (
          <div
            className="flex items-start gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-xs"
            title={`Currently imported BIM model: ${bimModelName}`}
          >
            <Box size={14} className="text-blue-500 shrink-0 mt-px" />
            {/* Long file names (e.g. "PROPOSED STACKING AREA_IFC.rvt") must
                read in full — the chip wraps instead of truncating. */}
            <span className="font-semibold text-blue-900 max-w-[200px] sm:max-w-[280px] leading-snug break-words">
              {bimModelName}
            </span>
          </div>
        )}

        {/* Structural Element IFC GUID Selector */}
        {onElementChange && elements.length > 0 && (
          <div className="relative">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-gray-200 rounded-xl text-xs">
              <Box size={14} className="text-blue-600" />
              <select
                value={selectedElementId || ""}
                onChange={(e) => onElementChange(e.target.value)}
                className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer max-w-[150px] sm:max-w-[180px] truncate"
              >
                <option value="">All Structural Elements</option>
                {elements.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name} ({el.grid_location})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Trimble Connect Status Indicator */}
        {trimbleStatus && (
          <div
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-xl text-xs"
            title={`Trimble Connect: ${trimbleStatus.status_display || trimbleStatus.status}`}
          >
            <div className={`w-2 h-2 rounded-full ${trimbleStatus.status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-blue-900 font-semibold">Trimble CDE</span>
            <button
              onClick={handleSyncTrimble}
              disabled={isSyncing}
              title="Synchronize IFC models and BCF topics with Trimble Connect"
              className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            >
              <RefreshCw size={12} className={isSyncing ? "animate-spin" : ""} />
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        {onExportReportClick && (
          <button
            onClick={onExportReportClick}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Share2 size={13} />
            <span>Export Dossier</span>
          </button>
        )}

        {onNewFindingClick && hasPermission('inspections.create') && (
          <button
            onClick={onNewFindingClick}
            className="px-3.5 py-2 bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>Log Finding</span>
          </button>
        )}

        {onNewScanClick && (
          <button
            onClick={onNewScanClick}
            className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Plus size={13} />
            <span>New Site Survey</span>
          </button>
        )}
      </div>
    </div>
  );
}
