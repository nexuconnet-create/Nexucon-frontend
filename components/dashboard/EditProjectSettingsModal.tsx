import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

export interface ProjectInfo {
  name: string;
  id: string;
  type: string;
  phase: string;
  location: string;
  manager: string;
  status: string;
}

export interface GeneralSettings {
  language: string;
  timeZone: string;
  measurementUnits: string;
  dateFormat: string;
  currency: string;
}

interface EditProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProjectInfo: ProjectInfo;
  initialGeneralSettings: GeneralSettings;
  onSave: (newProjectInfo: ProjectInfo, newGeneralSettings: GeneralSettings) => void;
}

export default function EditProjectSettingsModal({ 
  isOpen, 
  onClose, 
  initialProjectInfo, 
  initialGeneralSettings,
  onSave 
}: EditProjectSettingsModalProps) {
  
  const [projectInfo, setProjectInfo] = useState<ProjectInfo>(initialProjectInfo);
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(initialGeneralSettings);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(projectInfo, generalSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2rem] w-full max-w-[800px] max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b border-gray-100 shrink-0">
          <h2 className="text-[24px] font-extrabold text-[#022C4F]">Edit Project Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-[#022C4F] transition-colors">
            <X size={24} />
          </button>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-12 hide-scrollbar">
          
          {/* Project Information */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">Project Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project Name</label>
                <input 
                  type="text" 
                  value={projectInfo.name}
                  onChange={(e) => setProjectInfo({ ...projectInfo, name: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project ID</label>
                <input 
                  type="text" 
                  value={projectInfo.id}
                  onChange={(e) => setProjectInfo({ ...projectInfo, id: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project Type</label>
                <input 
                  type="text" 
                  value={projectInfo.type}
                  onChange={(e) => setProjectInfo({ ...projectInfo, type: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project Phase</label>
                <div className="relative">
                  <select 
                    value={projectInfo.phase}
                    onChange={(e) => setProjectInfo({ ...projectInfo, phase: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="Conceptual Design">Conceptual Design</option>
                    <option value="Schematic Design">Schematic Design</option>
                    <option value="Design Development">Design Development</option>
                    <option value="Construction Documents">Construction Documents</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Location</label>
                <input 
                  type="text" 
                  value={projectInfo.location}
                  onChange={(e) => setProjectInfo({ ...projectInfo, location: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project Manager</label>
                <input 
                  type="text" 
                  value={projectInfo.manager}
                  onChange={(e) => setProjectInfo({ ...projectInfo, manager: e.target.value })}
                  className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Project Status</label>
                <div className="relative">
                  <select 
                    value={projectInfo.status}
                    onChange={(e) => setProjectInfo({ ...projectInfo, status: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Completed">Completed</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>

          {/* General Settings */}
          <div className="flex flex-col gap-6">
            <h3 className="text-[18px] font-extrabold text-[#022C4F]">General Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Default Language</label>
                <div className="relative">
                  <select 
                    value={generalSettings.language}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="English">English</option>
                    <option value="French">French</option>
                    <option value="Spanish">Spanish</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Time Zone</label>
                <div className="relative">
                  <select 
                    value={generalSettings.timeZone}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, timeZone: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="West Africa Time (UTC +1)">West Africa Time (UTC +1)</option>
                    <option value="Greenwich Mean Time (UTC 0)">Greenwich Mean Time (UTC 0)</option>
                    <option value="Eastern Standard Time (UTC -5)">Eastern Standard Time (UTC -5)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Measurement Units</label>
                <div className="relative">
                  <select 
                    value={generalSettings.measurementUnits}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, measurementUnits: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="Metric (Meters)">Metric (Meters)</option>
                    <option value="Imperial (Feet/Inches)">Imperial (Feet/Inches)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Date Format</label>
                <div className="relative">
                  <select 
                    value={generalSettings.dateFormat}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold text-[#0F181F]">Currency</label>
                <div className="relative">
                  <select 
                    value={generalSettings.currency}
                    onChange={(e) => setGeneralSettings({ ...generalSettings, currency: e.target.value })}
                    className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] appearance-none bg-white"
                  >
                    <option value="Nigerian Naira (₦)">Nigerian Naira (₦)</option>
                    <option value="US Dollar ($)">US Dollar ($)</option>
                    <option value="Euro (€)">Euro (€)</option>
                    <option value="British Pound (£)">British Pound (£)</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>

            </div>
          </div>
          
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-end gap-4 p-8 border-t border-gray-100 shrink-0">
          <button 
            onClick={onClose}
            className="px-8 py-3 rounded-xl border border-gray-300 text-gray-700 text-[13px] font-bold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            className="px-8 py-3 rounded-xl bg-[#022C4F] text-white text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>

      </div>
    </div>
  );
}
