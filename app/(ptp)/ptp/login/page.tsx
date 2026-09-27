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

  const handleQuickFill = (email: string, roleName: string) => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      {/* Background Ornaments */}
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#022C4F_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center">
          <Link href="/transparency" className="inline-block mb-4">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Crest"
              width={140}
              height={44}
              className="h-10 w-auto mx-auto object-contain"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-blue-700" />
            <span>Public Transparency Portal</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight">
            Sign In to Civic Dashboard
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-600">
            Access statutory building records, verify permits, &amp; track community sites
          </p>
        </div>

        <div className="mt-8 bg-white py-8 px-4 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-200">
          {(errorMessage || authError) && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage || authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="e.g. monitor.lagos@nexucon.net"
                  className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-[#022C4F]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  href="/transparency"
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Need help?
                </Link>
              </div>
              <div className="relative rounded-xl shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-[#022C4F]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white font-bold text-sm shadow-md transition-all hover:scale-[1.01] cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Signing In...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Identities for instant verification */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center justify-between">
              <span>Quick Demo Civic Profiles:</span>
              <span className="text-[10px] text-blue-600">Click to autofill</span>
            </div>
            <div className="grid grid-cols-1 gap-1.5">
              <button
                type="button"
                onClick={() => handleQuickFill('citizen.etiosa@nexucon.net', 'Citizen Monitor')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-blue-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-blue-900">
                    Citizen Monitor (Eti-Osa)
                  </div>
                  <div className="text-[10px] text-slate-500">citizen.etiosa@nexucon.net</div>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('investor.lagos@nexucon.net', 'Property Buyer')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-emerald-900">
                    Property Investor / Buyer
                  </div>
                  <div className="text-[10px] text-slate-500">investor.lagos@nexucon.net</div>
                </div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">Autofill</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill('monitor.civic@nexucon.net', 'Civic Journalist')}
                className="text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-amber-50 border border-slate-200 text-xs flex items-center justify-between group transition-colors"
              >
                <div>
                  <div className="font-bold text-slate-800 group-hover:text-amber-900">
                    Civic Journalist / Researcher
                  </div>
                  <div className="text-[10px] text-slate-500">monitor.civic@nexucon.net</div>
                </div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded">Autofill</span>
              </button>
            </div>
          </div>

          {/* Registration link */}
          <div className="mt-6 text-center text-xs text-slate-600">
            <span>New to the Public Transparency Portal? </span>
            <Link
              href="/ptp/register"
              className="font-bold text-[#022C4F] hover:text-blue-700 underline"
            >
              Create Free Citizen Account
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link
              href="/transparency"
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              &larr; Back to Public Information Page
            </Link>
          </div>
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

