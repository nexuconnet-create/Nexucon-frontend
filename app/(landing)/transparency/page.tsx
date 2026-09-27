"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  Building2,
  FileCheck2,
  MapPin,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Search,
  Lock,
  Compass,
  Users,
  Eye,
  FileText,
  BarChart3,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Shield,
  Clock,
  Send,
  Zap,
} from 'lucide-react';
import { useLanguage } from '@/components/transparency/LanguageContext';

export default function PublicTransparencyInfoPage() {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "What is the Nexucon Public Transparency Portal (PTP)?",
      a: "The PTP is an open-access civic technology initiative deployed in partnership with Lagos State physical planning and building control frameworks (LASPPPA & LASBCA). It gives citizens, real estate buyers, community associations, and civic monitors transparent access to verified building approvals, construction stage certifications, and safety audit logs across Lagos State.",
    },
    {
      q: "Why do I need to register or sign in to the portal?",
      a: "While basic public searches can be performed, creating a free Citizen or Monitor account unlocks your personalized monitoring dashboard. With an account, you can subscribe to real-time alerts for developments in your Local Government Area (LGA), save properties to your watchlist, verify certificate cryptographic hashes, and track the investigation status of violation reports you submit.",
    },
    {
      q: "Can developers or contractors alter the inspection records shown here?",
      a: "No. All stage approvals, inspection reports, and compliance certificates are signed digitally by registered LASBCA inspectors and licensed engineers. The audit trail is immutable, meaning stage passes or stop-work sanctions cannot be altered or deleted by developers.",
    },
    {
      q: "How does the anonymous violation reporting (whistleblower) system work?",
      a: "When you report an unpermitted floor, structural crack, or ignored stop-work seal through the portal, your submission can be made 100% anonymously. All personal metadata is stripped, and the geotagged evidence is immediately routed to the zonal LASBCA rapid-response enforcement unit.",
    },
    {
      q: "Is there any subscription or access fee for the public?",
      a: "No. Civic transparency and public building safety are constitutional rights under Lagos State planning laws. The Public Transparency Portal is completely free for all citizens, researchers, community leaders, and prospective buyers.",
    },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFC] text-[#0F181F] flex flex-col font-sans">
      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#022C4F] via-[#033E6E] to-[#022C4F] text-white pt-16 pb-24 lg:pt-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
          {/* Subtle background grid & glowing ornaments */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Top pill badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs sm:text-sm font-medium text-cyan-200 mb-8 shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Official Civic Open Data & Statutory Building Safety Initiative</span>
            </div>

            {/* Main title */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight mb-6">
              Democratizing Building Safety &amp; Statutory Transparency in Lagos
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-200 max-w-3xl mx-auto leading-relaxed mb-10">
              A unified, civic-first transparency portal empowering citizens, real estate investors, and community watchdogs to verify building permits, track structural stage approvals, and protect our communities from unpermitted developments.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto sm:max-w-none">
              <Link
                href="/ptp/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-[#022C4F] font-bold text-base shadow-xl shadow-cyan-900/30 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>Enter Transparency Dashboard</span>
                <ArrowRight size={18} />
              </Link>

              <Link
                href="/ptp/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base backdrop-blur-md transition-all hover:scale-[1.02] cursor-pointer"
              >
                <Users size={18} className="text-cyan-300" />
                <span>Register as Citizen / Monitor</span>
              </Link>
            </div>

            {/* Direct Verification Quick Link */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs sm:text-sm text-cyan-200/80">
              <ShieldCheck size={16} className="text-emerald-400" />
              <span>Have a permit number or QR code?</span>
              <Link href="/ptp/login?redirect=/ptp/dashboard/verify" className="underline text-white font-medium hover:text-cyan-300">
                Jump directly to the Verification Desk
              </Link>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="max-w-6xl mx-auto mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-extrabold text-white">1,248+</div>
              <div className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-medium">Permitted Sites Tracked</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-extrabold text-white">4,890+</div>
              <div className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-medium">Stage Audits Logged</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-extrabold text-emerald-400">20 LGAs</div>
              <div className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-medium">Statewide Coverage</div>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
              <div className="text-2xl sm:text-4xl font-extrabold text-cyan-300">100% Free</div>
              <div className="text-xs sm:text-sm text-cyan-200/90 mt-1 font-medium">Civic Open Access</div>
            </div>
          </div>
        </section>

        {/* WHY TRANSPARENCY MATTERS */}
        <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
              The Mission
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022C4F] tracking-tight">
              Why Public Building Transparency Matters in Lagos
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Urban growth in Lagos demands modern, accessible oversight. Unapproved extra storeys, falsified permits, and rogue contractors jeopardize public safety and property capital.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mb-6">
                <AlertTriangle size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Preventing Structural Catastrophes</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                By publishing verified stage inspections—from soil tests and foundation depth to concrete cube tests and superstructure sign-offs—citizens and neighbors can spot structural irregularities before disasters occur.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#022C4F] flex items-center justify-center mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Protecting Property Buyers &amp; Tenants</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Before paying deposits on off-plan or newly completed developments, prospective homeowners can independently verify whether the development has genuine LASPPPA planning approval and certified occupancy permits.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Users size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Empowering Community Watchdogs</h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                Community Development Associations (CDAs) and civic journalists receive direct, unfiltered intelligence on zoning adherence, drainage setbacks, and immediate notifications of any Stop-Work orders issued in their area.
              </p>
            </div>
          </div>
        </section>

        {/* 4 CORE PILLARS OF THE PORTAL */}
        <section id="features" className="py-20 bg-slate-100 border-y border-slate-200 px-4 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-bold uppercase tracking-wider mb-3">
                Key Features
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-[#022C4F] tracking-tight">
                Streamlined Tools Inside Your Civic Dashboard
              </h2>
              <p className="mt-4 text-slate-600 text-base sm:text-lg">
                Once logged in, citizens and monitors have access to an institutional-grade control center matching the official regulatory systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#022C4F] flex items-center justify-center mb-4">
                    <Search size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Project Registry</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Search developments across all 20 LGAs by permit reference, developer identity, contractor, or street address. View approved floors and zoning limits.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-blue-700">
                  <span>Explore Search &amp; Filters</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                    <FileCheck2 size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">QR &amp; Certificate Verify</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Instantly authenticate building approval certificates and stage clearances by inputting the reference or verifying the cryptographic hash.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-emerald-700">
                  <span>Cryptographic Verification</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                    <Compass size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">GIS Safety Map</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Interactive geo-spatial map showing zoned construction sites, active Stop-Work seals, flood-risk setbacks, and high-density developments.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-amber-700">
                  <span>Open Spatial Map</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>

              {/* Feature 4 */}
              <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-cyan-500 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center mb-4">
                    <Send size={24} />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2">Whistleblower Reports</h4>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Safely report unapproved height additions, missing safety netting, or midnight construction work. Receive an anonymous tracking token for follow-up.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-xs font-bold text-red-700">
                  <span>Anonymous Reporting</span>
                  <ChevronRight size={14} className="ml-1" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS: THE 3-STEP USER ONBOARDING */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-3">
              Simple Workflow
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-[#022C4F] tracking-tight">
              How the Public Portal Works
            </h2>
            <p className="mt-4 text-slate-600 text-base sm:text-lg">
              Get onboarded in under two minutes to start monitoring your community’s building landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-[#022C4F] text-white font-black text-sm flex items-center justify-center mb-6">
                1
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Create Your Account</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Register as a resident, prospective buyer, or civic observer. Quick verification ensures credible community oversight.
              </p>
              <div className="text-xs text-blue-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Takes less than 60 seconds
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-cyan-600 text-white font-black text-sm flex items-center justify-center mb-6">
                2
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Complete Onboarding</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Select your primary Local Government Area (LGA) and choose what safety bulletins and stage completions trigger alerts for you.
              </p>
              <div className="text-xs text-cyan-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Custom LGA Watchlists
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm relative">
              <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-black text-sm flex items-center justify-center mb-6">
                3
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Access Streamlined Dashboard</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                Interact with the complete suite: live project status feeds, statutory notices, interactive map, and instant QR verification.
              </p>
              <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 size={14} /> Real-time regulatory feed
              </div>
            </div>
          </div>

          {/* Action button beneath steps */}
          <div className="mt-12 text-center">
            <Link
              href="/ptp/register"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white font-bold text-sm shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Start Free Registration</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* REGULATORY COLLABORATION BANNER */}
        <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Shield size={16} className="text-[#022C4F]" />
                <span>Statutory Standards &amp; Interoperability</span>
              </div>
              <h3 className="text-2xl font-bold text-[#022C4F]">
                Aligned with Lagos State Urban Planning &amp; Building Control Laws
              </h3>
              <p className="text-slate-600 text-sm mt-3 leading-relaxed">
                Nexucon interfaces with state planning frameworks including the Lagos State Physical Planning Permit Authority (LASPPPA) and the Lagos State Building Control Agency (LASBCA) to provide authenticated, verified stage audit records to the public.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-4 shrink-0">
              <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-800">LASPPPA</div>
                <div className="text-[10px] text-slate-500">Planning Permits</div>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-800">LASBCA</div>
                <div className="text-[10px] text-slate-500">Building Control</div>
              </div>
              <div className="px-5 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                <div className="text-xs font-bold text-slate-800">COREN</div>
                <div className="text-[10px] text-slate-500">Engineering Standards</div>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto scroll-mt-20">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-bold uppercase tracking-wider mb-3">
              FAQ
            </div>
            <h2 className="text-3xl font-black text-[#022C4F] tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              Everything you need to know about civic building monitoring and statutory verification.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-blue-900 transition-colors"
                  >
                    <span className="text-base sm:text-lg">{faq.q}</span>
                    <ChevronDown
                      size={20}
                      className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* FINAL CALL TO ACTION BANNER */}
        <section className="py-20 bg-gradient-to-r from-[#022C4F] to-[#044B84] text-white px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
          <div className="relative max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6">
              Ready to Access Verified Building Intelligence?
            </h2>
            <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto mb-10 leading-relaxed">
              Join thousands of Lagos residents, homeowners, and civic observers who rely on the Nexucon Public Transparency Portal for building safety.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/ptp/login"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-[#022C4F] font-bold text-base shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
              >
                Sign In to Dashboard
              </Link>
              <Link
                href="/ptp/register"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base transition-all hover:scale-[1.02] cursor-pointer"
              >
                Create Free Citizen Account
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
