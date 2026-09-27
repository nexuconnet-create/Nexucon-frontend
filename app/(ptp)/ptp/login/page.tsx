"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Search,
  Lock,
  Mail,
  AlertCircle,
  Building2,
  Compass,
  CheckCircle2,
  ChevronLeft,
  AlertTriangle,
  FileCheck2,
  Users
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

function PtpLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams?.get('redirect') || '/ptp/dashboard';

  const { login, user, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If already logged in, redirect to target or onboarding
  useEffect(() => {
    if (!isLoading && user) {
      const cleanEmail = user.email?.toLowerCase();
      const localOnboarded = typeof window !== 'undefined' && cleanEmail
        ? localStorage.getItem(`nexucon_onboarding_completed_${cleanEmail}`)
        : null;

      if (user.is_onboarded || localOnboarded) {
        router.push(redirectTarget);
      } else {
        router.push('/ptp/onboarding');
      }
    }
  }, [user, isLoading, router, redirectTarget]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handleQuickFill = (email: string) => {
    setFormData({
      email,
      password: 'password123',
    });
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.password.trim()) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const success = await login({
        email: formData.email.trim(),
        password: formData.password,
        portal: 'ptp',
      });

      if (success === true) {
        const cleanEmail = formData.email.trim().toLowerCase();
        const localOnboarded = typeof window !== 'undefined'
          ? localStorage.getItem(`nexucon_onboarding_completed_${cleanEmail}`)
          : null;

        if (localOnboarded) {
          router.push(redirectTarget);
        } else {
          router.push('/ptp/onboarding');
        }
      } else {
        setErrorMessage("Invalid credentials or server unavailable. Try selecting a Quick Demo Profile below.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to sign in. Please try again.");
    } finally {
      setSubmitting(false);
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
            href="/transparency"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to Public Portal
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
            Public Transparency Portal
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Civic Oversight &amp; Open Statutory Building Data
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Access statutory building records, verify permit legitimacy with LASPPPA / LASBCA references, monitor neighborhood stop-work notices, and report infractions directly to state regulators.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Search className="text-blue-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Permit Search</div>
              <div className="text-[11px] text-white/60 mt-0.5">Statutory approvals</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <AlertTriangle className="text-amber-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Notice Audits</div>
              <div className="text-[11px] text-white/60 mt-0.5">Stop-work tracking</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <FileCheck2 className="text-emerald-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Verification</div>
              <div className="text-[11px] text-white/60 mt-0.5">QR &amp; Certificate check</div>
            </div>
          </div>
        </div>

        <div className="text-xs text-white/50">
          nexucon.net &bull; Protected by Multi-Tenant Zero-Trust RBAC
        </div>
      </div>

      {/* Right Content Area (Login Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Mobile Top Navigation */}
          <div className="flex lg:hidden justify-between items-center w-full mb-8 mt-2">
            <Link
              href="/transparency"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              New monitor? <Link href="/ptp/register" className="text-[#022C4F] font-semibold hover:underline">Register</Link>
            </p>
          </div>

          {/* Desktop Card Header */}
          <div className="hidden lg:flex justify-between items-start mb-8">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={140}
              height={40}
              className="h-9 w-auto object-contain"
            />
            <p className="text-sm font-medium text-gray-500 mt-2">
              New monitor? <Link href="/ptp/register" className="text-[#022C4F] font-bold hover:underline">Register</Link>
            </p>
          </div>

          {/* Form Header */}
          <div className="text-left mb-6">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-2">
              Civic Sign In
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
              Sign in to your public transparency dashboard to verify building permits, track stop-work orders, and submit neighborhood oversight reports.
            </p>
            {(errorMessage || authError) && (
              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{errorMessage || authError}</span>
              </div>
            )}
          </div>

          {/* Form Fields & Actions */}
          <form className="flex flex-col h-full lg:h-auto" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs sm:text-sm font-bold text-[#022C4F]">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium"
                    placeholder="e.g. monitor.lagos@nexucon.net"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <div className="flex justify-between items-center">
                  <label className="text-xs sm:text-sm font-bold text-[#022C4F]">Password</label>
                  <Link href="/transparency#faq" className="text-xs font-semibold text-blue-600 hover:underline">
                    Need help?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-10 pr-12 py-3 sm:py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 sm:py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center cursor-pointer gap-2"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In to Civic Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Identities for instant verification */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                <span>Quick Demo Civic Profiles:</span>
                <span className="text-[10px] text-blue-600 font-semibold">Click to autofill</span>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleQuickFill('citizen.etiosa@nexucon.net')}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-[#022C4F] group-hover:text-blue-900 text-xs">
                      Citizen Monitor (Eti-Osa)
                    </div>
                    <div className="text-[10px] text-slate-500">citizen.etiosa@nexucon.net</div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Autofill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('investor.lagos@nexucon.net')}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-[#022C4F] group-hover:text-emerald-900 text-xs">
                      Property Investor / Buyer
                    </div>
                    <div className="text-[10px] text-slate-500">investor.lagos@nexucon.net</div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Autofill</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('monitor.civic@nexucon.net')}
                  className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors cursor-pointer"
                >
                  <div>
                    <div className="font-bold text-[#022C4F] group-hover:text-amber-900 text-xs">
                      Civic Journalist / Watchdog
                    </div>
                    <div className="text-[10px] text-slate-500">monitor.civic@nexucon.net</div>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Autofill</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-4 mt-auto">
              <span className="text-xs text-gray-400">
                Are you an agency official?{" "}
                <Link href="/government/login" className="text-[#022C4F] font-bold hover:underline">
                  Agency Portal
                </Link>
                {" "}&bull;{" "}
                <Link href="/stakeholder/login" className="text-[#022C4F] font-bold hover:underline">
                  Developer Portal
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function PtpLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-400 text-xs">
          Loading Sign In...
        </div>
      }
    >
      <PtpLoginContent />
    </Suspense>
  );
}


