"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Country, State, City } from "country-state-city";
import {
  ShieldCheck,
  Building2,
  HardHat,
  Briefcase,
  Users,
  Award,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  UploadCloud,
  FileText,
  Clock,
  Sparkles,
  ArrowRight,
  BellRing,
  Globe2,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { CustomSelect } from "@/components/CustomSelect";

interface OnboardingForm {
  stakeholderRole: "client" | "developer" | "contractor" | "professional" | "consultant";
  fullName: string;
  phone: string;
  jobTitle: string;
  companyName: string;
  registrationNumber: string;
  licenseAuthority: string;
  licenseNumber: string;
  country: string;
  stateRegion: string;
  city: string;
  officeAddress: string;
  projectScaleFocus: "residential" | "commercial" | "infrastructure" | "industrial";
  projectReferenceCode: string;
  notifyInspections: boolean;
  notifyMilestones: boolean;
  notifyFinancials: boolean;
}

const TOTAL_STEPS = 4;

export default function StakeholderOnboarding() {
  const router = useRouter();
  const { user, completeOnboarding, isLoading: authLoading, error: authError } = useAuth();

  const [step, setStep] = useState(0); // 0: Welcome, 1: Identity, 2: Regulatory, 3: Jurisdiction, 4: Linkage
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  const [formData, setFormData] = useState<OnboardingForm>({
    stakeholderRole: "client",
    fullName: "",
    phone: "",
    jobTitle: "",
    companyName: "",
    registrationNumber: "",
    licenseAuthority: "COREN",
    licenseNumber: "",
    country: "NG",
    stateRegion: "Lagos",
    city: "Ikeja",
    officeAddress: "",
    projectScaleFocus: "commercial",
    projectReferenceCode: "",
    notifyInspections: true,
    notifyMilestones: true,
    notifyFinancials: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Prefill user details if already in AuthContext
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "",
      }));
    }
  }, [user]);

  const handleInputChange = (field: keyof OnboardingForm, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "country") {
        next.stateRegion = "";
        next.city = "";
      } else if (field === "stateRegion") {
        next.city = "";
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Location helpers
  const countryOptions = Country.getAllCountries().map((c) => ({ value: c.isoCode, label: c.name }));
  const stateOptions = formData.country
    ? State.getStatesOfCountry(formData.country).map((s) => ({ value: s.name, label: s.name }))
    : [];
  const selectedStateObj = formData.country
    ? State.getStatesOfCountry(formData.country).find((s) => s.name === formData.stateRegion)
    : null;
  const cityOptions =
    formData.country && selectedStateObj
      ? City.getCitiesOfState(formData.country, selectedStateObj.isoCode).map((c) => ({
          value: c.name,
          label: c.name,
        }))
      : [];

  // Step 1 Validation
  const handleNextStep1 = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) errs.fullName = "Full name is required";
    if (!formData.phone.trim()) errs.phone = "Phone number is required";
    if (!formData.jobTitle.trim()) errs.jobTitle = "Official title is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
    } else {
      setStep(2);
    }
  };

  // Step 2 Validation
  const handleNextStep2 = () => {
    const errs: Record<string, string> = {};
    if (!formData.companyName.trim()) errs.companyName = "Company or firm name is required";
    if (!formData.registrationNumber.trim()) errs.registrationNumber = "Registration / CAC number is required";

    if (formData.stakeholderRole === "professional" && !formData.licenseNumber.trim()) {
      errs.licenseNumber = "Professional license number is required";
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
    } else {
      setStep(3);
    }
  };

  // Step 3 Validation
  const handleNextStep3 = () => {
    const errs: Record<string, string> = {};
    if (!formData.country) errs.country = "Country is required";
    if (!formData.stateRegion) errs.stateRegion = "State or region is required";
    if (!formData.officeAddress.trim()) errs.officeAddress = "Office address is required";

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
    } else {
      setStep(4);
    }
  };

  // Final Submission
  const handleCompleteOnboarding = async () => {
    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        portal: "stakeholder",
        stakeholder_type: formData.stakeholderRole,
        company_name: formData.companyName.trim(),
        registration_number: formData.registrationNumber.trim(),
        license_authority: formData.licenseAuthority,
        license_number: formData.licenseNumber.trim(),
        country: formData.country,
        state_region: formData.stateRegion,
        city: formData.city,
        office_address: formData.officeAddress.trim(),
        project_scale_focus: formData.projectScaleFocus,
        project_reference_code: formData.projectReferenceCode.trim(),
        contact_name: formData.fullName.trim(),
        phone: formData.phone.trim(),
        job_title: formData.jobTitle.trim(),
        notifications: {
          inspections: formData.notifyInspections,
          milestones: formData.notifyMilestones,
          financials: formData.notifyFinancials,
        },
      };

      const success = await completeOnboarding(payload);

      if (success) {
        if (typeof window !== "undefined" && user?.email) {
          localStorage.setItem(`nexucon_onboarding_completed_${user.email.toLowerCase()}`, "true");
        }
        setShowCompletionModal(true);
      } else {
        setErrors({ submit: authError || "Failed to complete onboarding. Please try again." });
      }
    } catch (err: any) {
      setErrors({ submit: err?.message || "An unexpected error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    {
      id: "client",
      title: "Client / Project Owner",
      desc: "Command statutory inspections, track stage-gate timelines & settle fees",
      icon: Building2,
      badge: "Primary Control",
    },
    {
      id: "developer",
      title: "Property Developer",
      desc: "Oversee portfolio projects, permit approvals & government compliance",
      icon: Users,
      badge: "Sponsor",
    },
    {
      id: "contractor",
      title: "General / Sub-Contractor",
      desc: "Execute construction phases, request inspections & rectify NCRs",
      icon: HardHat,
      badge: "Execution",
    },
    {
      id: "professional",
      title: "Licensed Professional",
      desc: "COREN/ARCON licensed engineers & architects providing digital signoffs",
      icon: Award,
      badge: "Statutory Seal",
    },
    {
      id: "consultant",
      title: "Advisory Consultant",
      desc: "Specialized geotechnical, EIA environmental & third-party audit firms",
      icon: Briefcase,
      badge: "Advisory",
    },
  ];

  const scaleOptions = [
    { id: "residential", label: "Residential", desc: "Multi-family, estate & private villas" },
    { id: "commercial", label: "Commercial", desc: "High-rise offices, retail & hospitality" },
    { id: "infrastructure", label: "Infrastructure", desc: "Roadways, bridges & municipal utilities" },
    { id: "industrial", label: "Industrial", desc: "Manufacturing, logistics & cold storage" },
  ];

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] flex flex-col font-sans text-slate-800 antialiased">
      {/* Top Regulatory Header */}
      <header className="w-full bg-white border-b border-[#DFDFDF] px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={140}
            height={40}
            className="h-8 w-auto object-contain"
            priority
          />
          <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#022C4F]/10 text-[#022C4F]">
              <ShieldCheck size={13} className="text-[#022C4F]" />
              Stakeholder Onboarding
            </span>
            <span className="text-xs text-gray-400 font-medium">
              Multi-Tenant Zero-Trust RBAC
            </span>
          </div>
        </div>

        {step > 0 && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#022C4F]">Step {step} of {TOTAL_STEPS}</div>
              <div className="text-[11px] text-gray-400 font-medium">
                {step === 1 && "Identity & Role"}
                {step === 2 && "Corporate Credentials"}
                {step === 3 && "Jurisdiction & Scope"}
                {step === 4 && "Project Linkage"}
              </div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    s === step
                      ? "w-8 bg-[#022C4F]"
                      : s < step
                      ? "w-4 bg-emerald-500"
                      : "w-4 bg-gray-200"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {/* ================= STEP 0: Welcome Gateway ================= */}
          {step === 0 && (
            <motion.div
              key="step0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#DFDFDF] p-8 sm:p-12 shadow-sm max-w-3xl mx-auto my-auto text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-[#022C4F]/10 text-[#022C4F] flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={36} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-4">
                <Sparkles size={13} />
                Accreditation & Profile Setup
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#022C4F] mb-4 tracking-tight">
                Welcome to the Stakeholder Portal
              </h1>

              <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-8 font-medium">
                Let&apos;s establish your verified regulatory profile to enable stage inspection requests, timeline synchronization, and statutory fee settlements directly with government agencies.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 text-left">
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#DFDFDF]">
                  <Building2 size={20} className="text-[#022C4F] mb-2" />
                  <div className="text-sm font-bold text-[#022C4F]">Stage Inspections</div>
                  <div className="text-xs text-gray-500 mt-1">Direct request & digital signoff hold-points</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#DFDFDF]">
                  <Clock size={20} className="text-emerald-600 mb-2" />
                  <div className="text-sm font-bold text-[#022C4F]">Timeline Sync</div>
                  <div className="text-xs text-gray-500 mt-1">Multi-party milestone alignment</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#DFDFDF]">
                  <FileText size={20} className="text-amber-600 mb-2" />
                  <div className="text-sm font-bold text-[#022C4F]">Financial Levies</div>
                  <div className="text-xs text-gray-500 mt-1">Statutory fee e-settlement & tax invoices</div>
                </div>
              </div>

              <button
                onClick={() => setStep(1)}
                className="px-8 py-4 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-base font-bold transition-all shadow-md active:scale-[0.99] inline-flex items-center gap-2 cursor-pointer"
              >
                Begin Onboarding
                <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {/* ================= STEP 1: Identity & Stakeholder Role ================= */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#DFDFDF] p-6 sm:p-10 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#022C4F]">
                  Select Stakeholder Role & Personal Identity
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Choose the primary operational role that defines your portal permissions and workflow capabilities.
                </p>
              </div>

              {/* Role Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mb-8">
                {roleOptions.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.stakeholderRole === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleInputChange("stakeholderRole", r.id)}
                      className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? "border-[#022C4F] bg-[#022C4F]/5 shadow-sm"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className={`p-2 rounded-xl ${isSelected ? "bg-[#022C4F] text-white" : "bg-gray-100 text-gray-600"}`}>
                            <Icon size={18} />
                          </div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isSelected ? "bg-[#022C4F] text-white" : "bg-gray-100 text-gray-500"
                          }`}>
                            {r.badge}
                          </span>
                        </div>
                        <div className="text-sm font-bold text-[#022C4F]">{r.title}</div>
                        <div className="text-xs text-gray-500 mt-1 leading-relaxed">{r.desc}</div>
                      </div>

                      <div className="mt-4 flex items-center justify-end">
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? "border-[#022C4F]" : "border-gray-300"
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-[#022C4F]" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Personal Details Form */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Official Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange("fullName", e.target.value)}
                    placeholder="e.g. Engr. Babatunde Adeleke"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.fullName ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.fullName && <p className="text-[11px] text-red-500 mt-1">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Direct Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="+234 802 345 6789"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.phone ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.phone && <p className="text-[11px] text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Official Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.jobTitle}
                    onChange={(e) => handleInputChange("jobTitle", e.target.value)}
                    placeholder="e.g. Managing Director / Principal Engineer"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.jobTitle ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.jobTitle && <p className="text-[11px] text-red-500 mt-1">{errors.jobTitle}</p>}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep1}
                  className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  Continue to Credentials
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: Corporate & Regulatory Credentials ================= */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#DFDFDF] p-6 sm:p-10 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#022C4F]">
                  Corporate & Regulatory Credentials
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Provide your official corporate registration and statutory professional licensing credentials.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Company / Firm Name *
                  </label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => handleInputChange("companyName", e.target.value)}
                    placeholder="e.g. Apex Civil Engineering Ltd"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.companyName ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.companyName && <p className="text-[11px] text-red-500 mt-1">{errors.companyName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    CAC / Business Registration Number *
                  </label>
                  <input
                    type="text"
                    value={formData.registrationNumber}
                    onChange={(e) => handleInputChange("registrationNumber", e.target.value)}
                    placeholder="e.g. RC-1928471 or BN-829104"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.registrationNumber ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.registrationNumber && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.registrationNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Regulatory Authority / Licensing Body
                  </label>
                  <CustomSelect
                    options={[
                      { value: "COREN", label: "COREN (Council for Regulation of Engineering in Nigeria)" },
                      { value: "ARCON", label: "ARCON (Architects Registration Council of Nigeria)" },
                      { value: "CORBON", label: "CORBON (Council of Registered Builders of Nigeria)" },
                      { value: "TOPREC", label: "TOPREC (Town Planners Registration Council)" },
                      { value: "NIA", label: "NIA (Nigerian Institute of Architects)" },
                      { value: "OTHER", label: "Other Statutory Authority" },
                    ]}
                    value={formData.licenseAuthority}
                    onChange={(val) => handleInputChange("licenseAuthority", val)}
                    placeholder="Select Licensing Authority"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                    Regulatory Seal / License Number {formData.stakeholderRole === "professional" && "*"}
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => handleInputChange("licenseNumber", e.target.value)}
                    placeholder="e.g. R.18492 or ARCON/2022/948"
                    className={`w-full px-3.5 py-2.5 rounded-xl border ${
                      errors.licenseNumber ? "border-red-500" : "border-gray-300"
                    } text-sm focus:outline-none focus:border-[#022C4F]`}
                  />
                  {errors.licenseNumber && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.licenseNumber}</p>
                  )}
                </div>
              </div>

              {/* Upload Certificate Simulation */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                  Statutory Certificate / CAC Document (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 hover:border-[#022C4F] rounded-2xl p-6 text-center cursor-pointer transition-colors bg-[#FAFAFA]">
                  <input
                    type="file"
                    id="doc-upload"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadedFileName(e.target.files[0].name);
                      }
                    }}
                  />
                  <label htmlFor="doc-upload" className="cursor-pointer">
                    <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
                    {uploadedFileName ? (
                      <div className="flex items-center justify-center gap-2 text-sm font-bold text-emerald-600">
                        <CheckCircle2 size={16} />
                        {uploadedFileName} (Ready for submission)
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-bold text-[#022C4F]">
                          Click to upload or drag & drop certificate
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          PDF, JPG, PNG up to 10MB (CAC certificate, COREN seal, or Tax Clearance)
                        </div>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep2}
                  className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  Continue to Jurisdiction
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: Operating Jurisdiction & Scale ================= */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#DFDFDF] p-6 sm:p-10 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#022C4F]">
                  Operating Jurisdiction & Project Scale
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Specify the geographic location and primary construction scale your organization undertakes.
                </p>
              </div>

              {/* Location Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">Country *</label>
                  <CustomSelect
                    options={countryOptions}
                    value={formData.country}
                    onChange={(val) => handleInputChange("country", val)}
                    placeholder="Select Country"
                  />
                  {errors.country && <p className="text-[11px] text-red-500 mt-1">{errors.country}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">State / Region *</label>
                  <CustomSelect
                    options={stateOptions}
                    value={formData.stateRegion}
                    onChange={(val) => handleInputChange("stateRegion", val)}
                    placeholder="Select State"
                  />
                  {errors.stateRegion && <p className="text-[11px] text-red-500 mt-1">{errors.stateRegion}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#022C4F] mb-1.5">City / LGA</label>
                  <CustomSelect
                    options={cityOptions}
                    value={formData.city}
                    onChange={(val) => handleInputChange("city", val)}
                    placeholder="Select City"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
                  Headquarters / Field Office Address *
                </label>
                <input
                  type="text"
                  value={formData.officeAddress}
                  onChange={(e) => handleInputChange("officeAddress", e.target.value)}
                  placeholder="e.g. 14 Marina Road, Lagos Island, Lagos State"
                  className={`w-full px-3.5 py-2.5 rounded-xl border ${
                    errors.officeAddress ? "border-red-500" : "border-gray-300"
                  } text-sm focus:outline-none focus:border-[#022C4F]`}
                />
                {errors.officeAddress && <p className="text-[11px] text-red-500 mt-1">{errors.officeAddress}</p>}
              </div>

              {/* Project Scale Focus */}
              <div className="mb-8">
                <label className="block text-xs font-bold text-[#022C4F] mb-2.5">
                  Primary Project Scale Focus
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {scaleOptions.map((s) => {
                    const isSelected = formData.projectScaleFocus === s.id;
                    return (
                      <div
                        key={s.id}
                        onClick={() => handleInputChange("projectScaleFocus", s.id as any)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#022C4F] bg-[#022C4F]/5 shadow-sm"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-[#022C4F]">{s.label}</span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? "border-[#022C4F]" : "border-gray-300"
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F]" />}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500">{s.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleNextStep3}
                  className="px-6 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-1.5 shadow-sm"
                >
                  Continue to Linkage
                  <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 4: Project Linkage & Notifications ================= */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-3xl border border-[#DFDFDF] p-6 sm:p-10 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-[#022C4F]">
                  Project Linkage & Statutory Sync
                </h2>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Link an existing development project and configure statutory notification channels.
                </p>
              </div>

              {/* Project Reference Code */}
              <div className="mb-6 p-4 rounded-2xl bg-[#FAFAFA] border border-[#DFDFDF]">
                <div className="flex items-center gap-2 mb-2">
                  <Compass size={18} className="text-[#022C4F]" />
                  <label className="text-xs font-bold text-[#022C4F]">
                    Existing Project Reference Code (Optional)
                  </label>
                </div>
                <input
                  type="text"
                  value={formData.projectReferenceCode}
                  onChange={(e) => handleInputChange("projectReferenceCode", e.target.value)}
                  placeholder="e.g. PRJ-2026-081 or DEV-904"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:border-[#022C4F] bg-white uppercase tracking-wider font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1.5">
                  If you have an existing permit application or registered project with a government agency, entering the code automatically associates your account.
                </p>
              </div>

              {/* Notification Toggles */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <BellRing size={18} className="text-[#022C4F]" />
                  <span className="text-xs font-bold text-[#022C4F]">
                    Statutory Alert Preferences
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <div className="text-xs font-bold text-[#022C4F]">Building Stage Inspection Updates</div>
                      <div className="text-[11px] text-gray-500">Real-time alerts when inspectors are dispatched or NCRs are logged</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifyInspections}
                      onChange={(e) => handleInputChange("notifyInspections", e.target.checked)}
                      className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <div className="text-xs font-bold text-[#022C4F]">Project Timeline & Hold-Point Sync</div>
                      <div className="text-[11px] text-gray-500">Notifications when milestone approvals or statutory gate-holds change</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifyMilestones}
                      onChange={(e) => handleInputChange("notifyMilestones", e.target.checked)}
                      className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
                    <div>
                      <div className="text-xs font-bold text-[#022C4F]">Financial Levies & Invoices</div>
                      <div className="text-[11px] text-gray-500">Instant alerts for statutory assessment notices and receipt confirmations</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.notifyFinancials}
                      onChange={(e) => handleInputChange("notifyFinancials", e.target.checked)}
                      className="w-4 h-4 rounded text-[#022C4F] focus:ring-[#022C4F]"
                    />
                  </label>
                </div>
              </div>

              {errors.submit && (
                <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-600 font-medium">
                  {errors.submit}
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors inline-flex items-center gap-1.5"
                >
                  <ChevronLeft size={16} />
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleCompleteOnboarding}
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all inline-flex items-center gap-2 shadow-md active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Activating Stakeholder Account...
                    </>
                  ) : (
                    <>
                      Complete Onboarding
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ================= Completion Modal ================= */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl border border-[#DFDFDF] p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} />
            </div>

            <h3 className="text-2xl font-extrabold text-[#022C4F] mb-2">
              Onboarding Complete!
            </h3>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Your stakeholder account has been accredited. You are now configured with full access to stage inspections, timeline controls, and statutory financial activities.
            </p>

            <div className="p-4 rounded-2xl bg-[#FAFAFA] border border-[#DFDFDF] text-left mb-6 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Organization:</span>
                <span className="font-bold text-[#022C4F]">{formData.companyName || "Personal Practice"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Role:</span>
                <span className="font-bold text-[#022C4F] capitalize">{formData.stakeholderRole}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Accreditation:</span>
                <span className="font-bold text-emerald-600">Active & Verified</span>
              </div>
            </div>

            <button
              onClick={() => router.push("/stakeholder")}
              className="w-full py-3.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-sm font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer inline-flex items-center justify-center gap-2"
            >
              Enter Stakeholder Portal
              <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
