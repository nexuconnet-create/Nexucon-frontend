"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  User,
  Shield,
  Sun,
  Moon,
  Laptop,
  Check,
  Lock,
  Building2,
  MapPin,
  RefreshCw,
  Database,
  Cloud,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import {
  getInspectorDashboard,
  getInspectorAccreditation,
  type AccreditationResult,
  type EvidenceSyncStatus,
} from "@/services/inspector";
import { countOr, dateTimeOr, orDash } from "@/lib/display";

export default function InspectorSettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Real identity and real sync figures. This page used to print
  // "Engr. A. Adeleke", "Badge #LAG-INS-042", "Lagos State Building Control
  // Agency (LASBCA)", "Lekki-Epe Directorate • Zone 4", "Lead Structural
  // Inspector" and "142 MB Cached • Normal" to every inspector who opened it,
  // whoever they were.
  const [identity, setIdentity] = useState<{
    agency: string | null;
    district: string | null;
    role: string | null;
  } | null>(null);
  const [accreditation, setAccreditation] = useState<AccreditationResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<EvidenceSyncStatus | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("nexucon_theme") as any) || "light";
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getInspectorDashboard(), getInspectorAccreditation()])
      .then(([dashboard, accred]) => {
        if (cancelled) return;
        setIdentity({
          agency: dashboard.profile?.agency ?? null,
          district: dashboard.profile?.district ?? null,
          role: dashboard.profile?.role ?? null,
        });
        setSyncStatus(dashboard.evidence_sync ?? null);
        setAccreditation(accred);
      })
      .catch((err) => {
        if (cancelled) return;
        // Neither value is substituted. An unreadable accreditation renders as
        // "could not be read", which is not the same statement as "none
        // recorded" — and the difference matters to the person holding a badge.
        setIdentityError(
          err?.response?.data?.detail ||
            err?.message ||
            "Could not read your accreditation from the server."
        );
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const accredited = accreditation?.accredited ? accreditation.accreditation : null;
  const fullName =
    user?.first_name || user?.last_name
      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
      : accredited?.full_name || null;

  const handleSelectTheme = (mode: "light" | "dark" | "system") => {
    setTheme(mode);
    localStorage.setItem("nexucon_theme", mode);
    if (mode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSaved(false);

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.post("/auth/change-password/", {
        old_password: currentPassword,
        new_password: newPassword,
      });

      if (res.data?.success) {
        setPasswordSaved(true);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => setPasswordSaved(false), 5000);
      } else {
        setPasswordError(res.data?.message || "Failed to update password.");
      }
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || err?.response?.data?.error || err?.message || "Failed to update password. Please verify your current password.";
      setPasswordError(errMsg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-4xl min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <Settings size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Inspector Station & Preferences
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            Manage your government credentials, theme settings, territorial scope, and evidence sync parameters.
          </p>
        </div>
      </div>

      {identityError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <div className="font-bold mb-0.5">Accreditation could not be read</div>
          <p>{identityError}</p>
        </div>
      )}

      {/* Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#022C4F] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {(fullName || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">
              {orDash(fullName, "Name not recorded")}
            </h2>
            {/* The badge line states an accreditation only when one is
                recorded. `government.Inspector` is empty by design until a
                Director issues a badge, so "no accreditation recorded" is the
                normal state for a new account — and the honest one to show. */}
            {accredited ? (
              <div className="text-xs font-semibold text-blue-700">
                Badge #{accredited.badge_number} &bull;{" "}
                {orDash(accredited.effective_status || accredited.accreditation_status, "Status not recorded")}
                {accredited.is_suspended ? " (suspended)" : ""}
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-700">
                {identityError
                  ? "Accreditation not read"
                  : "No inspector accreditation recorded"}
              </div>
            )}
          </div>
        </div>

        {accredited?.suspension_reason && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            <span className="font-bold">Suspension reason: </span>
            {accredited.suspension_reason}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Official Email</span>
            <span className="text-slate-900 font-semibold">
              {orDash(user?.email, "Not available")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Supervising Agency</span>
            <span className="text-slate-900 font-semibold">
              {orDash(identity?.agency, "Not recorded")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Jurisdiction / Zonal Office</span>
            <span className="text-slate-900 font-semibold">
              {orDash(identity?.district, "Not recorded")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">RBAC Role Authority</span>
            <span className="text-emerald-700 font-semibold">
              {orDash(identity?.role, "Not recorded")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Accreditation Directorate</span>
            <span className="text-slate-900 font-semibold">
              {orDash(accredited?.directorate, "Not recorded")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Accreditation Expiry</span>
            <span className="text-slate-900 font-semibold">
              {accredited
                ? dateTimeOr(accredited.accreditation_expiry, "No expiry recorded")
                : "No accreditation recorded"}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance & Theme Mode */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
          <Sun size={16} className="text-amber-500" />
          <span>Appearance & Visual Theme</span>
        </h3>
        <p className="text-xs text-slate-500">
          Switch between standard light mode (recommended for government alignment) and dark mode.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {[
            { id: "light", label: "Light Mode (Standard)", icon: Sun },
            { id: "dark", label: "Dark Mode", icon: Moon },
            { id: "system", label: "System Default", icon: Laptop },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => handleSelectTheme(mode.id as any)}
              className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all cursor-pointer shadow-sm ${
                theme === mode.id
                  ? "bg-[#022C4F]/10 border-[#022C4F] text-[#022C4F]"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <mode.icon size={16} className={theme === mode.id ? "text-[#022C4F]" : "text-slate-400"} />
                <span>{mode.label}</span>
              </div>
              {theme === mode.id && <Check size={14} className="text-[#022C4F]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Password Security */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
          <Lock size={16} className="text-[#022C4F]" />
          <span>Security & Authentication Credentials</span>
        </h3>

        {passwordSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            Password updated successfully.
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
            {passwordError}
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter your current password"
              required
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                required
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword || !currentPassword || newPassword.length < 8 || newPassword !== confirmPassword}
            className="px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-sm flex items-center gap-2"
          >
            {isUpdatingPassword ? "Updating..." : "Update Password"}
          </button>
        </form>
      </div>

      {/* Evidence registry figures, read from the dashboard payload.
          "142 MB Cached • Normal" was a literal, and "Real-time WebSocket +
          Background Polling" described a transport this app does not use —
          there is no service worker, no offline queue and no WebSocket client
          in the inspector bundle. Both are replaced with what the server
          actually reports, including `null` where nothing has measured it. */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
          <Cloud size={16} className="text-cyan-600" />
          <span>Evidence Registry Status</span>
        </h3>
        <p className="text-xs text-slate-500">
          What the server currently holds for the projects in your scope.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Evidence Records</span>
            <span className="text-slate-900 font-semibold">
              {syncStatus ? syncStatus.uploaded : "Not read"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Last Synced</span>
            <span className="text-slate-900 font-semibold">
              {syncStatus
                ? dateTimeOr(syncStatus.last_synced_at, "Never")
                : "Not read"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Pending Upload</span>
            <span className="text-slate-900 font-semibold">
              {syncStatus ? countOr(syncStatus.pending) : "Not read"}
            </span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Failed Syncs</span>
            <span className="text-slate-900 font-semibold">
              {syncStatus ? countOr(syncStatus.failed) : "Not read"}
            </span>
          </div>
        </div>

        {syncStatus && syncStatus.pending === null && (
          <p className="text-[11px] text-slate-500 leading-relaxed">
            &ldquo;Pending upload&rdquo; and &ldquo;failed syncs&rdquo; read as
            not measured because the offline sync queue is not written to by
            this app yet. They are not zero.
          </p>
        )}
      </div>
    </div>
  );
}
