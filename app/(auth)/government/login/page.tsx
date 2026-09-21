"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, EyeOff, Eye, ShieldCheck, Landmark, FileCheck2, Scale, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginSuccessModal from "@/components/dashboard/LoginSuccessModal";

export default function GovernmentLogin() {
  const router = useRouter();
  const { login, isLoading, error: authError } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string } = {};
    if (!formData.email) {
      newErrors.email = "Agency Email is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Valid Email Address is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const success = await login({ email: formData.email.trim(), password: formData.password });
      if (success) {
        setShowSuccessModal(true);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
            Official Government Agency Portal
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Government Agency Command &amp; Regulatory Access
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Access the statutory regulatory portal to review architectural submissions, issue building permits, monitor jurisdiction inspections, and enforce compliance standards.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Landmark className="text-blue-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Agency Authority</div>
              <div className="text-[11px] text-white/60 mt-0.5">Statutory approvals</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <FileCheck2 className="text-emerald-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Permit Control</div>
              <div className="text-[11px] text-white/60 mt-0.5">Stage-gate signoffs</div>
            </div>
            <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10">
              <Scale className="text-amber-300 mb-2" size={20} />
              <div className="text-xs font-bold text-white">Enforcement</div>
              <div className="text-[11px] text-white/60 mt-0.5">Jurisdiction audits</div>
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
          <div className="flex lg:hidden justify-between items-center w-full mb-10 mt-2">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to homepage
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              New official? <Link href="/government/register" className="text-[#022C4F] font-semibold hover:underline">Register</Link>
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
              New official? <Link href="/government/register" className="text-[#022C4F] font-bold hover:underline">Register</Link>
            </p>
          </div>

          {/* Form Header */}
          <div className="text-left mb-8">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-2">
              Agency Sign In
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed">
              Sign in as an Agency Head, Director, or Building Control official to review plans, issue permits, and oversee jurisdiction compliance.
            </p>
            {authError && (
              <div className="mt-4 flex items-center gap-2 text-xs sm:text-sm text-red-600 bg-red-50 p-3.5 rounded-xl border border-red-200">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{authError}</span>
              </div>
            )}
          </div>

          {/* Form Fields & Actions */}
          <form className="flex flex-col h-full lg:h-auto" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-[#022C4F]">Official Agency Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  placeholder="name@agency.gov.ng"
                  autoFocus
                />
                {errors.email && (
                  <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10">
                    {errors.email}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-2 relative">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-bold text-[#022C4F]">Password</label>
                  <Link href="/government/forgot-password" className="text-xs font-semibold text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10">
                    {errors.password}
                  </span>
                )}
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
                  "Sign In to Agency Command Center"
                )}
              </button>

              <div className="text-center pt-2">
                <span className="text-xs text-gray-400">
                  Are you a Government Stakeholder?{" "}
                  <Link href="/stakeholder/login" className="text-[#022C4F] font-bold hover:underline">
                    Stakeholder Portal
                  </Link>
                  {" "}&bull;{" "}
                  <Link href="/inspector/login" className="text-[#022C4F] font-bold hover:underline">
                    Inspector Login
                  </Link>
                </span>
              </div>
            </div>
          </form>
        </div>
      </div>

      <LoginSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => router.push('/government/dashboard/command-center')} 
      />
    </div>
  );
}
