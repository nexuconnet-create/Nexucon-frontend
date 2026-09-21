"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  User, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  ShieldCheck, 
  Save, 
  Briefcase, 
  FileBadge, 
  CheckCircle2, 
  RefreshCw,
  Lock,
  Layers
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StakeholderProfilePage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    role_name: "Client / Project Owner",
    stakeholder_type: "client",
    company_name: "Apex Atlantic Infrastructure Ltd",
    registration_number: "RC-1928471",
    license_authority: "COREN",
    license_number: "R.19482/ENG",
    country: "Nigeria",
    state_region: "Lagos State",
    office_address: "Plot 12, Waterfront Boulevard, Victoria Island, Lagos",
    status: "Verified & Active",
  });

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const cleanEmail = user.email?.toLowerCase();
      const localData = typeof window !== "undefined" && cleanEmail 
        ? localStorage.getItem(`nexucon_stakeholder_profile_${cleanEmail}`)
        : null;

      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          setProfile(prev => ({ ...prev, ...parsed }));
          return;
        } catch (e) {
          console.error("Error parsing local profile data", e);
        }
      }

      setProfile(prev => ({
        ...prev,
        name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || prev.name,
        email: user.email || prev.email,
        phone: user.phone_number || prev.phone,
        role_name: user.role_name || prev.role_name,
        company_name: user.stakeholder_profile?.company_name || prev.company_name,
      }));
    }
  }, [user]);

  const handleChange = (field: string, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    setTimeout(() => {
      if (user?.email && typeof window !== "undefined") {
        localStorage.setItem(`nexucon_stakeholder_profile_${user.email.toLowerCase()}`, JSON.stringify(profile));
      }
      setIsSaving(false);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Stakeholder profile updated successfully!", type: "success" },
        })
      );
    }, 600);
  };

  return (
    <div className="w-full min-h-screen pb-16">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-blue-600" />
            Statutory Regulatory Entity
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] flex items-center gap-3">
            <User className="text-blue-600" />
            Stakeholder Profile &amp; Enterprise Identity
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Manage your legal entity records, professional credentials, regulatory contacts, and statutory standing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#022C4F] text-white rounded-xl hover:bg-[#033c6c] transition-all shadow-md text-sm font-bold disabled:opacity-70 cursor-pointer active:scale-[0.99]"
          >
            <Save size={16} />
            {isSaving ? "Saving Changes..." : "Save Profile"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Section 1: Entity & Legal Credentials */}
          <div className="p-6 sm:p-8 border-b border-gray-100">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 size={18} className="text-blue-600" /> Organization Identity &amp; Status
            </h2>

            <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8">
              <div className="w-28 h-28 rounded-3xl bg-blue-50/70 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-600 shrink-0">
                <Building2 size={32} className="mb-1 text-blue-600" />
                <span className="text-[10px] font-bold text-center px-1">Corporate Seal</span>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Registered Company / Entity Name
                    </label>
                    <input
                      type="text"
                      value={profile.company_name}
                      onChange={(e) => handleChange("company_name", e.target.value)}
                      placeholder="Apex Atlantic Infrastructure Ltd"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 text-xs shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      CAC / Business Registration No.
                    </label>
                    <input
                      type="text"
                      value={profile.registration_number}
                      onChange={(e) => handleChange("registration_number", e.target.value)}
                      placeholder="RC-1928471"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-gray-900 text-xs shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Stakeholder Role Tier
                    </label>
                    <select
                      value={profile.stakeholder_type}
                      onChange={(e) => handleChange("stakeholder_type", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-xs bg-white shadow-sm"
                    >
                      <option value="client">Client / Project Owner</option>
                      <option value="developer">Property Developer</option>
                      <option value="contractor">General / Sub-Contractor</option>
                      <option value="professional">Licensed Professional (Engineer/Architect)</option>
                      <option value="consultant">Advisory Consultant</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Professional Authority Body
                    </label>
                    <input
                      type="text"
                      value={profile.license_authority}
                      onChange={(e) => handleChange("license_authority", e.target.value)}
                      placeholder="COREN, ARCON, CORBON, or NIA"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-xs shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                      Statutory License Number
                    </label>
                    <input
                      type="text"
                      value={profile.license_number}
                      onChange={(e) => handleChange("license_number", e.target.value)}
                      placeholder="R.19482/ENG"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-gray-800 text-xs shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Primary Representative Details */}
          <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Authorized Representative Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Representative Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Engr. Babatunde Williams"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs font-bold text-gray-800 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Mail size={14} /> Official Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 font-mono text-xs text-gray-600 shadow-sm cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Phone size={14} /> Contact Phone Number
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="+234 803 123 4567"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs font-medium text-gray-800 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                  Jurisdiction &amp; State
                </label>
                <input
                  type="text"
                  value={`${profile.state_region}, ${profile.country}`}
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 shadow-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <MapPin size={14} /> Official Registered Office Address
                </label>
                <textarea
                  rows={2}
                  value={profile.office_address}
                  onChange={(e) => handleChange("office_address", e.target.value)}
                  placeholder="Plot 12, Waterfront Boulevard, Victoria Island, Lagos"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs shadow-sm resize-none text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Statutory Standing & Compliance Badges */}
          <div className="p-6 sm:p-8">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <FileBadge size={18} className="text-blue-600" /> Regulatory Clearance &amp; Standing
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-emerald-950">Statutory Verified</div>
                  <div className="text-[11px] text-emerald-800 mt-0.5">Government multi-agency cleared</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-start gap-3">
                <ShieldCheck size={20} className="text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-blue-950">Zero-Trust RBAC</div>
                  <div className="text-[11px] text-blue-800 mt-0.5">Audited site-gate permissions</div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Layers size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-amber-950">Hold-Point Signoff</div>
                  <div className="text-[11px] text-amber-800 mt-0.5">Authorized for statutory stage signoffs</div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
