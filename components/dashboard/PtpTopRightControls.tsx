"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Bell, ShieldCheck, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PtpTopRightControls() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="hidden lg:flex items-center gap-3 shrink-0">
      {/* Search Shortcut */}
      <button 
        onClick={() => router.push('/ptp/dashboard/search')}
        className="w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-slate-50 transition-colors cursor-pointer"
        title="Search Projects & Permits"
        aria-label="Search Projects & Permits"
      >
        <Search size={18} />
      </button>

      {/* Notifications / Notices Shortcut */}
      <button 
        onClick={() => router.push('/ptp/dashboard/notices')}
        className="relative w-11 h-11 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-slate-50 transition-colors cursor-pointer"
        title="Statutory Notices & Bulletins"
        aria-label="Statutory Notices"
      >
        <Bell size={18} />
        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#022C4F] rounded-full animate-pulse" />
      </button>

      {/* Live Civic Open Data Badge */}
      <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full shadow-xs">
        <ShieldCheck size={14} className="text-emerald-600" />
        <span className="text-[10px] font-bold uppercase tracking-wider">Civic Data: Verified Open Gateway</span>
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-0.5 animate-ping" />
      </div>

      {/* User Profile Pill matching Nexucon standard */}
      <Link
        href="/ptp/dashboard/settings"
        className="h-11 rounded-full border border-[#022C4F] flex items-center px-1.5 pr-5 gap-2.5 hover:bg-slate-50 transition-colors group cursor-pointer"
        title="Civic Settings & Profile"
      >
        <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-xs font-bold uppercase shadow-xs">
          {user ? (user.first_name?.[0] || user.email?.[0] || 'C').toUpperCase() : 'C'}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-xs font-bold text-[#0F181F] leading-tight truncate max-w-[120px]">
            {user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'Citizen Monitor'}
          </span>
          <span className="text-[9px] text-gray-500 leading-tight">
            Citizen Monitor
          </span>
        </div>
      </Link>
    </div>
  );
}
