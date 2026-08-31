"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, AlertTriangle, CheckCircle2, Download } from "lucide-react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import FindingDetailDrawer from "@/components/dashboard/digital-eye/FindingDetailDrawer";
import { PunditTest, getPunditTests, DigitalEyeFinding, getDigitalEyeFindings } from "@/services/digitalEye";

export default function PunditCompliancePage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [tests, setTests] = useState<PunditTest[]>([]);
  const [findings, setFindings] = useState<DigitalEyeFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<DigitalEyeFinding | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    getPunditTests({ project: selectedProjectId }).then(setTests);
    getDigitalEyeFindings({ project: selectedProjectId }).then(res => {
      setFindings(res.filter(f => f.taxonomy === 'LOW_PULSE_VELOCITY_ZONE'));
    });
  }, [selectedProjectId]);

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: BS 1881-203 Compliance & NDT Certification"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
      />

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6 space-y-4">
        <h2 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-600" />
          BS 1881: Part 203 Concrete Homogeneity Rating
        </h2>
        <p className="text-xs text-gray-500">Regulatory standards evaluation for non-destructive testing of structural elements.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
            <span className="text-emerald-800 text-[10px] font-bold uppercase block">&gt; 4,500 m/s</span>
            <span className="text-sm font-bold text-emerald-900 mt-1 block">Excellent Quality</span>
            <span className="text-[10px] text-emerald-600 block mt-1">Dense, no voids</span>
          </div>

          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
            <span className="text-blue-800 text-[10px] font-bold uppercase block">3,500 – 4,500 m/s</span>
            <span className="text-sm font-bold text-blue-900 mt-1 block">Good Quality</span>
            <span className="text-[10px] text-blue-600 block mt-1">Normal structural concrete</span>
          </div>

          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
            <span className="text-amber-800 text-[10px] font-bold uppercase block">3,000 – 3,500 m/s</span>
            <span className="text-sm font-bold text-amber-900 mt-1 block">Doubtful Quality</span>
            <span className="text-[10px] text-amber-600 block mt-1">Requires core extraction</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <span className="text-rose-800 text-[10px] font-bold uppercase block">&lt; 3,000 m/s</span>
            <span className="text-sm font-bold text-rose-900 mt-1 block">Poor Quality</span>
            <span className="text-[10px] text-rose-600 block mt-1">Severe voids / stop-work</span>
          </div>
        </div>
      </div>

      {findings.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-6">
          <h3 className="text-sm font-bold text-rose-700 mb-3 flex items-center gap-2">
            <AlertTriangle size={16} /> Flagged Low-Velocity Structural Elements (Action Required)
          </h3>
          <div className="space-y-3">
            {findings.map((f) => (
              <div
                key={f.id}
                onClick={() => {
                  setSelectedFinding(f);
                  setIsDrawerOpen(true);
                }}
                className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 hover:bg-rose-50 transition-all cursor-pointer flex justify-between items-center"
              >
                <div>
                  <span className="font-mono font-bold text-xs text-rose-800">{f.finding_reference}</span>
                  <h4 className="font-bold text-sm text-gray-900">{f.title}</h4>
                  <p className="text-xs text-gray-600">{f.description}</p>
                </div>
                <button className="px-3 py-1.5 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm">
                  Review & Issue NCR
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <FindingDetailDrawer
        finding={selectedFinding}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </div>
  );
}
