"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Upload, MapPin, Mail, Phone, Building, Globe, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react";
import { AgencyProfile, getAgencyProfile, updateAgencyProfile } from "@/services/settings";

export default function AgencyProfilePage() {
  const [profile, setProfile] = useState<AgencyProfile>({
    agency_name: "Lagos State Ministry of Physical Planning & Urban Development (MPP&UD)",
    agency_code: "LASG-MPPUD-01",
    description: "Central Statutory Enforcement, Development Control, and Building Clearance Authority.",
    government_level: "State",
    jurisdiction: "Lagos State, Federal Republic of Nigeria",
    official_email: "planning@lagosstate.gov.ng",
    phone: "+234 1 234 5678",
    website: "https://mppud.lagosstate.gov.ng",
    office_address: "Block 15, The Secretariat, Alausa, Ikeja, Lagos",
    country: "Nigeria",
    state: "Lagos State",
    lga: "Ikeja",
    timezone: "Africa/Lagos (GMT+1)",
    default_language: "English (NG)",
    status: "Active"
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProfile = async () => {
    setIsLoading(true);
    try {
      const data = await getAgencyProfile();
      if (data && typeof data === 'object') {
        setProfile(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      console.error("Failed to load agency profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: keyof AgencyProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await updateAgencyProfile(profile);
      setProfile(updated);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Agency profile updated successfully!', type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to update agency profile', type: 'error' } }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Settings className="text-blue-500" />
            Agency Profile & Identity
          </h1>
          <p className="text-gray-500 mt-1">Manage global identity, jurisdictional parameters, and official contact details for this regulatory authority.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchProfile}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold disabled:opacity-70 cursor-pointer"
          >
            <Save size={16} />
            {isSaving ? "Saving Changes..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Logo & Branding */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Building size={18} className="text-blue-600" /> Agency Identity & Legal Standing
            </h2>
            
            <div className="flex flex-col sm:flex-row items-start gap-8">
              <div className="w-32 h-32 rounded-3xl bg-blue-50/50 border-2 border-dashed border-blue-200 flex flex-col items-center justify-center text-blue-600 hover:bg-blue-100/50 transition-colors cursor-pointer shrink-0">
                <Building size={32} className="mb-2 text-blue-500" />
                <span className="text-[11px] font-bold">Official Seal</span>
              </div>
              
              <div className="flex-1 space-y-4 w-full">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Agency Legal Entity Name</label>
                    <input 
                      type="text" 
                      value={profile.agency_name} 
                      onChange={(e) => handleChange('agency_name', e.target.value)}
                      placeholder="Lagos State Ministry of Physical Planning & Urban Development" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-900 text-xs shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Agency Code</label>
                    <input 
                      type="text" 
                      value={profile.agency_code} 
                      onChange={(e) => handleChange('agency_code', e.target.value)}
                      placeholder="LASG-MPPUD-01" 
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-bold text-gray-900 text-xs shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Government Level</label>
                    <select
                      value={profile.government_level}
                      onChange={(e) => handleChange('government_level', e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-gray-800 text-xs bg-white shadow-sm"
                    >
                      <option value="State">State Government</option>
                      <option value="Federal">Federal Republic of Nigeria</option>
                      <option value="Municipal">Local Government Area (LGA)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Statutory Mandate & Description</label>
                  <textarea 
                    rows={2}
                    value={profile.description} 
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Central Statutory Enforcement, Development Control, and Building Clearance Authority." 
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 text-xs shadow-sm resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Mail size={18} className="text-blue-600" /> Public Communications & Registry
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Mail size={14} /> Official Registry Email</label>
                <input 
                  type="email" 
                  value={profile.official_email} 
                  onChange={(e) => handleChange('official_email', e.target.value)}
                  placeholder="planning@lagosstate.gov.ng" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-xs shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone size={14} /> Official Contact Line</label>
                <input 
                  type="tel" 
                  value={profile.phone} 
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="+234 1 234 5678" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><Globe size={14} /> Official Portal / Website</label>
                <input 
                  type="url" 
                  value={profile.website} 
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://mppud.lagosstate.gov.ng" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs font-mono shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">State & LGA Headquarters</label>
                <input 
                  type="text" 
                  value={`${profile.state} - ${profile.lga}`} 
                  readOnly
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100 text-xs font-bold text-gray-700 shadow-sm"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} /> Physical Secretariat Address</label>
                <textarea 
                  rows={2}
                  value={profile.office_address} 
                  onChange={(e) => handleChange('office_address', e.target.value)}
                  placeholder="Block 15, The Secretariat, Alausa, Ikeja, Lagos" 
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-xs shadow-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Regional & Localization */}
          <div className="p-8">
            <h2 className="text-base font-extrabold text-gray-900 mb-6 flex items-center gap-2">
              <Globe size={18} className="text-blue-600" /> Regional Localization & Timezone
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Operational Timezone</label>
                <input 
                  type="text" 
                  value={profile.timezone} 
                  onChange={(e) => handleChange('timezone', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-xs text-gray-800 bg-white shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">Default Statutory Language</label>
                <input 
                  type="text" 
                  value={profile.default_language} 
                  onChange={(e) => handleChange('default_language', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 bg-white shadow-sm"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
