"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Compass,
  MapPin,
  Building2,
  AlertTriangle,
  Layers,
  ShieldCheck,
  Filter
} from "lucide-react";
import { getPublicProjects, PublicProject } from "@/services/publicPortal";
import PtpTopRightControls from "@/components/dashboard/PtpTopRightControls";

// Dynamic import for Leaflet map to prevent SSR issues
const ProjectMapView = dynamic(
  () => import("@/components/transparency/ProjectMapView").then((mod) => mod.ProjectMapView),
  {
    ssr: false,
    loading: () => (
      <div className="h-[650px] w-full bg-slate-100 rounded-3xl animate-pulse flex items-center justify-center text-slate-400 text-xs">
        Loading Lagos Geo-Spatial Map Engine...
      </div>
    ),
  }
);

export default function PtpMapPage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLga, setSelectedLga] = useState<string>("all");

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getPublicProjects();
        setProjects(data);
      } catch (err) {
        // Fallback handled in service
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  const filteredProjects = selectedLga === "all"
    ? projects
    : projects.filter((p) => p.lga.toLowerCase().includes(selectedLga.toLowerCase()));

  const stopWorkCount = filteredProjects.filter(
    (p) => p.compliance_state === "STOP_WORK_ORDER" || p.status === "SUSPENDED"
  ).length;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar matching Government standard */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 sm:gap-6 mb-2">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2.5 sm:gap-3 mb-2">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Compass size={20} />
            </div>
            <h1 className="text-2xl sm:text-[32px] font-bold text-[#022C4F] leading-tight">
              Interactive Geo-Spatial Safety Map
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Visual inspection of permitted construction sites, active Stop-Work enforcement seals, and coastal zoning setbacks across Lagos State.
          </p>
        </div>
        <PtpTopRightControls />
      </div>

      {/* Legend / Stats Strip */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Permitted / Active ({filteredProjects.length - stopWorkCount})</span>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-red-50 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Stop-Work Enforced ({stopWorkCount})</span>
          </div>
        </div>
        <span className="text-xs font-bold text-gray-500">
          Total Mapped: <strong className="text-gray-900">{filteredProjects.length} sites</strong>
        </span>
      </div>

      {/* LGA Fast Filters Strip */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 flex items-center gap-2 overflow-x-auto shadow-2xs">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 shrink-0">
          Focus LGA:
        </span>
        {[
          { id: "all", label: "All Lagos LGAs" },
          { id: "eti-osa", label: "Eti-Osa / Lekki / Ikoyi" },
          { id: "ikeja", label: "Ikeja / Alausa" },
          { id: "lagos island", label: "Lagos Island" },
          { id: "ibeju", label: "Ibeju-Lekki" },
          { id: "surulere", label: "Surulere" },
          { id: "mainland", label: "Mainland / Yaba" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedLga(tab.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedLga === tab.id
                ? "bg-[#022C4F] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 shadow-xs overflow-hidden">
        <ProjectMapView
          projects={filteredProjects}
          heightClassName="h-[650px] lg:h-[720px]"
          showSidebar={true}
        />
      </div>
    </div>
  );
}
