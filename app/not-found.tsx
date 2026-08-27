"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, Home, Building2, HardHat, 
  Briefcase, Search, ShieldAlert, Sparkles, HelpCircle,
  ChevronRight, MapPin, Layers, Compass, FileText
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthModalProvider } from "@/components/AuthModalContext";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const query = searchQuery.toLowerCase().trim();
    if (query.includes("gov") || query.includes("permit") || query.includes("inspect")) {
      router.push("/government/dashboard");
    } else if (query.includes("pro") || query.includes("bim") || query.includes("draw")) {
      router.push("/professional/dashboard");
    } else if (query.includes("client") || query.includes("project")) {
      router.push("/client/dashboard");
    } else {
      router.push(`/home?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const portalShortcuts = [
    {
      title: "Government & Regulatory Portal",
      subtitle: "State Planning, Permits & Inspection Controls",
      description: "Manage statutory building clearances, inspections, GIS telemetry & city compliance.",
      href: "/government/dashboard",
      icon: Building2,
      badge: "Government",
      badgeStyle: "bg-blue-50 text-[#022C4F] border-blue-200",
      accentBorder: "hover:border-[#022C4F]"
    },
    {
      title: "Professional & Contractor Hub",
      subtitle: "Engineers, Architects & Surveyors",
      description: "Access BIM models, clash detection, site alignment, project deliverables & drawings.",
      href: "/professional/dashboard",
      icon: HardHat,
      badge: "Professionals",
      badgeStyle: "bg-amber-50 text-amber-900 border-amber-200",
      accentBorder: "hover:border-amber-500"
    },
    {
      title: "Client & Developer Suite",
      subtitle: "Real Estate Developers & Project Owners",
      description: "Track project milestones, financial disbursements, peer reviews & contractor handoffs.",
      href: "/client/dashboard",
      icon: Briefcase,
      badge: "Clients",
      badgeStyle: "bg-emerald-50 text-emerald-900 border-emerald-200",
      accentBorder: "hover:border-emerald-500"
    }
  ];

  return (
    <AuthModalProvider>
      <div className="flex flex-col min-h-screen bg-[#F8FAFC] text-[#0F181F] font-sans antialiased selection:bg-[#022C4F] selection:text-white">
        <Navbar />

        <main className="flex-grow flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative overflow-hidden">
          {/* Subtle Blueprint & Dot Grid Background */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-40"
            style={{
              backgroundImage: `
                radial-gradient(#022C4F 0.75px, transparent 0.75px),
                linear-gradient(to right, #E2E8F0 1px, transparent 1px),
                linear-gradient(to bottom, #E2E8F0 1px, transparent 1px)
              `,
              backgroundSize: '32px 32px, 64px 64px, 64px 64px'
            }}
          />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-1/4 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-5xl mx-auto w-full text-center flex flex-col items-center">
            
            {/* Top Logo & Status Pill */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center gap-3 mb-6"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-xs font-semibold text-[#022C4F]">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="font-bold">Error 404</span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-gray-600">Blueprint / Resource Not Located</span>
              </div>
            </motion.div>

            {/* Central Graphic / 404 Headline */}
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="relative mb-6"
            >
              <div className="text-[90px] sm:text-[140px] md:text-[170px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#022C4F] via-[#0b487c] to-[#0F181F]/40 select-none">
                404
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-3xl bg-white/95 border border-blue-100 shadow-2xl flex items-center justify-center text-[#022C4F] backdrop-blur-md">
                  <Compass size={44} className="text-[#022C4F] animate-spin-slow" />
                </div>
              </div>
            </motion.div>

            {/* Main Text Content */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.2 }}
              className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#022C4F] tracking-tight mb-4 max-w-2xl"
            >
              We Couldn&apos;t Locate That Blueprint or Page
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.25 }}
              className="text-sm sm:text-base text-[#0F181F]/70 max-w-lg mb-8 leading-relaxed font-medium"
            >
              The address you entered might have been moved, archived, or is currently off-grid. Use the search bar or portal links below to get back on track.
            </motion.p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
              onSubmit={handleSearch}
              className="w-full max-w-md mb-8 relative"
            >
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, permits, BIM models, or portals..."
                className="w-full h-12 pl-11 pr-24 rounded-2xl bg-white border border-gray-200 text-xs font-semibold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F] focus:border-transparent shadow-sm"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#022C4F] hover:bg-[#011b30] text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Search
              </button>
            </motion.form>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-3.5 mb-14"
            >
              <button
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl bg-white hover:bg-gray-50 text-[#022C4F] border border-gray-200 text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer hover:border-gray-300"
              >
                <ArrowLeft size={16} /> Return to Previous View
              </button>
              <Link
                href="/home"
                className="px-7 py-3 rounded-xl bg-[#022C4F] hover:bg-[#011b30] text-white text-xs font-bold transition-all shadow-md shadow-[#022C4F]/20 flex items-center gap-2 cursor-pointer"
              >
                <Home size={16} /> Return to Home
              </Link>
            </motion.div>

            {/* Quick Portal Navigation Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="w-full"
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-px w-12 bg-gray-200" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
                  Direct Platform Portals
                </span>
                <div className="h-px w-12 bg-gray-200" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
                {portalShortcuts.map((portal, idx) => {
                  const Icon = portal.icon;
                  return (
                    <Link
                      key={idx}
                      href={portal.href}
                      className={`group p-6 rounded-3xl bg-white border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col justify-between shadow-sm ${portal.accentBorder}`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-center text-[#022C4F] group-hover:bg-[#022C4F] group-hover:text-white transition-all shadow-sm">
                            <Icon size={22} />
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${portal.badgeStyle}`}>
                            {portal.badge}
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-bold text-[#0F181F] group-hover:text-[#022C4F] transition-colors mb-1">
                          {portal.title}
                        </h3>
                        <p className="text-[11px] font-semibold text-gray-400 mb-2">
                          {portal.subtitle}
                        </p>
                        <p className="text-xs text-gray-600 leading-relaxed">
                          {portal.description}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs font-bold text-[#022C4F] group-hover:text-blue-600">
                        <span>Open Portal</span>
                        <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </AuthModalProvider>
  );
}
