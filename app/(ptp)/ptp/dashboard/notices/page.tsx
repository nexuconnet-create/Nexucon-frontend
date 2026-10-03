"use client";

import React, { useState, useEffect } from "react";
import {
  AlertTriangle,
  FileText,
  MapPin,
  Calendar,
  Building2,
  ExternalLink,
  ShieldAlert,
  CheckCircle2,
  Filter
} from "lucide-react";
import { getPublicNotices, PublicNotice } from "@/services/publicPortal";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

export default function PtpNoticesPage() {
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedNotice, setSelectedNotice] = useState<PublicNotice | null>(null);

  useEffect(() => {
    async function loadNotices() {
      try {
        const data = await getPublicNotices();
        setNotices(data);
      } catch {
        // Fallback handled in service
      } finally {
        setLoading(false);
      }
    }
    loadNotices();
  }, []);

  const filteredNotices = filterType === "all"
    ? notices
    : notices.filter((n) => n.notice_type === filterType);

  const getNoticeBadge = (type: string) => {
    switch (type) {
      case "STOP_WORK":
        return <span className="px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">Stop-Work Order</span>;
      case "SAFETY_ADVISORY":
        return <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">Safety Advisory</span>;
      case "STAGE_CLEARANCE":
        return <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Stage Clearance</span>;
      case "REGULATORY_UPDATE":
        return <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">Regulatory Update</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-800 text-[10px] font-bold">Notice</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government standard */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <AlertTriangle size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Statutory Bulletins &amp; Enforcements
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Official stop-work orders, safety seals, and regulatory directives gazetted by LASBCA and LASPPPA.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "All Bulletins" },
          { id: "STOP_WORK", label: "Stop-Work Orders" },
          { id: "SAFETY_ADVISORY", label: "Safety Advisories" },
          { id: "STAGE_CLEARANCE", label: "Stage Clearances" },
          { id: "REGULATORY_UPDATE", label: "Regulatory Updates" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              filterType === tab.id
                ? "bg-[#022C4F] text-white shadow-xs"
                : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.map((notice) => (
          <div
            key={notice.id}
            className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-start justify-between gap-4"
          >
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {getNoticeBadge(notice.notice_type)}
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                  {notice.reference_number}
                </span>
                <span className="text-[11px] text-slate-400">
                  Published: {notice.published_at}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900">
                {notice.title}
              </h3>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <MapPin size={14} className="text-slate-400 shrink-0" />
                <span>Target Region: {notice.target_lga}, Lagos</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                {notice.description}
              </p>
            </div>

            <div className="pt-2 md:pt-0 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Issuing Authority</span>
                <span className="text-xs font-bold text-slate-800">{notice.issuing_agency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
