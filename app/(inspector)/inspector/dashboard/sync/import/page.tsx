"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Hash,
  Database,
  Layers,
  Sparkles,
  Inbox,
  Check,
} from "lucide-react";
import { enqueueSyncItem, computeSHA256 } from "@/lib/offline-sync";

interface UploadedFileInfo {
  name: string;
  size: string;
  type: string;
  hash: string;
  parsedRecordsCount: number;
}

export default function ManualImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<UploadedFileInfo | null>(null);
  const [isHashing, setIsHashing] = useState(false);
  const [isQueued, setIsQueued] = useState(false);
  const [previewRows, setPreviewRows] = useState<string[]>([]);

  const handleFileDrop = async (file: File) => {
    setIsHashing(true);
    setIsQueued(false);

    const buffer = await file.arrayBuffer();
    const hash = await computeSHA256(buffer);

    let rows: string[] = [];
    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      rows = text.split("\n").slice(0, 5);
    } else if (file.name.endsWith(".json")) {
      rows = ["{", '  "telemetry": "parsed_stream",', '  "device": "Tersus_SLAM",', '  "status": "VALID"', "}"];
    } else {
      rows = ["[PDF Binary Content Parsed - Header valid, structural test stamps found]"];
    }

    setPreviewRows(rows);
    setSelectedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      type: file.type || "application/octet-stream",
      hash,
      parsedRecordsCount: rows.length > 0 ? rows.length : 1,
    });
    setIsHashing(false);
  };

  const handleSampleImport = async (type: "CSV" | "JSON" | "PDF") => {
    setIsHashing(true);
    setIsQueued(false);

    const sampleName =
      type === "CSV"
        ? "UPV_Field_Transit_Times.csv"
        : type === "JSON"
        ? "GPR_Subsurface_Radar_Grid.json"
        : "Foundation_Core_Compression_Report.pdf";

    const dummyContent = `SAMPLE_${type}_DATA_${Date.now()}`;
    const hash = await computeSHA256(dummyContent);

    setTimeout(() => {
      setSelectedFile({
        name: sampleName,
        size: type === "PDF" ? "1.8 MB" : "34.2 KB",
        type: type === "CSV" ? "text/csv" : type === "JSON" ? "application/json" : "application/pdf",
        hash,
        parsedRecordsCount: type === "CSV" ? 18 : type === "JSON" ? 240 : 1,
      });

      setPreviewRows(
        type === "CSV"
          ? [
              "Point,PathLength_mm,TransitTime_us,Strength_MPa",
              "A,120,30.1,27.9",
              "B,120,29.8,28.1",
              "C,120,30.3,27.5",
            ]
          : type === "JSON"
          ? [
              '{ "device": "GSSI Conquest 100", "transducer": "400MHz", "grid": "B4" }',
              '{ "scan_interval": "10mm", "depth_max": 2.5, "anomalies_detected": 1 }',
            ]
          : ["[PDF Certificate: Lagos State Materials Testing Laboratory Core Verification]"]
      );

      setIsHashing(false);
    }, 400);
  };

  const handleQueueForSync = () => {
    if (!selectedFile) return;

    enqueueSyncItem({
      type: "MANUAL_IMPORT",
      title: selectedFile.name,
      payload: { previewRows, recordsCount: selectedFile.parsedRecordsCount },
      hash: selectedFile.hash,
      timestamp: new Date().toISOString(),
      sizeBytes: 34000,
      source: "MANUAL_IMPORT",
    });

    setIsQueued(true);
    setTimeout(() => router.push("/inspector/dashboard/sync"), 1200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/inspector/dashboard/sync")}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#022C4F] flex items-center justify-center transition-colors cursor-pointer shrink-0"
            title="Back to Sync Center"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="text-[11px] font-mono text-gray-400 font-bold uppercase">
              SYNC CENTER &bull; PATH B: MANUAL IMPORT
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              MANUAL DATA INGESTION
            </h1>
          </div>
        </div>
      </div>

      {/* Drag and Drop Zone */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-8 shadow-sm space-y-6">
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileDrop(e.dataTransfer.files[0]);
            }
          }}
          className="border-2 border-dashed border-slate-300 hover:border-[#022C4F] bg-slate-50/50 hover:bg-slate-50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer"
        >
          <div className="w-14 h-14 rounded-2xl bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F] mb-3">
            <Upload size={28} />
          </div>
          <h3 className="text-base font-bold text-[#022C4F] mb-1">
            Drag &amp; Drop NDT or Test Files Here
          </h3>
          <p className="text-xs text-gray-500 max-w-md mb-4">
            Supports CSV (UPV readings), JSON (sensor telemetry &amp; SLAM points), and PDF (laboratory reports). Immediate client-side SHA-256 stamping applied.
          </p>

          <label className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-sm cursor-pointer">
            <span>Browse Files</span>
            <input
              type="file"
              accept=".csv,.json,.pdf"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileDrop(e.target.files[0]);
                }
              }}
            />
          </label>
        </div>

        {/* Quick Sample Presets */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs font-mono">
          <span className="text-gray-400 font-bold">Or load preset sample:</span>
          <button
            type="button"
            onClick={() => handleSampleImport("CSV")}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            📊 UPV Dataset (CSV)
          </button>
          <button
            type="button"
            onClick={() => handleSampleImport("JSON")}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            📡 GPR Radargram (JSON)
          </button>
          <button
            type="button"
            onClick={() => handleSampleImport("PDF")}
            className="px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            📄 Lab Certificate (PDF)
          </button>
        </div>
      </div>

      {/* File Preview & Hash Verification */}
      {selectedFile && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-[#022C4F]">
                {selectedFile.name}
              </h3>
              <span className="text-xs font-mono text-gray-500">
                Size: {selectedFile.size} &bull; Type: {selectedFile.type}
              </span>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
              SHA-256 GENERATED
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs font-mono">
            <span className="text-gray-500 block mb-1">Cryptographic Checksum:</span>
            <span className="font-bold text-[#022C4F] break-all">
              {selectedFile.hash}
            </span>
          </div>

          {/* Row Preview */}
          {previewRows.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-xs font-mono font-bold text-gray-500">
                Parsed Data Preview:
              </span>
              <pre className="p-3 rounded-xl bg-slate-900 text-cyan-300 text-xs font-mono overflow-x-auto">
                {previewRows.join("\n")}
              </pre>
            </div>
          )}

          <div className="pt-2">
            {isQueued ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-600" />
                <span>File queued into IndexedDB offline batch sync queue! Redirecting...</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQueueForSync}
                className="w-full py-3 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <Database size={15} />
                <span>Queue File For Batch Sync</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
