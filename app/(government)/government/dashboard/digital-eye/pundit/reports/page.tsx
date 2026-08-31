"use client";

import React, { useState } from "react";
import DigitalEyeHeader from "@/components/dashboard/digital-eye/DigitalEyeHeader";
import DeviceReportingSection from "@/components/dashboard/digital-eye/DeviceReportingSection";

export default function PunditReportsPage() {
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedElementId, setSelectedElementId] = useState<string>("");

  return (
    <div className="w-full min-h-screen pb-12 animate-in fade-in duration-300">
      <DigitalEyeHeader
        activePillar="PUNDIT: Ultrasonic Pulse Velocity Reports"
        selectedProjectId={selectedProjectId}
        onProjectChange={setSelectedProjectId}
        selectedElementId={selectedElementId}
        onElementChange={setSelectedElementId}
      />

      <DeviceReportingSection
        deviceType="pundit"
        projectId={selectedProjectId}
        elementId={selectedElementId}
        title="PUNDIT Ultrasonic UPV Official Deliverables"
        subtitle="Generate BS 1881-203 certified concrete homogeneity certificates, in-situ compressive strength (fcu MPa) curve assessments, and core extraction notices."
      />
    </div>
  );
}
