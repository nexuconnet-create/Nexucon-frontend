"use client";

import React, { useState } from 'react';
import { X, Building2, User, Briefcase, Shield, Check, Plus, AlertCircle } from 'lucide-react';
import { 
  createDeveloper, createContractor, createConsultant, 
  createInspector, createLicensedProfessional 
} from '@/services/stakeholders';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Entity / Person name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (category === 'developer') {
        await createDeveloper({
          name: name.trim(),
          hq_location: locationOrZone.trim() || 'Lagos, Nigeria',
          primary_contact_name: contactName.trim() || 'Director of Operations',
          primary_contact_email: contactEmail.trim() || undefined,
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
          role_title: roleOrType.trim() || 'Principal Registered Engineer',
          firm_name: firmOrOrg.trim() || 'Associated Engineering Consult',
          license_authority: authority,
          license_status: 'Valid',
          expiry_date: 'Dec 31, 2028',
          active_projects_count: 1,
          is_verified: true
        });
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `New ${category} registered successfully!`, type: 'success' }
      }));
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err?.message || 'Failed to register stakeholder');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[#0F181F]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-50 via-white to-blue-50/40 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#022C4F] text-white flex items-center justify-center shadow-md shadow-[#022C4F]/20">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                REGULATORY REGISTRY
              </span>
              <h2 className="text-base font-black text-[#022C4F] mt-0.5">
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

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 border border-red-200 text-xs flex items-center gap-2">
              <AlertCircle size={15} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Picker */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Stakeholder Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'developer', label: 'Developer' },
                { id: 'contractor', label: 'Contractor' },
                { id: 'professional', label: 'Professional' },
                { id: 'consultant', label: 'Consultant' },
                { id: 'inspector', label: 'Inspector' },
              ].map((c) => (
                <button
                  type="button"
                  key={c.id}
                  onClick={() => setCategory(c.id as StakeholderCategory)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all border text-center cursor-pointer ${
                    category === c.id
                      ? 'bg-[#022C4F] text-white border-[#022C4F] shadow-sm'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
              {category === 'developer' || category === 'contractor' || category === 'consultant' 
                ? 'Company / Entity Legal Name' 
                : 'Full Official Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={category === 'developer' ? 'e.g., Eko Atlantic Development Ltd' : 'e.g., Engr. Tunde Adeleke'}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Secondary Details */}
          {category === 'contractor' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Contractor Type</label>
                <input
                  type="text"
                  value={roleOrType}
                  onChange={(e) => setRoleOrType(e.target.value)}
                  placeholder="e.g., General Contractor, MEP"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">License No.</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  placeholder="e.g., LIC-GC-9912"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {category === 'professional' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Regulatory Authority</label>
                <select
                  value={authority}
                  onChange={(e) => setAuthority(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="COREN">COREN (Engineering)</option>
                  <option value="ARCON">ARCON (Architecture)</option>
                  <option value="CORBON">CORBON (Building)</option>
                  <option value="QSRBN">QSRBN (Quantity Surveying)</option>
                  <option value="TOPREC">TOPREC (Town Planning)</option>
                  <option value="SURCON">SURCON (Surveying)</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Firm / Practice</label>
                <input
                  type="text"
                  value={firmOrOrg}
                  onChange={(e) => setFirmOrOrg(e.target.value)}
                  placeholder="e.g., Studio Forma Architects"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {category === 'inspector' && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Assigned Zone / LGA</label>
              <input
                type="text"
                value={locationOrZone}
                onChange={(e) => setLocationOrZone(e.target.value)}
                placeholder="e.g., Zone A (Ikeja / Central Business District)"
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {(category === 'developer' || category === 'consultant') && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Headquarters</label>
                <input
                  type="text"
                  value={locationOrZone}
                  onChange={(e) => setLocationOrZone(e.target.value)}
                  placeholder="e.g., Lagos, Nigeria"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Contact Officer</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g., David Alabi"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

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
              <span>{isSubmitting ? 'Registering...' : 'Save & Register'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
