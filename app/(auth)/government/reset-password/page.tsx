"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronLeft, EyeOff, Eye, ShieldCheck, CheckCircle2, Lock, KeyRound, AlertCircle, ArrowRight } from "lucide-react";
import api from "@/lib/api";

function GovernmentResetPasswordForm() {
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
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const qEmail = searchParams.get("email") || "";
    const qToken = searchParams.get("token") || "";
    const qUid = searchParams.get("uid") || "";
    const qCode = searchParams.get("code") || "";

    if (qEmail) setEmail(qEmail);
    if (qToken) setToken(qToken);
    if (qUid) setUid(qUid);
    if (qCode) setCode(qCode);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Official agency email address is required.";
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
        email: email.trim(),
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
        setServerError(res.data?.message || "Failed to reset password. Please check your token or code.");
      }
    } catch (err: any) {
      console.error("Government reset password confirm error:", err);
      const msg = err.response?.data?.message || "Invalid or expired reset request. Please request a new link.";
      setServerError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-between font-sans bg-white lg:bg-transparent">
      {/* Background Image with Overlay (Hidden on mobile) */}
      <div
        className="hidden lg:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-[#022C4F]/85 backdrop-blur-[2px]"></div>
      </div>

      {/* Left Content Area (Hidden on mobile) */}
      <div className="hidden lg:flex relative z-10 w-1/2 h-full flex-col justify-between p-10 min-h-[calc(100vh)] text-white">
        <div>
          <Link
            href="/home"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to homepage
          </Link>
        </div>

        <div className="max-w-xl pb-16 pt-0">
          <div className="mb-6">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={220}
              height={70}
              className="h-14 w-auto object-contain brightness-0 invert"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-300/30 text-xs font-bold text-blue-200 uppercase tracking-wider mb-4">
            <ShieldCheck size={14} />
            Government Security Clearance
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Create Your New Government Credential
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Ensure your account is protected with an enterprise-grade password. Your agency credentials safeguard statutory approvals, enforcement orders, and jurisdictional audit logs.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Lock className="text-blue-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Salted Hashes</div>
              <div className="text-[11px] text-white/60 mt-0.5">Argon2 / PBKDF2</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <KeyRound className="text-emerald-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Session Invalidation</div>
              <div className="text-[11px] text-white/60 mt-0.5">Instant active reset</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <ShieldCheck className="text-amber-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Zero Trust</div>
              <div className="text-[11px] text-white/60 mt-0.5">Strict role barriers</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50">
          nexucon.net &bull; Government Agency Security Framework
        </div>
      </div>

      {/* Right Content Area (Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Mobile Top Navigation */}
          <div className="flex lg:hidden justify-between items-center w-full mb-10 mt-2">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to homepage
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              Remember password? <Link href="/government/login" className="text-[#022C4F] font-semibold hover:underline">Sign In</Link>
            </p>
          </div>

          {/* Desktop Card Header */}
          <div className="hidden lg:flex justify-between items-start mb-10">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <p className="text-sm font-medium text-gray-500 mt-2">
              Remember password? <Link href="/government/login" className="text-[#022C4F] font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          {!isSuccess ? (
            <>
              {/* Form Header */}
              <div className="text-left mb-6">
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-2">
                  Reset Agency Password
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
                  Enter your official email, verification code, and your new password to restore government portal access.
                </p>
                {serverError && (
                  <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{serverError}</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <form className="flex flex-col h-full lg:h-auto" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-4 mb-6">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">Official Agency Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="agency.official@agency.gov.ng"
                      className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                    />
                    {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
                  </div>

                  {/* 6-Digit Code / Token */}
                  {token ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-xs text-emerald-800">
                        <span className="font-bold">Security Token Verified</span>
                        <p className="text-[11px] text-emerald-700">One-time reset token attached securely from your email link.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1.5 relative">
                      <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">6-Digit Verification Code</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="e.g. 849201"
                        maxLength={6}
                        className={`w-full px-4 py-3 rounded-xl border ${errors.code ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-semibold tracking-widest`}
                      />
                      {errors.code && <span className="text-xs text-red-500">{errors.code}</span>}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 characters"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.newPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword}</span>}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5 relative">
                    <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-3 mt-auto lg:mt-2 mb-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Reset & Update Password"
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href="/government/login"
                      className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#022C4F] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to Government Sign In
                    </Link>
                  </div>
                </div>
              </form>
            </>
          ) : (
            <div className="flex flex-col justify-between h-full py-4">
              <div className="text-left">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-3">
                  Password Updated Successfully!
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed mb-6">
                  Your agency credentials have been updated securely. You can now sign in to access your regulatory command center, building reviews, and inspection logs.
                </p>

                <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                  <span className="font-semibold">All active sessions have been secured. Your account is ready for sign in.</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Link
                  href="/government/login"
                  className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Government Sign In</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function GovernmentResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="w-8 h-8 border-2 border-[#022C4F] border-t-transparent rounded-full animate-spin"></div></div>}>
      <GovernmentResetPasswordForm />
    </Suspense>
  );
}
