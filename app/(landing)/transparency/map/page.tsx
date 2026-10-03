"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ShieldCheck, Info, Layers, AlertTriangle, ArrowRight } from 'lucide-react';
import { getPublicProjects, PublicProject } from '@/services/publicPortal';
import { ProjectMapView } from '@/components/transparency/ProjectMapView';
import { usePtpRoute } from '@/components/transparency/PublicHeader';

export default function PublicMapExplorerPage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [loading, setLoading] = useState(true);
  const { getRoute } = usePtpRoute();

  useEffect(() => {
    async function loadProjects() {
      try {
        const data = await getPublicProjects();
        setProjects(data);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    loadProjects();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 mb-1">
            <MapPin className="w-4 h-4" />
            <span>Geospatial Regulatory Exploration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-[#022C4F]">
            Interactive Project GIS Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Explore active construction sites, approved planning permits, and regulatory enforcement orders across Lagos State with verified geospatial coordinates.
          </p>
        </div>

        {/* Legend */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-3 px-4 shadow-2xs flex flex-wrap items-center gap-3 text-xs font-medium text-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Status:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Under Construction</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
            <span>Completed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Under Review</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>Stop-Work Order</span>
          </div>
        </div>
      </div>

      {/* Main Full-Height Interactive Map */}
      <ProjectMapView
        projects={projects}
        heightClassName="h-[650px] lg:h-[740px]"
        showSidebar={true}
      />

      {/* Coordinate Privacy & Safeguards Note */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-600">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Geospatial Privacy Protection:</strong> Major commercial and civic infrastructure sites publish exact coordinates. In compliance with the Nigeria Data Protection Act, residential and sensitive developments enforce approximate (&plusmn;100m) area centroids to protect citizen privacy while preserving regulatory transparency.
          </p>
        </div>
        <Link
          href={getRoute('/transparency/report-violation')}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-700 border border-red-200 font-bold hover:bg-red-100 transition-colors shrink-0"
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Report Unlisted Site</span>
        </Link>
      </div>
    </div>
  );
}
