"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  KeyRound,
  Check,
  Copy,
  ArrowRight,
  AlertCircle,
  Building2,
  MapPin,
  Briefcase,
  Layers,
  ChevronRight,
  Lock,
  ExternalLink,
} from "lucide-react";
import { validateInspectorInvite, InviteValidationResult } from "@/services/inspector";

export default function InspectorInvitePage() {
  const params = useParams();
  const router = useRouter();
  const token = (params?.token as string) || "";

  const [inviteCode, setInviteCode] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<InviteValidationResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<"enter_code" | "preview_assignment" | "temporary_password">("enter_code");
  const [copiedPass, setCopiedPass] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-validate token on page load if token is in URL
  useEffect(() => {
    if (token) {
      setIsValidating(true);
      setErrorMessage(null);
      validateInspectorInvite(token)
        .then((res) => {
          if (res.valid) {
            setValidationResult(res);
            if (res.invite_code) {
              setInviteCode(res.invite_code);
            }
            setStep("preview_assignment");
          } else {
            setErrorMessage(res.message || "This invitation link is invalid or has already been accepted.");
          }
        })
        .catch((err: any) => {
          console.warn("Auto-validation error:", err);
        })
        .finally(() => {
          setIsValidating(false);
        });
    }
  }, [token]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!token && !inviteCode.trim()) {
      setErrorMessage("Please enter your invitation code.");
      return;
    }

    setIsValidating(true);
    setErrorMessage(null);

    try {
      const res = await validateInspectorInvite(token, inviteCode.trim() || undefined);
      if (res.valid) {
        setValidationResult(res);
        if (res.invite_code) {
          setInviteCode(res.invite_code);
        }
        setStep("preview_assignment");
      } else {
        setErrorMessage(res.message || "This invitation code or token is invalid.");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred while validating your invitation.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleCopyPassword = () => {
    if (!validationResult?.temporary_password) return;
    navigator.clipboard.writeText(validationResult.temporary_password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2500);
  };

  const handleCopyCode = () => {
    const code = validationResult?.invite_code || inviteCode;
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F181F] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between pb-6">
        <div className="flex items-center gap-3">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={130}
            height={36}
            className="h-8 w-auto object-contain"
          />
          <span className="hidden sm:inline-block text-[11px] font-mono tracking-wider text-[#022C4F] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase font-bold">
            Inspector Terminal
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a
            href="https://nexucon.net/government/login"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#022C4F] transition-colors"
          >
            <span>Directorate</span>
            <ExternalLink size={12} />
          </a>
          <Link
            href="/inspector/login"
            className="text-xs font-bold text-[#022C4F] hover:underline"
          >
            Already activated? Sign In &rarr;
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-xl w-full mx-auto my-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl">
          <AnimatePresence mode="wait">
            {/* STEP 1: Enter Invite Code / Token Loading */}
            {step === "enter_code" && (
              <motion.div
                key="step-enter-code"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
              >
                {isValidating && token ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-10 h-10 border-3 border-[#022C4F]/20 border-t-[#022C4F] rounded-full animate-spin mb-4" />
                    <h2 className="text-base font-bold text-[#022C4F]">Verifying Inspector Invitation...</h2>
                    <p className="text-xs text-gray-500 mt-1">Authenticating dispatch token with Nexucon Regulatory Authority</p>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#022C4F] border border-blue-100 flex items-center justify-center mb-5">
                      <ShieldCheck size={26} />
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                      Inspector Verification
                    </h1>
                    <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
                      You have been designated as an authorized government Field Inspector on Nexucon. Enter the 8-character invitation code from your dispatch email, or click validate to continue.
                    </p>

                    {errorMessage && (
                      <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 font-medium">
                        <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
                        <div className="leading-relaxed">{errorMessage}</div>
                      </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-5">
                      <div>
                        <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                          Verification Invite Code {token ? "(Optional - Token Detected)" : ""}
                        </label>
                        <input
                          type="text"
                          value={inviteCode}
                          onChange={(e) => setInviteCode(e.target.value)}
                          placeholder="e.g. B1F3-CBE6"
                          className="w-full h-13 bg-slate-50 border border-gray-300 rounded-xl px-4 text-base sm:text-lg font-mono font-bold tracking-widest text-[#022C4F] placeholder:text-gray-400 focus:outline-none focus:border-[#022C4F] focus:ring-2 focus:ring-[#022C4F]/10 transition-all uppercase"
                        />
                        <p className="text-[11px] text-gray-500 mt-2">
                          Dispatched to your registered email address along with your temporary passcode.
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={isValidating || (!token && !inviteCode.trim())}
                        className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {isValidating ? (
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <span>Validate Credentials & Scope</span>
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            )}

            {/* STEP 2: Preview Jurisdiction & Assignment */}
            {step === "preview_assignment" && validationResult && (
              <motion.div
                key="step-preview"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono font-bold border border-emerald-200 uppercase tracking-wider mb-2">
                    Verified Credentials
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#022C4F] tracking-tight">
                    Confirm Assignment
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Welcome, <strong className="text-gray-900">{validationResult.name || validationResult.email}</strong>. Review your designated jurisdiction and allocated projects.
                  </p>
                </div>

                {/* Scope Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Designated Role:</span>
                    <span className="font-bold text-[#022C4F]">{validationResult.role}</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                    <span className="text-gray-500 font-medium">Supervising Agency:</span>
                    <span className="font-bold text-gray-800">{validationResult.agency_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 font-medium">Zonal District:</span>
                    <span className="font-bold text-blue-700">{validationResult.district_name}</span>
                  </div>
                </div>

                {/* Assigned Projects Preview */}
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
                    Allocated Construction Sites ({validationResult.assigned_projects?.length || 0})
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {validationResult.assigned_projects && validationResult.assigned_projects.length > 0 ? (
                      validationResult.assigned_projects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate">{proj.name}</p>
                            <p className="text-[11px] font-mono text-gray-400">{proj.reference_number || "REF-GOV-2026"}</p>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Active Site
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 italic p-3 bg-slate-50 rounded-xl">
                        District-wide roving assignment. Specific site tasks will be dispatched by your Directorate.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep("temporary_password")}
                  className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Security Credentials</span>
                  <ChevronRight size={16} />
                </button>
              </motion.div>
            )}

            {/* STEP 3: Passkey & Direct Login */}
            {step === "temporary_password" && validationResult && (
              <motion.div
                key="step-password"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mb-4">
                    <KeyRound size={24} />
                  </div>
                  <h2 className="text-2xl font-extrabold text-[#022C4F] tracking-tight">
                    Terminal Access Credentials
                  </h2>
                  <p className="text-xs text-gray-600 mt-1">
                    Your official credentials for the Nexucon Inspector Terminal. Copy them to sign in.
                  </p>
                </div>

                {/* Verification Code Box */}
                {validationResult.invite_code && (
                  <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-blue-900 uppercase font-bold">Verification Invite Code</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 text-xs font-bold text-blue-800 hover:text-blue-900 bg-blue-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        <span>{copiedCode ? "Copied!" : "Copy"}</span>
                      </button>
                    </div>
                    <div className="p-3 bg-white rounded-xl border border-blue-200 font-mono text-base font-extrabold text-blue-950 tracking-widest select-all">
                      {validationResult.invite_code}
                    </div>
                  </div>
                )}

                {/* Temporary Password Box */}
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-800 uppercase font-bold">Temporary Access Password</span>
                    <button
                      type="button"
                      onClick={handleCopyPassword}
                      className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      {copiedPass ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      <span>{copiedPass ? "Copied!" : "Copy"}</span>
                    </button>
                  </div>
                  <div className="p-3 bg-white rounded-xl border border-amber-200 font-mono text-base font-extrabold text-gray-900 tracking-wider select-all">
                    {validationResult.temporary_password || "Nexucon@8842-2026!"}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/inspector/login?email=${encodeURIComponent(validationResult.email || "")}&new=true`)}
                  className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Inspector Sign In</span>
                  <ArrowRight size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-6 text-xs text-gray-400">
        Nexucon Regulatory & Inspection Platform &bull; Lagos State Building Control Agency Directorate
      </footer>
    </div>
  );
}
