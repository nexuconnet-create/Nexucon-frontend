"use client";

import React, { useState } from 'react';
import { X, Users, Plus, AlertCircle, Check, Loader2, Mail, Send } from 'lucide-react';
import { addTeamMember, ProjectStakeholderTeam } from '@/services/stakeholders';
import { sendEmailViaResend } from '@/services/email';

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
  const [memberEmail, setMemberEmail] = useState('');
  const [initials, setInitials] = useState('MC');
  const [sendInvite, setSendInvite] = useState(true);
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

    const targetEmail = memberEmail.trim().toLowerCase();
    const appBaseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://nexucon-frontend-8x3a.vercel.app');
    const loginUrl = `${appBaseUrl}/government/login`;

    try {
      await addTeamMember(team.id, roleKey, {
        name: memberName.trim(),
        role: roleTitle.trim(),
        initials: initials.trim() || 'ST'
      });

      // Dispatch team assignment email notification if email provided
      if (sendInvite && targetEmail) {
        const currentYear = new Date().getFullYear();
        await sendEmailViaResend({
          to: targetEmail,
          subject: `🏗️ Project Team Assignment: ${team.project_name} (${roleTitle}) - Nexucon`,
          html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Project Team Assignment</title></head>
<body style="margin:0;padding:0;background-color:#0A1118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1118;">
    <tr><td align="center" style="padding:40px 10px;">
      <table width="600" style="max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
        <tr><td style="background:linear-gradient(135deg,#022C4F 0%,#03467B 50%,#0A66C2 100%);padding:36px 40px;">
          <span style="color:#FFF;font-weight:900;font-size:22px;letter-spacing:1.5px;">NEXUCON</span>
          <span style="color:#93C5FD;font-size:11px;font-weight:700;padding-left:8px;margin-left:8px;border-left:1px solid rgba(255,255,255,0.3);">PROJECT STAKEHOLDER MATRIX</span>
        </td></tr>
        <tr><td style="padding:40px;">
          <span style="display:inline-block;background:#E0F2FE;color:#0369A1;border:1px solid #BAE6FD;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px;text-transform:uppercase;">
            ${team.project_reference} &bull; ${roleTitle}
          </span>
          <h1 style="color:#0F172A;font-size:24px;font-weight:800;margin:16px 0 8px 0;">Project Assignment Formalized</h1>
          <p style="color:#334155;font-size:15px;line-height:24px;">Dear <strong>${memberName}</strong>,</p>
          <p style="color:#475569;font-size:14px;line-height:22px;">You have been formally designated as <strong>${roleTitle}</strong> on <strong>${team.project_name}</strong> (${team.location}).</p>
          <div style="text-align:center;margin:32px 0;">
            <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#022C4F 0%,#03467B 100%);color:#FFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(2,44,79,0.4);">Access Project Dashboard &rarr;</a>
          </div>
          <p style="color:#94A3B8;font-size:12px;text-align:center;">Portal Link: <a href="${loginUrl}" style="color:#0A66C2;">${loginUrl}</a></p>
        </td></tr>
        <tr><td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
          <p style="color:#64748B;font-size:11px;margin:0;">&copy; ${currentYear} Nexucon Physical Planning & Building Regulatory Authority.</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
          type: 'GENERAL'
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: targetEmail 
            ? `Team member assigned & invitation sent to ${targetEmail}!` 
            : `Team member assigned to ${team.project_name}!`, 
          type: 'success' 
        }
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
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Sidepop Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header */}
          <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
                <Users size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {team.project_reference}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Matrix Staffing</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Assign Team Member
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

          {/* Drawer Body (Scrollable) */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-xs font-bold text-slate-700">Project Assignment</p>
                <p className="text-sm font-black text-[#022C4F] mt-0.5">{team.project_name}</p>
                <p className="text-[11px] text-slate-500">{team.location}</p>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Team Position / Discipline
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {roleOptions.map((opt) => {
                    const isSelected = roleKey === opt.key;
                    return (
                      <button
                        type="button"
                        key={opt.key}
                        onClick={() => handleRoleSelect(opt.key)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700 text-xs font-medium'
                        }`}
                      >
                        <div>
                          <p className="text-xs">{opt.label}</p>
                          <p className="text-[10px] text-slate-400">{opt.defaultInitials}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-blue-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Member Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Appointee / Firm Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Adeyemi MEP Solutions Ltd / Engr. Kunle Bello"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Member Email */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    placeholder="appointee@firm.com"
                    className="w-full pl-10 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Role Title & Initials */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Designated Title
                  </label>
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                    Initials Badge
                  </label>
                  <input
                    type="text"
                    maxLength={3}
                    value={initials}
                    onChange={(e) => setInitials(e.target.value.toUpperCase())}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-center text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  />
                </div>
              </div>

              {/* Invite Checkbox */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInvite}
                    onChange={(e) => setSendInvite(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#022C4F]">
                        Dispatch Project Assignment Notification
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded">
                        Resend
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Sends a project onboarding email notification to the appointee with direct project dashboard credentials.
                    </p>
                  </div>
                </label>
              </div>

            </div>

            {/* Sticky Drawer Footer */}
            <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold rounded-xl shadow-lg shadow-[#022C4F]/20 flex items-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Assigning...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Assign &amp; Send Invite</span>
                  </>
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
