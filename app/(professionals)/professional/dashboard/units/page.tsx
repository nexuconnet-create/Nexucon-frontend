"use client";

import React, { useState } from "react";
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function UnitsAndStandardsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const defaultStandards = [
    { id: "drawing-numbering", label: "Drawing Numbering Standard", checked: true },
    { id: "auto-unit-val", label: "Automatic Unit Validation", checked: true },
    { id: "coord-verify", label: "Coordinate Verification", checked: true },
    { id: "model-quality", label: "Model Quality Checks", checked: false },
    { id: "version-control", label: "Version Control Compliance", checked: false },
  ];

  const [qualityStandards, setQualityStandards] = useState(defaultStandards);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Standards saved successfully', type: 'success' } }));
    }, 800);
  };

  const handleRestoreDefaults = () => {
    setIsRestoring(true);
    setTimeout(() => {
      setQualityStandards(defaultStandards);
      setIsRestoring(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Project defaults restored', type: 'success' } }));
    }, 800);
  };

  const toggleStandard = (id: string) => {
    setQualityStandards(qualityStandards.map(std => 
      std.id === id ? { ...std, checked: !std.checked } : std
    ));
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            Units & Standards
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px] max-w-3xl">
            Define the measurement units, project standards, coordinate systems, and design conventions used across drawings, BIM models, calculations, and project documentation to ensure consistency throughout the project lifecycle.
          </p>
        </div>
        <div className="hidden lg:block">
          <TopRightControls />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24 mt-4">
        {/* Left Column */}
        <div className="lg:col-span-8 flex flex-col gap-14">
          
          {/* Measurement Units */}
          <div className="flex flex-col gap-8">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">
              Measurement Units
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Length</span>
                <span className="text-[14px] text-gray-600">Meters (m)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Area</span>
                <span className="text-[14px] text-gray-600">Square Meters (m²)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Volume</span>
                <span className="text-[14px] text-gray-600">Cubic Meters (m³)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Elevation</span>
                <span className="text-[14px] text-gray-600">Meters Above Sea Level (MASL)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Weight</span>
                <span className="text-[14px] text-gray-600">Kilograms (kg)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Force</span>
                <span className="text-[14px] text-gray-600">Kilonewtons (kN)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Temperature</span>
                <span className="text-[14px] text-gray-600">Degrees Celsius (°C)</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Angle</span>
                <span className="text-[14px] text-gray-600">Degrees (°)</span>
              </div>
            </div>
          </div>

          {/* Project Standards (Labelled Measurement Units in design) */}
          <div className="flex flex-col gap-8 pt-4">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">
              Measurement Units
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12">
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Drawing Scale</span>
                <span className="text-[14px] text-gray-600">1:50</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Coordinate System</span>
                <span className="text-[14px] text-gray-600">WGS 84 / UTM Zone 31N</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Dimension Style</span>
                <span className="text-[14px] text-gray-600">Architectural Metric</span>
              </div>
              <div className="flex flex-col gap-3">
                <span className="text-[16px] font-extrabold text-[#022C4F]">Sheet Size</span>
                <span className="text-[14px] text-gray-600">A1</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mt-6">
            <button 
              onClick={handleSave}
              disabled={isSaving || isRestoring}
              className="min-w-[180px] px-8 py-3.5 rounded-full border-[1.5px] border-[#022C4F] text-[#022C4F] font-bold text-[13px] hover:bg-[#022C4F]/5 transition-all disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Standards"}
            </button>
            <button 
              onClick={handleRestoreDefaults}
              disabled={isSaving || isRestoring}
              className="min-w-[180px] px-8 py-3.5 rounded-full bg-[#022C4F] text-white font-bold text-[13px] hover:bg-[#022C4F]/90 transition-all shadow-sm disabled:opacity-50"
            >
              {isRestoring ? "Restoring..." : "Restore Project Defaults"}
            </button>
          </div>

        </div>

        {/* Right Column */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          <h2 className="text-[22px] font-extrabold text-[#022C4F]">
            Quality Standards
          </h2>
          <div className="flex flex-col gap-5 mt-2">
            {qualityStandards.map((std) => (
              <label key={std.id} className="flex items-center gap-4 cursor-pointer group">
                <div 
                  className="w-5 h-5 border-[1.5px] border-[#0F181F] flex items-center justify-center p-[2px] shrink-0 transition-colors"
                >
                  <div className={`w-full h-full bg-[#0F181F] transition-opacity ${std.checked ? "opacity-100" : "opacity-0"}`} />
                </div>
                <input 
                  type="checkbox" 
                  className="hidden" 
                  checked={std.checked}
                  onChange={() => toggleStandard(std.id)}
                />
                <span className="text-[13px] text-gray-600 select-none group-hover:text-gray-900 transition-colors">{std.label}</span>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
