"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Gavel, ShieldAlert, UserCheck, UserPlus, Send, 
  Building2, AlertTriangle, Check, Sparkles, Mail, Briefcase, 
  Layers, Clock, ShieldCheck, ChevronRight, Copy, ExternalLink,
  MapPin, AlertOctagon, FileText, Landmark, Phone
} from 'lucide-react';
import { SiteIssue, escalateSiteIssue } from '@/services/monitoring';
import { getStaffUsers, inviteStaffUser, StaffUser } from '@/services/settings';
import { CustomSelect } from '@/components/CustomSelect';
import { useRouter } from 'next/navigation';

interface EscalateToDirectorateModalProps {
  isOpen: boolean;
  onClose: () => void;
  issue?: SiteIssue | null;
  issuesList?: SiteIssue[];
  onSuccess?: (updatedIssue?: SiteIssue) => void;
}

const DEFAULT_DIRECTORS = [
  {
    id: "dir-01",
    name: "Engr. Abimbola Williams",
    email: "abimbola.williams@lasbca.gov.ng",
    role: "Director",
    department: "Directorate of Building Control & Statutory Enforcement",
    title: "Director of Building Control (LASBCA)",
    phone: "+234 803 456 7890",
    jurisdiction: "Lagos State Division"
  },
  {
    id: "dir-02",
    name: "Dr. Olufemi Martins",
    email: "olufemi.martins@mppud.lagosstate.gov.ng",
    role: "Director",
    department: "Ministry of Physical Planning & Urban Development",
    title: "Director of Physical Planning & Compliance",
    phone: "+234 802 345 6789",
    jurisdiction: "Urban Development & Zoning"
  },
  {
    id: "dir-03",
    name: "Arc. Folashade Adeleke",
    email: "folashade.adeleke@lasbca.gov.ng",
    role: "Director",
    department: "Directorate of Structural Integrity & Materials Testing",
    title: "Director of Structural Inspections",
    phone: "+234 805 678 9012",
    jurisdiction: "Materials & Structural Lab"
  },
  {
    id: "dir-04",
    name: "Engr. Chukwuma Obi",
    email: "permanent.secretary@mppud.lagosstate.gov.ng",
    role: "Director General",
    department: "Executive Cabinet Office",
    title: "Permanent Secretary / Director General",
    phone: "+234 809 123 4567",
    jurisdiction: "State-wide Regulatory Cabinet"
  }
];

const ESCALATION_TIERS = [
  {
    level: "Tier 1: Directorate Executive Review & Formal Notice",
    badge: "Tier 1",
    authority: "Director of Building Control",
    sla: "24-Hour Review SLA",
    description: "Formal executive review and statutory notice issued to the developer and structural engineer of record."
  },
  {
    level: "Tier 2: Permanent Secretary Direct Intervention & Summons",
    badge: "Tier 2",
    authority: "Permanent Secretary / DG",
    sla: "12-Hour Urgent SLA",
    description: "Immediate Ministerial summons and directive requiring principal contractor to halt affected structural elements."
  },
  {
    level: "Tier 3: Special Building Appeals Tribunal & Demolition / Sealing Review",
    badge: "Tier 3",
    authority: "Statutory Appeals Tribunal",
    sla: "Immediate Evacuation",
    description: "Emergency sealing order, revocation of building approval, and tribunal review for dangerous structure mitigation."
  }
];

const BRIEFING_TEMPLATES = [
  {
    title: "Imminent Structural Risk & Safety Violation",
    text: "Defect represents imminent structural settlement and load-bearing deviation. Developer failed to rectify after formal notices. Executive intervention and immediate site directive required."
  },
  {
    title: "Uncertified Construction Modifications",
    text: "Site survey revealed unauthorized floor additions and beam alterations deviating from the approved architectural drawing. Formal summons to developer and consultant of record mandated."
  },
  {
    title: "Materials Testing Non-Conformance",
    text: "Concrete core crush test results failed compressive strength benchmarks (< 20 N/mm²). Immediate structural integrity audit and stop-work order enforcement requested."
  }
];

export default function EscalateToDirectorateModal({
  isOpen,
  onClose,
  issue,
  issuesList = [],
  onSuccess
}: EscalateToDirectorateModalProps) {
  const router = useRouter();
  const [selectedIssueId, setSelectedIssueId] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'select' | 'invite'>('select');

  // Directors list
  const [directors, setDirectors] = useState<any[]>(DEFAULT_DIRECTORS);
  const [selectedDirectorId, setSelectedDirectorId] = useState<string>(DEFAULT_DIRECTORS[0].id);

  // Invite Director form states
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('Directorate of Building Control & Statutory Enforcement');
  const [inviteTitle, setInviteTitle] = useState('Director of Building Control');
  const [invitePhone, setInvitePhone] = useState('+234 803 000 0000');
  const [isInviting, setIsInviting] = useState(false);
  const [lastInvitedLink, setLastInvitedLink] = useState<string | null>(null);

  // Escalation parameters
  const [escalationLevel, setEscalationLevel] = useState(ESCALATION_TIERS[0].level);
  const [escalationNotes, setEscalationNotes] = useState(BRIEFING_TEMPLATES[0].text);
  const [punitiveMeasures, setPunitiveMeasures] = useState({
    sealSite: false,
    revokePermit: false,
    summonEngineer: true,
    materialAudit: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (issue?.id) {
      setSelectedIssueId(issue.id);
    } else if (issuesList.length > 0 && !selectedIssueId) {
      const openIssue = issuesList.find(i => !i.is_escalated && i.status !== 'RESOLVED') || issuesList[0];
      setSelectedIssueId(openIssue.id);
    }

    // Attempt to load staff users who are Directors
    getStaffUsers()
      .then(users => {
        if (Array.isArray(users) && users.length > 0) {
          const dirUsers = users.filter(u => 
            u.role?.toLowerCase().includes('director') || 
            u.role?.toLowerCase().includes('head') || 
            u.role?.toLowerCase().includes('admin') ||
            u.role?.toLowerCase().includes('secretary')
          );
          if (dirUsers.length > 0) {
            setDirectors(dirUsers.map(u => ({
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              department: u.department || 'Urban Planning & Building Control',
              title: u.role,
              phone: u.phone || u.phone_number || "+234 800 000 0000",
              jurisdiction: "Lagos State Directorate"
            })));
            setSelectedDirectorId(dirUsers[0].id);
          }
        }
      })
      .catch(() => {
        // Keep default directors list
      });
  }, [isOpen, issue, issuesList]);

  if (!isOpen) return null;

  const currentIssue = issue || issuesList.find(i => i.id === selectedIssueId);
  const selectedDirector = directors.find(d => d.id === selectedDirectorId) || directors[0];

  const handleInviteDirector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteName.trim() || !inviteEmail.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Director name and official email are required', type: 'error' } 
      }));
      return;
    }

    setIsInviting(true);
    const token = `inv-${Date.now()}`;
    const generatedTemp = `Nexucon@Dir${Math.floor(1000 + Math.random() * 9000)}!`;
    const appBase = typeof window !== 'undefined' ? window.location.origin : 'https://nexucon-frontend-8x3a.vercel.app';
    const inviteUrl = `${appBase}/auth/accept-invite?token=${token}&email=${encodeURIComponent(inviteEmail.trim().toLowerCase())}&role=${encodeURIComponent('Director')}&temp=${encodeURIComponent(generatedTemp)}`;

    try {
      // 1. Send via Next.js Email Service
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: inviteEmail.trim().toLowerCase(),
          name: inviteName.trim(),
          role: 'Director',
          department: inviteDepartment,
          invite_token: token,
          temp_password: generatedTemp
        })
      }).catch(err => console.warn('Email dispatch log:', err));

      // 2. Save credentials in local storage for instant browser login testing
      if (typeof window !== 'undefined') {
        localStorage.setItem(`nexucon_user_credentials_${inviteEmail.trim().toLowerCase()}`, JSON.stringify({
          email: inviteEmail.trim().toLowerCase(),
          password: generatedTemp,
          name: inviteName.trim(),
          role: 'Director'
        }));
      }

      // 3. Register in backend database
      try {
        await inviteStaffUser({
          name: inviteName.trim(),
          email: inviteEmail.trim().toLowerCase(),
          role: 'Director',
          department: inviteDepartment
        });
      } catch (backendErr: any) {
        console.warn('Backend staff invite sync:', backendErr);
      }

      const newDirector = {
        id: `dir-${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        role: 'Director',
        department: inviteDepartment,
        title: inviteTitle,
        phone: invitePhone,
        jurisdiction: "Executive Directorate"
      };

      setDirectors(prev => [newDirector, ...prev]);
      setSelectedDirectorId(newDirector.id);
      setLastInvitedLink(inviteUrl);
      setActiveTab('select');

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Official Director invitation & onboarding dispatch sent to ${inviteEmail}. Executive selected for escalation.`, 
          type: 'success' 
        } 
      }));
    } catch (err: any) {
      const newDirector = {
        id: `dir-${Date.now()}`,
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        role: 'Director',
        department: inviteDepartment,
        title: inviteTitle,
        phone: invitePhone,
        jurisdiction: "Executive Directorate"
      };
      setDirectors(prev => [newDirector, ...prev]);
      setSelectedDirectorId(newDirector.id);
      setLastInvitedLink(inviteUrl);
      setActiveTab('select');

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Director invitation registered for ${inviteName}. Executive selected.`, type: 'success' } 
      }));
    } finally {
      setIsInviting(false);
    }
  };

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetIssueId = selectedIssueId || currentIssue?.id;
    if (!targetIssueId) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Please select a construction site defect / issue to escalate', type: 'error' } 
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const directorName = selectedDirector?.name || 'Director of Physical Planning & Building Control';
      const notes = escalationNotes.trim() || `Statutory Escalation to ${directorName} (${escalationLevel}). Imminent defect review mandated.`;

      const updated = await escalateSiteIssue(targetIssueId, {
        director_name: directorName,
        notes: notes,
        target_level: escalationLevel
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: `Site issue ${currentIssue?.issue_reference || ''} officially escalated to Directorate (${directorName}). Executive review registered.`, 
          type: 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(updated);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Failed to escalate site issue';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[110] animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Sidepop Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col z-[111] animate-in slide-in-from-right-8 duration-300 border-l border-slate-200">
        
        {/* Header Bar aligned with #022C4F Brand Aesthetic */}
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-[#022C4F] via-[#03467B] to-[#0A66C2] text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3 sm:gap-3.5 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-blue-200 shrink-0 shadow-inner">
              <Gavel size={22} className="text-amber-300 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                  <Landmark size={10} /> Statutory Escalation
                </span>
                <span className="text-xs text-blue-100 font-semibold hidden sm:inline">
                  Executive Tribunal
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-black tracking-tight text-white mt-1 truncate">
                Escalate Issue to Directorate
              </h2>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Sidepop Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 scrollbar-hide">
          
          {/* Target Defect Overview Card */}
          {issue ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#022C4F] font-mono bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm">
                    {issue.issue_reference}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase ${
                    issue.severity === 'CRITICAL' ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/30' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {issue.severity} Severity
                  </span>
                </div>

                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Clock size={12} /> {new Date(issue.created_at).toLocaleDateString()}
                </span>
              </div>

              <h4 className="text-sm font-black text-[#022C4F]">{issue.title}</h4>
              
              <p className="text-xs text-slate-600 leading-relaxed font-medium bg-white p-3 rounded-2xl border border-slate-100">
                {issue.description}
              </p>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <Building2 size={13} className="text-[#0A66C2]" /> {issue.project_name || 'Active Project Site'}
                </span>
                <span className="font-semibold text-slate-700">
                  Assigned: <strong>{issue.assigned_to_name || 'Site Engineer'}</strong>
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                Select Site Defect to Escalate
              </label>
              <CustomSelect
                value={selectedIssueId}
                onChange={(val) => setSelectedIssueId(val)}
                options={issuesList.map(i => ({
                  value: i.id,
                  label: `${i.issue_reference} - ${i.title} (${i.project_name}) [${i.severity}]`
                }))}
                placeholder="Choose open defect / site hazard..."
                searchable={true}
              />
            </div>
          )}

          {/* Statutory Escalation Tiers */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Statutory Directorate Tier & Severity Level
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {ESCALATION_TIERS.map((tier) => {
                const isSelected = escalationLevel === tier.level;
                return (
                  <div
                    key={tier.badge}
                    onClick={() => setEscalationLevel(tier.level)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 border-[#0A66C2] ring-1 ring-[#0A66C2] shadow-sm'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                          isSelected ? 'bg-[#022C4F] text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {tier.badge}
                        </span>
                        <span className="text-xs font-black text-[#022C4F]">{tier.authority}</span>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        {tier.sla}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium pl-1">{tier.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Director Selection & Invitation Container */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider block">
                Assign Executive Director
              </label>
              
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('select')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'select' 
                      ? 'bg-white text-[#022C4F] shadow-sm font-black' 
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <UserCheck size={12} className="inline mr-1 text-[#0A66C2]" /> Registered Directors ({directors.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('invite')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'invite' 
                      ? 'bg-[#022C4F] text-white shadow-sm font-black' 
                      : 'text-[#022C4F] hover:text-blue-900'
                  }`}
                >
                  <UserPlus size={12} className="inline mr-1" /> + Invite Director
                </button>
              </div>
            </div>

            {/* TAB 1: SELECT EXISTING DIRECTOR */}
            {activeTab === 'select' && (
              <div className="space-y-2">
                <div className="grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                  {directors.map(dir => {
                    const isSelected = selectedDirectorId === dir.id;
                    return (
                      <div
                        key={dir.id}
                        onClick={() => setSelectedDirectorId(dir.id)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50/70 border-[#0A66C2] shadow-sm ring-1 ring-[#0A66C2]'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected ? 'bg-[#022C4F] text-white shadow-md' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {dir.name.split(' ').map((n: string) => n[0]).slice(0, 2).join('')}
                          </div>
                          <div>
                            <h5 className="text-xs font-black text-[#022C4F]">{dir.name}</h5>
                            <p className="text-[11px] text-[#0A66C2] font-bold">{dir.title || dir.role}</p>
                            <p className="text-[10px] text-slate-500 truncate max-w-[280px]">{dir.department}</p>
                          </div>
                        </div>

                        <div className="shrink-0 flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-400 hidden sm:inline">{dir.phone}</span>
                          {isSelected ? (
                            <div className="w-5 h-5 rounded-full bg-[#022C4F] text-white flex items-center justify-center shadow-sm">
                              <Check size={12} />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Banner if a director was just invited */}
                {lastInvitedLink && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-xs font-bold text-emerald-900">
                      <span className="flex items-center gap-1.5">
                        <Check size={14} className="text-emerald-600" /> Director Invitation Link Generated:
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lastInvitedLink);
                          window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Invite URL copied to clipboard!', type: 'success' } }));
                        }}
                        className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 text-[10px] uppercase font-black cursor-pointer"
                      >
                        <Copy size={11} /> Copy URL
                      </button>
                    </div>
                    <p className="text-[11px] font-mono text-emerald-800 break-all bg-white p-2 rounded-xl border border-emerald-100">
                      {lastInvitedLink}
                    </p>
                    <a
                      href={lastInvitedLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline pt-0.5"
                    >
                      <ExternalLink size={11} /> Open Director Onboarding Portal Preview &rarr;
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: INVITE NEW DIRECTOR */}
            {activeTab === 'invite' && (
              <form onSubmit={handleInviteDirector} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl space-y-3.5">
                <div className="flex items-center justify-between text-xs font-black text-[#022C4F] pb-2 border-b border-slate-200">
                  <span className="flex items-center gap-1.5">
                    <UserPlus size={14} className="text-[#0A66C2]" /> Executive Directorate Onboarding
                  </span>
                  <span className="text-[10px] font-bold text-slate-500">Official Gov Email Dispatch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Director Full Name</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      required
                      placeholder="e.g. Arc. Taiwo Oladipo"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#022C4F] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Official Email Address</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="taiwo.oladipo@lasbca.gov.ng"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#022C4F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Directorate / Ministry</label>
                    <select
                      value={inviteDepartment}
                      onChange={(e) => setInviteDepartment(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#022C4F] focus:outline-none"
                    >
                      <option value="Directorate of Building Control & Statutory Enforcement">Building Control (LASBCA)</option>
                      <option value="Ministry of Physical Planning & Urban Development">Physical Planning (MPPUD)</option>
                      <option value="Materials Testing & Structural Integrity Directorate">Materials Testing (LSMTL)</option>
                      <option value="Executive Cabinet / Permanent Secretary Office">Executive Cabinet Office</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1">Designation Title</label>
                    <input
                      type="text"
                      value={inviteTitle}
                      onChange={(e) => setInviteTitle(e.target.value)}
                      placeholder="Director of Building Enforcement"
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-[#022C4F] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('select')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="px-4 py-2 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Send size={12} /> {isInviting ? 'Dispatching Official Invite...' : 'Send Invitation & Select'}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Quick Briefing Templates */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Statutory Clauses & Briefing Templates
            </label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {BRIEFING_TEMPLATES.map((tmpl) => (
                <button
                  key={tmpl.title}
                  type="button"
                  onClick={() => setEscalationNotes(tmpl.text)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-[#0A66C2] text-slate-700 rounded-xl text-[11px] font-bold whitespace-nowrap border border-slate-200 transition-colors cursor-pointer shrink-0"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Formal Escalation Briefing */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider">
              Executive Briefing & Directive Notes
            </label>
            <textarea
              rows={4}
              value={escalationNotes}
              onChange={(e) => setEscalationNotes(e.target.value)}
              placeholder="Provide statutory context on why this defect warrants immediate director-level review..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-[#022C4F] focus:bg-white focus:outline-none leading-relaxed"
            />
          </div>

          {/* Punitive & Remedial Measures Checklist */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2.5">
            <span className="text-xs font-bold text-[#022C4F] uppercase tracking-wider block">
              Enforcement Actions Requested in Escalation
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={punitiveMeasures.summonEngineer}
                  onChange={(e) => setPunitiveMeasures(prev => ({ ...prev, summonEngineer: e.target.checked }))}
                  className="w-4 h-4 text-[#022C4F] rounded border-slate-300 focus:ring-[#022C4F]"
                />
                Summon Engineer of Record
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={punitiveMeasures.materialAudit}
                  onChange={(e) => setPunitiveMeasures(prev => ({ ...prev, materialAudit: e.target.checked }))}
                  className="w-4 h-4 text-[#022C4F] rounded border-slate-300 focus:ring-[#022C4F]"
                />
                Order Compressive Strength Testing
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={punitiveMeasures.sealSite}
                  onChange={(e) => setPunitiveMeasures(prev => ({ ...prev, sealSite: e.target.checked }))}
                  className="w-4 h-4 text-[#022C4F] rounded border-slate-300 focus:ring-[#022C4F]"
                />
                Execute Statutory Site Seal
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={punitiveMeasures.revokePermit}
                  onChange={(e) => setPunitiveMeasures(prev => ({ ...prev, revokePermit: e.target.checked }))}
                  className="w-4 h-4 text-[#022C4F] rounded border-slate-300 focus:ring-[#022C4F]"
                />
                Review Building Permit Revocation
              </label>
            </div>
          </div>

        </div>

        {/* Footer Actions Aligned with Primary Brand Theme */}
        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="button"
            disabled={isSubmitting || !selectedDirectorId || (!selectedIssueId && !issue?.id)}
            onClick={handleEscalateSubmit}
            className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#03467B] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Gavel size={15} className="text-amber-300" /> {isSubmitting ? 'Submitting to Directorate...' : 'Dispatch Formal Directorate Escalation'}
          </button>
        </div>

      </div>
    </>
  );
}
