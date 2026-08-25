"use client";

import React, { useState } from 'react';
import { X, Users, Plus, AlertCircle, Check } from 'lucide-react';
import { addTeamMember, ProjectStakeholderTeam } from '@/services/stakeholders';

interface AddTeamMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  team: ProjectStakeholderTeam | null;
}

export default function AddTeamMemberModal({
  isOpen,
  onClose,
  onSuccess,
  team
}: AddTeamMemberModalProps) {
  const [roleKey, setRoleKey] = useState('mep_consultant');
  const [roleTitle, setRoleTitle] = useState('MEP Infrastructure Consultant');
  const [memberName, setMemberName] = useState('');
  const [initials, setInitials] = useState('MC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen || !team) return null;

  const roleOptions = [
    { key: 'developer', label: 'Master Developer', defaultTitle: 'Master Property Developer', defaultInitials: 'MD' },
    { key: 'contractor', label: 'General Contractor', defaultTitle: 'Main Civil Contractor', defaultInitials: 'GC' },
    { key: 'architect', label: 'Lead Architect', defaultTitle: 'Principal Chartered Architect', defaultInitials: 'AR' },
    { key: 'structural_engineer', label: 'Structural Engineer', defaultTitle: 'Chief Structural Engineer', defaultInitials: 'SE' },
    { key: 'mep_consultant', label: 'MEP Consultant', defaultTitle: 'MEP Infrastructure Consultant', defaultInitials: 'MC' },
    { key: 'geotech_consultant', label: 'Geotechnical Consultant', defaultTitle: 'Geotechnical Advisory Firm', defaultInitials: 'GT' },
    { key: 'inspector', label: 'Government Inspector', defaultTitle: 'Lead Structural Inspector', defaultInitials: 'IN' },
    { key: 'hse_officer', label: 'HSE Safety Auditor', defaultTitle: 'Site Safety Auditor', defaultInitials: 'HS' },
  ];

  const handleRoleSelect = (key: string) => {
    setRoleKey(key);
    const opt = roleOptions.find(o => o.key === key);
    if (opt) {
      setRoleTitle(opt.defaultTitle);
      setInitials(opt.defaultInitials);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      setErrorMsg('Member / Firm name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await addTeamMember(team.id, roleKey, {
        name: memberName.trim(),
        role: roleTitle.trim(),
        initials: initials.trim() || 'ST'
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Team member assigned to ${team.project_name}!`, type: 'success' }
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to assign team member');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0F181F]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                {team.project_reference}
              </span>
              <h2 className="text-base font-black text-[#022C4F] mt-0.5">
                Assign Stakeholder to Team
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Select Project Role Position
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {roleOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.key}
                  onClick={() => handleRoleSelect(opt.key)}
                  className={`p-2 rounded-xl text-left text-xs font-bold transition-all border cursor-pointer ${
                    roleKey === opt.key
                      ? 'bg-[#022C4F] text-white border-[#022C4F] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Entity or Personnel Name
            </label>
            <input
              type="text"
              required
              value={memberName}
              onChange={(e) => setMemberName(e.target.value)}
              placeholder="e.g., Studio Forma Architects or Engr. David Adeleke"
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Custom Role Title</label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="e.g., Lead Structural Consultant"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Badge Initials</label>
              <input
                type="text"
                maxLength={4}
                value={initials}
                onChange={(e) => setInitials(e.target.value.toUpperCase())}
                placeholder="e.g., MC"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-center uppercase focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-[#022C4F]/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Plus size={14} />
              <span>{isSubmitting ? 'Assigning...' : 'Assign to Team Matrix'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
