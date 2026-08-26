"use client";

import React, { useState } from 'react';
import { 
  X, Building2, User, Briefcase, Shield, Check, Plus, 
  AlertCircle, HardHat, FileCheck, Loader2, Mail, Send, Sparkles 
} from 'lucide-react';
import { 
  createDeveloper, createContractor, createConsultant, 
  createInspector, createLicensedProfessional 
} from '@/services/stakeholders';
import { sendEmailViaResend } from '@/services/email';

export type StakeholderCategory = 'developer' | 'contractor' | 'consultant' | 'inspector' | 'professional';

interface CreateStakeholderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialCategory?: StakeholderCategory;
}

export default function CreateStakeholderModal({
  isOpen,
  onClose,
  onSuccess,
  initialCategory = 'developer'
}: CreateStakeholderModalProps) {
  const [category, setCategory] = useState<StakeholderCategory>(initialCategory);
  const [name, setName] = useState('');
  const [roleOrType, setRoleOrType] = useState('');
  const [firmOrOrg, setFirmOrOrg] = useState('');
  const [locationOrZone, setLocationOrZone] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [authority, setAuthority] = useState('COREN');
  const [sendInviteEmail, setSendInviteEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const buildOnboardingInviteHtml = (params: {
    name: string;
    category: string;
    role: string;
    email: string;
    loginUrl: string;
  }) => {
    const { name, category, role, email, loginUrl } = params;
    const currentYear = new Date().getFullYear();

    const categoryLabels: Record<string, string> = {
      developer: 'Master Property Developer',
      contractor: 'General Contractor / Builder',
      consultant: 'Technical Advisory Consultant',
      inspector: 'Field Surveillance Inspector',
      professional: 'Licensed Engineering / Architecture Professional'
    };

    const badgeTitle = categoryLabels[category] || 'Registered Stakeholder';

    return {
      subject: `🏛️ Official Platform Invitation: ${name} (${badgeTitle}) - Nexucon`,
      html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Nexucon Stakeholder Invitation</title></head>
<body style="margin:0;padding:0;background-color:#0A1118;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0A1118;">
    <tr>
      <td align="center" style="padding:40px 10px;">
        <table width="600" style="max-width:600px;background:#FFFFFF;border-radius:24px;overflow:hidden;box-shadow:0 25px 50px -12px rgba(0,0,0,0.35);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg,#022C4F 0%,#03467B 50%,#0A66C2 100%);padding:36px 40px;">
              <table width="100%">
                <tr>
                  <td>
                    <span style="color:#FFF;font-weight:900;font-size:22px;letter-spacing:1.5px;">NEXUCON</span>
                    <span style="color:#93C5FD;font-size:11px;font-weight:700;padding-left:8px;margin-left:8px;border-left:1px solid rgba(255,255,255,0.3);">STAKEHOLDER GOVERNANCE</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding:40px;">
              <span style="display:inline-block;background:#E0F2FE;color:#0369A1;border:1px solid #BAE6FD;padding:6px 14px;border-radius:20px;font-weight:800;font-size:12px;text-transform:uppercase;">
                ${badgeTitle}
              </span>
              
              <h1 style="color:#0F172A;font-size:24px;font-weight:800;margin:16px 0 8px 0;">
                Welcome to Nexucon Regulatory Platform
              </h1>
              
              <p style="color:#334155;font-size:15px;line-height:24px;margin-top:0;">
                Dear <strong>${name}</strong>,
              </p>
              
              <p style="color:#475569;font-size:14px;line-height:22px;">
                You have been formally registered as an approved <strong>${role || badgeTitle}</strong> on the Nexucon Physical Planning and Building Control Management System.
              </p>

              <div style="background-color:#F8FAFC;border:1px solid #E2E8F0;border-radius:16px;padding:20px;margin:24px 0;">
                <div style="font-size:11px;font-weight:800;color:#64748B;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">
                  Stakeholder Credentials Summary
                </div>
                <table width="100%" style="font-size:13px;color:#1E293B;">
                  <tr>
                    <td style="padding:4px 0;color:#64748B;">Registered Entity:</td>
                    <td style="padding:4px 0;font-weight:700;text-align:right;">${name}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748B;">Assigned Category:</td>
                    <td style="padding:4px 0;font-weight:700;text-align:right;">${badgeTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding:4px 0;color:#64748B;">Registered Email:</td>
                    <td style="padding:4px 0;font-weight:700;text-align:right;">${email}</td>
                  </tr>
                </table>
              </div>

              <p style="color:#475569;font-size:14px;line-height:22px;">
                Through your portal, you can submit stage-gate compliance documents, review real-time BIM model revisions, coordinate with government inspectors, and participate in multilingual stakeholder deliberations.
              </p>

              <div style="text-align:center;margin:32px 0;">
                <a href="${loginUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#022C4F 0%,#03467B 100%);color:#FFF;text-decoration:none;border-radius:12px;font-weight:700;font-size:14px;box-shadow:0 4px 14px rgba(2,44,79,0.4);">
                  Access Nexucon Portal &rarr;
                </a>
              </div>

              <p style="color:#94A3B8;font-size:12px;text-align:center;">
                Direct link: <a href="${loginUrl}" style="color:#0A66C2;">${loginUrl}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:24px 40px;text-align:center;">
              <p style="color:#64748B;font-size:11px;margin:0;">
                &copy; ${currentYear} Nexucon Physical Planning & Building Regulatory Authority. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Entity / Person name is required');
      return;
    }
    if (!contactEmail.trim()) {
      setErrorMsg('Contact / Onboarding email is required to dispatch platform invitation');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const targetEmail = contactEmail.trim().toLowerCase();
    const appBaseUrl = typeof window !== 'undefined' 
      ? window.location.origin 
      : (process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://nexucon-frontend-8x3a.vercel.app');
    const loginUrl = `${appBaseUrl}/government/login`;

    try {
      if (category === 'developer') {
        await createDeveloper({
          name: name.trim(),
          hq_location: locationOrZone.trim() || 'Lagos, Nigeria',
          primary_contact_name: contactName.trim() || name.trim(),
          primary_contact_email: targetEmail,
          primary_contact_phone: contactPhone.trim() || undefined,
          status: 'Verified',
          active_projects_count: 1
        });
      } else if (category === 'contractor') {
        await createContractor({
          name: name.trim(),
          contractor_type: roleOrType.trim() || 'General Contractor',
          license_number: licenseNumber.trim() || `LIC-GC-${Math.floor(1000 + Math.random() * 9000)}`,
          compliance_score: 92,
          active_permits: 1,
          status: 'Prequalified',
          specialties: ['Structural Civil Works', 'Commercial Construction']
        });
      } else if (category === 'consultant') {
        await createConsultant({
          name: name.trim(),
          specialty: roleOrType.trim() || 'Structural Engineering Advisory',
          hq_location: locationOrZone.trim() || 'Lagos, Nigeria',
          status: 'Verified',
          active_roles_count: 1
        });
      } else if (category === 'inspector') {
        await createInspector({
          name: name.trim(),
          role_title: roleOrType.trim() || 'Senior Structural Field Inspector',
          assigned_zone: locationOrZone.trim() || 'Zone A (Lekki / Victoria Island)',
          inspector_type: 'Internal (Gov)',
          active_inspections: 0,
          pass_rate: '100%',
          ncrs_issued: 0
        });
      } else if (category === 'professional') {
        await createLicensedProfessional({
          name: name.trim(),
          role_title: roleOrType.trim() || 'Principal Structural Engineer',
          firm_name: firmOrOrg.trim() || 'Independent Practice',
          license_authority: authority,
          license_status: 'Active',
          expiry_date: '2027-12-31',
          active_projects_count: 1,
          is_verified: true
        });
      }

      // Dispatch Onboarding Invitation Email via Resend
      if (sendInviteEmail && targetEmail) {
        const { subject, html } = buildOnboardingInviteHtml({
          name: name.trim(),
          category,
          role: roleOrType.trim() || category,
          email: targetEmail,
          loginUrl
        });

        await sendEmailViaResend({
          to: targetEmail,
          subject,
          html,
          type: 'GENERAL',
          metadata: { category, name, role: roleOrType }
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: sendInviteEmail 
            ? `New ${category} registered & invitation sent to ${targetEmail}!`
            : `New ${category} registered successfully!`, 
          type: 'success' 
        }
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || `Failed to register ${category}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories: Array<{ id: StakeholderCategory; label: string; icon: any }> = [
    { id: 'developer', label: 'Developer', icon: Building2 },
    { id: 'contractor', label: 'Contractor', icon: HardHat },
    { id: 'consultant', label: 'Consultant', icon: Briefcase },
    { id: 'inspector', label: 'Inspector', icon: Shield },
    { id: 'professional', label: 'Professional', icon: FileCheck },
  ];

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
                <Plus size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    REGULATORY ENROLLMENT
                  </span>
                  <span className="text-xs text-slate-400 font-medium">• Email Onboarding Enabled</span>
                </div>
                <h2 className="text-lg font-black text-[#022C4F] mt-0.5">
                  Register New Stakeholder
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
              
              {/* Category Tabs */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                  Select Stakeholder Entity Type
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {categories.map((c) => {
                    const Icon = c.icon;
                    const isSelected = category === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-900 font-bold'
                            : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-600 text-xs font-medium'
                        }`}
                      >
                        <Icon size={16} className={isSelected ? 'text-blue-600' : 'text-slate-400'} />
                        <span className="text-[11px] truncate w-full">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center gap-2">
                  <AlertCircle size={16} />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Entity / Person Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  {category === 'developer' ? 'Developer / Corporate Firm Name' :
                   category === 'contractor' ? 'Contractor / Company Name' :
                   category === 'consultant' ? 'Consultancy Practice Name' :
                   category === 'inspector' ? 'Inspector Full Name' :
                   'Professional Practitioner Name'} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={category === 'inspector' || category === 'professional' ? 'e.g. Engr. Oladipo Adeleke' : 'e.g. Landmark Real Estate Developers Ltd'}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Contact Email Field (Explicit across all categories) */}
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                  Official Contact / Onboarding Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={15} />
                  </div>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="onboarding@stakeholder-firm.com"
                    className="w-full pl-10 pr-3.5 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  The invitation and portal access link will be dispatched to this email address.
                </p>
              </div>

              {/* Dynamic Inputs based on category */}
              <div className="space-y-4">
                
                {/* Developer Fields */}
                {category === 'developer' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Headquarters Location
                        </label>
                        <input
                          type="text"
                          value={locationOrZone}
                          onChange={(e) => setLocationOrZone(e.target.value)}
                          placeholder="e.g. Victoria Island, Lagos"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Primary Contact Person
                        </label>
                        <input
                          type="text"
                          value={contactName}
                          onChange={(e) => setContactName(e.target.value)}
                          placeholder="e.g. Mr. Femi Balogun"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Contact Phone
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+234 802 345 6789"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}

                {/* Contractor Fields */}
                {category === 'contractor' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Contractor Classification
                      </label>
                      <select
                        value={roleOrType}
                        onChange={(e) => setRoleOrType(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="General Contractor">General Contractor</option>
                        <option value="Specialist Subcontractor">Specialist Subcontractor</option>
                        <option value="Civil Engineering Works">Civil Engineering Works</option>
                        <option value="MEP Systems Contractor">MEP Systems Contractor</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Statutory License Number
                      </label>
                      <input
                        type="text"
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        placeholder="LIC-CONTR-9942"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Consultant Fields */}
                {category === 'consultant' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Advisory Specialty
                      </label>
                      <input
                        type="text"
                        value={roleOrType}
                        onChange={(e) => setRoleOrType(e.target.value)}
                        placeholder="e.g. Geotechnical &amp; Seismic Advisory"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        HQ Office Location
                      </label>
                      <input
                        type="text"
                        value={locationOrZone}
                        onChange={(e) => setLocationOrZone(e.target.value)}
                        placeholder="e.g. Ikoyi, Lagos"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {/* Inspector Fields */}
                {category === 'inspector' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Inspector Role Title
                      </label>
                      <input
                        type="text"
                        value={roleOrType}
                        onChange={(e) => setRoleOrType(e.target.value)}
                        placeholder="e.g. Principal Structural Auditor"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Assigned Field Zone
                      </label>
                      <select
                        value={locationOrZone}
                        onChange={(e) => setLocationOrZone(e.target.value)}
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="Zone A (Lekki / Victoria Island)">Zone A (Lekki / Victoria Island)</option>
                        <option value="Zone B (Ikeja / Central Business District)">Zone B (Ikeja / Central Business District)</option>
                        <option value="Zone C (East Corridor)">Zone C (East Corridor)</option>
                        <option value="Zone D (Harbor &amp; Maritime Hub)">Zone D (Harbor &amp; Maritime Hub)</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Professional Fields */}
                {category === 'professional' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Professional Title / Role
                        </label>
                        <input
                          type="text"
                          value={roleOrType}
                          onChange={(e) => setRoleOrType(e.target.value)}
                          placeholder="e.g. Chief Structural Engineer"
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                          Licensing Body
                        </label>
                        <select
                          value={authority}
                          onChange={(e) => setAuthority(e.target.value)}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="COREN">COREN (Engineers)</option>
                          <option value="ARCON">ARCON (Architects)</option>
                          <option value="QSRBN">QSRBN (Quantity Surveyors)</option>
                          <option value="CORBON">CORBON (Builders)</option>
                          <option value="TOPREC">TOPREC (Town Planners)</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1.5">
                        Firm / Institutional Affiliation
                      </label>
                      <input
                        type="text"
                        value={firmOrOrg}
                        onChange={(e) => setFirmOrOrg(e.target.value)}
                        placeholder="e.g. Prime Engineering Consultants Ltd"
                        className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Transactional Email Invitation Toggle Card */}
              <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sendInviteEmail}
                    onChange={(e) => setSendInviteEmail(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-blue-500 cursor-pointer h-4 w-4"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#022C4F]">
                        Dispatch Official Onboarding Invitation Email
                      </span>
                      <span className="text-[9px] font-extrabold uppercase tracking-wider bg-blue-600 text-white px-1.5 py-0.5 rounded">
                        Resend
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Sends an official onboarding invitation to <strong>{contactEmail || 'the registered email'}</strong> with one-click portal access, regulatory compliance orientation, and role permissions.
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
                    <span>Registering &amp; Inviting...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>Register &amp; Send Invite</span>
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
