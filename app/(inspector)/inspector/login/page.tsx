"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Lock, Mail, ArrowRight, AlertCircle, KeyRound, CheckCircle2, ChevronLeft, ExternalLink } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

function InspectorLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isLoading } = useAuth();

  const queryEmail = searchParams?.get("email") || "";
  const isNewUser = searchParams?.get("new") === "true";

  const [email, setEmail] = useState(queryEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forced password change / activation dialog state
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);
  const [isAccountActivated, setIsAccountActivated] = useState(false);
  const [inviteCredential, setInviteCredential] = useState("");
  const [showInviteCredential, setShowInviteCredential] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
    }
    if (isNewUser) {
      setNeedsPasswordChange(true);
    }
  }, [queryEmail, isNewUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsAccountActivated(false);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setErrorMessage("Please provide both official email address and password / invite code.");
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Direct standard login attempt with backend
      const loginRes: any = await login({ email: cleanEmail, password: cleanPassword });
      if (loginRes === true) {
        const onboardingDone = typeof window !== 'undefined'
          ? localStorage.getItem(`nexucon_onboarding_completed_${cleanEmail}`)
          : null;

        if (!onboardingDone) {
          router.replace("/inspector/onboarding");
        } else {
          router.replace("/inspector/dashboard");
        }
        return;
      }

      // If backend recognizes this as an invited inspector needing first-time activation
      if (loginRes?.requiresActivation) {
        setInviteCredential(cleanPassword);
        setNeedsPasswordChange(true);
        setErrorMessage(null);
        return;
      }

      // 2. If login failed, check if this is a pending inspector verifying with an invite credential
      try {
        const valRes: any = await api.post("/settings/users/validate-invite/", {
          email: cleanEmail,
          invite_code: cleanPassword,
          temp_password: cleanPassword,
        });
        const valData: any = valRes?.data !== undefined ? valRes.data : valRes;
        if (valData?.valid === true || valRes?.valid === true) {
          // Valid pending invite credential! Transition to set permanent password
          setInviteCredential(cleanPassword);
          setNeedsPasswordChange(true);
          setErrorMessage(null);
          return;
        } else {
          if (valData?.error_code === 'ALREADY_ACCEPTED') {
            setIsAccountActivated(true);
            setErrorMessage("Incorrect permanent password. This inspector account is already activated. Please verify your password or use Forgot Password.");
            return;
          }
          if (valData?.error_code === 'NOT_REGISTERED' || valData?.message?.includes('not been registered')) {
            setErrorMessage("Access Denied: This email has not been registered as an accredited inspector by the Agency Directorate. Access is strictly invite-based.");
            return;
          }
          if (valData?.error_code === 'INVALID_CREDENTIALS') {
            setErrorMessage("Incorrect password. If you are logging in for the first time, click below to activate your station with your official Invite Code.");
            return;
          }
          if (valData?.message) {
            setErrorMessage(valData.message);
            return;
          }
        }
      } catch (valErr: any) {
        const valData = valErr?.response?.data;
        if (valData?.error_code === 'ALREADY_ACCEPTED') {
          setIsAccountActivated(true);
          setErrorMessage("Incorrect permanent password. This inspector account is already activated. Please verify your password or use Forgot Password.");
          return;
        }
        if (valData?.error_code === 'NOT_REGISTERED' || valData?.message?.includes('not been registered')) {
          setErrorMessage("Access Denied: This email has not been registered as an accredited inspector by the Agency Directorate. Access is strictly invite-based.");
          return;
        }
        if (valData?.error_code === 'INVALID_CREDENTIALS') {
          setErrorMessage("Incorrect password. If you are logging in for the first time, click below to activate your station with your official Invite Code.");
          return;
        }
        if (valData?.message) {
          setErrorMessage(valData.message);
          return;
        }
      }

      setErrorMessage("Access Restricted: This terminal is strictly invite-based. If you have been registered by the Agency Directorate, you must enter your official Invite Code or Temporary Password to activate your account.");
    } catch (err: any) {
      setErrorMessage(err?.message || "Authentication failed. Please check network connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPermanentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCredential = inviteCredential.trim();

    if (!cleanEmail) {
      setErrorMessage("Please enter your official email address.");
      return;
    }
    if (!cleanCredential) {
      setErrorMessage("Strict verification required: Please enter your official Invite Code (format XXXX-XXXX) or Temporary Password issued by the Agency Directorate.");
      return;
    }
    if (!newPassword || newPassword.length < 8) {
      setErrorMessage("New permanent password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res: any = await api.post("/settings/users/accept-invite/", {
        email: cleanEmail,
        password: newPassword,
        invite_code: cleanCredential,
        temp_password: cleanCredential,
      });

      const data: any = res?.data !== undefined ? res.data : res;
      const isSuccess = data?.success === true || res?.success === true;

      if (isSuccess) {
        const token = data?.access || res?.access;
        if (token && typeof window !== 'undefined') {
          localStorage.setItem('nexucon_access_token', token);
        }
        try {
          await login({ email: cleanEmail, password: newPassword });
        } catch (_) {}
        router.replace("/inspector/onboarding");
        return;
      }
    } catch (err: any) {
      const apiError = err?.response?.data?.error || err?.response?.data?.message || err?.message;
      if (apiError?.toLowerCase().includes('already activated') || apiError?.toLowerCase().includes('already accepted')) {
        const loginSuccess = await login({ email: cleanEmail, password: newPassword });
        if (loginSuccess) {
          router.replace("/inspector/onboarding");
          return;
        }
      }
      setErrorMessage(apiError || "Verification failed: Invalid Invite Code or Temporary Password. Please verify your details with the Agency Directorate.");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-between font-sans bg-[#F8FAFC] lg:bg-transparent">
      {/* Background Image with Overlay (Desktop) */}
      <div
        className="hidden lg:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-[#022C4F]/85 backdrop-blur-[2px]" />
      </div>

      {/* Left Content Area (Desktop) */}
      <div className="hidden lg:flex relative z-10 w-1/2 h-full flex-col justify-between p-10 min-h-[calc(100vh)]">
        <div>
          <a
            href="https://nexucon.net/government/login"
            className="inline-flex items-center text-white/90 hover:text-white transition-colors font-semibold text-sm bg-white/10 hover:bg-white/15 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/20"
          >
            <ChevronLeft className="w-4 h-4 mr-1.5" />
            Switch to Agency Directorate Login
          </a>
        </div>

        <div className="max-w-xl pb-16 pt-0">
          <div className="mb-6">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={220}
              height={70}
              className="h-14 w-auto object-contain brightness-0 invert"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/25 text-xs font-bold text-white mb-4">
            <ShieldCheck size={15} className="text-emerald-300" />
            <span>Official Field Inspector Terminal</span>
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-5 leading-tight drop-shadow-sm">
            Field Oversight & Site Verification
          </h1>

          <p className="text-white/85 text-base font-medium leading-relaxed max-w-lg">
            Sign in to execute mandated statutory inspections, record GPS-verified checklists, review subsurface GPR scans, log defects, and seal evidence records.
          </p>

          <div className="mt-8 pt-6 border-t border-white/15 text-xs text-white/70">
            Authoritative platform synchronized with Lagos State Building Control Agency & Zonal Directorates.
          </div>
        </div>
      </div>

      {/* Right Content Area (Login Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-[32px] lg:shadow-2xl w-full max-w-[550px] lg:max-w-[600px] p-6 sm:p-8 lg:p-12 flex flex-col justify-between min-h-screen lg:min-h-[740px] border border-gray-100">

          {/* Top Bar on Mobile & Desktop */}
          <div className="flex justify-between items-center w-full mb-8">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <a
              href="https://nexucon.net/government/login"
              className="text-xs font-bold text-[#022C4F] hover:text-[#0284C7] transition-colors flex items-center gap-1 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200"
            >
              <span>Directorate</span>
              <ExternalLink size={12} />
            </a>
          </div>

          {!needsPasswordChange ? (
            <div>
              {/* Card Header */}
              <div className="text-left mb-8">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-[#022C4F] text-[11px] font-bold uppercase tracking-wider border border-blue-100 mb-3">
                  <ShieldCheck size={13} className="text-[#0284C7]" />
                  Inspector Portal
                </div>
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-2 tracking-tight">
                  Inspector Sign In
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
                  Access your district jurisdiction, assigned projects, checklists, and evidence registry.
                </p>
              </div>

              {errorMessage && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col gap-2.5 font-medium animate-in fade-in">
                  <div className="flex items-start gap-2.5">
                    <AlertCircle size={17} className="shrink-0 mt-0.5 text-red-600" />
                    <div className="leading-relaxed">{errorMessage}</div>
                  </div>
                  {!isAccountActivated ? (
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setNeedsPasswordChange(true);
                      }}
                      className="text-left text-xs font-bold text-[#022C4F] underline hover:text-[#0284C7] ml-6 cursor-pointer"
                    >
                      First-time login? Click here to activate with your Invite Code or Temporary Password &rarr;
                    </button>
                  ) : (
                    <div className="ml-6 text-xs text-gray-600">
                      Forgot your permanent password?{" "}
                      <Link href="/inspector/forgot-password" className="font-bold text-[#022C4F] underline hover:text-[#0284C7]">
                        Reset your password here &rarr;
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="inspector.officer@nexucon.gov.ng"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-2 focus:ring-[#022C4F]/10 transition-all text-sm font-medium text-[#0F181F] placeholder:text-gray-400 bg-white"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider">
                      Passkey / Password
                    </label>
                    <Link
                      href="/inspector/forgot-password"
                      className="text-xs font-semibold text-[#022C4F] hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-2 focus:ring-[#022C4F]/10 transition-all text-sm font-medium text-[#0F181F] pr-12 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || isLoading}
                    className="w-full py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-bold tracking-wide transition-all shadow-md active:scale-[0.98] disabled:opacity-70 flex justify-center items-center cursor-pointer"
                  >
                    {isSubmitting || isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Sign In to Field Terminal"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setNeedsPasswordChange(true);
                    }}
                    className="text-xs font-semibold text-[#022C4F] hover:text-[#0284C7] transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <KeyRound size={14} className="text-[#0284C7]" />
                    <span>First time or invited? Activate with Invite Code / Temp Password</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* First Login Password Setup View */
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4">
                <KeyRound size={24} />
              </div>
              <h3 className="text-2xl font-bold text-[#022C4F] mb-1">
                Activate Inspector Station
              </h3>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Access is strictly invite-based. Input your official <strong>Invite Code</strong> or <strong>Temporary Password</strong> issued by the Government Directorate to verify your account and set your permanent passkey.
              </p>

              <div className="mb-5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 text-xs text-gray-700 flex items-center justify-between">
                <span>Already set your permanent password?</span>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setNeedsPasswordChange(false);
                    router.replace('/inspector/login' + (email ? `?email=${encodeURIComponent(email)}` : ''));
                  }}
                  className="font-bold text-[#022C4F] hover:text-[#0284C7] underline ml-2 cursor-pointer shrink-0"
                >
                  Sign in directly &rarr;
                </button>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSetPermanentPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Official Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="inspector.officer@nexucon.gov.ng"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] text-sm text-[#0F181F] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Invite Code OR Temporary Password
                  </label>
                  <div className="relative">
                    {/*
                      The placeholder used to read "e.g. INS-549182 or
                      Nexucon@XXXX2026!" — a live sample of the temporary
                      password's shape, prefix, year suffix and four-digit body
                      included, published to anyone who opens the login page.

                      It then read "e.g. INS-549182", which is the wrong shape
                      entirely: `settings.services` mints an invite code as two
                      groups of four hex characters (`f"{hex[:4]}-{hex[4:8]}"`),
                      and `accounts.views` accepts that code *in place of the
                      password* while the invitation is pending — so an invite
                      code is a credential, not the reference an earlier comment
                      here claimed. Showing the format is useful; showing a
                      value in that format is a credential sample. `XXXX-XXXX`
                      teaches the shape and cannot be mistaken for one.
                    */}
                    <input
                      type={showInviteCredential ? "text" : "password"}
                      value={inviteCredential}
                      onChange={(e) => setInviteCredential(e.target.value)}
                      required
                      placeholder="e.g. XXXX-XXXX"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] text-sm text-[#0F181F] bg-white font-mono placeholder:font-sans pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowInviteCredential(!showInviteCredential)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showInviteCredential ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                    Found in your dispatch notice or appointment email from the Agency Directorate.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Create Permanent Password (min 8 chars)
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] text-sm pr-12 text-[#0F181F] bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Confirm Permanent Password
                  </label>
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] text-sm text-[#0F181F] bg-white"
                  />
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="w-full py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 flex justify-center items-center"
                  >
                    {isUpdatingPassword ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "Verify Invite & Activate Account"
                    )}
                  </button>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage(null);
                      setNeedsPasswordChange(false);
                      router.replace('/inspector/login' + (email ? `?email=${encodeURIComponent(email)}` : ''));
                    }}
                    className="text-xs font-semibold text-gray-500 hover:text-[#022C4F] transition-colors inline-flex items-center gap-1.5 cursor-pointer py-1"
                  >
                    <ChevronLeft size={14} />
                    <span>Back to Standard Sign In</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Footer Notice */}
          <div className="pt-6 border-t border-gray-100 text-center">
            <p className="text-xs text-gray-500 font-medium">
              Government Technical Directorate Official?{" "}
              <a
                href="https://nexucon.net/government/login"
                className="text-[#022C4F] font-bold hover:underline"
              >
                Sign in at Agency Directorate
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function InspectorLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-gray-400">Loading...</div>}>
      <InspectorLoginContent />
    </Suspense>
  );
}
