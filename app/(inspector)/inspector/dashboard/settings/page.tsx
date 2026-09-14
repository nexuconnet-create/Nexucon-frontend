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

export default function InspectorSettingsPage() {
  const { user } = useAuth();
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    const savedTheme = (localStorage.getItem("nexucon_theme") as any) || "light";
    setTheme(savedTheme);
  }, []);

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

      {/* Profile Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#022C4F] text-white font-extrabold text-xl flex items-center justify-center shadow-md">
            {user?.first_name?.charAt(0) || "A"}
          </div>
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">
              {user ? `${user.first_name || ""} ${user.last_name || ""}`.trim() : "Engr. A. Adeleke"}
            </h2>
            <div className="text-xs font-semibold text-blue-700">Badge #LAG-INS-042 &bull; Accredited Field Officer</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Official Email</span>
            <span className="text-slate-900 font-semibold">{user?.email || "inspector.adeleke@lasbca.gov.ng"}</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Supervising Agency</span>
            <span className="text-slate-900 font-semibold">Lagos State Building Control Agency (LASBCA)</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Jurisdiction / Zonal Office</span>
            <span className="text-slate-900 font-semibold">Lekki-Epe Directorate &bull; Zone 4</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">RBAC Role Authority</span>
            <span className="text-emerald-700 font-semibold">Lead Structural Inspector</span>
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
              Current Password <span className="text-slate-400 font-normal lowercase">(initial default is password123)</span>
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

      {/* Sync Parameters */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
          <Cloud size={16} className="text-cyan-600" />
          <span>Field Synchronization Parameters</span>
        </h3>
        <p className="text-xs text-slate-500">
          Shared evidence cache settings synchronized with the mobile offline database.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Local Evidence Cache</span>
            <span className="text-slate-900 font-semibold">142 MB Cached &bull; Normal</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">Sync Protocol</span>
            <span className="text-emerald-700 font-semibold">Real-time WebSocket + Background Polling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
