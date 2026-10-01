"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Bookmark,
  Building2,
  MapPin,
  FileCheck2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus
} from "lucide-react";
import { getPublicProjects, PublicProject } from "@/services/publicPortal";
import { ProjectStatusBadge, ComplianceBadge } from "@/components/transparency/ProjectStatusBadge";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

export default function PtpWatchlistPage() {
  const [watchlist, setWatchlist] = useState<PublicProject[]>([]);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWatchlist() {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("nexucon_ptp_watchlist_ids") : null;
        const ids: string[] = stored ? JSON.parse(stored) : [];
        setSavedProjectIds(ids);

        const data = await getPublicProjects();
        if (ids.length > 0) {
          const matched = data.filter(
            (p) => ids.includes(p.id) || ids.includes(p.slug) || ids.includes(p.permit_number)
          );
          setWatchlist(matched);
        } else {
          setWatchlist([]);
        }
      } catch {
        setWatchlist([]);
      } finally {
        setLoading(false);
      }
    }
    loadWatchlist();
  }, []);

  const handleRemoveFromWatchlist = (projectId: string) => {
    const updatedIds = savedProjectIds.filter((id) => id !== projectId);
    setSavedProjectIds(updatedIds);
    if (typeof window !== "undefined") {
      localStorage.setItem("nexucon_ptp_watchlist_ids", JSON.stringify(updatedIds));
    }
    setWatchlist((prev) => prev.filter((p) => p.id !== projectId && p.slug !== projectId));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government standard */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Bookmark size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              My Civic Watchlist
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Track real-time inspection passes, stage-gates, and statutory notices for your saved developments.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* Sub-header CTA bar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Saved Properties ({watchlist.length})
        </span>
        <Link
          href="/ptp/dashboard/search"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033E6E] shadow-sm transition-all"
        >
          <Plus size={16} />
          <span>Browse Developments to Watch</span>
        </Link>
      </div>

      {/* Empty State */}
      {!loading && watchlist.length === 0 && (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-blue-50 text-[#022C4F] flex items-center justify-center">
            <Bookmark size={28} />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-bold text-slate-800">Your Civic Watchlist is Empty</h3>
            <p className="text-xs text-slate-500">
              You haven&apos;t saved any developments to monitor yet. Search the public transparency portal and save approved sites to receive real-time inspection alerts.
            </p>
          </div>
          <Link
            href="/ptp/dashboard/search"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] text-white text-xs font-bold hover:bg-[#033E6E] shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Search Public Developments</span>
          </Link>
        </div>
      )}

      {/* Watchlist Cards */}
      {!loading && watchlist.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watchlist.map((project) => (
            <div
              key={project.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <ProjectStatusBadge status={project.status} />
                  <ComplianceBadge state={project.compliance_state} />
                </div>

                <div>
                  <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                    {project.permit_number}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-1.5">{project.name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{project.site_address}, {project.lga}</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Approved Floors:</span>
                    <strong className="text-slate-900">{project.number_of_floors} Storeys</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Stage Pass Rate:</span>
                    <strong className="text-emerald-700">
                      {project.inspections ? project.inspections.filter((i) => i.outcome === "PASS").length : 0} of {project.inspections ? project.inspections.length : 0} Passed
                    </strong>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleRemoveFromWatchlist(project.id)}
                  className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  Remove
                </button>
                <Link
                  href={`/ptp/dashboard/search?project=${project.id}`}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                >
                  <span>View Dossier</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
