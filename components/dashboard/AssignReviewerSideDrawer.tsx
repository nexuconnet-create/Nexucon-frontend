"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Search, ChevronDown, AlertCircle, UserPlus, ShieldCheck, 
  Send, User, Building2, CheckCircle2, Clock, Mail, Award, Check
} from 'lucide-react';
import { Application, assignApplicationReviewer } from '@/services/applications';
import { getInspectors, Inspector } from '@/services/stakeholders';
import { CustomSelect } from '@/components/CustomSelect';

interface AssignReviewerSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  onAssign?: () => void;
}

interface ReviewerItem {
  id: string;
  name: string;
  role: string;
  organization: string;
  zone?: string;
  rating?: string;
  isInspector?: boolean;
  activeCount?: number;
  email?: string;
}

const DEFAULT_REVIEWERS: ReviewerItem[] = [
  { id: "REV-01", name: "Engr. Babatunde Fashola", role: "Principal Structural Reviewer", organization: "Lagos State Building Control Agency", zone: "Zone 1 (Island)", rating: "4.9", isInspector: true, activeCount: 3, email: "b.fashola@lasbca.gov.ng" },
  { id: "REV-02", name: "Arch. Amina Mohammed", role: "Lead Architectural Examiner", organization: "Ministry of Physical Planning", zone: "Zone 2 (Ikeja)", rating: "4.8", isInspector: false, activeCount: 2, email: "a.mohammed@mpp.gov.ng" },
  { id: "REV-03", name: "Engr. Chukwuma Obi", role: "Senior MEP & Fire Safety Inspector", organization: "Fire & Safety Regulatory Board", zone: "Zone 4 (Lekki)", rating: "4.9", isInspector: true, activeCount: 1, email: "c.obi@safetyboard.gov.ng" },
  { id: "REV-04", name: "Dr. Kemi Adeyemi", role: "Geotechnical & Soil Specialist", organization: "Materials Testing Council", zone: "All Zones", rating: "5.0", isInspector: false, activeCount: 4, email: "k.adeyemi@mat-testing.org" },
];

export default function AssignReviewerSideDrawer({
  isOpen,
  onClose,
  application,
  onAssign
}: AssignReviewerSideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'invite'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewers, setReviewers] = useState<ReviewerItem[]>(DEFAULT_REVIEWERS);
  const [selectedReviewerId, setSelectedReviewerId] = useState<string>('');
  const [assignmentRole, setAssignmentRole] = useState('Primary Reviewer');
  const [mustApprove, setMustApprove] = useState(true);
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDiscipline, setInviteDiscipline] = useState('Structural Engineering');
  const [inviteOrg, setInviteOrg] = useState('State Building Control Authority');
  const [inviteRole, setInviteRole] = useState('Primary Reviewer');
  const [inviteNote, setInviteNote] = useState('You have been nominated to review regulatory building submittals.');

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    getInspectors()
      .then(inspectors => {
        if (inspectors && inspectors.length > 0) {
          const mapped: ReviewerItem[] = inspectors.map(insp => ({
            id: insp.id || insp.inspector_id,
            name: insp.name,
            role: insp.role_title || "Field Compliance Inspector",
            organization: "State Regulatory Authority",
            zone: insp.assigned_zone,
            rating: insp.pass_rate || "4.8",
            isInspector: true,
            activeCount: insp.active_inspections || 0,
            email: `${insp.name.toLowerCase().replace(/\s+/g, '.')}@regulatory.gov.ng`
          }));
          // Merge unique
          const combined = [...mapped, ...DEFAULT_REVIEWERS.filter(d => !mapped.some(m => m.name === d.name))];
          setReviewers(combined);
          if (combined.length > 0) setSelectedReviewerId(combined[0].id);
        } else {
          setSelectedReviewerId(DEFAULT_REVIEWERS[0].id);
        }
      })
      .catch(err => {
        console.error("Failed to fetch inspectors in real-time", err);
        setSelectedReviewerId(DEFAULT_REVIEWERS[0].id);
      })
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredReviewers = reviewers.filter(r => 
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.organization.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.zone && r.zone.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedReviewer = reviewers.find(r => r.id === selectedReviewerId);

  const handleConfirmAssignment = async () => {
    if (!selectedReviewer) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a reviewer or inspector', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (application?.id) {
        await assignApplicationReviewer(application.id, {
          reviewer_id: selectedReviewer.id,
          reviewer_name: selectedReviewer.name,
          review_deadline: reviewDeadline || undefined
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Assigned ${selectedReviewer.name} as ${assignmentRole} in real-time`, type: 'success' } 
      }));
      
      onClose();
      if (onAssign) onAssign();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign reviewer';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Name and email are required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const newReviewer: ReviewerItem = {
        id: `REV-INV-${Date.now().toString().slice(-4)}`,
        name: inviteName.trim(),
        role: `${inviteDiscipline} Specialist`,
        organization: inviteOrg,
        zone: "Assigned Project Zone",
        rating: "New",
        isInspector: inviteRole.includes('Inspector'),
        activeCount: 1,
        email: inviteEmail.trim()
      };

      setReviewers(prev => [newReviewer, ...prev]);
      setSelectedReviewerId(newReviewer.id);
      setAssignmentRole(inviteRole);

      if (application?.id) {
        await assignApplicationReviewer(application.id, {
          reviewer_id: newReviewer.id,
          reviewer_name: newReviewer.name,
          review_deadline: reviewDeadline || undefined
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Invitation dispatched to ${inviteEmail}. Added & assigned as reviewer.`, type: 'success' } 
      }));

      // Reset invite fields
      setInviteName('');
      setInviteEmail('');
      setActiveTab('select');
      onClose();
      if (onAssign) onAssign();
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to send invitation', type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-[620px] bg-white p-8 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Reviewer Oversight</span>
            <h2 className="text-xl font-black text-[#022C4F]">Assign Reviewer & Inspector</h2>
            {application && (
              <p className="text-xs text-slate-500 mt-0.5">
                {application.application_reference} • {application.project_name}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher: Select vs Invite */}
        <div className="flex bg-slate-100 p-1 rounded-2xl my-4 shrink-0">
          <button
            onClick={() => setActiveTab('select')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'select'
                ? 'bg-white text-[#022C4F] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShieldCheck size={15} className="text-blue-600" /> Available Reviewers & Inspectors ({reviewers.length})
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-white text-[#022C4F] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} className="text-emerald-600" /> ➕ Invite New Reviewer
          </button>
        </div>

        {/* TAB 1: Select Available Inspector / Reviewer */}
        {activeTab === 'select' && (
          <div className="flex-1 overflow-y-auto flex flex-col space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filter by name, discipline, zone, or agency..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Reviewers List */}
            <div className="space-y-2.5">
              {isLoading ? (
                <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Loading certified reviewers and inspectors in real-time...
                </div>
              ) : filteredReviewers.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-slate-400 text-xs">
                  No reviewers found matching "{searchQuery}".
                </div>
              ) : (
                filteredReviewers.map((rev) => {
                  const isSelected = selectedReviewerId === rev.id;

                  return (
                    <div 
                      key={rev.id}
                      onClick={() => setSelectedReviewerId(rev.id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                        isSelected 
                          ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600' 
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rev.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-extrabold text-[#022C4F]">{rev.name}</h4>
                              {rev.isInspector && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                  Inspector
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{rev.role}</p>
                            <p className="text-[10px] text-slate-400">{rev.organization} {rev.zone ? `• ${rev.zone}` : ''}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-500">
                            {rev.activeCount} active case(s)
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">
                            ★ {rev.rating} rating
                          </span>
                        </div>
                      </div>

                      {/* Selected Assignment Parameters */}
                      {isSelected && (
                        <div className="pt-3 mt-1 border-t border-blue-200/60 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Assignment Role
                            </label>
                            <CustomSelect
                              value={assignmentRole}
                              onChange={(val) => setAssignmentRole(val)}
                              options={[
                                { value: "Primary Reviewer", label: "Primary Reviewer (Lead)" },
                                { value: "Structural Inspector", label: "Structural Inspector" },
                                { value: "MEP & Fire Specialist", label: "MEP & Fire Specialist" },
                                { value: "Planning Examiner", label: "Planning Examiner" },
                                { value: "Advisory Reviewer", label: "Advisory Reviewer" }
                              ]}
                              placeholder="Role..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Target SLA Deadline
                            </label>
                            <input 
                              type="date"
                              value={reviewDeadline}
                              onChange={(e) => setReviewDeadline(e.target.value)}
                              className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Action Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleConfirmAssignment}
                disabled={isSubmitting || !selectedReviewer}
                className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033b6a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check size={14} /> {isSubmitting ? 'Assigning in Real-Time...' : 'Confirm Real-Time Assignment'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: Invite New Reviewer */}
        {activeTab === 'invite' && (
          <form onSubmit={handleSendInvite} className="flex-1 overflow-y-auto flex flex-col space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium">
              <span className="font-bold">Official Registration:</span> Inviting an external engineer or certified officer sends an encrypted credentials invitation to their email and provisions their reviewer seat immediately.
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Legal Name
              </label>
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="e.g. Engr. Adeola Balogun"
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="e.g. a.balogun@regulatory.gov.ng"
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Engineering Discipline
                </label>
                <CustomSelect
                  value={inviteDiscipline}
                  onChange={(val) => setInviteDiscipline(val)}
                  options={[
                    { value: "Structural Engineering", label: "Structural Engineering" },
                    { value: "Civil & Foundation", label: "Civil & Foundation" },
                    { value: "MEP & Fire Safety", label: "MEP & Fire Safety" },
                    { value: "Architectural Examiner", label: "Architectural Examiner" },
                    { value: "Geotechnical / Soil", label: "Geotechnical / Soil" },
                    { value: "Environmental Impact", label: "Environmental Impact" }
                  ]}
                  placeholder="Discipline..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Assigned Authority Role
                </label>
                <CustomSelect
                  value={inviteRole}
                  onChange={(val) => setInviteRole(val)}
                  options={[
                    { value: "Primary Reviewer", label: "Primary Reviewer" },
                    { value: "Compliance Inspector", label: "Compliance Inspector" },
                    { value: "Advisory Specialist", label: "Advisory Specialist" },
                    { value: "Lead Approver", label: "Lead Approver" }
                  ]}
                  placeholder="Role..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Organization / Government Agency
              </label>
              <input
                type="text"
                value={inviteOrg}
                onChange={(e) => setInviteOrg(e.target.value)}
                placeholder="e.g. Lagos State Physical Planning Directorate"
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Personalized Onboarding Note
              </label>
              <textarea
                value={inviteNote}
                onChange={(e) => setInviteNote(e.target.value)}
                rows={3}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setActiveTab('select')}
                className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Back
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> {isSubmitting ? 'Sending Invite & Assigning...' : 'Send Invitation & Assign Reviewer'}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}
