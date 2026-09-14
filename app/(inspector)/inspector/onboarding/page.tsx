"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Building2,
  MapPin,
  Layers,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Eye,
  Radio,
  FileCheck,
  AlertTriangle,
  Compass,
  Check,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInspectorDashboard, InspectorDashboardData } from "@/services/inspector";

const ONBOARDING_STEPS = [
  { id: 1, title: "Welcome", subtitle: "Inspector Workspace Overview" },
  { id: 2, title: "Agency & District", subtitle: "Regulatory Jurisdiction Scope" },
  { id: 3, title: "Assigned Sites", subtitle: "Active Construction Deployments" },
  { id: 4, title: "Field Workflow", subtitle: "Statutory Check-in & Evidence" },
  { id: 5, title: "Digital Eye", subtitle: "BIM, GPR & Ultrasonic NDT" },
  { id: 6, title: "Ready", subtitle: "Operational Workspace Active" },
];

export default function InspectorOnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [dashboardData, setDashboardData] = useState<InspectorDashboardData | null>(null);

  useEffect(() => {
    getInspectorDashboard().then((data) => setDashboardData(data));
  }, []);

  const handleCompleteOnboarding = () => {
    if (typeof window !== "undefined" && user?.email) {
      localStorage.setItem(`nexucon_onboarding_completed_${user.email.toLowerCase()}`, "true");
    }
    router.push("/inspector/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F181F] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans">
      {/* Top Header & Progress */}
      <header className="max-w-4xl w-full mx-auto pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={130}
              height={36}
              className="h-8 w-auto object-contain"
            />
            <span className="text-[11px] font-mono tracking-wider text-[#022C4F] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase font-bold">
              Orientation
            </span>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="https://nexucon.net/government/login"
              className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-[#022C4F] transition-colors"
            >
              <span>Directorate</span>
              <ExternalLink size={12} />
            </a>
            <div className="text-xs font-mono text-gray-500">
              Step <span className="text-[#022C4F] font-bold">{currentStep}</span> of {ONBOARDING_STEPS.length}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex gap-1">
          {ONBOARDING_STEPS.map((s) => (
            <div
              key={s.id}
              className={`h-full flex-1 transition-all duration-300 ${
                s.id <= currentStep ? "bg-[#022C4F]" : "bg-transparent"
              }`}
            />
          ))}
        </div>
      </header>

      {/* Dynamic Step Content */}
      <main className="max-w-2xl w-full mx-auto my-6">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-10 shadow-xl min-h-[460px] flex flex-col justify-between">
          <AnimatePresence mode="wait">
            {/* STEP 1: Welcome */}
            {currentStep === 1 && (
              <motion.div
                key="step-1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#022C4F] flex items-center justify-center">
                  <ShieldCheck size={30} />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Welcome to Nexucon Field Operations
                  </h1>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Your accredited Inspector Workspace is active. Nexucon connects government technical officers with live field verification, synchronized directly with your supervising Agency Directorate.
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  {[
                    { label: "Assigned Projects", icon: Building2 },
                    { label: "Live Inspections", icon: FileCheck },
                    { label: "Evidence Registry", icon: Layers },
                    { label: "Defect Findings", icon: AlertTriangle },
                    { label: "Digital Eye NDT", icon: Eye },
                    { label: "Statutory Reports", icon: Sparkles },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col gap-2"
                    >
                      <item.icon size={18} className="text-[#022C4F]" />
                      <span className="text-xs font-bold text-gray-800">{item.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 2: Jurisdiction Scope */}
            {currentStep === 2 && (
              <motion.div
                key="step-2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#022C4F] flex items-center justify-center">
                  <Compass size={30} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Jurisdiction & District Isolation
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You operate under Multi-Tenant Scoping boundaries. Your terminal exclusively views and logs data within your assigned district jurisdiction.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Supervising Agency</span>
                    <span className="text-xs font-extrabold text-[#022C4F]">
                      {dashboardData?.profile?.agency || "Lagos State Building Control Agency (LASBCA)"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Zonal Directorate</span>
                    <span className="text-xs font-extrabold text-blue-700">
                      {dashboardData?.profile?.district || "Ikeja North Directorate"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Designated Inspector Badge</span>
                    <span className="text-xs font-mono font-bold text-gray-800">
                      #{dashboardData?.profile?.badge_number || "LAG-INS-042"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Assigned Sites */}
            {currentStep === 3 && (
              <motion.div
                key="step-3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Building2 size={30} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Scoped Project Allocations
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Active construction projects assigned to your inspection team by the Agency Directorate:
                  </p>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {dashboardData?.assigned_projects?.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{p.name}</p>
                        <p className="text-[11px] font-mono text-gray-400">{p.reference_number}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {p.compliance_status || p.current_phase || "Active"}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* STEP 4: Field Workflow */}
            {currentStep === 4 && (
              <motion.div
                key="step-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-[#022C4F] flex items-center justify-center">
                  <FileCheck size={30} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Evidence Integrity & Check-in
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Statutory inspections require on-site presence and cryptographic verification:
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <MapPin size={18} className="text-[#022C4F] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">GNSS / GPS Site Geo-fence Verification</p>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">Check-in occurs within 50m of designated site boundaries.</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
                    <Layers size={18} className="text-[#0284C7] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-gray-900">SHA-256 Hash Tamper-evident Records</p>
                      <p className="text-gray-500 mt-0.5 leading-relaxed">Every captured photo and radar scan is cryptographically signed upon capture.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: Digital Eye */}
            {currentStep === 5 && (
              <motion.div
                key="step-5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center">
                  <Eye size={30} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Digital Eye Multi-Modal Inspection
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    Inspect structural elements non-destructively:
                  </p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-gray-900">GPR Subsurface Radargrams</p>
                    <p className="text-gray-500 mt-0.5">Detect rebar spacing, concrete cover depth, and sub-slab voids.</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                    <p className="font-bold text-gray-900">Ultrasonic Pulse Velocity (UPV)</p>
                    <p className="text-gray-500 mt-0.5">Pundit strength waveform analysis and honeycombing identification.</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 6: Ready */}
            {currentStep === 6 && (
              <motion.div
                key="step-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight mb-2">
                    Terminal Operational & Ready
                  </h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    You have successfully completed orientation. Your field terminal is synchronized with your supervising Agency Directorate.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 text-xs space-y-1">
                  <p className="font-bold text-[#022C4F]">Statutory Authority Granted</p>
                  <p className="text-gray-600">All submissions bear your digital inspector signature and immutable timestamp.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stepper Bottom Controls */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between mt-auto">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-gray-600 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft size={15} />
                <span>Previous</span>
              </button>
            ) : <div />}

            {currentStep < ONBOARDING_STEPS.length ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCompleteOnboarding}
                className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Enter Command Center</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center pt-4 text-xs text-gray-400">
        Nexucon Regulatory & Inspection Platform &bull; Lagos State Building Control Agency
      </footer>
    </div>
  );
}
