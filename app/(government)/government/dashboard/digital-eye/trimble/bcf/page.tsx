"use client";

import React, { useState, useEffect } from "react";
import { Share2, AlertTriangle, Box, Download, Plus } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import CreateFindingModal from "@/components/dashboard/digital-eye/CreateFindingModal";
import { DigitalEyeFinding, getDigitalEyeFindings } from "@/services/digitalEye";

export default function TrimbleBCFPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    getDigitalEyeFindings({ project: selectedProjectId }).then(setFindings);
  }, [selectedProjectId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="Trimble Connect: BCF Topics & Issues"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        onNewFindingClick={() => setIsCreateModalOpen(true)}
      />

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">BCF 2.1 / 3.0 Issue Topics</h2>
            <p className="text-xs text-gray-500 mt-0.5">Clash viewpoints and structural findings linked to Trimble Connect.</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={13} /> Log New BCF Topic
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                <th className="py-3 px-5">Topic Ref</th>
                <th className="py-3 px-5">Title & Defect</th>
                <th className="py-3 px-5">IFC Element Anchor</th>
                <th className="py-3 px-5">Severity</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3.5 px-5 font-mono font-bold text-gray-900">{f.finding_reference}</td>
                  <td className="py-3.5 px-5 font-semibold text-gray-800">{f.title}</td>
                  <td className="py-3.5 px-5 text-blue-600 font-medium flex items-center gap-1">
                    <Box size={12} /> {f.structural_element_name || "Unassigned"}
                  </td>
                  <td className="py-3.5 px-5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      f.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {f.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-right">
                    <button
                      onClick={() => {
                        setSelectedFinding(f);
                        setIsDrawerOpen(true);
                      }}
                      className="px-3 py-1 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Examine BCF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onRefresh={() => getDigitalEyeFindings({ project: selectedProjectId }).then(setFindings)}
      />

      <CreateFindingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => getDigitalEyeFindings({ project: selectedProjectId }).then(setFindings)}
        defaultProjectId={selectedProjectId}
      />
    </div>
  );
}
