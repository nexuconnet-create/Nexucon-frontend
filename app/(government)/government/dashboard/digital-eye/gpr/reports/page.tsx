"use client";

import React, { useState } from "react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import DeviceReportingSection from "@/components/dashboard/digital-eye/DeviceReportingSection";

export default function GPRReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="GPR: Subsurface Radar Compliance Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      <DeviceReportingSection
        deviceType="gpr"
        projectId={selectedProjectId}
        elementId={selectedElementId}
        title="Ground Penetrating Radar (GPR) Official Deliverables"
        subtitle="Generate ASTM D4748 / ACI 228.2R certified subsurface inspection dossiers, rebar cover depth statutory matrices, and air/water void risk assessments."
      />
    </div>
  );
}
