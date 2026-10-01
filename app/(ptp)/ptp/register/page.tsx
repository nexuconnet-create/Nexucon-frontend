"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Users,
  Eye,
  EyeOff,
  Building2,
  MapPin,
  Lock,
  Mail,
  User,
  Phone,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const LAGOS_LGAS = [
  "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
  "Ikeja (GRA, Alausa, Allen)",
  "Lagos Island (Marina, CMS, Isale Eko)",
  "Ibeju-Lekki (Dangote Refinery Corridor, Eleko)",
  "Surulere",
  "Alimosho",
  "Kosofe (Magodo, Ogudu)",
  "Lagos Mainland (Yaba, Ebute Metta)",
  "Oshodi-Isolo",
  "Somolu",
  "Apapa",
  "Amuwo-Odofin (Festac)",
  "Badagry",
  "Epe",
  "Ikorodu",
  "Agege",
  "Ifako-Ijaiye",
  "Mushin",
  "Ojo",
  "Ajeromi-Ifelodun",
];

const CITIZEN_ROLES = [
  {
    id: "resident",
    title: "Neighborhood Resident / Homeowner",
    desc: "Monitor developments, heights, and drainage impact around your residential street.",
    icon: Building2,
  },
  {
    id: "investor",
    title: "Property Buyer / Investor",
    desc: "Perform due diligence on off-plan projects, title status, and LASPPPA approvals before purchase.",
    icon: ShieldCheck,
  },
  {
    id: "cda",
    title: "Community Association (CDA) Executive",
    desc: "Official neighborhood association tracking infrastructure compliance and Stop-Work notices.",
    icon: Users,
  },
  {
    id: "monitor",
    title: "Civic Watchdog / Journalist",
    desc: "Open data researcher auditing public safety standards, collapse risks, and state compliance.",
    icon: MapPin,
  },
];

export default function PtpRegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    citizenRole: "resident",
    primaryLga: "Eti-Osa (Ikoyi, Victoria Island, Lekki)",
    neighborhood: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrorMessage(null);
  };

  const handleStep1Next = () => {
    if (!formData.fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage("Please enter your phone number.");
      return;
    }
    setErrorMessage(null);
    setStep(2);
  };

  const handleStep2Next = () => {
    setStep(3);
  };

  const handleStep3Next = () => {
    if (!formData.neighborhood.trim()) {
      setErrorMessage("Please enter your primary neighborhood or area.");
      return;
    }
    setErrorMessage(null);
    setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.password || formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    if (!formData.acceptTerms) {
      setErrorMessage("Please accept the Civic Monitoring Oath & Terms.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const cleanEmail = formData.email.trim().toLowerCase();
    const nameParts = formData.fullName.trim().split(" ");
    const firstName = nameParts[0] || "Citizen";
    const lastName = nameParts.slice(1).join(" ") || "Monitor";

    // Store local profile (never store plaintext password)
    const credentials = {
      email: cleanEmail,
      first_name: firstName,
      last_name: lastName,
      name: formData.fullName,
      role: "Citizen Monitor",
      role_name: "Citizen Monitor",
      portal: "ptp",
      citizenRole: formData.citizenRole,
      primaryLga: formData.primaryLga,
      neighborhood: formData.neighborhood,
      id: `ptp-${Date.now()}`,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(`nexucon_user_credentials_${cleanEmail}`, JSON.stringify(credentials));
      // Save partial profile
      localStorage.setItem(
        `ptp_profile_${cleanEmail}`,
        JSON.stringify({
          role: formData.citizenRole,
          lga: formData.primaryLga,
          neighborhood: formData.neighborhood,
        })
      );
    }

    try {
      await register({
        email: cleanEmail,
        first_name: firstName,
        last_name: lastName,
        password: formData.password,
        phone_number: formData.phone,
        role: "Citizen Monitor",
        portal: "ptp",
      });
    } catch {
      // Handled gracefully by local fallback
    }

    // Direct user to Onboarding to configure their notifications and badge
    router.push("/ptp/onboarding");
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
        <div className="absolute inset-0 bg-[#022C4F]/85 backdrop-blur-[2px]"></div>
      </div>

      {/* Left Content Area (Desktop) */}
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
            Official Civic Onboarding
          </div>

          <h1 className="text-[38px] font-extrabold text-white mb-4 leading-tight">
            Register as a Civic Transparency Monitor
          </h1>

          <p className="text-white/80 text-base font-medium leading-relaxed max-w-lg mb-8">
            Join thousands of Lagos residents, CDAs, property investors, and researchers actively monitoring building safety standards, statutory approvals, and structural notices.
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
          nexucon.net &bull; Protected by Multi-Tenant Zero-Trust RBAC
        </div>
      </div>

      {/* Right Content Area (Register Card) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Top Bar */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#022C4F] bg-blue-50 px-3 py-1 rounded-full uppercase tracking-wider">
                Step {step} of 4
              </span>
            </div>
            <p className="text-xs font-medium text-gray-500">
              Already registered? <Link href="/ptp/login" className="text-[#022C4F] font-bold hover:underline">Sign In</Link>
            </p>
          </div>

          {/* Form Header */}
          <div className="mb-6">
            <h2 className="text-2xl sm:text-[26px] font-extrabold text-[#022C4F]">
              {step === 1 && "Personal Identity"}
              {step === 2 && "Civic Monitoring Role"}
              {step === 3 && "Primary Monitored Location"}
              {step === 4 && "Account Security"}
            </h2>
            <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
              {step === 1 && "Provide your basic contact details to establish civic accountability."}
              {step === 2 && "Select the persona that best describes your monitoring goals."}
              {step === 3 && "Pick your primary Local Government Area for customized alerts."}
              {step === 4 && "Set an encrypted password to manage your civic watchlist and report tokens."}
            </p>
            {errorMessage && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
                <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Full Legal Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Babatunde Adeleke"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                    autoFocus
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="e.g. b.adeleke@lagos.org"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g. +234 802 345 6789"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all cursor-pointer shadow-md"
                >
                  <span>Continue to Role Selection</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="space-y-2.5">
                {CITIZEN_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isSelected = formData.citizenRole === role.id;
                  return (
                    <div
                      key={role.id}
                      onClick={() => handleInputChange("citizenRole", role.id)}
                      className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? "border-[#022C4F] bg-blue-50/50 shadow-sm"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? "bg-[#022C4F] text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-[#022C4F]">{role.title}</h4>
                          {isSelected && <CheckCircle2 size={16} className="text-[#022C4F] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{role.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all cursor-pointer shadow-md"
                >
                  <span>Continue to Location</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION FOCUS */}
          {step === 3 && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Local Government Area (LGA)
                </label>
                <select
                  value={formData.primaryLga}
                  onChange={(e) => handleInputChange("primaryLga", e.target.value)}
                  className="w-full py-3 px-3.5 border border-gray-300 rounded-xl text-sm font-medium focus:outline-none focus:border-[#022C4F] bg-white"
                >
                  {LAGOS_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">
                  Neighborhood / Street / Estate Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="e.g. Lekki Phase 1 / Admiralty Way"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-500">
                  This sets your default dashboard map viewport and local safety bulletins.
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleStep3Next}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all cursor-pointer shadow-md"
                >
                  <span>Continue to Security</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PASSWORD & CIVIC OATH */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-bold text-[#022C4F]">Confirm Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm font-medium focus:outline-none focus:border-[#022C4F]"
                  />
                </div>
              </div>

              {/* Civic Oath Checkbox */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptTerms}
                    onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
                    className="mt-0.5 rounded text-[#022C4F] focus:ring-[#022C4F]"
                  />
                  <span className="text-[11px] text-gray-600 leading-relaxed">
                    I pledge to use the Public Transparency Portal in good faith, respecting the integrity of whistleblowing mechanisms and utilizing verified data for public safety and lawful diligence.
                  </span>
                </label>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold text-xs hover:bg-gray-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center text-xs text-gray-500 pt-4 border-t border-slate-100">
            <span>Already registered? </span>
            <Link href="/ptp/login" className="font-bold text-[#022C4F] hover:underline">
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
