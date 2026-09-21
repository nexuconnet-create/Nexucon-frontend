"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Mail, ShieldCheck, CheckCircle2, ArrowRight, KeyRound, Lock, AlertCircle } from "lucide-react";
import api from "@/lib/api";

export default function StakeholderForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [homeUrl, setHomeUrl] = useState("/");
  const [loginUrl, setLoginUrl] = useState("/stakeholder/login");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.startsWith("stakeholder.") || hostname.includes("stakeholder.localhost")) {
        setHomeUrl("https://nexucon.net");
        setLoginUrl("/login");
      }
    }
  }, []);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your official email address.");
      return;
    }
    if (!validateEmail(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsLoading(true);
    try {
      await api.post("/auth/password-reset/", { email: cleanEmail });
      setIsSuccess(true);
    } catch (err: any) {
      console.error("Password reset error:", err);
      const serverMsg = err.response?.data?.message || "Failed to dispatch password recovery email. Please try again.";
      setError(serverMsg);
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
            href={homeUrl}
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
            Secure Identity Recovery
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Account Access &amp; Password Recovery
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Reset credentials securely with real-time token dispatch. Your authorized account allows you to seamlessly orchestrate inspections and synchronize project timelines.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <KeyRound className="text-blue-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Instant Dispatch</div>
              <div className="text-[11px] text-white/60 mt-0.5">Secure recovery links</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Lock className="text-emerald-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Encrypted Tokens</div>
              <div className="text-[11px] text-white/60 mt-0.5">Zero-trust RBAC safety</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <ShieldCheck className="text-amber-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">24/7 Security</div>
              <div className="text-[11px] text-white/60 mt-0.5">Protected audit trail</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50">
          nexucon.net &bull; Protected by Multi-Tenant Zero-Trust RBAC
        </div>
      </div>

      {/* Right Content Area (Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Mobile Top Navigation */}
          <div className="flex lg:hidden justify-between items-center w-full mb-10 mt-2">
            <Link
              href={homeUrl}
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to homepage
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              Remember password? <Link href={loginUrl} className="text-[#022C4F] font-semibold hover:underline">Sign In</Link>
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
              Remember password? <Link href={loginUrl} className="text-[#022C4F] font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          {!isSuccess ? (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-2">
                  Forgot Password
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
                  Enter your registered official email address. We will dispatch secure password recovery instructions and a verification code.
                </p>
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              {/* Form Fields */}
              <form className="flex flex-col h-full lg:h-auto" onSubmit={handleSubmit}>
                <div className="flex flex-col gap-5 mb-8">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">Official Email Address</label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError("");
                        }}
                        className={`w-full px-4 py-3.5 pl-11 rounded-xl border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                        placeholder="name@company.com"
                        autoFocus
                      />
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-auto lg:mt-0 mb-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center cursor-pointer"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      "Send Reset Instructions"
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <Link
                      href={loginUrl}
                      className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-[#022C4F] transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Back to Sign In
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
                  Instructions Dispatched!
                </h2>
                <p className="text-xs sm:text-sm font-medium text-gray-600 leading-relaxed mb-6">
                  If <strong className="text-[#022C4F]">{email}</strong> is registered in our portal, you will receive an email shortly containing your secure password reset button and a 6-digit verification code.
                </p>

                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 space-y-2">
                  <p className="font-bold flex items-center gap-1.5 text-blue-950">
                    <ShieldCheck size={16} className="text-blue-600" />
                    Next Steps:
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-blue-800/90 font-medium">
                    <li>Check your inbox (and spam/junk folder).</li>
                    <li>Click the link in the email or enter your 6-digit code on the reset page.</li>
                    <li>Recovery link and code are valid for 60 minutes.</li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-8">
                <Link
                  href={`/stakeholder/reset-password?email=${encodeURIComponent(email)}`}
                  className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Enter Code / Reset Password</span>
                  <ArrowRight size={16} />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    setIsSuccess(false);
                    setEmail("");
                  }}
                  className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Try Another Email
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
