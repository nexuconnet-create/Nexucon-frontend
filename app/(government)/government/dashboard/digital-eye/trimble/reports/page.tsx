"use client";

import React, { useState } from "react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import DeviceReportingSection from "@/components/dashboard/digital-eye/DeviceReportingSection";

export default function TrimbleReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="Trimble Connect: BIM Compliance Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      <DeviceReportingSection
        deviceType="trimble"
        projectId={selectedProjectId}
        elementId={selectedElementId}
        title="Trimble Connect BIM & BCF Official Deliverables"
        subtitle="Generate statutory NBC 2020 As-Built vs BIM tolerance verification dossiers (±20mm envelope), BCF 3.0 clash issue registers, and Common Data Environment (CDE) model audit trails."
      />
    </div>
  );
}
