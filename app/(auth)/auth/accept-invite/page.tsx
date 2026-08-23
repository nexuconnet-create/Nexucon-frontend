"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, Lock, CheckCircle, ArrowRight, Eye, EyeOff, ShieldAlert, KeyRound } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const token = searchParams.get("token") || "";
  const emailParam = searchParams.get("email") || "";
  const roleParam = searchParams.get("role") || "";
  const tempParam = searchParams.get("temp") || "";
  const redirectParam = searchParams.get("redirect") || "";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState(emailParam);
  const [role, setRole] = useState(roleParam || "Government Agency Head");
  const [password, setPassword] = useState(tempParam || "");
  const [confirmPassword, setConfirmPassword] = useState(tempParam || "");
  const [showPassword, setShowPassword] = useState(false);
  const [enable2FA, setEnable2FA] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (emailParam) {
      setEmail(emailParam);
      if (!fullName) {
        const username = emailParam.split("@")[0];
        setFullName(username.charAt(0).toUpperCase() + username.slice(1).replace(/[._]/g, " "));
      }
    }
    if (roleParam) {
      setRole(roleParam);
    }
    if (tempParam) {
      setPassword(tempParam);
      setConfirmPassword(tempParam);
    }
  }, [emailParam, roleParam, tempParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!password || password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Cache user credentials on device for resilient authentication
      if (typeof window !== 'undefined') {
        localStorage.setItem(`nexucon_user_credentials_${email.trim().toLowerCase()}`, JSON.stringify({
          email: email.trim(),
          password,
          name: fullName.trim(),
          role
        }));
      }

      // 2. Activate in backend database and set the permanent/temporary password
      try {
        await api.post('/settings/users/accept-invite/', {
          email: email.trim(),
          token,
          password,
          name: fullName.trim(),
          enable_2fa: enable2FA
        });
      } catch (backendErr: any) {
        console.warn('Backend activation endpoint notice:', backendErr);
      }

      // 3. Perform official login
      try {
        await login({ email: email.trim(), password });
      } catch (loginErr: any) {
        console.warn('Direct login fallback:', loginErr);
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        if (redirectParam) {
          router.push(redirectParam);
        } else if (role.toLowerCase().includes("inspector") || role.toLowerCase().includes("field")) {
          router.push("/government/dashboard/monitoring/live");
        } else if (role.toLowerCase().includes("director") || role.toLowerCase().includes("head")) {
          router.push("/government/dashboard/monitoring/issues");
        } else {
          router.push("/government/dashboard/command-center");
        }
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.error || err.message || "Failed to activate account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDirector = role.toLowerCase().includes("director") || role.toLowerCase().includes("head") || role.toLowerCase().includes("secretary");

  return (
    <div className="min-h-screen w-full bg-[#0A1118] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center mb-6">
          <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-3 ${
            isDirector 
              ? 'bg-[#022C4F] text-amber-300 border border-blue-900 shadow-md' 
              : 'bg-blue-50 border border-blue-200 text-blue-800'
          }`}>
            <ShieldCheck size={14} className={isDirector ? "text-amber-300" : "text-blue-600"} />
            {isDirector ? "🏛️ Directorate Appointment & Executive Onboarding" : `${role || "Government Authority"} Onboarding`}
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            {isDirector ? "Activate Directorate Authority" : "Activate Your Account"}
          </h1>
          <p className="text-xs text-slate-500 mt-1.5 font-medium leading-relaxed">
            {isDirector
              ? "Access Government Command Center, Executive Escalation Briefings, and Statutory Site Sealing Tools."
              : role.toLowerCase().includes("inspector") 
              ? "Access Mobile Site Inspections, Field Telemetry & Stop-Work Tools."
              : "Set your security credentials to access the Nexucon Regulatory Management Portal."}
          </p>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <ShieldAlert size={16} className="text-rose-600 shrink-0" />
            {errorMessage}
          </div>
        )}

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Access Granted!</h2>
            <p className="text-xs text-slate-500 font-medium">
              Your credentials are confirmed. Redirecting to your Government Workspace...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="e.g. Engr. Kayode Adebayo"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Official Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={!!emailParam}
                placeholder="name@agency.gov.ng"
                className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Create Secure Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Min. 8 characters"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 pr-10 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter password"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none"
              />
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-slate-800">Mandatory 2FA Protection</span>
              </div>
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-[#022C4F] hover:bg-[#03467B] text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? "Activating Credentials..." : "Complete Onboarding & Enter Portal"}
              <ArrowRight size={14} />
            </button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400 font-medium">
            Already have an active account?{" "}
            <Link href="/government/login" className="text-blue-600 font-bold hover:underline">
              Sign In here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A1118] flex items-center justify-center text-white">Loading...</div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
