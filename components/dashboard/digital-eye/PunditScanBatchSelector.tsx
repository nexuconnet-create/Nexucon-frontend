"use client";

import React, { useState, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  Plus,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  UserCheck,
  Camera,
  Filter,
} from "lucide-react";
import {
  PunditScanBatch,
  getPunditScanBatches,
  createPunditScanBatch,
} from "@/services/digitalEye";

interface PunditScanBatchSelectorProps {
  projectId: string;
  selectedBatchId?: string;
  onSelectBatch: (batch: PunditScanBatch | null) => void;
  onBatchesLoaded?: (batches: PunditScanBatch[]) => void;
  className?: string;
}

export default function PunditScanBatchSelector({
  projectId,
  selectedBatchId,
  onSelectBatch,
  onBatchesLoaded,
  className = "",
}: PunditScanBatchSelectorProps) {
  const [batches, setBatches] = useState<PunditScanBatch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [newInspectorName, setNewInspectorName] = useState("");
  const [newElementCount, setNewElementCount] = useState<number>(48);
  const [newFloor, setNewFloor] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const loadBatches = async () => {
    if (!projectId) {
      setBatches([]);
      onSelectBatch(null);
      return;
    }
    setIsLoading(true);
    try {
      const rows = await getPunditScanBatches(projectId);
      setBatches(rows || []);
      if (onBatchesLoaded) onBatchesLoaded(rows || []);

      // Auto-select initial batch if none selected
      if (!selectedBatchId && rows && rows.length > 0) {
        onSelectBatch(rows[0]);
      } else if (!rows || rows.length === 0) {
        onSelectBatch(null);
      }
    } catch {
      setBatches([]);
      onSelectBatch(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, [projectId]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    try {
      const created = await createPunditScanBatch({
        project_id: projectId,
        folder_name: newFolderName.trim(),
        inspector_name: newInspectorName.trim() || "Field Inspector",
        element_count: Number(newElementCount) || 0,
        floor: newFloor.trim() || "Ground Floor",
        notes: newNotes.trim(),
        status: "RAW_INGESTED",
      });

      const updated = [created, ...batches];
      setBatches(updated);
      onSelectBatch(created);
      setIsCreating(false);
      setNewFolderName("");
      setNewInspectorName("");
      setNewNotes("");
    } catch (err: any) {
      alert("Failed to create scan folder: " + (err.message || "Unknown error"));
    }
  };

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) || null;

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 ${className}`}>
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-sky-50 text-[#0284C7]">
            <FolderOpen size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
              Project Scan Batches & Raw Data Folders
              <span className="text-[11px] font-normal text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                Isolates Field Scans (Prevents 59 vs 48 Clashes)
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Raw scan data is strictly isolated into project folders for curated manual calibration and analysis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsCreating(!isCreating)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus size={14} className={isCreating ? "rotate-45 transition-transform" : ""} />
            <span>{isCreating ? "Cancel" : "New Scan Folder"}</span>
          </button>
        </div>
      </div>

      {/* New Folder Form */}
      {isCreating && (
        <form onSubmit={handleCreateBatch} className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 space-y-3 animate-in fade-in duration-150">
          <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <Plus size={13} className="text-[#0284C7]" />
            <span>Create Isolated Project Scan Folder</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Folder / Session Name *</label>
              <input
                type="text"
                required
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Floor 2 Slab (48 elements)"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Inspector / Lead Officer</label>
              <input
                type="text"
                value={newInspectorName}
                onChange={(e) => setNewInspectorName(e.target.value)}
                placeholder="e.g. Engr. Abdullateef"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Target Element Count</label>
              <input
                type="number"
                min={1}
                value={newElementCount}
                onChange={(e) => setNewElementCount(Number(e.target.value))}
                placeholder="48"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-slate-600 mb-1">Floor / Structural Level</label>
              <input
                type="text"
                value={newFloor}
                onChange={(e) => setNewFloor(e.target.value)}
                placeholder="e.g. Level 2"
                className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200/60"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold"
            >
              Create Folder
            </button>
          </div>
        </form>
      )}

      {/* Batch Cards Grid */}
      {isLoading ? (
        <div className="p-6 text-center text-xs text-slate-400">Loading scan folders...</div>
      ) : batches.length === 0 ? (
        <div className="p-6 text-center text-xs text-slate-400">No scan folders found for this project.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {batches.map((b) => {
            const isSelected = selectedBatchId === b.id;
            const isAnalyzed = b.status === "ANALYSIS_COMPLETE";
            const isCalibrated = b.status === "CALIBRATED";

            return (
              <div
                key={b.id}
                onClick={() => onSelectBatch(b)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? "bg-sky-50/70 border-[#0284C7] ring-2 ring-[#0284C7]/20 shadow-sm"
                    : "bg-slate-50/50 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="text-[11px] font-mono font-bold text-slate-500 uppercase">
                      {b.batch_reference}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isAnalyzed
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : isCalibrated
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : "bg-amber-50 text-amber-700 border-amber-200"
                      }`}
                    >
                      {isAnalyzed
                        ? "ANALYZED"
                        : isCalibrated
                        ? "CALIBRATED"
                        : "RAW (AWAITING CALIBRATION)"}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {b.folder_name}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1 mb-2">
                    {b.inspector_name} {b.floor ? `• ${b.floor}` : ""}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-bold text-[#022C4F] bg-white px-2 py-0.5 rounded border border-slate-200">
                      <Layers size={11} className="text-[#0284C7]" />
                      {b.element_count} Elements
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-[10px] text-slate-500">
                    {b.visual_observations_count > 0 && (
                      <span className="flex items-center gap-0.5" title="Visual Observations Recorded">
                        <Camera size={11} className="text-indigo-500" />
                        {b.visual_observations_count}
                      </span>
                    )}
                    {b.attendance_count > 0 && (
                      <span className="flex items-center gap-0.5" title="Site Representatives Logged">
                        <UserCheck size={11} className="text-teal-600" />
                        {b.attendance_count}
                      </span>
                    )}
                    <span>{new Date(b.scan_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Batch Summary Banner */}
      {selectedBatch && (
        <div className="bg-slate-100/70 rounded-xl p-3 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-700">
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span>
              Active Isolated Dataset: <strong>{selectedBatch.folder_name}</strong> (
              <span className="font-mono font-bold text-[#022C4F]">{selectedBatch.element_count} elements</span>
              ). Only tests in this folder will be analyzed.
            </span>
          </div>

          <div className="text-[11px] text-slate-500 font-mono">
            Model: {selectedBatch.calibration_model || "Exponential (Default)"}
          </div>
        </div>
      )}
    </div>
  );
}
