"use client";

import React, { useState } from "react";
import Link from "next/link";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { CheckCircle2, ChevronDown } from "lucide-react";

export default function BimStandardsPage() {
  const activeTab: string = "BIM Standards";
  
  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // BIM Standards State
  const [lodRequirement, setLodRequirement] = useState("LOD 350 - Construction Documentation");
  const [classificationSystem, setClassificationSystem] = useState("OmniClass");
  
  const [namingConventions, setNamingConventions] = useState({
    files: "[ProjectCode]-[Originator]-[Zone]-[Level]-[Type]-[Role]-[Number]",
    layers: "[Discipline]-[Element]-[Material]-[Status]",
    elements: "[TypeMark]-[Description]-[Material]",
  });

  const [qaqcChecklist, setQaqcChecklist] = useState<Record<string, boolean>>({
    "Verify elements are modeled to correct LOD": true,
    "Run automated clash detection (no hard clashes > 10mm)": true,
    "Ensure all elements follow classification system": true,
    "Validate element naming conventions": true,
    "Check for overlapping geometry": true,
    "Verify coordinates match project base point": true,
    "Purge unused families and materials": false,
  });

  const toggleQaqcItem = (key: string) => setQaqcChecklist(prev => ({ ...prev, [key]: !prev[key] }));

  const handleSaveBimStandards = () => {
    showToast("BIM Standards saved successfully!");
  };

  const handleRestoreDefaults = () => {
    setLodRequirement("LOD 300 - Detailed Design");
    setClassificationSystem("OmniClass");
    setNamingConventions({
      files: "[ProjectCode]-[Originator]-[Zone]-[Level]-[Type]-[Role]-[Number]",
      layers: "[Discipline]-[Element]-[Material]-[Status]",
      elements: "[TypeMark]-[Description]-[Material]",
    });
    setQaqcChecklist({
      "Verify elements are modeled to correct LOD": true,
      "Run automated clash detection (no hard clashes > 10mm)": true,
      "Ensure all elements follow classification system": true,
      "Validate element naming conventions": true,
      "Check for overlapping geometry": true,
      "Verify coordinates match project base point": true,
      "Purge unused families and materials": false,
    });
    showToast("Restored BIM Standards defaults.");
  };

  const getHeaderDescription = () => {
    return "Set project-specific BIM standards including Level of Development (LOD) requirements, naming conventions, classification systems, and QA/QC checklists for model submission.";
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-[#022C4F] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={20} className="text-[#00D000]" />
          <span className="text-[14px] font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-2xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            {activeTab}
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px]">
            {getHeaderDescription()}
          </p>
        </div>
        
        <TopRightControls />
      </div>

      {/* Tabs */}
      <div className="flex mt-2 shrink-0 overflow-x-auto hide-scrollbar">
        {[
          { name: "Project Settings", href: "/professional/dashboard/settings" },
          { name: "Permission Overview", href: "/professional/dashboard/permissions" },
          { name: "Review Management", href: "/professional/dashboard/review-management" },
          { name: "BIM Standards", href: "/professional/dashboard/bim-standards" }
        ].map((tab, index) => (
          <Link
            key={tab.name}
            href={tab.href}
            className={`px-8 py-4 text-[12px] font-bold transition-colors whitespace-nowrap border ${
              activeTab === tab.name
                ? "bg-[#022C4F] text-white border-[#022C4F]"
                : "bg-white text-[#022C4F] border-[#022C4F]/20 hover:bg-gray-50"
            } ${index !== 0 ? "border-l-0" : ""}`}
          >
            {tab.name}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-16 mt-6">
        
        {/* Left Column: LOD & Naming Conventions & Classification */}
        <div className="flex flex-col gap-12">
          
          {/* Classification & LOD */}
          <div className="flex flex-col gap-8">
            <h2 className="text-[20px] font-extrabold text-[#022C4F]">Model Requirements</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-12">
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-extrabold text-[#022C4F]">Level of Development (LOD)</label>
                <div className="relative">
                  <select 
                    value={lodRequirement}
                    onChange={(e) => setLodRequirement(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 text-[13px] text-[#0F181F] font-medium appearance-none focus:outline-none focus:border-[#022C4F]"
                  >
                    <option>LOD 100 - Conceptual Design</option>
                    <option>LOD 200 - Schematic Design</option>
                    <option>LOD 300 - Detailed Design</option>
                    <option>LOD 350 - Construction Documentation</option>
                    <option>LOD 400 - Fabrication & Assembly</option>
                    <option>LOD 500 - As-Built</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
              
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-extrabold text-[#022C4F]">Classification System</label>
                <div className="relative">
                  <select 
                    value={classificationSystem}
                    onChange={(e) => setClassificationSystem(e.target.value)}
                    className="w-full h-12 pl-4 pr-10 rounded-xl border border-gray-200 text-[13px] text-[#0F181F] font-medium appearance-none focus:outline-none focus:border-[#022C4F]"
                  >
                    <option>OmniClass</option>
                    <option>MasterFormat</option>
                    <option>UniFormat</option>
                    <option>Uniclass</option>
                  </select>
                  <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Naming Conventions */}
          <div className="flex flex-col gap-8">
            <h2 className="text-[20px] font-extrabold text-[#022C4F]">Naming Conventions</h2>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-extrabold text-[#022C4F]">File Naming Convention (ISO 19650)</label>
                <input 
                  type="text" 
                  value={namingConventions.files}
                  onChange={(e) => setNamingConventions({...namingConventions, files: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-[13px] text-[#0F181F] font-medium focus:outline-none focus:border-[#022C4F]"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-extrabold text-[#022C4F]">Layer Naming Convention</label>
                <input 
                  type="text" 
                  value={namingConventions.layers}
                  onChange={(e) => setNamingConventions({...namingConventions, layers: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-[13px] text-[#0F181F] font-medium focus:outline-none focus:border-[#022C4F]"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-extrabold text-[#022C4F]">Element / Component Naming</label>
                <input 
                  type="text" 
                  value={namingConventions.elements}
                  onChange={(e) => setNamingConventions({...namingConventions, elements: e.target.value})}
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 text-[13px] text-[#0F181F] font-medium focus:outline-none focus:border-[#022C4F]"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-6 mt-8">
            <button 
              onClick={handleRestoreDefaults}
              className="h-12 px-8 rounded-full border border-gray-200 text-gray-600 text-[12px] font-bold hover:bg-gray-50 transition-colors"
            >
              Restore Defaults
            </button>
            <button 
              onClick={handleSaveBimStandards}
              className="h-12 px-8 rounded-full bg-[#022C4F] text-white text-[12px] font-bold hover:bg-[#033A6B] transition-colors"
            >
              Save BIM Standards
            </button>
          </div>

        </div>

        {/* Right Column: QA/QC Checklist */}
        <div className="flex flex-col gap-8 lg:pl-12">
          <h2 className="text-[20px] font-extrabold text-[#022C4F]">QA/QC Submission Checklist</h2>
          <p className="text-[12px] text-gray-500 font-medium mb-2">Select the checks that must be verified before a BIM model can be officially submitted for review.</p>
          
          <div className="flex flex-col gap-5">
            {Object.keys(qaqcChecklist).map((item) => (
              <label key={item} className="flex items-start gap-4 cursor-pointer group">
                <div 
                  className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                    qaqcChecklist[item] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 border group-hover:border-[#0F181F] bg-white"
                  }`}
                  onClick={() => toggleQaqcItem(item)}
                >
                  {qaqcChecklist[item] && <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                </div>
                <span className="text-[12px] text-[#0F181F] font-medium leading-relaxed">{item}</span>
              </label>
            ))}
          </div>
          
          <div className="mt-4 border-t border-gray-100 pt-6">
            <button className="text-[12px] font-bold text-[#022C4F] hover:underline">
              + Add Custom Checklist Item
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
