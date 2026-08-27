"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  Compass, ArrowLeft, Home, Building2, HardHat, 
  Briefcase, Search, ShieldAlert, Sparkles, HelpCircle,
  ChevronRight, MapPin, Layers
} from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    // Redirect to home or search relevant portal
    const query = searchQuery.toLowerCase().trim();
    if (query.includes("gov") || query.includes("permit") || query.includes("inspect")) {
      router.push("/government/dashboard");
    } else if (query.includes("pro") || query.includes("bim") || query.includes("draw")) {
      router.push("/professional/dashboard");
    } else if (query.includes("client") || query.includes("project")) {
      router.push("/client/dashboard");
    } else {
      router.push(`/home?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const portalCards = [
    {
      title: "Government & Regulatory Portal",
      role: "State Agency & Municipal Directorate",
      description: "Permits, statutory inspection workflows, spatial GIS telemetry & city compliance controls.",
      href: "/government/dashboard",
      icon: Building2,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      accentBg: "from-blue-600 to-[#022C4F]",
      btnText: "Enter Government Portal"
    },
    {
      title: "Professional Workspace",
      role: "Engineers, Architects & Surveyors",
      description: "BIM models, 3D clash detection, construction handoffs & collaborative design workspaces.",
      href: "/professional/dashboard",
      icon: HardHat,
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
      accentBg: "from-amber-500 to-amber-700",
      btnText: "Open Professional Hub"
    },
    {
      title: "Client & Developer Center",
      role: "Asset Owners & Real Estate Developers",
      description: "Milestone execution, capital expenditure tracking, contractor bids & handoff sign-offs.",
      href: "/client/dashboard",
      icon: Briefcase,
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      accentBg: "from-emerald-600 to-teal-800",
      btnText: "Access Client Suite"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden selection:bg-blue-500 selection:text-white font-sans">
      {/* Background Blueprint Grid & Radial Glows */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255, 255, 255, 0.08) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px'
        }}
      />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#022C4F]/40 rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navbar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-[#022C4F] flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform border border-white/10">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
              NEXUCON <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-white/10 text-blue-300 font-bold">OS</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">Built Environment Intelligence</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            className="text-xs font-semibold text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors hidden sm:inline-flex items-center gap-1.5"
          >
            <HelpCircle size={14} /> Support &amp; Help Desk
          </Link>
          <Link
            href="/home"
            className="text-xs font-bold text-white px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Home size={14} /> Main Portal
          </Link>
        </div>
      </header>

      {/* Main 404 Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto w-full px-6 py-12 flex flex-col items-center text-center my-auto">
        
        {/* Status Coordinate Tag */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-blue-300 text-xs font-mono mb-6 shadow-inner backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          <MapPin size={13} className="text-amber-400" />
          <span>STATUS 404 &bull; COORD [00&deg;00&apos;00&quot;N 00&deg;00&apos;00&quot;E] UNMAPPED</span>
        </motion.div>

        {/* Large 404 Graphic Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative mb-6"
        >
          <div className="text-[110px] sm:text-[160px] md:text-[190px] font-black tracking-tighter leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-600 select-none drop-shadow-2xl">
            404
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-full border-2 border-dashed border-blue-400/30 flex items-center justify-center"
            >
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#022C4F]/90 backdrop-blur-md border border-blue-400/40 flex items-center justify-center text-blue-400 shadow-2xl shadow-blue-500/40">
                <Layers size={36} className="text-blue-300 animate-pulse" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Heading & Subtitle */}
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight max-w-3xl mb-4"
        >
          The Blueprint You&apos;re Looking For Is Off-Grid.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-slate-400 text-sm sm:text-base max-w-xl mb-8 leading-relaxed font-normal"
        >
          The requested coordinate or document address does not exist, has expired, or was relocated during recent statutory zoning revisions.
        </motion.p>

        {/* Search Input Bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          onSubmit={handleSearchSubmit}
          className="w-full max-w-lg mb-8 relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search permits, projects, BIM models, or portals..."
            className="w-full h-12 pl-12 pr-28 rounded-2xl bg-slate-800/80 border border-slate-700 text-xs font-semibold text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-xl shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
          >
            Locate
          </button>
        </motion.form>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-14"
        >
          <button
            onClick={() => router.back()}
            className="px-6 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer hover:border-slate-600"
          >
            <ArrowLeft size={16} /> Return to Previous View
          </button>
          <Link
            href="/government/dashboard"
            className="px-7 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-[#022C4F] hover:from-blue-500 hover:to-[#033c6c] text-white text-xs font-bold transition-all shadow-lg shadow-blue-900/30 flex items-center gap-2 cursor-pointer border border-blue-400/20"
          >
            <Building2 size={16} /> Central Command Center
          </Link>
        </motion.div>

        {/* Portal Directory Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="w-full"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-slate-700" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              Navigate Direct Platform Modules
            </span>
            <div className="h-px w-12 bg-slate-700" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-left">
            {portalCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <Link
                  key={idx}
                  href={card.href}
                  className="group relative p-6 rounded-3xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/70 hover:border-blue-500/50 transition-all duration-300 flex flex-col justify-between shadow-xl hover:shadow-blue-500/5 backdrop-blur-sm"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-slate-700/60 border border-slate-600/50 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                        <Icon size={22} />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                        {card.role.split(" ")[0]}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors mb-1.5 flex items-center gap-1">
                      {card.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {card.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs font-bold text-blue-400 group-hover:text-blue-300">
                    <span>{card.btnText}</span>
                    <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </main>

      {/* Clean Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          &copy; {new Date().getFullYear()} Nexucon Infrastructure &amp; Built-Environment OS. All rights reserved.
        </div>
        <div className="flex items-center gap-5">
          <Link href="/transparency" className="hover:text-slate-300 transition-colors">
            Public Registry
          </Link>
          <Link href="/compliance" className="hover:text-slate-300 transition-colors">
            Statutory Standards
          </Link>
          <Link href="/terms" className="hover:text-slate-300 transition-colors">
            Terms of Service
          </Link>
          <Link href="/contact" className="hover:text-slate-300 transition-colors">
            Report Broken Link
          </Link>
        </div>
      </footer>
    </div>
  );
}
