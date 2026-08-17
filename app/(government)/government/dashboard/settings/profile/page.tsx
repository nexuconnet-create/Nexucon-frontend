"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, Save, Upload, MapPin, Mail, Phone, Building, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import { CustomSelect } from "@/components/CustomSelect";

let ALL_TIMEZONES: { value: string; label: string }[] = [];
try {
  // @ts-ignore
  if (typeof Intl !== 'undefined' && typeof Intl.supportedValuesOf === 'function') {
    // @ts-ignore
    ALL_TIMEZONES = Intl.supportedValuesOf('timeZone').map((tz: string) => ({
      value: tz,
      label: tz.replace(/_/g, ' ')
    }));
  } else {
    ALL_TIMEZONES = [
      "UTC", "Africa/Abidjan", "Africa/Accra", "Africa/Addis_Ababa", "Africa/Algiers", "Africa/Cairo", "Africa/Casablanca", "Africa/Johannesburg", "Africa/Lagos", "Africa/Nairobi",
      "America/Chicago", "America/Denver", "America/Los_Angeles", "America/Mexico_City", "America/New_York", "America/Sao_Paulo", "America/Toronto", "America/Vancouver",
      "Asia/Bangkok", "Asia/Dubai", "Asia/Hong_Kong", "Asia/Kolkata", "Asia/Riyadh", "Asia/Seoul", "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo",
      "Australia/Brisbane", "Australia/Perth", "Australia/Sydney",
      "Europe/Amsterdam", "Europe/Berlin", "Europe/London", "Europe/Madrid", "Europe/Moscow", "Europe/Paris", "Europe/Rome",
      "Pacific/Auckland", "Pacific/Honolulu"
    ].map(tz => ({ value: tz, label: tz.replace(/_/g, ' ') }));
  }
} catch (e) {
  ALL_TIMEZONES = [
    { value: "UTC", label: "UTC" }
  ];
}

const MEASUREMENT_SYSTEMS = [
  { value: "Imperial (ft, lbs)", label: "Imperial (ft, lbs)" },
  { value: "Metric (m, kg)", label: "Metric (m, kg)" }
];

export default function AgencyProfile() {
  const [profile, setProfile] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [passwordData, setPasswordData] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const fetchProfile = async () => {
    try {
      const response: any = await api.get('/government/agency-profile/');
      
      // Depending on interceptor, response might be unwrapped or raw
      const data = response.success !== undefined ? response : { success: true, data: response };
      
      if (data.success || response.department_name !== undefined) {
        setProfile(data.data || response);
      } else {
        setError(data.message || "Failed to load profile.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An unexpected error occurred while loading profile.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (field: string, value: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    try {
      const response: any = await api.put('/government/agency-profile/', profile);
      
      const data = response.success !== undefined ? response : { success: true, data: response };
      
      if (data.success || response.department_name !== undefined) {
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Profile updated successfully!', type: 'success' } }));
      } else {
        setError(data.message || "Failed to save profile.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "An unexpected error occurred while saving profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (!passwordData.old_password || !passwordData.new_password) {
      setPasswordError("Please fill in all password fields.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response: any = await api.post('/auth/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });

      const data = response.success !== undefined ? response : { success: true, data: response };

      if (data.success || response.message === 'Password updated successfully') {
        setPasswordSuccess("Password updated successfully!");
        setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
        window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Password updated successfully!', type: 'success' } }));
      } else {
        setPasswordError(data.message || "Failed to change password.");
      }
    } catch (err: any) {
      console.error(err);
      setPasswordError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Settings className="text-blue-500" />
            Agency Profile
          </h1>
          <p className="text-gray-500 mt-1">Manage global configuration, contact details, and branding for the government entity.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold disabled:opacity-70"
          >
            {isSaving ? (
               <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : <Save size={16} />}
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      <div className="max-w-4xl">
        {error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100">{error}</div>}
        
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Logo & Branding */}
          <div className="p-8 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Agency Branding</h2>
            
            <div className="flex items-start gap-8">
              <div className="w-32 h-32 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 hover:border-gray-300 transition-colors cursor-pointer">
                <Building size={32} className="mb-2 text-gray-300" />
                <span className="text-xs font-bold">Upload Logo</span>
              </div>
              
              <div className="flex-1 space-y-4 max-w-md">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Agency Full Name</label>
                  <input 
                    type="text" 
                    value={profile.department_name || profile.name || ""} 
                    onChange={(e) => handleChange('department_name', e.target.value)}
                    placeholder="Department of Urban Development" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Short Name / Acronym</label>
                  <input 
                    type="text" 
                    value={profile.short_name || ""} 
                    onChange={(e) => handleChange('short_name', e.target.value)}
                    placeholder="DUD-City" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Public Contact Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Mail size={14} /> Official Email</label>
                <input 
                  type="email" 
                  value={profile.official_email || ""} 
                  onChange={(e) => handleChange('official_email', e.target.value)}
                  placeholder="contact@dud.city.gov" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Phone size={14} /> Main Phone</label>
                <input 
                  type="tel" 
                  value={profile.main_phone || ""} 
                  onChange={(e) => handleChange('main_phone', e.target.value)}
                  placeholder="+1 (555) 019-2000" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><MapPin size={14} /> Physical Address</label>
                <textarea 
                  rows={3}
                  value={profile.physical_address || ""} 
                  onChange={(e) => handleChange('physical_address', e.target.value)}
                  placeholder="100 City Hall Plaza\nSuite 400\nMetropolis, NY 10007" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white resize-none"
                />
              </div>
            </div>
          </div>

          {/* Regional Settings */}
          <div className="p-8">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Regional Settings</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Timezone</label>
                <CustomSelect
                  value={profile.timezone || ""}
                  onChange={(val) => handleChange('timezone', val)}
                  options={ALL_TIMEZONES}
                  placeholder="Select Timezone"
                  searchable={true}
                  variant="form"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Measurement System</label>
                <CustomSelect
                  value={profile.measurement_system || ""}
                  onChange={(val) => handleChange('measurement_system', val)}
                  options={MEASUREMENT_SYSTEMS}
                  placeholder="Select Measurement System"
                  variant="form"
                />
              </div>
            </div>
          </div>

          {/* Change Password */}
          <div className="p-8 border-t border-gray-100 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lock size={18} className="text-gray-500" /> Security
            </h2>
            <p className="text-sm text-gray-500 mb-6">Change your account password.</p>
            
            {passwordError && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{passwordError}</div>}
            {passwordSuccess && <div className="mb-4 p-3 bg-green-50 text-green-600 rounded-lg text-sm">{passwordSuccess}</div>}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.old_password} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, old_password: e.target.value }))}
                  placeholder="Enter current password" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password" 
                  value={passwordData.new_password} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, new_password: e.target.value }))}
                  placeholder="Enter new password" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirm_password} 
                  onChange={(e) => setPasswordData(prev => ({ ...prev, confirm_password: e.target.value }))}
                  placeholder="Confirm new password" 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-2">
                <button 
                  onClick={handlePasswordChange} 
                  disabled={isChangingPassword}
                  className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors shadow-sm text-sm font-bold disabled:opacity-70 flex items-center gap-2"
                >
                  {isChangingPassword ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : <Lock size={16} />}
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
