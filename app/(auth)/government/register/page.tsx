"use client";

import { useState, useRef, KeyboardEvent, ClipboardEvent, useEffect } from "react";
import { ChevronLeft, ChevronRight, EyeOff, Eye, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Country, State } from "country-state-city";
import { CustomSelect } from "../../../../components/CustomSelect";
import { useAuth } from "@/context/AuthContext";

export default function GovernmentRegister() {
  const { register, isLoading, error: authError } = useAuth();
  const [step, setStep] = useState(1);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '', email: '', phone: '', role: 'government',
    agencyName: '', agencyWebsite: '', jurisdictionLevel: '', department: '',
    country: '', stateRegion: '', officeAddress: '',
    password: '', confirmPassword: '',
    termsAccepted: false, privacyAccepted: false, marketingAccepted: false,
    otp: ['', '', '', '', '', '']
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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

  const handleTermsSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.termsAccepted) newErrors.termsAccepted = "You must accept the Terms & Conditions";
    if (!formData.privacyAccepted) newErrors.privacyAccepted = "You must accept the Privacy Policy";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setShowTermsModal(false);
      setStep(5);
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

  const handleFinalSubmit = async () => {
    const isOtpComplete = formData.otp.every(char => char.trim() !== '');
    if (!isOtpComplete) {
      setErrors({ otp: 'Please enter the complete verification code' });
      return;
    }

    const userData = {
      email: formData.email,
      password: formData.password,
      first_name: formData.fullName.split(' ')[0] || '',
      last_name: formData.fullName.split(' ').slice(1).join(' ') || '',
      phone_number: formData.phone,
    };

    const success = await register(userData);
    
    if (success) {
      setShowSuccessModal(true);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-between font-sans bg-white lg:bg-transparent">
      {/* Background Image with Overlay */}
      <div
        className="hidden lg:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
      </div>

      {/* Left Content Area */}
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
            Create Agency Account
          </h1>

          <p className="text-white text-lg font-medium leading-relaxed max-w-lg drop-shadow-md">
            Join Nexucon to streamline permit approvals, review architectural plans efficiently,
            and ensure compliance across all projects in your jurisdiction.
          </p>
        </div>
      </div>

      {/* Right Content Area */}
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
              Already have account? <Link href="/government/login" className="text-[#022C4F] font-semibold hover:underline">Sign In</Link>
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
              Already have account? <Link href="/government/login" className="text-[#022C4F] font-semibold hover:underline">Sign In</Link>
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

          {step === 1 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Personal Details</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Complete your account setup to start overseeing projects and ensuring compliance.
                </p>
              </div>

              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Full Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  />
                  {errors.fullName && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.fullName}</span>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  />
                  {errors.email && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.email}</span>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  />
                  {errors.phone && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.phone}</span>}
                </div>

                <div className="flex flex-col gap-2 relative z-50">
                  <label className="text-sm font-bold text-[#022C4F]">Select Roles</label>
                  <CustomSelect
                    value={formData.role}
                    onChange={(val) => handleInputChange('role', val)}
                    options={[
                      { value: "Agency Head", label: "Agency Head" },
                      { value: "Director", label: "Director" },
                      { value: "Inspector", label: "Inspector" }
                    ]}
                    placeholder="Select Role"
                    error={errors.role}
                  />
                </div>
              </form>

              <div className="flex justify-end mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  onClick={handleNextStep1}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full lg:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Agency Information</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Provide details about your government agency or department.
                </p>
              </div>

              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Agency Name</label>
                  <input
                    type="text"
                    value={formData.agencyName}
                    onChange={(e) => handleInputChange('agencyName', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.agencyName ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  />
                  {errors.agencyName && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.agencyName}</span>}
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col gap-2 w-full sm:w-1/2">
                    <label className="text-sm font-bold text-[#022C4F]">Agency Website (Optional)</label>
                    <input
                      type="url"
                      value={formData.agencyWebsite}
                      onChange={(e) => handleInputChange('agencyWebsite', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-1/2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">Jurisdiction Level</label>
                    <CustomSelect
                      value={formData.jurisdictionLevel}
                      onChange={(val) => handleInputChange('jurisdictionLevel', val)}
                      options={[
                        { value: "municipal", label: "Municipal / City" },
                        { value: "county", label: "County / District" },
                        { value: "state", label: "State / Provincial" },
                        { value: "federal", label: "Federal / National" }
                      ]}
                      placeholder="Select jurisdiction"
                      error={errors.jurisdictionLevel}
                    />
                    {errors.jurisdictionLevel && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.jurisdictionLevel}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Department</label>
                  <CustomSelect
                    value={formData.department}
                    onChange={(val) => handleInputChange('department', val)}
                    options={[
                      { value: "planning", label: "Planning & Zoning" },
                      { value: "building", label: "Building & Safety" },
                      { value: "public_works", label: "Public Works" },
                      { value: "transportation", label: "Transportation" },
                      { value: "environmental", label: "Environmental Protection" },
                      { value: "other", label: "Other" }
                    ]}
                    placeholder="Select department"
                    error={errors.department}
                  />
                  {errors.department && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.department}</span>}
                </div>
              </form>

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  onClick={() => setStep(1)}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStep2}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Location Details</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Provide your agency's primary office location.
                </p>
              </div>

              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col gap-2 w-full sm:w-1/2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">Country</label>
                    <CustomSelect
                      value={formData.country}
                      onChange={(val) => handleInputChange('country', val)}
                      options={Country.getAllCountries().map(country => ({ value: country.isoCode, label: country.name }))}
                      placeholder="Select Country"
                      searchable={true}
                      error={errors.country}
                    />
                    {errors.country && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.country}</span>}
                  </div>
                  <div className="flex flex-col gap-2 w-full sm:w-1/2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">State/Region</label>
                    <CustomSelect
                      value={formData.stateRegion}
                      onChange={(val) => handleInputChange('stateRegion', val)}
                      options={formData.country ? State.getStatesOfCountry(formData.country).map(state => ({ value: state.isoCode, label: state.name })) : []}
                      placeholder="Select State/Region"
                      searchable={true}
                      error={errors.stateRegion}
                      disabled={!formData.country}
                      disabledText="Select Country First"
                    />
                    {errors.stateRegion && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.stateRegion}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Office Address</label>
                  <input
                    type="text"
                    value={formData.officeAddress}
                    onChange={(e) => handleInputChange('officeAddress', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.officeAddress ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium`}
                  />
                  {errors.officeAddress && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.officeAddress}</span>}
                </div>
              </form>

              <div className="flex flex-col sm:flex-row justify-between gap-3 mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  onClick={() => setStep(2)}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextStep3}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Secure Your Account</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Create a secure password for your agency account.
                </p>
              </div>

              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className={`w-full px-4 py-3.5 rounded-xl border ${errors.password ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none p-0 flex items-center justify-center"
                    >
                      {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.password}</span>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={`w-full px-4 py-3.5 rounded-xl border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-gray-600 transition-colors bg-transparent border-none p-0 flex items-center justify-center"
                    >
                      {showConfirmPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.confirmPassword}</span>}
                </div>
              </form>

              <div className="flex flex-col gap-6 mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  onClick={handleNextStep4}
                  type="button"
                  className="flex items-center justify-center w-full px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                  Complete Setup
                </button>
                <button
                  onClick={() => setStep(3)}
                  type="button"
                  className="text-[#022C4F] font-semibold hover:underline w-full text-center"
                >
                  Back
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <div className="text-center mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Verify Your Account</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm mx-auto leading-relaxed">
                  We've sent a verification link and security code to your email address.
                  Please verify your account to continue securely.
                </p>
              </div>

              <div className="flex flex-col gap-3 mb-10 lg:mb-8 mt-4">
                <label className="text-sm font-bold text-[#022C4F]">Verification Code</label>
                <div className="flex gap-2 sm:gap-4 justify-between w-full">
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
                      className={`w-12 h-12 sm:w-14 sm:h-14 text-center rounded-xl border ${errors.otp ? 'border-red-500' : 'border-gray-400'} focus:outline-none focus:border-[#022C4F] focus:ring-1 transition-all text-xl font-bold text-[#022C4F]`}
                    />
                  ))}
                </div>
                {errors.otp && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.otp}</span>}
              </div>

              <div className="flex flex-col gap-6 mt-auto lg:mt-0 mb-6 lg:mb-0">
                <p className="text-[13px] text-gray-600 leading-relaxed text-left">
                  Check your inbox and follow the verification instructions provided. If you don't see it, please check your spam folder.
                </p>
                {authError && <p className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{authError}</p>}
                <button
                  onClick={handleFinalSubmit}
                  type="button"
                  disabled={isLoading}
                  className="flex items-center justify-center w-full px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    "Verify Account & Continue"
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-[850px] p-8 md:p-14">
            <h2 className="text-[28px] sm:text-[32px] font-bold text-[#022C4F] mb-6">
              Terms of Service
            </h2>
            <p className="text-sm text-gray-700 leading-relaxed mb-6">
              By creating an agency account on Nexucon, you agree to comply with our platform policies, confidentiality terms, and operational standards.
            </p>
            
            <div className="flex flex-col gap-5 mb-10">
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`relative flex items-center justify-center w-5 h-5 border ${errors.termsAccepted ? 'border-red-500' : 'border-gray-400'} rounded-sm group-hover:border-[#022C4F] transition-colors`}>
                  <input
                    type="checkbox"
                    checked={formData.termsAccepted}
                    onChange={(e) => handleInputChange('termsAccepted', e.target.checked)}
                    className="opacity-0 absolute inset-0 cursor-pointer peer"
                  />
                  <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-sm"></div>
                </div>
                <span className={`text-sm font-medium ${errors.termsAccepted ? 'text-red-500' : 'text-gray-700'}`}>I agree to Nexucon's Terms & Conditions</span>
              </label>
              <label className="flex items-center gap-4 cursor-pointer group">
                <div className={`relative flex items-center justify-center w-5 h-5 border ${errors.privacyAccepted ? 'border-red-500' : 'border-gray-400'} rounded-sm group-hover:border-[#022C4F] transition-colors`}>
                  <input
                    type="checkbox"
                    checked={formData.privacyAccepted}
                    onChange={(e) => handleInputChange('privacyAccepted', e.target.checked)}
                    className="opacity-0 absolute inset-0 cursor-pointer peer"
                  />
                  <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-sm"></div>
                </div>
                <span className={`text-sm font-medium ${errors.privacyAccepted ? 'text-red-500' : 'text-gray-700'}`}>I agree to Nexucon's Privacy Policy</span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowTermsModal(false)}
                type="button"
                className="flex-1 py-4 border-2 border-[#022C4F] text-[#022C4F] font-semibold rounded-xl hover:bg-gray-50 transition-colors"
              >
                Not right now
              </button>
              <button
                onClick={handleTermsSubmit}
                type="button"
                className="flex-1 py-4 bg-[#022C4F] text-white font-semibold rounded-xl hover:bg-[#022C4F]/90 transition-colors"
              >
                I Agree
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-[500px] p-8 md:p-12 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-[26px] sm:text-[30px] font-bold text-[#022C4F] mb-4">
              Account Created Successfully!
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed mb-10">
              Your Nexucon agency profile is now active. You can start reviewing projects and managing compliance.
            </p>
            <Link
              href="/government/onboarding"
              className="flex items-center justify-center w-full py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-semibold transition-all shadow-md active:scale-[0.98]"
            >
              Start Onboarding
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
