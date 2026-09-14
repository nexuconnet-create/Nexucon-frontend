"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ClipboardCheck,
  Search,
  MapPin,
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { getInspectorInspections } from "@/services/inspector";
import { Inspection } from "@/services/inspections";

export default function InspectorInspectionsPage() {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspections = async () => {
    setIsLoading(true);
    try {
      const data = await getInspectorInspections({
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        search: search.trim() || undefined,
      });
      setInspections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load inspections:", err);
      setInspections([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInspections();
  }, [statusFilter, search]);

  const filtered = inspections.filter((ins) => {
    if (search) {
      const q = search.toLowerCase();
      const match =
        ins.inspection_reference?.toLowerCase().includes(q) ||
        ins.project_name?.toLowerCase().includes(q) ||
        ins.inspection_type?.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (statusFilter !== "ALL" && ins.status !== statusFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Title & Refresh */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <ClipboardCheck size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Field Inspection Workspace
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Conduct geofenced site reviews, complete structural checklists, and submit cryptographic sign-offs.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchInspections}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh inspections"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by reference, project name, or discipline..."
            className="w-full h-11 bg-white border border-slate-200/80 rounded-xl pl-10 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F] shadow-sm"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {["ALL", "SCHEDULED", "IN_PROGRESS", "COMPLETED", "RE_INSPECTION_REQUIRED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-sm ${
                statusFilter === st
                  ? "bg-[#022C4F] text-white"
                  : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80"
              }`}
            >
              {st === "ALL" ? "All Inspections" : st.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {/* Inspections List */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((insp) => (
            <div
              key={insp.id}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                    {insp.inspection_reference}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    insp.status === 'COMPLETED'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : insp.status === 'IN_PROGRESS'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {insp.status}
                  </span>
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                    insp.priority === 'Critical' || insp.priority === 'High'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {insp.priority || 'Normal'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#022C4F] truncate">{insp.project_name}</h3>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-1">
                  <span className="font-semibold text-slate-700">{insp.inspection_type}</span>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1 truncate">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{insp.project_location || "Lekki, Lagos"}</span>
                  </div>
                  {insp.scheduled_date && (
                    <>
                      <span>&bull;</span>
                      <div className="flex items-center gap-1">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        <span>{new Date(insp.scheduled_date).toLocaleDateString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href={`/inspector/dashboard/inspections/${insp.id}`}
                  className="px-4 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2"
                >
                  <Play size={13} className="fill-current" />
                  <span>{insp.status === 'COMPLETED' ? 'View Report' : 'Execute Inspection'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <ClipboardCheck size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">No Inspections Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No inspection records match your current filter selection.
          </p>
        </div>
      )}
    </div>
  );
}
