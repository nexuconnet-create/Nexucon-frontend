"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { X, UserPlus, Mail, ShieldCheck, Building2, RefreshCw, Send, CheckCircle2, AlertTriangle } from 'lucide-react';
import { inviteStaffUser, getDistricts, District } from '@/services/settings';

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
  const [districtId, setDistrictId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dispatchedInvitation, setDispatchedInvitation] = useState<any | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // The operational zone register — the real one. This was a hardcoded list of
  // five zone names, none of which existed as a `District` row, so every officer
  // invited through this form was scoped to nothing.
  const [zones, setZones] = useState<District[]>([]);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDistricts({ active: 'true' })
      .then((data) => {
        if (!cancelled) setZones(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setZonesError('The zone register could not be read from the server.');
      })
      .finally(() => {
        if (!cancelled) setZonesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!isOpen) return null;

  const selectedZone = zones.find((zone) => zone.id === districtId) || null;
  // Only shown when the server actually returned one — the panel used to fall
  // back to a literal "NXC-8842-2026", which is not a code anyone can redeem.
  const inviteCode = dispatchedInvitation?.invite_code || null;
  const inviteToken = dispatchedInvitation?.token || dispatchedInvitation?.id || null;
  const inviteLink = inviteToken
    ? `https://inspector.nexucon.net/invite/${inviteToken}`
    : null;

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
        // Omitted entirely when no zone was chosen, so the officer is created
        // with a state-wide (unscoped) profile rather than a made-up zone.
        district_id: districtId || undefined,
      });

      setDispatchedInvitation(res || { email, role });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Invitation successfully dispatched to ${email}!`, type: 'success' }
      }));
      if (onSuccess) onSuccess();
    } catch (err: any) {
      // The server's reason is the useful one — a duplicate email, an unknown
      // zone id. "Failed to invite user" would hide which.
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: {
          message:
            err?.response?.data?.detail ||
            err?.response?.data?.message ||
            'The invitation could not be dispatched.',
          type: 'error',
        },
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!inviteLink) return;
    navigator.clipboard.writeText(inviteLink);
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
                  <label htmlFor="invite-zone" className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Zonal District Jurisdiction
                  </label>
                  {zonesLoading ? (
                    <div className="flex items-center gap-2 h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-500">
                      <RefreshCw size={13} className="animate-spin" /> Loading the zone register...
                    </div>
                  ) : zonesError ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50">
                      <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-amber-800">
                        {zonesError} The officer can still be invited without a
                        zone and scoped to one later.
                      </p>
                    </div>
                  ) : zones.length === 0 ? (
                    <div className="flex items-start gap-2 p-3 rounded-xl border border-gray-200 bg-gray-50">
                      <AlertTriangle size={15} className="text-gray-500 mt-0.5 shrink-0" />
                      <p className="text-[11px] leading-relaxed text-gray-600">
                        No operational zone has been created yet.{' '}
                        <Link
                          href="/government/dashboard/settings/districts"
                          className="font-bold text-blue-600 hover:text-blue-700"
                        >
                          Create one
                        </Link>{' '}
                        to scope which projects this officer can see.
                      </p>
                    </div>
                  ) : (
                    <>
                      <select
                        id="invite-zone"
                        value={districtId}
                        onChange={(e) => setDistrictId(e.target.value)}
                        className="w-full h-12 bg-white rounded-xl border border-gray-200 px-4 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
                      >
                        <option value="">No zone — state-wide scope</option>
                        {zones.map((zone) => (
                          <option key={zone.id} value={zone.id}>
                            {zone.name}
                            {zone.code ? ` (${zone.code})` : ''}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-[11px] text-gray-500">
                        Determines which projects this officer can see. It is set
                        when the invitation is accepted and cannot be changed
                        afterwards — invite to the correct zone.
                      </p>
                    </>
                  )}
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
                  <span className="font-bold text-gray-800">
                    {role} &bull; {selectedZone ? selectedZone.name : 'State-wide (no zone)'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-mono text-gray-400 block uppercase font-bold">Verification Invite Code</span>
                  {inviteCode ? (
                    <span className="font-mono font-bold text-blue-600 text-base">
                      {inviteCode}
                    </span>
                  ) : (
                    <span className="text-gray-500 leading-relaxed block">
                      The server did not return an invite code for this invitation.
                      The officer is on the roster — resend the invitation from
                      User Management, or check its status there.
                    </span>
                  )}
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
                  {inviteLink ? (
                    <div className="flex items-center justify-between gap-2 bg-white p-2.5 rounded-xl border border-gray-200 font-mono text-[11px] text-gray-600 select-all">
                      <span className="truncate">{inviteLink}</span>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold shrink-0 transition-colors"
                      >
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 leading-relaxed">
                      The server did not return an activation token, so no link can
                      be shown. The invitation itself was created.
                    </p>
                  )}
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
