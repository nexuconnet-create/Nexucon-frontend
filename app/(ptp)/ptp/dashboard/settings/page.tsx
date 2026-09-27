"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Settings,
  User,
  Bell,
  Globe,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Save,
  Lock,
  Phone,
  Mail,
  QrCode,
  Award,
  Layers,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  LogOut,
  RefreshCw,
  KeyRound
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LanguageCode } from "@/components/transparency/LanguageContext";
import MetricCard from "@/components/dashboard/MetricCard";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

const LAGOS_LGAS = [
  "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
  "Ikeja (GRA, Alausa, Allen)",
  "Lagos Island (Marina, CMS, Broad St)",
  "Ibeju-Lekki (Dangote Refinery Corridor, Eleko)",
  "Surulere (Bode Thomas, Stadium)",
  "Lagos Mainland (Yaba, Ebute Metta)",
  "Kosofe (Magodo, Ogudu, Ojota)",
  "Alimosho (Egbeda, Ipaja)",
  "Oshodi-Isolo",
  "Somolu",
  "Apapa",
  "Amuwo-Odofin (Festac)",
  "Badagry",
  "Epe",
  "Ikorodu",
  "Agege",
  "Ifako-Ijaiye",
  "Mushin",
  "Ojo",
  "Ajeromi-Ifelodun",
];

const CITIZEN_ROLES = [
  "Neighborhood Resident / Homeowner",
  "Property Investor / Buyer",
  "Community Association (CDA) Executive",
  "Civic Watchdog / Journalist",
  "Licensed Built-Environment Professional",
];

export default function PtpSettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage } = useLanguage();

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [monitorId, setMonitorId] = useState("PTP-2026-8841");

  const [formData, setFormData] = useState({
    fullName: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : "Citizen Monitor",
    email: user?.email || "citizen@nexucon.net",
    phone: "+234 802 345 6789",
    citizenRole: "Neighborhood Resident / Homeowner",
    primaryLga: "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
    neighborhood: "Lekki Phase 1 / Admiralty Way",
    alertRadius: "5km",
    notifyStopWork: true,
    notifyNewPermits: true,
    notifyStageClearance: true,
    notifyTipOffs: true,
    channelEmail: true,
    channelSms: false,
    channelInApp: true,
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleanEmail = user?.email?.toLowerCase();
      if (cleanEmail) {
        const savedSettings = localStorage.getItem(`ptp_settings_${cleanEmail}`);
        if (savedSettings) {
          try {
            setFormData((prev) => ({ ...prev, ...JSON.parse(savedSettings) }));
          } catch {
            // Ignored
          }
        }

        const savedPrefs = localStorage.getItem(`ptp_preferences_${cleanEmail}`);
        if (savedPrefs) {
          try {
            const parsed = JSON.parse(savedPrefs);
            if (parsed.monitorId) setMonitorId(parsed.monitorId);
          } catch {
            // Ignored
          }
        }
      }
    }
  }, [user]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined" && user?.email) {
      localStorage.setItem(
        `ptp_settings_${user.email.toLowerCase()}`,
        JSON.stringify(formData)
      );
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/ptp/login');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government Command Center */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Settings size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Civic Monitor Profile &amp; Alert Settings
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Manage your verified civic identity, monitored Local Government Area geofence, statutory bulletin alert feeds, and language preferences.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* KPI METRIC CARDS matching Nexucon standard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <MetricCard
          title="Civic Monitor Status"
          value="Verified"
        />
        <MetricCard
          title="Monitored Jurisdiction"
          value="1 LGA"
        />
        <MetricCard
          title="Active Alert Feeds"
          value="4 Topics"
        />
        <MetricCard
          title="Privacy Shield"
          value="Zero-Trust"
        />
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Your civic monitor profile, geofence, and alert preferences have been updated successfully.</span>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
            Synchronized
          </span>
        </div>
      )}

      {/* MAIN 2-COLUMN SETTINGS LAYOUT */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* LEFT COLUMN: SETTINGS FORMS */}
        <div className="lg:col-span-8 space-y-6">
          {/* SECTION 1: CIVIC PROFILE DETAILS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            {/* Card Header with User Avatar Lockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-xl font-extrabold shadow-inner uppercase shrink-0">
                  {user?.first_name?.[0] || 'C'}{user?.last_name?.[0] || 'M'}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#022C4F]">
                    {formData.fullName || "Citizen Monitor"}
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-[#022C4F] text-[10px] font-bold">
                      Accredited Monitor
                    </span>
                    <span className="text-xs text-gray-500 font-medium">
                      &bull; ID: {monitorId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold block">
                  Access Level
                </span>
                <span className="text-xs font-bold text-emerald-600 flex items-center sm:justify-end gap-1 mt-0.5">
                  <ShieldCheck size={14} />
                  Public Transparency RBAC
                </span>
              </div>
            </div>

            {/* Profile Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Full Legal Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData((p) => ({ ...p, fullName: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Official Account Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 text-xs sm:text-sm bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock size={14} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                    placeholder="+234 800 000 0000"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] font-medium"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Civic Persona
                </label>
                <select
                  value={formData.citizenRole}
                  onChange={(e) => setFormData((p) => ({ ...p, citizenRole: e.target.value }))}
                  className="w-full py-3 px-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] bg-white font-medium"
                >
                  {CITIZEN_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: MONITORED JURISDICTION & GEOFENCE */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#022C4F] flex items-center justify-center shrink-0">
                <MapPin size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">
                  Monitored Jurisdiction &amp; Geofence
                </h2>
                <p className="text-xs text-gray-500">
                  Defines your default GIS map viewport and sets local safety notice feeds.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Primary Local Government Area (LGA)
                </label>
                <select
                  value={formData.primaryLga}
                  onChange={(e) => setFormData((p) => ({ ...p, primaryLga: e.target.value }))}
                  className="w-full py-3 px-3.5 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] bg-white font-medium"
                >
                  {LAGOS_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Neighborhood / Street / Estate Focus
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData((p) => ({ ...p, neighborhood: e.target.value }))}
                    placeholder="e.g. Lekki Phase 1 / Admiralty Way"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] font-medium"
                  />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-[#022C4F] block">Alert Proximity Radius</span>
                <span className="text-[11px] text-gray-500">How far around your primary street you receive immediate safety notices</span>
              </div>
              <div className="flex items-center gap-2">
                {["2km", "5km", "10km", "All LGA"].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, alertRadius: r }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      formData.alertRadius === r
                        ? "bg-[#022C4F] text-white shadow-xs"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: STATUTORY ALERT FEEDS */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">
                  Statutory Bulletin Subscriptions
                </h2>
                <p className="text-xs text-gray-500">
                  Select which regulatory events generate instant push and dashboard alerts.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-red-50 text-red-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#022C4F]">Stop-Work Orders &amp; Sealing Bulletins</div>
                    <div className="text-[11px] text-gray-500">Immediate alerts when buildings are sanctioned in your monitored LGA</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyStopWork}
                  onChange={(e) => setFormData((p) => ({ ...p, notifyStopWork: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#022C4F] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#022C4F]">New Gazetted Planning Approvals</div>
                    <div className="text-[11px] text-gray-500">Alerts when new permits are officially approved by LASPPPA in your zone</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyNewPermits}
                  onChange={(e) => setFormData((p) => ({ ...p, notifyNewPermits: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:bg-slate-50/70 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 size={16} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#022C4F]">Structural Stage Clearances</div>
                    <div className="text-[11px] text-gray-500">Milestone updates on certified foundation tests and roofing approvals</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.notifyStageClearance}
                  onChange={(e) => setFormData((p) => ({ ...p, notifyStageClearance: e.target.checked }))}
                  className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* SECTION 4: INTERFACE LANGUAGE & LOCALIZATION */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 rounded-xl bg-cyan-50 text-[#022C4F] flex items-center justify-center shrink-0">
                <Globe size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#022C4F]">
                  Portal Interface Language
                </h2>
                <p className="text-xs text-gray-500">
                  Choose your preferred civic language for all statutory registry labels.
                </p>
              </div>
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
                  className={`p-3.5 rounded-2xl border-2 text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    language === lang.code
                      ? "border-[#022C4F] bg-blue-50/70 text-[#022C4F] shadow-xs"
                      : "border-gray-200 text-gray-700 hover:border-gray-300 bg-white"
                  }`}
                >
                  <span>{lang.label}</span>
                  <span className="text-base">{lang.flag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-gray-400">
              Changes are saved locally to your browser and synced with your civic account.
            </span>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-sm shadow-md transition-all active:scale-[0.99] cursor-pointer"
            >
              <Save size={16} />
              <span>Save Civic Preferences</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: CIVIC CREDENTIAL PASS & SECURITY SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          {/* DIGITAL CIVIC MONITOR PASS CARD */}
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#022C4F] to-[#044B84] text-white shadow-xl relative overflow-hidden border border-cyan-500/30">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-cyan-400" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-200">
                  Lagos State PTP
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                Active Observer
              </span>
            </div>

            <div className="my-6 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase text-cyan-200/80 font-bold tracking-wider">
                  Civic Monitor
                </div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5 truncate max-w-[170px]">
                  {formData.fullName || "Citizen Monitor"}
                </div>
                <div className="text-xs text-cyan-200/90 mt-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-cyan-400" />
                  <span className="truncate max-w-[160px]">{formData.primaryLga.split(' ')[0]} Focus</span>
                </div>
              </div>

              <div className="bg-white p-2 rounded-xl text-slate-900 text-center shrink-0">
                <QrCode size={44} className="text-[#022C4F]" />
                <span className="text-[8px] font-mono font-bold block mt-1">VERIFIED</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-200/80 font-mono">
              <span>ID: <strong className="text-white font-mono">{monitorId}</strong></span>
              <span>Valid: <strong className="text-white">2026/2027</strong></span>
            </div>
          </div>

          {/* STATUTORY PROTECTION CARD */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#022C4F]" />
              <span>Whistleblower &amp; Data Shield</span>
            </h3>

            <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Protected under Lagos State Urban and Regional Planning Whistleblower immunity provisions.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Multi-tenant zero-trust database encryption for all monitored watchlist sites and tips.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                <span>Geofence parameters are stored in your secure client enclave and never sold or shared.</span>
              </div>
            </div>
          </div>

          {/* ACCOUNT & SESSION SECURITY */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider flex items-center gap-2">
              <Lock size={16} className="text-[#022C4F]" />
              <span>Account Security &amp; Session</span>
            </h3>

            <div className="space-y-2.5 pt-1">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Session State:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Active Civic Session
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut size={14} />
                <span>Sign Out of Civic Account</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

