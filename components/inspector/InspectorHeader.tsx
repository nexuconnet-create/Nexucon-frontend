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
  HelpCircle,
  ExternalLink,
  Menu,
  Radio,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getInspectorAccreditation, type AccreditationResult } from "@/services/inspector";
import { getUnreadCounts } from "@/services/notifications";

interface InspectorHeaderProps {
  onOpenMobileMenu?: () => void;
}

export default function InspectorHeader({ onOpenMobileMenu }: InspectorHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Real accreditation. The pill below used to read "Lagos State Building
  // Control Agency • Ikeja North Directorate" and the dropdown badge
  // "Accredited Inspector" for every inspector who ever loaded a page, none of
  // it read from anywhere.
  const [accreditation, setAccreditation] = useState<AccreditationResult | null>(null);
  const [accreditationFailed, setAccreditationFailed] = useState(false);
  // A real unread count, instead of an unconditional pulsing dot that asserted
  // unread notifications on every account, always.
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    getInspectorAccreditation()
      .then((result) => {
        if (!cancelled) setAccreditation(result);
      })
      .catch(() => {
        // Distinct from "no accreditation recorded": the header says which.
        if (!cancelled) setAccreditationFailed(true);
      });
    getUnreadCounts()
      .then((counts) => {
        if (!cancelled) setUnreadCount(counts?.total_unread ?? 0);
      })
      .catch(() => {
        if (!cancelled) setUnreadCount(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    setIsProfileOpen(false);
    await logout("/inspector/login");
  };

  // The full name, else the email — which is a real identifier the inspector
  // recognises. Not `email.split("@")[0]`: turning "a.adeleke" into a display
  // name invents a name the platform does not hold, which is the same defect
  // that was removed from the dashboard's backend.
  const userName = user
    ? `${user.first_name || ""} ${user.last_name || ""}`.trim() || user.email || "Inspector"
    : "Inspector";

  const accredited = accreditation?.accredited ? accreditation.accreditation : null;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-4 shadow-sm">
      {/* Left: Mobile trigger & Jurisdiction Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="w-9 h-9 flex items-center justify-center text-[#022C4F] bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer lg:hidden"
            aria-label="Open Navigation Menu"
          >
            <Menu size={20} />
          </button>
        )}

        <div className="flex lg:hidden items-center">
          <Link href="/inspector/dashboard" className="flex items-center">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={110}
              height={28}
              className="h-6 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Desktop Jurisdiction Pill */}
        <div className="hidden sm:flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 border border-blue-200/80 text-xs font-bold text-[#022C4F]">
            <Shield size={13} className="text-[#0284C7]" />
            {accredited ? (
              <>
                <span className="truncate">
                  {accredited.directorate || "Directorate not recorded"}
                </span>
                <span className="text-gray-300">&bull;</span>
                <span className="text-gray-600 font-medium">
                  Badge {accredited.badge_number}
                </span>
              </>
            ) : (
              <span className="text-gray-600 font-medium">
                {accreditationFailed
                  ? "Accreditation unavailable"
                  : "No accreditation recorded"}
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Right: Sync Status, Search, Notifications & User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Connectivity. This used to read "Live Sync Active" whenever the
            browser was online — claiming a field-sync process that does not
            exist in this app (no service worker, no offline queue, no
            WebSocket client). Online and offline are what is actually known. */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
          <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>

        {/* Agency Directorate Quick Jump */}
        <a
          href="https://nexucon.net/government/login"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-[#022C4F] bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
          title="Open Agency Directorate Portal"
        >
          <span>Directorate</span>
          <ExternalLink size={12} className="text-[#0284C7]" />
        </a>

        {/* Notifications */}
        <Link
          href="/inspector/dashboard/notifications"
          className="relative w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-[#022C4F] hover:bg-slate-50 transition-colors shrink-0"
          aria-label="Open Notifications"
        >
          <Bell size={16} />
          {/* Shown only when the server reports unread notifications. The dot
              used to pulse unconditionally, telling every inspector they had
              something waiting. `null` means the count could not be read, and
              nothing is claimed. */}
          {unreadCount !== null && unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Link>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-[#022C4F] text-white flex items-center justify-center text-xs font-bold shrink-0">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden md:inline-block text-xs font-bold text-[#022C4F] max-w-[120px] truncate">
              {userName}
            </span>
          </button>

          {isProfileOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsProfileOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-3 z-50 text-slate-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-3 bg-slate-50 rounded-xl mb-2">
                  <p className="text-xs font-bold text-[#022C4F] truncate">{userName}</p>
                  <p className="text-[11px] text-gray-500 truncate">
                    {user?.email || "No email on this account"}
                  </p>
                  {accredited ? (
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                      {accredited.effective_status || accredited.accreditation_status || "Status not recorded"}
                      {accredited.is_suspended ? " • Suspended" : ""}
                    </span>
                  ) : (
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                      {accreditationFailed ? "Accreditation unavailable" : "No accreditation recorded"}
                    </span>
                  )}
                </div>

                <div className="space-y-1 text-xs font-medium">
                  <Link
                    href="/inspector/dashboard/settings"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-gray-700 hover:bg-slate-100 hover:text-[#022C4F] transition-colors"
                  >
                    <User size={15} />
                    <span>Inspector Profile & Key</span>
                  </Link>
                  <a
                    href="https://nexucon.net/government/login"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-700 hover:bg-slate-100 hover:text-[#022C4F] transition-colors"
                  >
                    <span className="flex items-center gap-2.5">
                      <Shield size={15} />
                      <span>Agency Directorate</span>
                    </span>
                    <ExternalLink size={12} className="text-gray-400" />
                  </a>
                </div>

                <div className="pt-2 mt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors cursor-pointer"
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
