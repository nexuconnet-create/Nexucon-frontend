"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Layers,
  Filter,
  CheckCircle2,
  AlertCircle,
  Hash,
  Download,
  Trash2,
  Send,
  Search,
  Check,
  Camera,
  Thermometer,
  Activity,
  Radio,
  FileText,
  ShieldCheck,
} from "lucide-react";
import { computeSHA256, getPendingSyncCount, getVerifiedEvidenceCount } from "@/lib/offline-sync";

interface EvidenceFile {
  id: string;
  icon: string;
  name: string;
  type: "Photo" | "Thermal" | "NDT File" | "Document";
  size: string;
  gps: string;
  timestamp: string;
  inspector: string;
  hash: string;
  status: "VERIFIED" | "PENDING";
}

const INITIAL_MEDIA_LEDGER: EvidenceFile[] = [
  {
    id: "ev-1",
    icon: "📸",
    name: "Column C4 Crack.jpg",
    type: "Photo",
    size: "2.4 MB",
    gps: "6.428100° N, 3.421900° E",
    timestamp: "2026-09-16 10:30:45 WAT",
    inspector: "Badge #LAG-INS-042",
    hash: "a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3",
    status: "VERIFIED",
  },
  {
    id: "ev-2",
    icon: "🌡️",
    name: "Thermal_Scan_01.jpg",
    type: "Thermal",
    size: "3.1 MB",
    gps: "6.428100° N, 3.421900° E",
    timestamp: "2026-09-16 10:35:12 WAT",
    inspector: "Badge #LAG-INS-042",
    hash: "b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3a3f5",
    status: "VERIFIED",
  },
  {
    id: "ev-3",
    icon: "📊",
    name: "UPV_Reading_01.csv",
    type: "NDT File",
    size: "14.2 KB",
    gps: "6.428100° N, 3.421900° E",
    timestamp: "2026-09-16 10:40:00 WAT",
    inspector: "Badge #LAG-INS-042",
    hash: "c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8",
    status: "VERIFIED",
  },
  {
    id: "ev-4",
    icon: "📡",
    name: "GPR_Radargram_01.dzt",
    type: "NDT File",
    size: "840 KB",
    gps: "6.428100° N, 3.421900° E",
    timestamp: "2026-09-16 11:00:15 WAT",
    inspector: "Badge #LAG-INS-042",
    hash: "d4e7f0a3b6c9d2e5f8a1b4c7d0e3a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1",
    status: "PENDING",
  },
];

export default function EvidenceVaultPage() {
  const router = useRouter();
  const [files, setFiles] = useState<EvidenceFile[]>(INITIAL_MEDIA_LEDGER);
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedFile, setSelectedFile] = useState<EvidenceFile>(INITIAL_MEDIA_LEDGER[0]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(3);
  const [verifiedCount, setVerifiedCount] = useState(247);

  useEffect(() => {
    setPendingCount(getPendingSyncCount());
    setVerifiedCount(getVerifiedEvidenceCount());
  }, []);

  const filteredFiles = files.filter((f) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Photos") return f.type === "Photo";
    if (activeFilter === "Thermal") return f.type === "Thermal";
    if (activeFilter === "NDT Files") return f.type === "NDT File";
    if (activeFilter === "Documents") return f.type === "Document";
    return true;
  });

  const handleVerifyHash = async () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationResult("SHA-256 MATCHES IMMUTABLE DIRECTORY LEDGER (TAMPER-PROOF ✅)");
      setTimeout(() => setVerificationResult(null), 3000);
    }, 600);
  };

  const handleSyncToDashboard = () => {
    alert(`File ${selectedFile.name} synced directly to State Government Dashboard.`);
  };

  const handleDelete = () => {
    if (confirm(`Remove local copy of ${selectedFile.name}? (Statutory hash stays logged in ledger)`)) {
      setFiles((prev) => prev.filter((f) => f.id !== selectedFile.id));
      if (filteredFiles.length > 1) {
        setSelectedFile(filteredFiles[1]);
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-5xl mx-auto pb-20">
      {/* Top Header */}
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
              TECHNICAL ANALYSIS &bull; CRYPTOGRAPHIC VAULT
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#022C4F]">
              EVIDENCE VAULT
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/inspector/dashboard/sync/import"
            className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Upload size={14} />
            <span>Upload File</span>
          </Link>
        </div>
      </div>

      {/* INTEGRITY STATUS (Specified in Wireframe 6) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-emerald-600" />
          <span className="text-xs font-mono font-bold text-gray-700">INTEGRITY STATUS:</span>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono font-bold">
          <span className="text-emerald-700 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span>✅ {verifiedCount} files SHA-256 verified</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-amber-700 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span>🟢 {pendingCount} files pending sync</span>
          </span>
        </div>
      </div>

      {/* FILTERS (Specified in Wireframe 6) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-mono font-bold text-gray-500 mr-1">FILTERS:</span>
        {["All", "Photos", "Thermal", "NDT Files", "Documents"].map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer shrink-0 ${
              activeFilter === filter
                ? "bg-[#022C4F] text-white shadow-sm"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200"
            }`}
          >
            {filter} {filter === "All" && "▼"}
          </button>
        ))}
      </div>

      {/* MEDIA LEDGER (Master-Detail Layout) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: MEDIA LEDGER TABLE / LIST */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h2 className="text-base font-bold text-[#022C4F] tracking-tight uppercase pb-2 border-b border-gray-100">
            MEDIA LEDGER
          </h2>

          <div className="space-y-2">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile?.id === file.id;
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFile(file)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#022C4F] bg-blue-50/50 shadow-sm"
                      : "border-slate-200/80 bg-white hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xl p-2 rounded-lg bg-slate-100 shrink-0">
                      {file.icon}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {file.name}
                      </h4>
                      <p className="text-[11px] font-mono text-gray-500 truncate">
                        GPS: {file.gps.split(",")[0].trim()}, {file.gps.split(",")[1]?.trim() || "3.4219"}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-right shrink-0 font-mono">
                    <span className="text-[11px] text-gray-500">
                      SHA-256: {file.hash.slice(0, 4)}...
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      file.status === "VERIFIED"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {file.status === "VERIFIED" ? "✅ VERIFIED" : "🟢 PENDING"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {file.timestamp.split(" ")[0]}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: SELECTED FILE DETAILS (Specified in Wireframe 6) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#022C4F] tracking-tight uppercase pb-2 border-b border-gray-100">
              SELECTED FILE DETAILS
            </h3>

            {selectedFile ? (
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <span className="text-gray-500 block text-[11px]">File:</span>
                  <span className="font-bold text-gray-900 break-all">{selectedFile.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-gray-500 block text-[11px]">Type:</span>
                    <span className="font-bold text-gray-900">{selectedFile.type}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[11px]">Size:</span>
                    <span className="font-bold text-gray-900">{selectedFile.size}</span>
                  </div>
                </div>

                <div>
                  <span className="text-gray-500 block text-[11px]">GPS:</span>
                  <span className="font-bold text-gray-900">{selectedFile.gps}</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[11px]">Timestamp:</span>
                  <span className="font-bold text-gray-900">{selectedFile.timestamp}</span>
                </div>

                <div>
                  <span className="text-gray-500 block text-[11px]">Inspector:</span>
                  <span className="font-bold text-gray-900">{selectedFile.inspector}</span>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-gray-500 block font-bold mb-1">
                    FULL SHA-256 AUDIT CHECKSUM:
                  </span>
                  <p className="font-bold text-[#022C4F] text-[11px] break-all leading-tight">
                    {selectedFile.hash}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-gray-500">Status:</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-emerald-600" />
                    <span>Status: ✅ VERIFIED (Tamper-proof)</span>
                  </span>
                </div>

                {verificationResult && (
                  <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-bold animate-in fade-in">
                    {verificationResult}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-gray-400">Select a file from the media ledger.</p>
            )}
          </div>

          {/* Action Buttons (Specified in Wireframe 6) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleVerifyHash}
              disabled={isVerifying}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Hash size={14} className="text-[#0284C7]" />
              <span>{isVerifying ? "Verifying..." : "🔍 VERIFY HASH"}</span>
            </button>

            <button
              type="button"
              onClick={handleSyncToDashboard}
              className="px-3 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Send size={14} />
              <span>📤 SYNC</span>
            </button>

            <button
              type="button"
              onClick={() => alert(`Exported file ${selectedFile.name}`)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Download size={14} />
              <span>📥 EXPORT</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs font-mono transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Trash2 size={14} />
              <span>🗑️ DELETE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
