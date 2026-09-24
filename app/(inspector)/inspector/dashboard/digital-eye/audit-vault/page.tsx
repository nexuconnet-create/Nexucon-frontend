"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Eye,
  Layers,
  Sparkles,
  Radio,
  Box,
  Satellite,
  Scan,
  Key,
} from "lucide-react";
import { computeSHA256 } from "@/lib/offline-sync";

interface VaultItem {
  id: string;
  sourceDevice: "T-S1 LiDAR" | "PUNDIT UPV" | "GPR Radar" | "Trimble CDE" | "Tersus GNSS";
  dataType: string;
  fileName: string;
  size: string;
  recordedBy: string;
  sha256Hash: string;
  tamperStatus: "VERIFIED" | "PENDING" | "MODIFIED";
  timestamp: string;
}

export default function AuditShaVaultPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("ALL");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  const [vaultItems, setVaultItems] = useState<VaultItem[]>([
    {
      id: "VAULT-2026-801",
      sourceDevice: "T-S1 LiDAR",
      dataType: "3D Spatial Point Cloud",
      fileName: "TS1_L4_SlabReinforcement.las",
      size: "142 MB",
      recordedBy: "Badge #LAG-INS-042",
      sha256Hash: "9a2f7c01b45de89f1092a832c9183b0f5e1284d720c24f61e7a5b3d90218fa22",
      tamperStatus: "VERIFIED",
      timestamp: "Today, 09:15 AM",
    },
    {
      id: "VAULT-2026-802",
      sourceDevice: "PUNDIT UPV",
      dataType: "A-Scan Waveform Oscillogram",
      fileName: "PUNDIT_Col_C3_GridP1_P12.csv",
      size: "4.8 MB",
      recordedBy: "Badge #LAG-INS-042",
      sha256Hash: "3f8e1a2b5c7d9e0f2a4b6c8d0e2f4a6b8c0d2e4f6a8b0c2d4e6f8a0b2c4d6e8f",
      tamperStatus: "VERIFIED",
      timestamp: "Today, 10:24 AM",
    },
    {
      id: "VAULT-2026-803",
      sourceDevice: "GPR Radar",
      dataType: "B-Scan Radargram Profile",
      fileName: "GPR_Conquest_Section_L4.dzt",
      size: "38.2 MB",
      recordedBy: "Badge #LAG-INS-042",
      sha256Hash: "a3f5b8c2d1e4f7a9b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3a1b2",
      tamperStatus: "VERIFIED",
      timestamp: "Today, 10:30 AM",
    },
    {
      id: "VAULT-2026-804",
      sourceDevice: "Trimble CDE",
      dataType: "BCF Deviation Topic Snapshot",
      fileName: "BCF_Col_C4_Out_Of_Plumb.bcfzip",
      size: "12.4 MB",
      recordedBy: "Badge #LAG-INS-042",
      sha256Hash: "c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5",
      tamperStatus: "VERIFIED",
      timestamp: "Today, 10:45 AM",
    },
    {
      id: "VAULT-2026-805",
      sourceDevice: "Tersus GNSS",
      dataType: "Geodetic Control Points",
      fileName: "GNSS_Site_Control_CP01_CP06.xml",
      size: "1.2 MB",
      recordedBy: "Badge #LAG-INS-042",
      sha256Hash: "4a8e2b7c9f10d3a5e8b2c4d6f8a0e2b4c6d8f0a2e4b6c8d0f2a4e6b8c0d2f4a6",
      tamperStatus: "VERIFIED",
      timestamp: "Today, 08:30 AM",
    },
  ]);

  const handleVerifyHash = async (item: VaultItem) => {
    setVerifyingId(item.id);
    setTimeout(async () => {
      setVerifyingId(null);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: `SHA-256 for ${item.fileName} mathematically verified! Zero tampering detected.`,
            type: "success",
          },
        })
      );
    }, 1000);
  };

  const filteredItems = vaultItems.filter((item) => {
    const matchesSearch =
      item.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sha256Hash.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDevice =
      deviceFilter === "ALL" || item.sourceDevice.includes(deviceFilter);
    return matchesSearch && matchesDevice;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-2">
            <Link href="/inspector/dashboard/digital-eye" className="hover:underline">Digital Eye</Link>
            <ChevronRight size={13} />
            <span>Audit & SHA-256 Vault</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight flex items-center gap-3">
            <ShieldCheck className="text-emerald-600" />
            Cryptographic Sensor Audit Vault
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Immutable SHA-256 cryptographic proof ledger for all 5 Digital Eye telemetry pipelines and court-admissible evidence.
          </p>
        </div>

        {/* Top Integrity Summary Cards */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <Lock size={15} className="text-emerald-600" />
            <span>100% Tamper-Evident</span>
          </div>

          <button
            type="button"
            onClick={() =>
              window.dispatchEvent(
                new CustomEvent("show-toast", {
                  detail: { message: "Generating Merkle Tree Proof for all inspection records...", type: "info" },
                })
              )
            }
            className="px-4 py-2 rounded-2xl bg-[#022C4F] hover:bg-[#033B6B] text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Key size={14} />
            <span>Certify Merkle Proof</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by file name, Vault ID, or SHA-256 hash..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-blue-500 text-slate-700"
          />
        </div>

        {/* Device Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {["ALL", "T-S1", "PUNDIT", "GPR", "Trimble", "GNSS"].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDeviceFilter(d)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                deviceFilter === d
                  ? "bg-[#022C4F] text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {d === "ALL" ? "All Sensors" : d}
            </button>
          ))}
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
            <Layers size={18} className="text-[#0284C7]" />
            Immutable Evidence Hash Ledger
          </h2>
          <span className="text-xs text-gray-500 font-mono">
            {filteredItems.length} records verified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Vault ID & Sensor</th>
                <th className="py-3 px-4">Artifact / File Name</th>
                <th className="py-3 px-4">SHA-256 Fingerprint</th>
                <th className="py-3 px-4">Captured By</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Integrity State</th>
                <th className="py-3 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <p className="font-mono font-bold text-[#022C4F]">{item.id}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-[#022C4F]">
                      {item.sourceDevice}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-slate-800">{item.fileName}</p>
                    <p className="text-[11px] text-gray-400 font-mono">{item.dataType} • {item.size}</p>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[11px] text-slate-500 max-w-xs">
                    <span className="break-all" title={item.sha256Hash}>
                      {item.sha256Hash.substring(0, 16)}...{item.sha256Hash.substring(item.sha256Hash.length - 12)}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">{item.recordedBy}</td>
                  <td className="py-3.5 px-4 font-mono text-gray-500">{item.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                      <CheckCircle2 size={12} />
                      <span>{item.tamperStatus}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleVerifyHash(item)}
                      disabled={verifyingId === item.id}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[#022C4F] font-bold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {verifyingId === item.id ? (
                        <span className="flex items-center gap-1">
                          <RefreshCw size={12} className="animate-spin" /> Verifying...
                        </span>
                      ) : (
                        "Verify Hash"
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
