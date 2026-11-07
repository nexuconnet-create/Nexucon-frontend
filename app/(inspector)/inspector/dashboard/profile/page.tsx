"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Shield,
  Building2,
  MapPin,
  RefreshCw,
  Mail,
  Award,
  Key,
  Calendar,
  Lock,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";
import UsernameSettingsCard from "@/components/dashboard/UsernameSettingsCard";
import {
  getInspectorDashboard,
  getInspectorAccreditation,
  type AccreditationResult,
  type EvidenceSyncStatus,
} from "@/services/inspector";
import { dateTimeOr, orDash } from "@/lib/display";

export default function InspectorProfilePage() {
  const { user } = useAuth();
  const [identity, setIdentity] = useState<{
    agency: string | null;
    district: string | null;
    role: string | null;
  } | null>(null);
  const [accreditation, setAccreditation] = useState<AccreditationResult | null>(null);
  const [syncStatus, setSyncStatus] = useState<EvidenceSyncStatus | null>(null);
  const [identityError, setIdentityError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

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
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Failed to update password. Please verify your current password.";
      setPasswordError(errMsg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 max-w-4xl min-w-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
          <User size={20} />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
            Inspector Profile &amp; Identity
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
            Manage your official username handle, governmental accreditation, agency jurisdiction, and security credentials.
          </p>
        </div>
      </div>

      {identityError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2.5">
          <AlertTriangle size={16} className="shrink-0 mt-0.5" />
          <div>
            <div className="font-bold">Accreditation notice</div>
            <p>{identityError}</p>
          </div>
        </div>
      )}

      {/* Prominent Username Settings Card */}
      <UsernameSettingsCard />

      {/* Inspector Accreditation & Identity Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#022C4F] text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {(fullName || user?.email || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-[#022C4F]">
              {orDash(fullName, "Name not recorded")}
            </h2>
            {accredited ? (
              <div className="text-xs font-semibold text-blue-700 flex items-center gap-1.5 mt-0.5">
                <Award size={14} />
                <span>
                  Badge #{accredited.badge_number} &bull;{" "}
                  {orDash(accredited.effective_status || accredited.accreditation_status, "Status not recorded")}
                  {accredited.is_suspended ? " (suspended)" : ""}
                </span>
              </div>
            ) : (
              <div className="text-xs font-semibold text-amber-700 mt-0.5">
                {identityError ? "Accreditation not read" : "No inspector accreditation recorded"}
              </div>
            )}
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              @{user?.username || "unregistered"} &bull; {user?.email}
            </p>
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
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              Official Email Address
            </span>
            <span className="text-slate-900 font-semibold font-mono">
              {orDash(user?.email, "Not available")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              Supervising Agency
            </span>
            <span className="text-slate-900 font-semibold">
              {orDash(identity?.agency, "Lagos State Building Control Agency (LASBCA)")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              Jurisdiction / Zonal Directorate
            </span>
            <span className="text-slate-900 font-semibold">
              {orDash(identity?.district, "Lekki-Epe Directorate • Zone 4")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              RBAC Role Authority
            </span>
            <span className="text-emerald-700 font-semibold">
              {orDash(identity?.role, "Accredited Field Officer")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              Accreditation Directorate
            </span>
            <span className="text-slate-900 font-semibold">
              {orDash(accredited?.directorate, "Directorate of Inspection & Enforcement")}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-500 block text-[11px] font-medium uppercase mb-1">
              Accreditation Expiry
            </span>
            <span className="text-slate-900 font-semibold">
              {accredited
                ? dateTimeOr(accredited.accreditation_expiry, "No expiry recorded")
                : "Continuous Regulatory Authority"}
            </span>
          </div>
        </div>
      </div>

      {/* Security: Change Password Form */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-[#022C4F] flex items-center justify-center shrink-0">
            <Lock size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#022C4F]">
              Station Security &amp; Password
            </h2>
            <p className="text-xs text-gray-500">
              Update your inspector terminal login password.
            </p>
          </div>
        </div>

        {passwordSaved && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0" />
            <span>Password updated successfully. Use your new password on your next login.</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <AlertTriangle size={16} className="shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handleSavePassword} className="space-y-4 max-w-md">
          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              New Password (min 8 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 block mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            />
          </div>

          <button
            type="submit"
            disabled={isUpdatingPassword}
            className="px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isUpdatingPassword ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Updating Password...</span>
              </>
            ) : (
              <span>Save New Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

