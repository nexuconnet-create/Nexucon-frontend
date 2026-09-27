"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Bell,
  Globe,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Save
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LanguageCode } from "@/components/transparency/LanguageContext";

export default function PtpSettingsPage() {
  const { user } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Citizen Monitor",
    email: user?.email || "citizen@nexucon.net",
    primaryLga: "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
    notifyStopWork: true,
    notifyNewPermits: true,
    notifyStageClearence: true,
    notifyTipOffs: true,
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && user?.email) {
      localStorage.setItem(`ptp_settings_${user.email.toLowerCase()}`, JSON.stringify(formData));
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-900 text-xs font-bold uppercase tracking-wider mb-2">
          <Settings size={14} className="text-slate-700" />
          <span>Workspace Preferences</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
          Civic Monitor Profile &amp; Alert Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Configure your monitored jurisdiction, statutory notification frequencies, and language preferences.
        </p>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Your civic preferences have been saved successfully.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <User size={20} className="text-[#022C4F]" />
            <h2 className="text-base font-bold text-slate-900">Civic Profile Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                className="w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full py-3 px-3.5 border border-slate-200 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* Monitored Jurisdiction Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <MapPin size={20} className="text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Monitored Jurisdiction (LGA)</h2>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary Local Government Area (LGA)
            </label>
            <select
              value={formData.primaryLga}
              onChange={(e) => setFormData((p) => ({ ...p, primaryLga: e.target.value }))}
              className="w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] bg-white"
            >
              {[
                "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
                "Ikeja (GRA, Alausa, Allen)",
                "Lagos Island (Marina, CMS, Isale Eko)",
                "Ibeju-Lekki (Free Trade Zone, Eleko)",
                "Surulere",
                "Alimosho",
                "Kosofe",
                "Lagos Mainland",
              ].map((lga) => (
                <option key={lga} value={lga}>
                  {lga}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Bell size={20} className="text-amber-600" />
            <h2 className="text-base font-bold text-slate-900">Statutory Alert Subscriptions</h2>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800">Stop-Work &amp; Sealing Orders</div>
                <div className="text-[11px] text-slate-500">Urgent notifications when sanctions are issued in your LGA</div>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyStopWork}
                onChange={(e) => setFormData((p) => ({ ...p, notifyStopWork: e.target.checked }))}
                className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800">New Planning Approvals</div>
                <div className="text-[11px] text-slate-500">Alerts when new permits are officially gazetted</div>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyNewPermits}
                onChange={(e) => setFormData((p) => ({ ...p, notifyNewPermits: e.target.checked }))}
                className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
              <div>
                <div className="text-xs font-bold text-slate-800">Stage Completion Milestones</div>
                <div className="text-[11px] text-slate-500">Updates on structural audits and concrete test passes</div>
              </div>
              <input
                type="checkbox"
                checked={formData.notifyStageClearence}
                onChange={(e) => setFormData((p) => ({ ...p, notifyStageClearence: e.target.checked }))}
                className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
              />
            </label>
          </div>
        </div>

        {/* Language Preference */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <Globe size={20} className="text-cyan-600" />
            <h2 className="text-base font-bold text-slate-900">Portal Interface Language</h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { code: "en", label: "English", flag: "🇬🇧" },
              { code: "yo", label: "Yorùbá", flag: "🇳🇬" },
              { code: "ig", label: "Igbo", flag: "🇳🇬" },
              { code: "ha", label: "Hausa", flag: "🇳🇬" },
            ].map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setLanguage(lang.code as LanguageCode)}
                className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                  language === lang.code
                    ? "border-[#022C4F] bg-blue-50/70 text-[#022C4F]"
                    : "border-slate-200 text-slate-700 hover:border-slate-300"
                }`}
              >
                <span>{lang.label}</span>
                <span>{lang.flag}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
          >
            <Save size={16} />
            <span>Save Civic Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
}
