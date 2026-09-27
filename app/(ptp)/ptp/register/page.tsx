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

    // Store local profile and credentials
    const credentials = {
      email: cleanEmail,
      password: formData.password,
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="fixed inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#022C4F_1px,transparent_1px)] [background-size:20px_20px]" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
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
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Civic Transparency Network</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight">
            Register as a Civic Monitor
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Join thousands of Lagos residents safeguarding building standards &amp; statutory compliance
          </p>
        </div>

        {/* Progress Stepper Bar */}
        <div className="mt-6 max-w-md mx-auto flex items-center justify-between px-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  step === s
                    ? "bg-[#022C4F] text-white ring-4 ring-blue-100"
                    : step > s
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step > s ? <CheckCircle2 size={16} /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-12 sm:w-16 h-1 mx-1 rounded transition-colors ${
                    step > s ? "bg-emerald-600" : "bg-slate-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 bg-white py-8 px-6 shadow-xl shadow-slate-200/60 sm:rounded-2xl sm:px-10 border border-slate-200">
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: IDENTITY */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#022C4F]">Step 1: Your Identity</h3>
                <p className="text-xs text-slate-500">Provide your basic contact details to establish civic accountability.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Legal Name
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Babatunde Adeleke"
                    className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
              </div>

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
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="e.g. b.adeleke@lagos.org"
                    className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="e.g. +234 802 345 6789"
                    className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleStep1Next}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#022C4F] text-white font-bold text-xs sm:text-sm hover:bg-[#033E6E] transition-all cursor-pointer"
                >
                  <span>Continue to Role Selection</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#022C4F]">Step 2: How Will You Use the Portal?</h3>
                <p className="text-xs text-slate-500">Select the persona that best describes your monitoring goals.</p>
              </div>

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
                          : "border-slate-200 hover:border-slate-300 bg-white"
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
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{role.title}</h4>
                          {isSelected && <CheckCircle2 size={16} className="text-[#022C4F] shrink-0" />}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{role.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleStep2Next}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#022C4F] text-white font-bold text-xs sm:text-sm hover:bg-[#033E6E] transition-all cursor-pointer"
                >
                  <span>Continue to Location</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: LOCATION FOCUS */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#022C4F]">Step 3: Primary Monitored Location</h3>
                <p className="text-xs text-slate-500">Pick your primary Local Government Area for customized alerts.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Local Government Area (LGA)
                </label>
                <select
                  value={formData.primaryLga}
                  onChange={(e) => handleInputChange("primaryLga", e.target.value)}
                  className="block w-full py-3 px-3.5 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F] bg-white"
                >
                  {LAGOS_LGAS.map((lga) => (
                    <option key={lga} value={lga}>
                      {lga}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Neighborhood / Street / Estate Name
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <MapPin size={16} />
                  </div>
                  <input
                    type="text"
                    value={formData.neighborhood}
                    onChange={(e) => handleInputChange("neighborhood", e.target.value)}
                    placeholder="e.g. Lekki Phase 1 / Admiralty Way"
                    className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                  />
                </div>
                <p className="mt-1 text-[11px] text-slate-500">
                  This will set your default dashboard map viewport and local safety bulletins.
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleStep3Next}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#022C4F] text-white font-bold text-xs sm:text-sm hover:bg-[#033E6E] transition-all cursor-pointer"
                >
                  <span>Continue to Security</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: PASSWORD & CIVIC OATH */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-[#022C4F]">Step 4: Secure Your Account</h3>
                <p className="text-xs text-slate-500">Set a password to manage your civic watchlist and report tokens.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    placeholder="At least 6 characters"
                    className="block w-full pl-10 pr-10 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
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

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    placeholder="Re-enter your password"
                    className="block w-full pl-10 pr-3.5 py-3 border border-slate-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
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
                  <span className="text-[11px] text-slate-600 leading-relaxed">
                    I pledge to use the Public Transparency Portal in good faith, respecting the integrity of whistleblowing mechanisms and utilizing verified data for public safety and lawful diligence.
                  </span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Registering...</span>
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

          <div className="mt-6 text-center text-xs text-slate-600 pt-4 border-t border-slate-100">
            <span>Already registered? </span>
            <Link href="/ptp/login" className="font-bold text-[#022C4F] hover:text-blue-700 underline">
              Sign In to Your Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
