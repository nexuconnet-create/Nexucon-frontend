import React, { useState } from "react";
import { X, ChevronDown, CheckSquare, Square, Circle, Dot } from "lucide-react";

interface ManageTeamPermissionsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ManageTeamPermissionsDrawer({ isOpen, onClose }: ManageTeamPermissionsDrawerProps) {
  const [selectedMember, setSelectedMember] = useState("");
  const [currentRole, setCurrentRole] = useState("");
  const [permissionLevel, setPermissionLevel] = useState("Viewer");

  // Design Permissions
  const [designPerms, setDesignPerms] = useState<Record<string, boolean>>({
    "Upload Drawings": true,
    "Edit Drawings": true,
    "Delete Drawings": true,
    "Upload BIM Models": true,
    "Compare Model Versions": true,
    "Launch AR Viewer": true,
    "Create Deliverables": true,
    "Publish Deliverables": true,
  });

  // Task Permissions
  const [taskPerms, setTaskPerms] = useState<Record<string, boolean>>({
    "Create Tasks": true,
    "Assign Tasks": true,
    "Edit Tasks": true,
    "Mark Tasks Complete": true,
    "Export Task Reports": true,
  });

  const toggleDesignPerm = (key: string) => {
    setDesignPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTaskPerm = (key: string) => {
    setTaskPerms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div 
        className={`fixed top-0 right-0 w-full max-w-[650px] h-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 p-8 border-b border-gray-100 shrink-0 relative">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-400 hover:text-[#022C4F] transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-[24px] font-extrabold text-[#022C4F]">
            Manage Team Permissions
          </h2>
          <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-[90%]">
            Configure project access, workspace permissions, and collaboration privileges for each team member. Control who can view, edit, review, approve, and manage project resources throughout the design lifecycle.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 hide-scrollbar">
          
          {/* Team Member */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Team Member</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Selected Member</label>
              <div className="relative">
                <select 
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white font-medium"
                  value={selectedMember}
                  onChange={(e) => setSelectedMember(e.target.value)}
                >
                  <option value="" disabled>Select a team member</option>
                  <option value="olivia">Olivia Thompson</option>
                  <option value="michael">Michael Adeyemi</option>
                  <option value="daniel">Daniel Okoro</option>
                  <option value="sarah">Sarah Williams</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Project Role */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Project Role</h3>
            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Current Role</label>
              <div className="relative">
                <select 
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white font-medium"
                  value={currentRole}
                  onChange={(e) => setCurrentRole(e.target.value)}
                >
                  <option value="" disabled>Select a role</option>
                  <option value="architect">Lead Architect</option>
                  <option value="structural">Structural Engineer</option>
                  <option value="mechanical">Mechanical Engineer</option>
                  <option value="coordinator">Design Coordinator</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Permission Level */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Permission Level</h3>
            <div className="grid grid-cols-2 gap-4">
              {["Viewer", "Contributor", "Reviewer", "Project Manager", "Administrator"].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${permissionLevel === level ? "border-[#022C4F]" : "border-gray-400 group-hover:border-[#022C4F]"}`}>
                    {permissionLevel === level && <div className="w-2.5 h-2.5 bg-[#022C4F] rounded-full" />}
                  </div>
                  <span className="text-[12px] text-[#0F181F] font-medium">{level}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Design Permissions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Design Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(designPerms).map((perm) => (
                <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${designPerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"}`}
                       onClick={() => toggleDesignPerm(perm)}>
                    {designPerms[perm] && <CheckSquare size={14} className="text-white opacity-0" />}
                    {designPerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Task Permissions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Task Permissions</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(taskPerms).map((perm) => (
                <label key={perm} className="flex items-center gap-3 cursor-pointer group">
                  <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 transition-colors ${taskPerms[perm] ? "bg-[#0F181F] border-[#0F181F]" : "border-gray-400 group-hover:border-[#0F181F] bg-white"}`}
                       onClick={() => toggleTaskPerm(perm)}>
                    {taskPerms[perm] && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                  <span className="text-[12px] text-[#0F181F] font-medium">{perm}</span>
                </label>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className="w-full bg-[#022C4F] text-white h-12 rounded-xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
          >
            Save Permissions
          </button>
        </div>
      </div>
    </>
  );
}
