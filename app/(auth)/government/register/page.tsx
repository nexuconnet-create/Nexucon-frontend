"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Eye, CheckCircle2, ShieldCheck, Landmark, Building2, MapPin, Lock, Mail } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Country, State } from "country-state-city";
import { CustomSelect } from "@/components/CustomSelect";
import { useAuth } from "@/context/AuthContext";

export default function GovernmentRegister() {
  const { register, verifyEmail, resendVerificationCode, isLoading, error: authError } = useAuth();
  const [step, setStep] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendMessage, setResendMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', role: 'government',
    agencyName: '', agencyWebsite: '', jurisdictionLevel: '', department: '',
    country: 'NG', stateRegion: 'Lagos', officeAddress: '',
    password: '', confirmPassword: '',
    termsAccepted: false, privacyAccepted: false, marketingAccepted: false,
    otp: ['', '', '', '', '', '']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      if (field === 'country') {
        newData.stateRegion = '';
      }
      return newData;
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
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = "Valid Email Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.agencyName.trim()) newErrors.agencyName = "Agency Name is required";
    if (!formData.jurisdictionLevel) newErrors.jurisdictionLevel = "Jurisdiction Level is required";
    if (!formData.department) newErrors.department = "Department is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(3);
    }
  };

  const handleNextStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.stateRegion) newErrors.stateRegion = "State/Region is required";
    if (!formData.officeAddress.trim()) newErrors.officeAddress = "Office Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(4);
    }
  };

  const handleNextStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(formData.password)) {
      newErrors.password = "Password must contain uppercase, lowercase, number, and special character";
    }
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setShowTermsModal(true);
    }
  };

  const handleTermsSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the Terms & Conditions";
    if (!formData.privacyAccepted) newErrors.privacyAccepted = "You must accept the Privacy Policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setShowTermsModal(false);

    const userData = {
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      first_name: formData.fullName.split(' ')[0] || '',
      last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
      phone_number: formData.phone,
      agency_name: formData.agencyName,
      jurisdiction_level: formData.jurisdictionLevel,
      department: formData.department,
      country: formData.country,
      state_region: formData.stateRegion,
      office_address: formData.officeAddress,
    };

    const success = await register(userData);
    if (success) {
      setShowTermsModal(false);
      setStep(5);
      setResendCooldown(60);
    } else {
      setShowTermsModal(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    handleInputChange('otp', newOtp);

    if (value && index < 5 && otpRefs.current[index + 1]) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !formData.otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim().slice(0, 6).split('');
    const newOtp = [...formData.otp];
    pastedData.forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    handleInputChange('otp', newOtp);

    const focusIndex = Math.min(pastedData.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    setResendMessage(null);
    const res = await resendVerificationCode(formData.email);
    if (res.success) {
      setResendCooldown(60);
      setResendMessage({ type: 'success', text: res.message || 'Verification code resent to your email.' });
    } else {
      setResendMessage({ type: 'error', text: res.message || 'Failed to resend code. Please try again.' });
    }
  };

  const handleFinalSubmit = async () => {
    const otpString = formData.otp.join('').trim();
    if (otpString.length !== 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code' });
      return;
    }

    const verified = await verifyEmail(formData.email, otpString);
    if (verified) {
      setShowSuccessModal(true);
    }
  };

  // Country & State options
  const countryOptions = Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }));
  const stateOptions = formData.country
    ? State.getStatesOfCountry(formData.country).map(s => ({ value: s.name, label: s.name }))
    : [];

  const jurisdictionOptions = [
    { value: 'State', label: 'State Level Authority (e.g. LASBCA)' },
    { value: 'Federal', label: 'Federal Regulatory Agency' },
    { value: 'Municipal', label: 'Local Government / Municipal Council' },
    { value: 'Regional', label: 'Regional Development Board' },
  ];

  const departmentOptions = [
    { value: 'Building Control', label: 'Building Control & Inspection' },
    { value: 'Urban Planning', label: 'Urban Planning & Approvals' },
    { value: 'Structural Integrity', label: 'Structural Integrity & Materials' },
    { value: 'Enforcement & Compliance', label: 'Enforcement & Compliance' },
    { value: 'Safety & Environment', label: 'Environmental & Fire Safety' },
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
            Official Agency Onboarding
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Register Government Regulatory Agency
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Connect your agency to the national regulatory platform to manage permit approvals, assign site inspectors, review architectural models, and enforce building standards across your jurisdiction.
          </p>

          {/* Stepper Dots */}
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
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
                {i < 5 && <div className={`w-6 h-0.5 ${step > i ? "bg-emerald-400" : "bg-white/20"}`} />}
              </div>
            ))}
          </div>
        </div>

        <div className="text-xs text-white/50">
          nexucon.net &bull; Protected by Multi-Tenant Zero-Trust RBAC
        </div>
      </div>

      {/* Right Content Area (Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Step {step} of 5
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">
              Already registered? <Link href="/government/login" className="text-[#022C4F] font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#022C4F]">
              {step === 1 && "Official Personal Details"}
              {step === 2 && "Agency & Department"}
              {step === 3 && "Jurisdiction & Location"}
              {step === 4 && "Account Security"}
              {step === 5 && "Identity Verification"}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              {step === 1 && "Provide your official agency representative credentials."}
              {step === 2 && "Select your statutory agency name, tier, and oversight department."}
              {step === 3 && "Enter your regional jurisdiction and headquarters office address."}
              {step === 4 && "Establish an encrypted credential to safeguard statutory enforcement logs."}
              {step === 5 && "Confirm your official email by entering the 6-digit passcode."}
            </p>
            {authError && (
              <p className="mt-3 text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                {authError}
              </p>
            )}
          </div>

          {/* Step 1: Personal Details */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Official Representative Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="Engr. Arc. Olawale Sanwo"
                />
                {errors.fullName && <span className="text-[11px] text-red-500 font-bold">{errors.fullName}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Official Agency Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="director@lasbca.gov.ng"
                />
                {errors.email && <span className="text-[11px] text-red-500 font-bold">{errors.email}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Direct Official Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="+234 803 000 1122"
                />
                {errors.phone && <span className="text-[11px] text-red-500 font-bold">{errors.phone}</span>}
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="w-full py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Proceed to Agency Details</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Agency & Department */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Statutory Agency Name</label>
                <input
                  type="text"
                  value={formData.agencyName}
                  onChange={(e) => handleInputChange('agencyName', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.agencyName ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F]`}
                  placeholder="e.g. Lagos State Building Control Agency (LASBCA)"
                />
                {errors.agencyName && <span className="text-[11px] text-red-500 font-bold">{errors.agencyName}</span>}
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Official Portal / Agency Website</label>
                <input
                  type="text"
                  value={formData.agencyWebsite}
                  onChange={(e) => handleInputChange('agencyWebsite', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  placeholder="https://lasbca.lagosstate.gov.ng"
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Jurisdiction Authority Tier</label>
                <CustomSelect
                  options={jurisdictionOptions}
                  value={formData.jurisdictionLevel}
                  onChange={(val) => handleInputChange('jurisdictionLevel', val)}
                  placeholder="Select Jurisdiction Tier"
                  error={errors.jurisdictionLevel}
                />
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Primary Operational Department</label>
                <CustomSelect
                  options={departmentOptions}
                  value={formData.department}
                  onChange={(val) => handleInputChange('department', val)}
                  placeholder="Select Primary Department"
                  error={errors.department}
                />
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-1/3 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Location */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-[#022C4F]">Country</label>
                  <CustomSelect
                    options={countryOptions}
                    value={formData.country}
                    onChange={(val) => handleInputChange('country', val)}
                    placeholder="Select Country"
                    error={errors.country}
                  />
                </div>
                <div className="flex flex-col gap-1.5 relative">
                  <label className="text-xs font-bold text-[#022C4F]">State / Region</label>
                  <CustomSelect
                    options={stateOptions}
                    value={formData.stateRegion}
                    onChange={(val) => handleInputChange('stateRegion', val)}
                    placeholder="Select State"
                    error={errors.stateRegion}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Headquarters Office Address</label>
                <textarea
                  rows={3}
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.officeAddress ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F] resize-none`}
                  placeholder="Muiz Banire Street, Old Secretariat, Ikeja, Lagos"
                />
                {errors.officeAddress && <span className="text-[11px] text-red-500 font-bold">{errors.officeAddress}</span>}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-1/3 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Password & Security */}
          {step === 4 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Create Master Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F] pr-12`}
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
                    className={`w-full px-4 py-3 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} text-sm font-medium focus:outline-none focus:border-[#022C4F] pr-12`}
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

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-gray-600 space-y-1">
                <p className="font-bold text-[#022C4F]">Password Guidelines:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                  <li>Minimum 8 characters long</li>
                  <li>Include uppercase, lowercase, number, and symbol (@$!%*?&)</li>
                </ul>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-1/3 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep4}
                  className="w-2/3 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] flex justify-center items-center gap-2 cursor-pointer"
                >
                  <span>Review &amp; Accept Terms</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 5: OTP Verification */}
          {step === 5 && (
            <div className="flex flex-col h-full justify-between py-2">
              <div>
                <div className="w-14 h-14 bg-blue-50 text-[#022C4F] rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                  <CheckCircle2 className="w-7 h-7 text-blue-600" />
                </div>
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-[#022C4F] mb-1">Verify Agency Credential</h3>
                  <p className="text-xs text-gray-500">
                    We dispatched a 6-digit statutory verification passcode to:
                  </p>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-[#022C4F] text-xs font-bold rounded-full border border-slate-200">
                    {formData.email}
                  </span>
                </div>

                <div className="flex flex-col gap-2 mb-6">
                  <label className="text-xs font-bold text-[#022C4F] uppercase tracking-wider text-center">
                    Enter 6-Digit Passcode
                  </label>
                  <div className="flex gap-2 sm:gap-3 justify-center w-full">
                    {[...Array(6)].map((_, i) => (
                      <input
                        key={i}
                        ref={(el) => { otpRefs.current[i] = el; }}
                        type="text"
                        maxLength={1}
                        value={formData.otp[i]}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={handleOtpPaste}
                        className={`w-11 h-12 sm:w-12 sm:h-14 text-center rounded-xl border ${errors.otp ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-xl font-bold text-[#022C4F]`}
                      />
                    ))}
                  </div>
                  {errors.otp && <span className="text-[11px] text-center text-red-500 font-bold">{errors.otp}</span>}
                </div>

                {/* Resend Code Section */}
                <div className="flex justify-between items-center py-2 px-1 mb-4 border-b border-gray-100 text-xs">
                  <span className="text-gray-500">Didn't receive the email?</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0}
                    className="font-bold text-[#022C4F] hover:underline disabled:text-gray-400 cursor-pointer"
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                  </button>
                </div>

                {resendMessage && (
                  <div className={`p-3 rounded-xl text-xs font-medium mb-4 border ${resendMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
                    {resendMessage.text}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3 mt-6">
                <button
                  onClick={handleFinalSubmit}
                  type="button"
                  disabled={isLoading}
                  className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] disabled:opacity-70 flex justify-center items-center cursor-pointer"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Activate Agency Command Center"
                  )}
                </button>
                <button
                  onClick={() => setStep(4)}
                  type="button"
                  className="text-xs text-gray-500 hover:text-gray-800 text-center font-medium"
                >
                  ← Edit account details
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[700px] p-8 sm:p-10 border border-gray-100">
            <h2 className="text-2xl sm:text-[28px] font-extrabold text-[#022C4F] mb-4">
              Statutory Agency Protocol &amp; Terms
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6">
              By establishing a regulatory agency account on Nexucon, you confirm authorized delegation to execute statutory building controls, review architectural submissions, and enforce compliance orders.
            </p>
            
            <div className="flex flex-col gap-4 mb-8">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                  className="w-5 h-5 accent-[#022C4F] rounded cursor-pointer"
                />
                <span className={`text-xs sm:text-sm font-medium ${errors.termsAccepted ? 'text-red-500' : 'text-gray-700'}`}>
                  I agree to the Statutory Regulatory Terms &amp; Conditions
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.privacyAccepted}
                  onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                  className="w-5 h-5 accent-[#022C4F] rounded cursor-pointer"
                />
                <span className={`text-xs sm:text-sm font-medium ${errors.privacyAccepted ? 'text-red-500' : 'text-gray-700'}`}>
                  I agree to the National Data Protection &amp; Jurisdiction Privacy Policy
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setShowTermsModal(false)}
                type="button"
                disabled={isLoading}
                className="w-full sm:w-1/2 py-3.5 border border-gray-300 text-gray-700 font-bold rounded-xl text-xs hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTermsSubmit}
                type="button"
                disabled={isLoading}
                className="w-full sm:w-1/2 py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center justify-center cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Accept & Dispatch Verification"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[480px] p-8 md:p-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-extrabold text-[#022C4F] mb-2">
              Agency Account Activated!
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-8">
              Your official agency profile has been established. You can now access the regulatory command center to review applications and oversee building compliance.
            </p>
            <Link
              href="/government/onboarding"
              className="w-full py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md flex items-center justify-center cursor-pointer"
            >
              Enter Agency Command Center
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
