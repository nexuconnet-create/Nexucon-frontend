"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Bell,
  User,
  Building2,
  Globe,
  Sliders,
  CheckCircle2,
  Save,
  HelpCircle,
  Smartphone,
  Mail,
  Lock,
  ExternalLink,
  ChevronRight,
  Database,
  FileBadge
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function StakeholderSettingsPage() {
  const { user } = useAuth();

  const [settings, setSettings] = useState({
    defaultJurisdiction: "Lagos State Physical Planning Permit Authority (LASPPPA)",
    autoDownloadReports: true,
    emailWeeklyDigest: true,
    instantSmsEmergency: true,
    strictBimValidation: true,
    publicRosterVisibility: true,
    twoFactorEnforced: false,
    defaultCurrency: "NGN (₦)",
    timezone: "Africa/Lagos (WAT, UTC+1)",
  });

  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    setIsSaved(true);
    window.dispatchEvent(
      new CustomEvent("show-toast", {
        detail: { message: "Stakeholder operational settings saved successfully!", type: "success" },
      })
    );
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#022C4F] to-[#044377] p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md text-cyan-300">
              <Settings size={24} />
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-300">
              Operational Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Stakeholder Portal Settings
          </h1>
          <p className="text-sm text-white/80 max-w-2xl mt-1">
            Configure enterprise preferences, default regulatory jurisdictions, notification channels, and credential integrations.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-[#022C4F] font-bold text-sm shadow-md hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            {isSaved ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Save size={16} />}
            <span>{isSaved ? "Saved" : "Save Changes"}</span>
          </button>
        </div>

        {/* Subtle background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      </div>

      {/* Quick Nav Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/stakeholder/profile"
          className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <h3 className="font-bold text-base text-[#022C4F] mb-1 group-hover:text-blue-600 transition-colors flex items-center justify-between">
              Corporate & Statutory Profile
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Maintain CAC corporate registration, COREN/ARCON professional licenses, seal certifications, and executive signatory records.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-blue-600 flex items-center gap-1">
            Update Profile &rarr;
          </span>
        </Link>

        <Link
          href="/stakeholder/settings/notifications"
          className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Bell size={24} />
            </div>
            <h3 className="font-bold text-base text-[#022C4F] mb-1 group-hover:text-amber-600 transition-colors flex items-center justify-between">
              Notification Preferences
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fine-tune automated SMS, email, and in-app alerts for Stage Inspections, Inspector dispatch ETA, NCR notices, and invoice levies.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-amber-600 flex items-center gap-1">
            Configure Alerts &rarr;
          </span>
        </Link>

        <Link
          href="/stakeholder/settings/security"
          className="p-6 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Shield size={24} />
            </div>
            <h3 className="font-bold text-base text-[#022C4F] mb-1 group-hover:text-emerald-600 transition-colors flex items-center justify-between">
              Security & Credentials
              <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Change account password, manage active browser/mobile sessions, view authorization tokens, and enforce multi-factor authentication.
            </p>
          </div>
          <span className="mt-4 text-xs font-bold text-emerald-600 flex items-center gap-1">
            Manage Security &rarr;
          </span>
        </Link>
      </div>

      {/* Main Settings Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sliders size={20} className="text-[#022C4F]" />
            <div>
              <h2 className="text-base font-bold text-[#022C4F]">Operational & Jurisdiction Preferences</h2>
              <p className="text-xs text-slate-500">Configure regulatory defaults for building permits and stage filings.</p>
            </div>
          </div>
          <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
            Enterprise Tier
          </span>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Default Regulatory Body */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-slate-100">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                Primary Regulatory Authority
              </label>
              <p className="text-xs text-slate-500">
                The lead planning & inspection body receiving your digital submissions.
              </p>
            </div>
            <div className="md:col-span-2">
              <select
                value={settings.defaultJurisdiction}
                onChange={(e) => setSettings({ ...settings, defaultJurisdiction: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent bg-slate-50/50"
              >
                <option value="Lagos State Physical Planning Permit Authority (LASPPPA)">
                  Lagos State Physical Planning Permit Authority (LASPPPA)
                </option>
                <option value="Lagos State Building Control Agency (LASBCA)">
                  Lagos State Building Control Agency (LASBCA)
                </option>
                <option value="Lagos State Materials Testing Laboratory (LSMTL)">
                  Lagos State Materials Testing Laboratory (LSMTL)
                </option>
                <option value="Federal Capital Development Authority (FCDA - Abuja)">
                  Federal Capital Development Authority (FCDA - Abuja)
                </option>
                <option value="Ogun State Urban and Regional Planning Board">
                  Ogun State Urban and Regional Planning Board
                </option>
              </select>
            </div>
          </div>

          {/* Regional Currency & Timezone */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-slate-100">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                Localization & Currency
              </label>
              <p className="text-xs text-slate-500">
                Applied to bills of quantities, regulatory tariffs, and Gantt milestones.
              </p>
            </div>
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Default Currency</label>
                <select
                  value={settings.defaultCurrency}
                  onChange={(e) => setSettings({ ...settings, defaultCurrency: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022C4F] bg-slate-50/50"
                >
                  <option value="NGN (₦)">NGN (₦) - Nigerian Naira</option>
                  <option value="USD ($)">USD ($) - US Dollar</option>
                  <option value="GBP (£)">GBP (£) - British Pound</option>
                  <option value="EUR (€)">EUR (€) - Euro</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Operational Timezone</label>
                <select
                  value={settings.timezone}
                  onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022C4F] bg-slate-50/50"
                >
                  <option value="Africa/Lagos (WAT, UTC+1)">Africa/Lagos (WAT, UTC+1)</option>
                  <option value="Europe/London (GMT/BST)">Europe/London (GMT/BST)</option>
                  <option value="America/New_York (EST/EDT)">America/New_York (EST/EDT)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feature Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start pb-6 border-b border-slate-100">
            <div>
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 block mb-1">
                Operational Safeguards
              </label>
              <p className="text-xs text-slate-500">
                Automated protocols for statutory submissions and BIM models.
              </p>
            </div>
            <div className="md:col-span-2 space-y-4">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Auto-Download Signed Certificates</div>
                  <div className="text-[11px] text-slate-500">Automatically download cryptographic PDF seals upon inspection sign-off.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoDownloadReports}
                  onChange={(e) => setSettings({ ...settings, autoDownloadReports: e.target.checked })}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Strict BIM Structural Check</div>
                  <div className="text-[11px] text-slate-500">Prevent stage filing unless IFC/Revit models pass automated clash tests.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.strictBimValidation}
                  onChange={(e) => setSettings({ ...settings, strictBimValidation: e.target.checked })}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div>
                  <div className="text-xs font-bold text-slate-800">Public Roster Visibility</div>
                  <div className="text-[11px] text-slate-500">Allow certified consultants and contractors to find your company in the registry.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.publicRosterVisibility}
                  onChange={(e) => setSettings({ ...settings, publicRosterVisibility: e.target.checked })}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer save */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <Shield size={14} className="text-blue-600" />
            Changes take effect immediately across all project workspaces.
          </div>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033b68] transition-colors cursor-pointer shadow-sm"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
}
