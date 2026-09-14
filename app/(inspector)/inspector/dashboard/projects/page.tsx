"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  MapPin,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  Layers,
  ArrowRight,
} from "lucide-react";
import { getInspectorProjects } from "@/services/inspector";

export default function InspectorProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await getInspectorProjects({
        search: search.trim() || undefined,
        phase: phaseFilter !== "ALL" ? phaseFilter : undefined,
      });
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load inspector projects:", err);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, phaseFilter]);

  const filteredProjects = projects.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.reference_number?.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (phaseFilter !== "ALL" && p.status !== phaseFilter) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Page Title & Controls */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Building2 size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Assigned Construction Sites
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Supervised developments allocated under your inspection warrant and district jurisdiction.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchProjects}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh projects"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by project name, reference number, or LGA..."
            className="w-full h-11 bg-white border border-gray-300 rounded-xl pl-10 pr-4 text-xs font-medium text-[#0F181F] placeholder:text-gray-400 focus:outline-none focus:border-[#022C4F] focus:ring-2 focus:ring-[#022C4F]/10 shadow-sm transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-hide">
          {["ALL", "ACTIVE", "PLANNING", "SUSPENDED", "COMPLETED"].map((phase) => (
            <button
              key={phase}
              type="button"
              onClick={() => setPhaseFilter(phase)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                phaseFilter === phase
                  ? "bg-[#022C4F] text-white shadow-sm"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {phase === "ALL" ? "All Phases" : phase}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredProjects.map((proj) => (
            <Link
              key={proj.id}
              href={`/inspector/dashboard/projects/${proj.id}`}
              className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200/80 hover:border-[#022C4F] hover:shadow-md transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono font-bold text-gray-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    {proj.reference_number || "REF-PENDING"}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                    proj.status === 'ACTIVE'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : proj.status === 'SUSPENDED'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-blue-50 text-[#022C4F] border border-blue-200'
                  }`}>
                    {proj.status || 'ACTIVE'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 group-hover:text-[#022C4F] transition-colors line-clamp-1 mb-1">
                  {proj.name}
                </h3>

                <p className="text-xs text-gray-500 line-clamp-1 mb-4 flex items-center gap-1.5">
                  <MapPin size={13} className="text-gray-400 shrink-0" />
                  <span>{proj.site_address || proj.lga || "Lagos District"}</span>
                </p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Developer:</span>
                    <span className="font-semibold text-gray-800 truncate max-w-[160px]">
                      {proj.developer_name || proj.developer_organization || "Developer Corp"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Floors:</span>
                    <span className="font-bold text-gray-800">{proj.number_of_floors || 5} Levels</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                <span className="text-gray-500 font-medium">
                  {proj.inspections_count || 0} inspections logged
                </span>
                <span className="text-[#022C4F] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Open Site</span>
                  <ArrowRight size={13} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 shadow-sm">
          <Building2 size={36} className="mx-auto text-gray-300 mb-3" />
          <h3 className="text-sm font-bold text-gray-800 mb-1">No Projects Found</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            No active construction projects matched your filter. Verify your search or contact your Directorate administrator.
          </p>
        </div>
      )}
    </div>
  );
}
