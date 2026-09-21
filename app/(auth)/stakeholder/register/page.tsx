"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Eye, CheckCircle2, Building2, HardHat, Briefcase, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Country, State } from "country-state-city";
import { CustomSelect } from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";
import LoginSuccessModal from "@/components/dashboard/LoginSuccessModal";
import { useRouter } from "next/navigation";

export default function StakeholderRegister() {
  const router = useRouter();
  const { register, isLoading, error: authError } = useAuth();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    stakeholderRole: 'client', // 'client' | 'developer' | 'contractor' | 'professional' | 'consultant'
    companyName: '',
    registrationNumber: '',
    licenseAuthority: 'COREN',
    licenseNumber: '',
    country: 'NG',
    stateRegion: 'Lagos',
    officeAddress: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'country') next.stateRegion = '';
      return next;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNextStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = "Valid Email is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.companyName.trim()) newErrors.companyName = "Company / Firm Name is required";
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = "CAC or Business Reg Number is required";

    if (formData.stakeholderRole === 'professional' && !formData.licenseNumber.trim()) {
      newErrors.licenseNumber = "Professional License Number is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(3);
    }
  };

  const handleNextStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.stateRegion) newErrors.stateRegion = "State / Region is required";
    if (!formData.officeAddress.trim()) newErrors.officeAddress = "Office Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(4);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must agree to the Terms and Privacy Policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const payload = {
        name: formData.fullName.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone_number: formData.phone.trim(),
        role_name: `Stakeholder: ${formData.stakeholderRole.toUpperCase()}`,
        stakeholder_type: formData.stakeholderRole,
        company_name: formData.companyName.trim(),
        registration_number: formData.registrationNumber.trim(),
        license_authority: formData.licenseAuthority,
        license_number: formData.licenseNumber.trim(),
        country: formData.country,
        state_region: formData.stateRegion,
        office_address: formData.officeAddress.trim(),
      };

      const success = await register(payload);
      if (success) {
        setShowSuccessModal(true);
      }
    } catch (err: any) {
      setErrors({ submit: err?.message || 'Registration failed. Please try again.' });
    }
  };

  // Country and State options
  const countryOptions = Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }));
  const stateOptions = formData.country 
    ? State.getStatesOfCountry(formData.country).map(s => ({ value: s.name, label: s.name }))
    : [];

  const roleTypes = [
    { id: 'client', label: 'Client / Project Owner', desc: 'Control inspections, timelines & financial activities' },
    { id: 'developer', label: 'Property Developer', desc: 'Master developer portfolio & permit management' },
    { id: 'contractor', label: 'General / Sub-Contractor', desc: 'Execute site construction & NCR remediation' },
    { id: 'professional', label: 'Licensed Professional', desc: 'COREN/ARCON engineer or architect signoff' },
    { id: 'consultant', label: 'Advisory Consultant', desc: 'Specialized geotechnical, EIA or NDT advisory' },
  ];

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-between font-sans bg-white lg:bg-transparent">
      {/* Background Image with Overlay */}
      <div
        className="hidden lg:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-[#022C4F]/85 backdrop-blur-[2px]"></div>
      </div>

      {/* Left Content Area (Desktop) */}
      <div className="hidden lg:flex relative z-10 w-1/2 h-full flex-col justify-between p-10 min-h-[calc(100vh)] text-white">
        <div>
          <Link
            href="/"
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
            Official Stakeholder Onboarding
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Register as a Government Stakeholder
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Connect your organization to the national regulatory platform to schedule building inspections, coordinate stage-gate project timelines, and settle statutory financial levies.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    step === i 
                      ? "bg-white text-[#022C4F] scale-110 shadow-lg" 
                      : step > i 
                      ? "bg-emerald-400 text-white" 
                      : "bg-white/20 text-white/70"
                  }`}
                >
                  {step > i ? "✓" : i}
                </div>
                {i < 4 && <div className={`w-8 h-0.5 ${step > i ? "bg-emerald-400" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/50">
          stakeholder.nexucon.net &bull; Protected by Multi-Tenant Zero-Trust RBAC
        </div>
      </div>

      {/* Right Content Area (Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Step {step} of 4
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">
              Already have an account? <Link href="/stakeholder/login" className="text-[#022C4F] font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#022C4F]">
              {step === 1 && "Personal & Role Selection"}
              {step === 2 && "Organization & Credentials"}
              {step === 3 && "Jurisdiction & Location"}
              {step === 4 && "Account Security"}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              {step === 1 && "Select how your organization participates in the regulatory ecosystem."}
              {step === 2 && "Enter your statutory registration numbers and license details."}
              {step === 3 && "Provide your official headquarters or local operational address."}
              {step === 4 && "Set up a secure password to protect your stakeholder workspace."}
            </p>
            {authError && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {authError}
              </p>
            )}
            {errors.submit && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {errors.submit}
              </p>
            )}
          </div>

          {/* Step 1: Personal & Role */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="Engr. Babatunde Williams"
                />
                {errors.fullName && <span className="text-[11px] text-red-500 font-bold">{errors.fullName}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Official Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="babatunde@williamsconstruction.com"
                />
                {errors.email && <span className="text-[11px] text-red-500 font-bold">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="+234 803 123 4567"
                />
                {errors.phone && <span className="text-[11px] text-red-500 font-bold">{errors.phone}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#022C4F]">Stakeholder Role Classification</label>
                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto pr-1">
                  {roleTypes.map(r => (
                    <div
                      key={r.id}
                      onClick={() => handleInputChange('stakeholderRole', r.id)}
                      className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        formData.stakeholderRole === r.id
                          ? "border-[#022C4F] bg-blue-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="text-xs font-bold text-[#022C4F]">{r.label}</div>
                      <div className="text-[11px] text-gray-500 mt-0.5">{r.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextStep1}
                className="w-full mt-4 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Continue to Credentials</span>
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* Step 2: Organization & Credentials */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Company / Firm / Entity Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="Apex Construction & Engineering Ltd"
                />
                {errors.companyName && <span className="text-[11px] text-red-500 font-bold">{errors.companyName}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">CAC / Corporate Registration Number</label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.registrationNumber ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="RC-1234567"
                />
                {errors.registrationNumber && <span className="text-[11px] text-red-500 font-bold">{errors.registrationNumber}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#022C4F]">Regulatory Authority Accreditation</label>
                <select
                  value={formData.licenseAuthority}
                  onChange={(e) => handleInputChange('licenseAuthority', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium bg-white focus:outline-none focus:border-[#022C4F]"
                >
                  <option value="COREN">COREN (Council for the Regulation of Engineering)</option>
                  <option value="ARCON">ARCON (Architects Registration Council of Nigeria)</option>
                  <option value="CORBON">CORBON (Council of Registered Builders of Nigeria)</option>
                  <option value="QSRBN">QSRBN (Quantity Surveyors Registration Board)</option>
                  <option value="CAC">CAC (Corporate Affairs Commission Prequalification)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Statutory License / Practice Certificate No.</label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="COREN-REG-2026-8941"
                />
                {errors.licenseNumber && <span className="text-[11px] text-red-500 font-bold">{errors.licenseNumber}</span>}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Location</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#022C4F]">Country</label>
                <CustomSelect
                  value={formData.country}
                  onChange={(val) => handleInputChange('country', val)}
                  options={countryOptions}
                  placeholder="Select Country"
                  searchable
                />
                {errors.country && <span className="text-[11px] text-red-500 font-bold">{errors.country}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-[#022C4F]">State / Region</label>
                <CustomSelect
                  value={formData.stateRegion}
                  onChange={(val) => handleInputChange('stateRegion', val)}
                  options={stateOptions}
                  placeholder="Select State / Region"
                  searchable
                />
                {errors.stateRegion && <span className="text-[11px] text-red-500 font-bold">{errors.stateRegion}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Head Office / Operational Address</label>
                <textarea
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-2.5 rounded-xl border ${errors.officeAddress ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="Plot 14, Commercial Avenue, Victoria Island, Lagos"
                />
                {errors.officeAddress && <span className="text-[11px] text-red-500 font-bold">{errors.officeAddress}</span>}
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Security</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Security */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-sm font-medium pr-12 focus:outline-none focus:border-[#022C4F]`}
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
                {errors.password && <span className="text-[11px] text-red-500 font-bold">{errors.password}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} text-sm font-medium pr-12 focus:outline-none focus:border-[#022C4F]`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <span className="text-[11px] text-red-500 font-bold">{errors.confirmPassword}</span>}
              </div>

              <div className="flex items-start gap-2.5 mt-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  I agree to the <Link href="/terms" className="text-blue-600 underline font-semibold">Terms of Service</Link>, statutory data verification with regulatory bodies (COREN/CAC/LASRRA), and the <Link href="/privacy" className="text-blue-600 underline font-semibold">Privacy Policy</Link>.
                </label>
              </div>
              {errors.termsAccepted && <span className="text-[11px] text-red-500 font-bold">{errors.termsAccepted}</span>}

              <div className="flex gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3.5 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>

      <LoginSuccessModal 
        isOpen={showSuccessModal} 
        onClose={() => router.push('/stakeholder/onboarding')} 
        message="Stakeholder Registration Successful!"
      />
    </div>
  );
}
