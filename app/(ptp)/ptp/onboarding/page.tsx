"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Bell,
  MapPin,
  Building2,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileCheck2,
  QrCode,
  Award
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const AVAILABLE_LGAS = [
  { id: "eti_osa", name: "Eti-Osa (Ikoyi, Victoria Island, Lekki)" },
  { id: "ikeja", name: "Ikeja (GRA, Alausa, Ikeja Central)" },
  { id: "lagos_island", name: "Lagos Island (Marina, CMS, Broad St)" },
  { id: "ibeju_lekki", name: "Ibeju-Lekki (Free Trade Zone, Eleko)" },
  { id: "surulere", name: "Surulere (Bode Thomas, Stadium)" },
  { id: "lagos_mainland", name: "Lagos Mainland (Yaba, Ebute Metta)" },
  { id: "kosofe", name: "Kosofe (Magodo, Ogudu, Ojota)" },
  { id: "alimosho", name: "Alimosho (Egbeda, Ipaja, Igando)" },
];

export default function PtpOnboardingPage() {
  const router = useRouter();
  const { user, completeOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [selectedLgas, setSelectedLgas] = useState<string[]>(["eti_osa", "ikeja"]);
  const [alerts, setAlerts] = useState({
    stopWorkOrders: true,
    newApprovals: true,
    stageCompletions: true,
    whistleblowerUpdates: true,
  });

  const [monitorId, setMonitorId] = useState("PTP-2026-8841");

  useEffect(() => {
    // Generate unique monitor ID
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setMonitorId(`PTP-2026-${randomNum}`);
  }, []);

  const toggleLga = (lgaId: string) => {
    setSelectedLgas((prev) =>
      prev.includes(lgaId) ? prev.filter((id) => id !== lgaId) : [...prev, lgaId]
    );
  };

  const handleFinish = async () => {
    const cleanEmail = user?.email?.toLowerCase() || "citizen@nexucon.net";

    if (typeof window !== "undefined") {
      localStorage.setItem(`nexucon_onboarding_completed_${cleanEmail}`, "true");
      localStorage.setItem(
        `ptp_preferences_${cleanEmail}`,
        JSON.stringify({
          selectedLgas,
          alerts,
          monitorId,
          completedAt: new Date().toISOString(),
        })
      );
    }

    try {
      await completeOnboarding({
        is_onboarded: true,
        selected_lgas: selectedLgas,
        monitor_id: monitorId,
      });
    } catch {
      // Local fallback handles redirection smoothly
    }

    router.push("/ptp/dashboard");
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans bg-[#DFDFDF]">
      {/* Background Image with Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-[#022C4F]/85 backdrop-blur-[2px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/transparency" className="inline-block mb-3">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Crest"
              width={160}
              height={48}
              className="h-10 w-auto mx-auto object-contain brightness-0 invert"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-300/30 text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">
            <Sparkles size={14} className="text-blue-300" />
            <span>Civic Monitor Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Set Up Your Monitoring Workspace
          </h1>
          <p className="text-xs sm:text-sm text-white/80 mt-1">
            Personalize your statutory alert feeds, monitored LGAs, and civic credentials
          </p>
        </div>

        {/* Stepper Dots */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2, 3].map((i) => (
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
              {i < 3 && <div className={`w-8 h-0.5 ${step > i ? "bg-emerald-400" : "bg-white/20"}`} />}
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-gray-100">
          {/* STEP 1: WELCOME & CIVIC ORIENTATION */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#022C4F] flex items-center justify-center">
                <ShieldCheck size={32} />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#022C4F]">
                  Welcome to the Lagos Civic Transparency Network
                </h2>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                  As an accredited civic user, you hold statutory oversight tools designed to eliminate unpermitted construction, illegal extra storeys, and building collapse hazards across Lagos State.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                  <FileCheck2 size={20} className="text-[#022C4F] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#022C4F]">Cryptographic Verification</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Verify genuine LASPPPA planning permit seals and stage clearances in real time.
                    </p>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-start">
                  <ShieldAlert size={20} className="text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-[#022C4F]">Direct Tip-off Channel</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Safely submit geotagged violation tip-offs routed directly to zonal LASBCA teams.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all cursor-pointer shadow-md"
                >
                  <span>Configure Watchlist &amp; Alerts</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: CONFIGURE WATCHLIST & ALERTS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-extrabold text-[#022C4F]">Select LGAs of Interest</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the Local Government Areas you want to track on your dashboard map and feed.
                </p>
              </div>

              {/* LGA Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_LGAS.map((lga) => {
                  const isChecked = selectedLgas.includes(lga.id);
                  return (
                    <div
                      key={lga.id}
                      onClick={() => toggleLga(lga.id)}
                      className={`p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all flex items-center justify-between ${
                        isChecked
                          ? "border-[#022C4F] bg-blue-50/70 text-[#022C4F] font-bold"
                          : "border-gray-200 hover:border-gray-300 text-gray-700 bg-white"
                      }`}
                    >
                      <span className="truncate pr-2">{lga.name}</span>
                      {isChecked ? (
                        <CheckCircle2 size={16} className="text-[#022C4F] shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Alert Toggles */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-3">
                  Instant Notification Triggers
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-slate-50">
                    <div>
                      <div className="text-xs font-bold text-gray-800">
                        Stop-Work Orders &amp; Sealing Bulletins
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Immediate alert when a site is sanctioned in your monitored LGAs
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={alerts.stopWorkOrders}
                      onChange={(e) => setAlerts((p) => ({ ...p, stopWorkOrders: e.target.checked }))}
                      className="rounded text-[#022C4F] focus:ring-[#022C4F] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-slate-50">
                    <div>
                      <div className="text-xs font-bold text-gray-800">
                        New Statutory Approvals
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Get notified when newly gazetted planning permits are registered
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={alerts.newApprovals}
                      onChange={(e) => setAlerts((p) => ({ ...p, newApprovals: e.target.checked }))}
                      className="rounded text-[#022C4F] focus:ring-[#022C4F] w-4 h-4 cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer p-2.5 rounded-xl hover:bg-slate-50">
                    <div>
                      <div className="text-xs font-bold text-gray-800">
                        Stage Completion Milestones
                      </div>
                      <div className="text-[11px] text-gray-500">
                        Foundation depth, concrete cube test results, and roofing passes
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={alerts.stageCompletions}
                      onChange={(e) => setAlerts((p) => ({ ...p, stageCompletions: e.target.checked }))}
                      className="rounded text-[#022C4F] focus:ring-[#022C4F] w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
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
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all cursor-pointer shadow-md"
                >
                  <span>Generate Monitor Pass</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: DIGITAL CIVIC MONITOR PASS */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-2">
                  <Award size={24} />
                </div>
                <h2 className="text-xl font-extrabold text-[#022C4F]">Your Civic Monitor Pass is Ready</h2>
                <p className="text-xs text-gray-500 mt-1">
                  This digital credential identifies your active participation in public building safety.
                </p>
              </div>

              {/* Digital Pass Card */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-[#022C4F] to-[#044B84] text-white shadow-xl relative overflow-hidden border border-cyan-500/30">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex items-center justify-between pb-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={20} className="text-cyan-400" />
                    <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-200">
                      Lagos State PTP
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-400/30">
                    Active Observer
                  </span>
                </div>

                <div className="my-6 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] uppercase text-cyan-200/80 font-bold tracking-wider">
                      Civic Monitor Name
                    </div>
                    <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                      {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : "Citizen Observer"}
                    </div>
                    <div className="text-xs text-cyan-200/90 mt-1 flex items-center gap-1.5">
                      <MapPin size={12} className="text-cyan-400" />
                      <span>{selectedLgas.length} Monitored LGAs Active</span>
                    </div>
                  </div>

                  <div className="bg-white p-2 rounded-xl text-slate-900 text-center shrink-0">
                    <QrCode size={48} className="text-[#022C4F]" />
                    <span className="text-[8px] font-mono font-bold block mt-1">VERIFIED</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-cyan-200/80">
                  <span>Monitor ID: <strong className="text-white font-mono">{monitorId}</strong></span>
                  <span>Valid: <strong className="text-white">2026/2027</strong></span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
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
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Launch My Transparency Dashboard</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
