"use client";

import React, { useState } from "react";
import TopRightControls from "@/components/dashboard/TopRightControls";
import { CustomSelect } from "@/components/CustomSelect";

export default function TagsAndClassificationPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const [designPhase, setDesignPhase] = useState("concept");
  const [discipline, setDiscipline] = useState("architecture");
  const [documentType, setDocumentType] = useState("drawings");
  const [reviewStatus, setReviewStatus] = useState("draft");
  const [priority, setPriority] = useState("low");
  const [projectArea, setProjectArea] = useState("draft");

  const designPhaseOptions = [
    { value: "concept", label: "Concept Design" },
    { value: "schematic", label: "Schematic Design" },
    { value: "development", label: "Design Development" },
    { value: "construction", label: "Construction Documents" },
  ];
  
  const disciplineOptions = [
    { value: "architecture", label: "Architecture" },
    { value: "structural", label: "Structural" },
    { value: "mep", label: "MEP" },
    { value: "civil", label: "Civil" },
  ];
  
  const documentTypeOptions = [
    { value: "drawings", label: "Drawings" },
    { value: "specifications", label: "Specifications" },
    { value: "reports", label: "Reports" },
    { value: "models", label: "Models" },
  ];
  
  const reviewStatusOptions = [
    { value: "draft", label: "Draft" },
    { value: "in-review", label: "In Review" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
  ];
  
  const priorityOptions = [
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" },
  ];
  
  const projectAreaOptions = [
    { value: "draft", label: "Draft" },
    { value: "area-1", label: "Area 1" },
    { value: "area-2", label: "Area 2" },
    { value: "site", label: "Site" },
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Changes saved successfully', type: 'success' } }));
    }, 800);
  };

  const handleCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'New tag created successfully', type: 'success' } }));
    }, 800);
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-[1400px] mx-auto pb-12 animate-in fade-in duration-500 relative">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] leading-tight">
            Tags & Classifications
          </h1>
          <p className="text-[12px] md:text-[14px] text-gray-600 font-medium leading-relaxed min-h-[40px] max-w-3xl">
            Organize project drawings, BIM models, documents, tasks, review topics, and deliverables using standardized tags and classification systems for faster search, filtering, reporting, and project coordination.
          </p>
        </div>
        <div className="hidden lg:block">
          <TopRightControls />
        </div>
      </div>

      <div className="flex flex-col mt-4 gap-10">
        <h2 className="text-[22px] font-extrabold text-[#022C4F]">
          Project Tags
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-12 max-w-[1000px]">
          
          {/* Design Phase */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Design Phase</label>
            <CustomSelect
              value={designPhase}
              onChange={setDesignPhase}
              options={designPhaseOptions}
              placeholder="Select Phase"
              variant="form"
            />
          </div>

          {/* Discipline */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Discipline</label>
            <CustomSelect
              value={discipline}
              onChange={setDiscipline}
              options={disciplineOptions}
              placeholder="Select Discipline"
              variant="form"
            />
          </div>

          {/* Document Type */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Document Type</label>
            <CustomSelect
              value={documentType}
              onChange={setDocumentType}
              options={documentTypeOptions}
              placeholder="Select Document Type"
              variant="form"
            />
          </div>

          {/* Review Status */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Review Status</label>
            <CustomSelect
              value={reviewStatus}
              onChange={setReviewStatus}
              options={reviewStatusOptions}
              placeholder="Select Status"
              variant="form"
            />
          </div>

          {/* Priority */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Priority</label>
            <CustomSelect
              value={priority}
              onChange={setPriority}
              options={priorityOptions}
              placeholder="Select Priority"
              variant="form"
            />
          </div>

          {/* Project Area */}
          <div className="flex flex-col gap-3">
            <label className="text-[16px] font-extrabold text-[#022C4F]">Project Area</label>
            <CustomSelect
              value={projectArea}
              onChange={setProjectArea}
              options={projectAreaOptions}
              placeholder="Select Area"
              variant="form"
            />
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-6">
          <button 
            onClick={handleSave}
            disabled={isSaving || isCreating}
            className="min-w-[180px] px-8 py-3.5 rounded-full border-[1.5px] border-[#022C4F] text-[#022C4F] font-bold text-[13px] hover:bg-[#022C4F]/5 transition-all disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
          <button 
            onClick={handleCreate}
            disabled={isSaving || isCreating}
            className="min-w-[180px] px-8 py-3.5 rounded-full bg-[#022C4F] text-white font-bold text-[13px] hover:bg-[#022C4F]/90 transition-all shadow-sm disabled:opacity-50"
          >
            {isCreating ? "Creating..." : "Create New Tag"}
          </button>
        </div>

      </div>

    </div>
  );
}
