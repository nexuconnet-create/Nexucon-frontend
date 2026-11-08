"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
} from "lucide-react";
import api from "@/services/api";

function InspectorResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams?.get("email") || "";
    const qToken = searchParams?.get("token") || "";
    const qUid = searchParams?.get("uid") || "";
    const qCode = searchParams?.get("code") || "";

    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
    if (qUid) setUid(qUid);
    if (qCode) setCode(qCode);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const newErrors: Record<string, string> = {};

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      newErrors.email = "Inspector email or username is required.";
    }
    if (!token && !code.trim()) {
      newErrors.code = "Reset token or 6-digit code is required.";
    }
    if (!newPassword) {
      newErrors.newPassword = "New password is required.";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters.";
    }
    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    try {
      const payload: any = {
        email: cleanEmail,
        new_password: newPassword,
        confirm_password: confirmPassword,
      };
      if (token) payload.token = token;
      if (uid) payload.uid = uid;
      if (code.trim()) payload.code = code.trim();

      const res = await api.post("/auth/password-reset-confirm/", payload);
      if (res.data?.success) {
        setIsSuccess(true);
      } else {
        setServerError(
          res.data?.message ||
            "Failed to reset password. Please check your verification code or request a new link."
        );
      }
    } catch (err: any) {
      console.error("Inspector reset password confirm error:", err);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid or expired password reset link. Please request a new recovery instructions.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#DFDFDF] text-slate-900 flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans relative">
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between z-10">
        <Link href="/inspector/login" className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20">
            Inspectorate
          </span>
        </Link>
        <Link
          href="/inspector/login"
          className="text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft size={14} />
          <span>Back to sign in</span>
        </Link>
      </header>

      <main className="max-w-md w-full mx-auto my-10 z-10">
        <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-xl">
          {!isSuccess ? (
            <>
              <div className="mb-8">
                <div className="w-12 h-12 rounded-2xl bg-[#022C4F]/10 border border-[#022C4F]/20 text-[#022C4F] flex items-center justify-center mb-5">
                  <KeyRound size={26} />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-[#022C4F] mb-2">
                  Create New Password
                </h1>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Establish a secure permanent password for your inspector terminal account.
                </p>
              </div>

              {serverError && (
                <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0 text-red-600" />
                  <span>{serverError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Inspector Email or Username
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="inspector@agency.gov.ng"
                    required
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.email}</p>
                  )}
                </div>

                {!token && (
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                      6-Digit Verification Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="e.g. 123456"
                      maxLength={6}
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-center tracking-widest font-mono text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                    />
                    {errors.code && (
                      <p className="text-red-500 text-[11px] mt-1">{errors.code}</p>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      required
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.newPassword}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 pr-10 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-[11px] mt-1">{errors.confirmPassword}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Set Permanent Password</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 size={30} />
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-[#022C4F] mb-2">
                Password Reset Successfully
              </h2>
              <p className="text-xs text-slate-600 leading-relaxed mb-8">
                Your inspector account password has been updated. You can now authenticate with your username and new password.
              </p>
              <Link
                href="/inspector/login"
                className="inline-flex items-center justify-center w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-md"
              >
                Sign In to Terminal
              </Link>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col items-center text-center gap-2">
            <p className="text-[11px] text-slate-500">
              Need assistance with your inspection credentials?
            </p>
            <Link
              href="/inspector/forgot-password"
              className="text-xs font-semibold text-[#022C4F] hover:underline"
            >
              Request a new reset code
            </Link>
          </div>
        </div>
      </main>

      <footer className="max-w-4xl w-full mx-auto text-center text-xs text-slate-500 font-medium z-10">
        Nexucon Regulatory Enforcement Terminal • Synchronized with Agency Directorate
      </footer>
    </div>
  );
}

export default function InspectorResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#DFDFDF] flex items-center justify-center text-slate-500 text-xs">
          Loading recovery portal...
        </div>
      }
    >
      <InspectorResetPasswordContent />
    </Suspense>
  );
}
