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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold uppercase tracking-wider mb-2">
            <Compass size={14} className="text-emerald-700" />
            <span>Interactive Geo-Spatial Safety Map</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
            Lagos State Construction Geo-Spatial Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Visual inspection of permitted sites, active Stop-Work enforcement orders, and zoning boundaries.
          </p>
        </div>

        {/* Legend / Stats */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Permitted / Active ({filteredProjects.length - stopWorkCount})</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs flex items-center gap-2 shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Stop-Work Enforced ({stopWorkCount})</span>
          </div>
        </div>
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
