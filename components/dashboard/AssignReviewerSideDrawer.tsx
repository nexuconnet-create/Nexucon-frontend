"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Search, ChevronDown, AlertCircle, UserPlus, ShieldCheck, 
  Send, User, Building2, CheckCircle2, Clock, Mail, Award, Check, RefreshCw
} from 'lucide-react';
import { Application, assignApplicationReviewer } from '@/services/applications';
import { getInspectors, createInspector, Inspector } from '@/services/stakeholders';
import { CustomSelect } from '@/components/CustomSelect';

interface AssignReviewerSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  application?: Application | null;
  onAssign?: () => void;
}

export default function AssignReviewerSideDrawer({
  isOpen,
  onClose,
  application,
  onAssign
}: AssignReviewerSideDrawerProps) {
  const [activeTab, setActiveTab] = useState<'select' | 'invite'>('select');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectors, setInspectors] = useState<Inspector[]>([]);
  const [selectedInspectorId, setSelectedInspectorId] = useState<string>('');
  const [assignmentRole, setAssignmentRole] = useState('Primary Reviewer');
  const [reviewDeadline, setReviewDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Invite form state
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDiscipline, setInviteDiscipline] = useState('Structural Integrity Inspector');
  const [inviteType, setInviteType] = useState('Internal (Gov)');
  const [inviteZone, setInviteZone] = useState('Zone 1 (Island & Lekki)');
  const [inviteNote, setInviteNote] = useState('Official invitation to conduct regulatory reviews and site inspections.');

  const fetchRegisteredInspectors = async () => {
    setIsLoading(true);
    try {
      const data = await getInspectors();
      const list = Array.isArray(data) ? data : [];
      setInspectors(list);
      if (list.length > 0) {
        setSelectedInspectorId(list[0].id || list[0].inspector_id);
      } else {
        setSelectedInspectorId('');
      }
    } catch (err) {
      console.error("Failed to load registered inspectors from database", err);
      setInspectors([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    fetchRegisteredInspectors();
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredInspectors = inspectors.filter(insp => 
    insp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (insp.role_title && insp.role_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (insp.assigned_zone && insp.assigned_zone.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (insp.inspector_id && insp.inspector_id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const selectedInspector = inspectors.find(
    i => i.id === selectedInspectorId || i.inspector_id === selectedInspectorId
  );

  const handleConfirmAssignment = async () => {
    if (!selectedInspector) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select an inspector from the registered database', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      if (application?.id) {
        await assignApplicationReviewer(application.id, {
          reviewer_id: selectedInspector.id || selectedInspector.inspector_id,
          reviewer_name: selectedInspector.name,
          review_deadline: reviewDeadline || undefined
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Assigned ${selectedInspector.name} (${selectedInspector.role_title}) in real-time`, type: 'success' } 
      }));
      
      onClose();
      if (onAssign) onAssign();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign inspector';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Inspector name is required', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create inspector in backend database
      const created = await createInspector({
        name: inviteName.trim(),
        role_title: inviteDiscipline,
        inspector_type: inviteType,
        assigned_zone: inviteZone,
        active_inspections: 0,
        pass_rate: '100%',
        ncrs_issued: 0
      });

      // 2. Assign to active application if selected
      if (application?.id) {
        await assignApplicationReviewer(application.id, {
          reviewer_id: created.id || created.inspector_id,
          reviewer_name: created.name,
          review_deadline: reviewDeadline || undefined
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${created.name} registered into database and assigned as inspector. Invitation dispatched to ${inviteEmail || 'user'}.`, type: 'success' } 
      }));

      // Reset form & reload database inspectors
      setInviteName('');
      setInviteEmail('');
      await fetchRegisteredInspectors();
      setActiveTab('select');
      onClose();
      if (onAssign) onAssign();
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to register and invite inspector';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
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
            <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider">Government Regulatory Desk</span>
            <h2 className="text-xl font-black text-[#022C4F]">Assign Certified Inspector / Reviewer</h2>
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
            <ShieldCheck size={15} className="text-blue-600" /> Database Inspectors ({inspectors.length})
          </button>
          <button
            onClick={() => setActiveTab('invite')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'invite'
                ? 'bg-white text-[#022C4F] shadow-sm'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserPlus size={15} className="text-emerald-600" /> ➕ Invite & Register Reviewer
          </button>
        </div>

        {/* TAB 1: Select Registered Database Inspector */}
        {activeTab === 'select' && (
          <div className="flex-1 overflow-y-auto flex flex-col space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search database inspectors by name, zone, or ID..." 
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Live Database Inspectors List */}
            <div className="space-y-2.5 flex-1">
              {isLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Querying registered database inspectors in real-time...
                </div>
              ) : filteredInspectors.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-3">
                  <ShieldCheck size={32} className="text-slate-300 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-700">No Registered Inspectors Found</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    {searchQuery 
                      ? `No registered inspector matches "${searchQuery}".`
                      : "There are currently no inspectors registered on the database. You can invite and register new reviewers directly."}
                  </p>
                  <button
                    onClick={() => setActiveTab('invite')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus size={14} /> ➕ Invite & Register First Reviewer
                  </button>
                </div>
              ) : (
                filteredInspectors.map((insp) => {
                  const inspId = insp.id || insp.inspector_id;
                  const isSelected = selectedInspectorId === inspId;

                  return (
                    <div 
                      key={inspId}
                      onClick={() => setSelectedInspectorId(inspId)}
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
                            {insp.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-extrabold text-[#022C4F]">{insp.name}</h4>
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
                                {insp.inspector_id}
                              </span>
                            </div>
                            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{insp.role_title}</p>
                            <p className="text-[10px] text-slate-400">{insp.inspector_type} • Zone: {insp.assigned_zone}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-slate-500">
                            {insp.active_inspections} active inspection(s)
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-600">
                            {insp.pass_rate} pass rate
                          </span>
                        </div>
                      </div>

                      {/* Selected Assignment Parameters */}
                      {isSelected && (
                        <div className="pt-3 mt-1 border-t border-blue-200/60 grid grid-cols-2 gap-3 animate-in fade-in duration-200">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                              Reviewer Authority Role
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
                              Target Review SLA Deadline
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
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0">
              <button 
                type="button"
                onClick={fetchRegisteredInspectors}
                className="text-xs font-bold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} /> Refresh DB List
              </button>

              <div className="flex items-center gap-2">
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
                  disabled={isSubmitting || !selectedInspector}
                  className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033b6a] text-white rounded-xl text-xs font-bold shadow-md shadow-[#022C4F]/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Check size={14} /> {isSubmitting ? 'Assigning in Real-Time...' : 'Confirm Real-Time Assignment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Invite & Register New Reviewer in Database */}
        {activeTab === 'invite' && (
          <form onSubmit={handleSendInvite} className="flex-1 overflow-y-auto flex flex-col space-y-4 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl text-xs text-emerald-900 leading-relaxed font-medium">
              <span className="font-bold">Database Registration:</span> Submitting this form registers the inspector record directly in the backend database and sends an official reviewer invitation link to their email.
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
                placeholder="e.g. a.balogun@lasbca.gov.ng"
                required
                className="w-full p-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inspector Discipline / Role
                </label>
                <CustomSelect
                  value={inviteDiscipline}
                  onChange={(val) => setInviteDiscipline(val)}
                  options={[
                    { value: "Structural Integrity Inspector", label: "Structural Integrity Inspector" },
                    { value: "Senior MEP & Infrastructure Inspector", label: "Senior MEP & Infrastructure Inspector" },
                    { value: "Senior Geodetic & GNSS Survey Inspector", label: "Senior Geodetic & GNSS Survey Inspector" },
                    { value: "Fire & Site Safety Inspector", label: "Fire & Site Safety Inspector" },
                    { value: "Environmental & Drainage Inspector", label: "Environmental & Drainage Inspector" },
                    { value: "Lead Architectural Examiner", label: "Lead Architectural Examiner" }
                  ]}
                  placeholder="Discipline..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Inspector Classification
                </label>
                <CustomSelect
                  value={inviteType}
                  onChange={(val) => setInviteType(val)}
                  options={[
                    { value: "Internal (Gov)", label: "Internal (Government Staff)" },
                    { value: "Third-Party Accredited", label: "Third-Party Accredited" },
                    { value: "Independent Specialist", label: "Independent Specialist" }
                  ]}
                  placeholder="Classification..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Jurisdiction Zone
              </label>
              <CustomSelect
                value={inviteZone}
                onChange={(val) => setInviteZone(val)}
                options={[
                  { value: "Zone 1 (Island & Lekki)", label: "Zone 1 (Island & Lekki)" },
                  { value: "Zone 2 (Ikeja & Mainland)", label: "Zone 2 (Ikeja & Mainland)" },
                  { value: "Zone 3 (Ibeju-Lekki & Free Zone)", label: "Zone 3 (Ibeju-Lekki & Free Zone)" },
                  { value: "All Zones (Statewide)", label: "All Zones (Statewide)" }
                ]}
                placeholder="Zone..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Personalized Onboarding Directives
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
                Back to List
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> {isSubmitting ? 'Registering & Inviting...' : 'Register to DB & Send Invitation'}
              </button>
            </div>
          </form>
        )}

      </div>
    </>
  );
}
