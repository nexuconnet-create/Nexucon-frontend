"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, EyeOff, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/CustomSelect";
import LoginSuccessModal from "@/components/dashboard/LoginSuccessModal";

const roleOptions = [
  { value: "skipper", label: "Skipper" },
  { value: "navigator", label: "Navigator" },
  { value: "architect", label: "Architect" },
  { value: "structural_engineer", label: "Structural Engineer" },
  { value: "mep_engineer", label: "MEP Engineer" },
  { value: "geotech_engineer", label: "Geotech Engineer" },
  { value: "quantity_surveyor", label: "Quantity Surveyor" },
  { value: "civil_engineer", label: "Civil Engineer" },
  { value: "permit_specialist", label: "Permit Specialist" }
];

export default function MentorLogin() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '', role: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string; role?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { email?: string; password?: string; role?: string } = {};
    if (!formData.email) {
      newErrors.email = "Email Address is required";
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Valid Email Address is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Proceed with login
      console.log('Login successful', formData);
      setShowSuccessModal(true);
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
          // Using a placeholder image from the project, update this with the specific hard hat image URL
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      </div>

      {/* Left Content Area (Hidden on mobile) */}
      <div className="hidden lg:flex relative z-10 w-1/2 h-full flex-col justify-between p-10 min-h-[calc(100vh)]">
        <div>
          <Link
            href="/home"
            className="inline-flex items-center text-white hover:text-gray-200 transition-colors font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to homepage
          </Link>
        </div>

        <div className="max-w-xl pb-20 pt-0">
          <div className="mb-6">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={220}
              height={70}
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </div>

          <h1 className="text-[40px] font-extrabold text-[#022C4F] mb-6 leading-tight drop-shadow-sm">
            Welcome Back
          </h1>

          <p className="text-white text-lg font-medium leading-relaxed max-w-lg drop-shadow-md">
            Sign in to your Nexucon account to access projects, manage proposals, collaborate
            with clients, and grow your mentor presence.
          </p>
        </div>
      </div>

      {/* Right Content Area (Login Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Mobile Top Navigation */}
          <div className="flex lg:hidden justify-between items-center w-full mb-12 mt-4">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to homepage
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              Don't have an account? <Link href="/mentors/register" className="text-[#022C4F] font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Desktop Card Header */}
          <div className="hidden lg:flex justify-between items-start mb-12">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Icon"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <p className="text-sm font-medium text-gray-500 mt-2">
              Don't have an account? <Link href="/mentors/register" className="text-[#022C4F] font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={160}
              height={50}
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {/* Form Header */}
          <div className="text-left mb-8">
            <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Welcome Back</h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 leading-relaxed max-w-sm">
              Sign in to your Nexucon account to access projects, manage proposals, collaborate with clients, and grow your mentor presence.
            </p>
          </div>

          {/* Form Fields & Actions */}
          <form className="flex flex-col h-full lg:h-auto" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-5 mb-10 lg:mb-8">
              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-[#022C4F]">Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  placeholder=""
                />
                {errors.email && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-[#022C4F]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                    placeholder=""
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-2 relative">
                <label className="text-sm font-bold text-[#022C4F]">Select Roles</label>
                <div className="relative">
                  <CustomSelect
                    options={roleOptions}
                    value={formData.role}
                    onChange={(val) => handleInputChange('role', val)}
                    placeholder=""
                    error={errors.role}
                    searchable={true}
                  />
                </div>
                {errors.role && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.role}</span>}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 mt-auto lg:mt-0 mb-6 lg:mb-0">
              <button
                type="submit"
                className="w-full py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
              >
                Login
              </button>
            </div>
          </form>

        </div>
      </div>
      <LoginSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => {
          if (typeof window !== 'undefined') {
            const status = localStorage.getItem('verification_status');
            if (status === 'completed') {
              router.push('/mentors/dashboard');
            } else {
              router.push('/mentors/verification');
            }
          }
        }} 
      />
    </div>
  );
}
