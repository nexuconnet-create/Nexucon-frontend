"use client";

import React, { useState } from 'react';
import { X, UserPlus, Mail, ShieldCheck, Building2, RefreshCw, Send, CheckCircle2 } from 'lucide-react';
import { inviteStaffUser } from '@/services/settings';

interface InviteUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteUserDrawer({
  isOpen,
  onClose,
  onSuccess
}: InviteUserDrawerProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Inspector');
  const [department, setDepartment] = useState('Building Inspectorate');
  const [district, setDistrict] = useState('Lekki-Epe Zonal Directorate');
  const [assignedProjectRef, setAssignedProjectRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedInvitation, setDispatchedInvitation] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const handleRoleChange = (newRole: string) => {
    setRole(newRole);
    if (newRole.toLowerCase().includes('inspector')) {
      setDepartment('Building Inspectorate');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Name and email are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await inviteStaffUser({
        name: name.trim(),
        email: email.trim(),
        role,
        department,
        assigned_projects: assignedProjectRef.trim() ? [assignedProjectRef.trim()] : []
      });

      setDispatchedInvitation(res || { email, role, invite_code: 'GENERATED' });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Invitation successfully dispatched to ${email}!`, type: 'success' } 
      }));
      if (onSuccess) onSuccess();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to invite user', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    const link = `https://inspector.nexucon.net/invite/${dispatchedInvitation?.token || dispatchedInvitation?.id || 'TOKEN'}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[560px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex-1 overflow-y-auto pr-2 -mr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {!dispatchedInvitation ? (
            <>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-[#0F181F] tracking-tight">
                    Invite Government Official
                  </h2>
                  <p className="text-xs text-gray-500 font-medium">Provision Agency Roles & Field Inspector Terminals</p>
                </div>
              </div>

              <p className="text-xs text-gray-600 mb-8 leading-relaxed">
                Invite state technical officers, directors, civil engineers, and accredited field inspectors. An official dispatch email containing a single-use verification token and temporary passkey will be transmitted.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Full Name & Title
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Engr. Babatunde Sanwo"
                    required
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Official Government Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="b.sanwo@lagosstate.gov.ng"
                    required
                    className="w-full h-12 rounded-xl border border-gray-200 px-4 text-xs font-mono font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Assigned RBAC Role
                    </label>
                    <select
                      value={role}
                      onChange={(e) => handleRoleChange(e.target.value)}
                      className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="Inspector">Field Inspector</option>
                      <option value="Lead Inspector">Lead Field Inspector</option>
                      <option value="City Planner">City Planner</option>
                      <option value="Reviewer">Technical Reviewer</option>
                      <option value="Compliance Officer">Compliance Officer</option>
                      <option value="Director">State Director / HOD</option>
                      <option value="System Administrator">System Administrator</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Department
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                    >
                      <option value="Building Inspectorate">Building Inspectorate</option>
                      <option value="Urban Planning">Urban Planning</option>
                      <option value="Structural Engineering">Structural Engineering</option>
                      <option value="Development Control">Development Control</option>
                      <option value="Environmental Safety">Environmental Safety</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Zonal District Jurisdiction
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                  >
                    <option value="Lekki-Epe Zonal Directorate">Lekki-Epe Zonal Directorate</option>
                    <option value="Ikeja Central Directorate">Ikeja Central Directorate</option>
                    <option value="Badagry Directorate">Badagry Directorate</option>
                    <option value="Ikorodu Directorate">Ikorodu Directorate</option>
                    <option value="State Headquarters Directorate">State Headquarters Directorate (State-Wide)</option>
                  </select>
                </div>

                <div className="p-4 bg-blue-50/70 border border-blue-100 rounded-2xl text-xs text-blue-950 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-[11px] leading-relaxed">
                    <span className="font-bold block">Synchronized Inspector Architecture:</span>
                    Field Inspectors automatically receive access to both the dedicated Inspector Web Dashboard and the Inspector Mobile App under identical project scopes.
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-md shadow-blue-600/20 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Send size={14} className={isSubmitting ? "animate-spin" : ""} />
                    {isSubmitting ? 'Dispatching...' : 'Dispatch Invitation'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  Invitation Dispatched!
                </h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Official onboarding token generated and emailed to <strong className="text-gray-800">{email}</strong>.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 text-left space-y-3 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Designated Role</span>
                  <span className="font-bold text-gray-800">{role} &bull; {district}</span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Verification Invite Code</span>
                  <span className="font-mono font-bold text-blue-600 text-base">
                    {dispatchedInvitation.invite_code || "NXC-8842-2026"}
                  </span>
                </div>

                {dispatchedInvitation.temporary_password && (
                  <div>
                    <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Temporary Access Passcode</span>
                    <span className="font-mono font-bold text-emerald-600 text-base">
                      {dispatchedInvitation.temporary_password}
                    </span>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-200">
                  <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold mb-1">Direct Activation Link</span>
                  <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-600 select-all">
                    <span className="truncate">
                      https://inspector.nexucon.net/invite/{dispatchedInvitation.token || dispatchedInvitation.id || 'token'}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold shrink-0 transition-colors"
                    >
                      {copiedLink ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setDispatchedInvitation(null);
                  onClose();
                }}
                className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-md shadow-blue-600/20"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
