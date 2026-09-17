"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  User,
  LogOut,
  Shield,
  ExternalLink,
  Menu,
  Radio,
  Sparkles,
  Wifi,
  HardDrive,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getSyncStats } from "@/lib/offline-sync";

interface InspectorHeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function InspectorHeader({ onOpenMobileMenu }: InspectorHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    setIsOnline(typeof navigator !== "undefined" ? navigator.onLine : true);

    const updateStats = () => {
      const stats = getSyncStats();
      setQueueCount(stats.pendingCount);
    };

    updateStats();

    const handleOnline = () => {
      setIsOnline(true);
      updateStats();
    };
    const handleOffline = () => {
      setIsOnline(false);
      updateStats();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("storage", updateStats);
    window.addEventListener("offline-sync-queue-updated", updateStats);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("storage", updateStats);
      window.removeEventListener("offline-sync-queue-updated", updateStats);
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout("/inspector/login");
  };

  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() ||
      user.email?.split("@")[0]
    : "Field Inspector";

  return (
    <header className="h-24 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 sm:px-10 sticky top-0 z-30 transition-all duration-300">
      {/* Mobile Menu & Logo */}
      <div className="flex items-center gap-4 lg:hidden">
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="p-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-[#0F181F] transition-colors"
          aria-label="Open Navigation Drawer"
        >
          <Menu size={24} />
        </button>
        <Link href="/inspector/dashboard" className="flex items-center">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon Logo"
            width={120}
            height={36}
            priority
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Desktop Search Bar matching Government Dashboard */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-4 lg:mx-0">
        <div className="relative w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-gray-400 group-focus-within:text-blue-500 transition-colors"
            />
          </div>
          <input
            type="text"
            placeholder="Search inspections, permits, GPR scans, SWOs..."
            className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 text-gray-700 placeholder-gray-400"
          />
        </div>
      </div>

      {/* Right Controls Area */}
      <div className="flex items-center gap-3 sm:gap-5 ml-auto">
        {/* LASBCA Field Jurisdiction Badge */}
        <div className="hidden xl:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-50/80 border border-blue-100/80 text-xs font-bold text-[#022C4F]">
          <Shield size={14} className="text-blue-600 shrink-0" />
          <span className="truncate">LASBCA Field Operations</span>
          <span className="text-blue-200">•</span>
          <span className="text-blue-700/80 font-semibold text-[11px]">Ikeja North</span>
        </div>

        {/* Live Sync Status Pill */}
        <Link
          href="/inspector/dashboard/sync"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-bold border transition-all ${
            isOnline
              ? "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100"
              : "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100"
          }`}
          title="Open Sync Status Center"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
            }`}
          />
          <span className="hidden sm:inline">
            {isOnline ? "Live Sync Active" : "Offline Cache"}
          </span>
          {queueCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-200 text-amber-900 rounded-full text-[10px] font-mono font-bold">
              {queueCount}
            </span>
          )}
        </Link>

        {/* Government Portal Quick Link */}
        <a
          href="https://nexucon.net/government/dashboard/command-center"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:inline-flex items-center gap-1.5 text-xs font-bold text-[#022C4F] bg-gray-50 hover:bg-gray-100 border border-gray-200/70 px-3 py-2 rounded-2xl transition-all hover:border-gray-300"
          title="Open State Directorate Portal"
        >
          <span>Directorate</span>
          <ExternalLink size={12} className="text-blue-600" />
        </a>

        {/* Notifications Icon Button */}
        <Link
          href="/inspector/dashboard/notifications"
          className="relative p-2.5 rounded-full text-gray-500 hover:bg-gray-50 hover:text-[#0F181F] transition-all duration-300 hover:scale-105 shrink-0"
          aria-label="Open Notifications"
        >
          <Bell size={22} />
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
        </Link>

        <div className="h-8 w-px bg-gray-200 hidden sm:block" />

        {/* User Profile Pill matching Government Dashboard */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all duration-300 bg-white group cursor-pointer"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-blue-100 border-2 border-white shadow-sm flex items-center justify-center text-[#022C4F] font-bold text-sm">
              {user
                ? (
                    user.first_name?.[0] ||
                    user.email?.[0] ||
                    "I"
                  ).toUpperCase()
                : "I"}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-bold text-[#0F181F] leading-none mb-1">
                {userName}
              </p>
              <p className="text-[11px] font-medium text-gray-500 leading-none">
                Badge #LAG-INS-042
              </p>
            </div>
            <ChevronDown
              size={14}
              className={`text-gray-400 transition-transform hidden sm:block ${
                isProfileOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-3 border-b border-gray-100 bg-slate-50/50 rounded-t-2xl">
                  <p className="text-xs text-gray-500 font-medium">Logged in as</p>
                  <p className="text-sm font-bold text-[#022C4F] truncate">
                    {userName}
                  </p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <CheckCircle2 size={11} /> Authorized Field Inspector
                  </span>
                </div>

                <div className="py-1">
                  <Link
                    href="/inspector/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <User size={15} className="text-gray-500" />
                    <span>Inspector Profile & Credentials</span>
                  </Link>

                  <Link
                    href="/inspector/dashboard/sync"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Wifi size={15} className="text-gray-500" />
                    <span>Offline Sync Ledger</span>
                  </Link>
                </div>

                <div className="border-t border-gray-100 pt-1 mt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50 transition-colors font-semibold text-left cursor-pointer"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
