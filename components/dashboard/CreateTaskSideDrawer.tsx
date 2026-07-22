"use client";

import React, { useState } from "react";
import { X, Search, Link2 } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";

interface CreateTaskSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateTaskSideDrawer({
  isOpen,
  onClose,
}: CreateTaskSideDrawerProps) {
  const [taskTitle, setTaskTitle] = useState("");
  const [taskCategory, setTaskCategory] = useState("");
  const [discipline, setDiscipline] = useState("");
  const [priority, setPriority] = useState<string>("Low");
  const [description, setDescription] = useState("");
  const [blockedBy, setBlockedBy] = useState("");
  const [blocks, setBlocks] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleCreate = () => {
    setIsCreating(true);
    setTimeout(() => {
      setIsCreating(false);
      onClose();
    }, 1000);
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 1000);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 z-[100] backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300 rounded-l-[32px]">
        
        {/* Header (Matching Mockup) */}
        <div className="px-10 pt-10 pb-6 bg-white shrink-0 rounded-tl-[32px] relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
          <h2 className="text-[28px] font-extrabold text-[#022C4F] mb-4">Create New Task</h2>
          <p className="text-[12px] text-gray-500 font-medium leading-relaxed pr-4">
            Create and assign a new task to project team members. Define responsibilities, priorities, deadlines, dependencies, and related project assets to ensure efficient design coordination and project delivery.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-10 pb-10 flex flex-col gap-8 scrollbar-hide">
          
          <div className="flex flex-col gap-6">
            <h3 className="text-[13px] font-extrabold text-[#022C4F]">Task Information</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-[#022C4F]">Task Title</label>
              <input 
                type="text" 
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full h-12 rounded-lg border border-[#022C4F] px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-[#022C4F]">Task Category</label>
              <CustomSelect
                value={taskCategory}
                onChange={setTaskCategory}
                options={[
                  { value: 'review', label: 'Design Review' },
                  { value: 'coordination', label: 'BIM Coordination' },
                  { value: 'inspection', label: 'Site Inspection' },
                  { value: 'issue', label: 'Issue Resolution' }
                ]}
                placeholder=""
                variant="form"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-[#022C4F]">Discipline</label>
              <CustomSelect
                value={discipline}
                onChange={setDiscipline}
                options={[
                  { value: 'architecture', label: 'Architecture' },
                  { value: 'structural', label: 'Structural' },
                  { value: 'mep', label: 'MEP' },
                  { value: 'civil', label: 'Civil' }
                ]}
                placeholder=""
                variant="form"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-extrabold text-[#022C4F]">Priority</label>
              <div className="flex flex-col gap-3">
                {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                  <label key={level} className="flex items-center gap-3 cursor-pointer group" onClick={() => setPriority(level)}>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${priority === level ? 'border-[#022C4F]' : 'border-gray-400 group-hover:border-[#022C4F]'}`}>
                      {priority === level && <div className="w-2.5 h-2.5 rounded-full bg-[#022C4F]" />}
                    </div>
                    <span className="text-[12px] text-gray-600 font-medium">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[11px] font-extrabold text-[#022C4F]">Task Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 rounded-lg border border-[#022C4F] p-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F] resize-none" 
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-4 h-4 text-[#022C4F]" />
                <label className="text-[11px] font-extrabold text-[#022C4F]">Task Dependencies (Blocked By)</label>
              </div>
              <CustomSelect
                value={blockedBy}
                onChange={setBlockedBy}
                options={[
                  { value: 'tsk-001', label: 'TSK-001: Approve Architectural Drawings' },
                  { value: 'tsk-002', label: 'TSK-002: Client Sign-off on Schematic Design' },
                  { value: 'tsk-003', label: 'TSK-003: Finalize MEP Layouts' },
                ]}
                placeholder="Search tasks..."
                variant="form"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 mb-1">
                <Link2 className="w-4 h-4 text-[#022C4F]" />
                <label className="text-[11px] font-extrabold text-[#022C4F]">Task Dependencies (Blocks)</label>
              </div>
              <CustomSelect
                value={blocks}
                onChange={setBlocks}
                options={[
                  { value: 'tsk-004', label: 'TSK-004: Issue Construction IFC Package' },
                  { value: 'tsk-005', label: 'TSK-005: Begin Foundation Pour' },
                  { value: 'tsk-006', label: 'TSK-006: MEP Clash Resolution' },
                ]}
                placeholder="Search tasks..."
                variant="form"
              />
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[15px] font-extrabold text-[#022C4F]">Search Team Members</h3>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search by name, role, or discipline..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 rounded-full border border-[#022C4F] pl-11 pr-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] placeholder:text-gray-400 placeholder:font-medium" 
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 mt-4">
            <button 
              onClick={handleCreate}
              disabled={isCreating || isSaving}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] disabled:opacity-70 text-white h-12 rounded-lg font-medium transition-colors text-[12px] shadow-sm flex items-center justify-center"
            >
              {isCreating ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Task"
              )}
            </button>
            <button 
              onClick={handleSaveDraft}
              disabled={isCreating || isSaving}
              className="w-full bg-[#111827] hover:bg-[#1F2937] disabled:opacity-70 text-white h-12 rounded-lg font-medium transition-colors text-[12px] shadow-sm flex items-center justify-center"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                "Save as Draft"
              )}
            </button>
          </div>

        </div>
      </div>
    </>
  );
}
