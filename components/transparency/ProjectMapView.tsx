"use client";

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building, ShieldCheck, ArrowRight, ExternalLink, Layers, Navigation } from 'lucide-react';
import { PublicProject } from '@/services/publicPortal';
import { ProjectStatusBadge, ComplianceBadge } from './ProjectStatusBadge';
import { usePtpRoute } from './PublicHeader';

// Leaflet dynamic map component
const LeafletMap = dynamic(
  () => import('./LeafletMapInner').then((mod) => mod.LeafletMapInner),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[500px] bg-slate-100 flex flex-col items-center justify-center text-slate-500 rounded-2xl border border-slate-200">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-sm font-semibold text-slate-700">Loading Geospatial Regulatory Map...</span>
        <span className="text-xs text-slate-400 mt-1">Rendering Lagos State verified building coordinates</span>
      </div>
    ),
  }
);

interface ProjectMapViewProps {
  projects: PublicProject[];
  initialSelectedId?: string;
  heightClassName?: string;
  showSidebar?: boolean;
}

export const ProjectMapView: React.FC<ProjectMapViewProps> = ({
  projects,
  initialSelectedId,
  heightClassName = "h-[650px] lg:h-[720px]",
  showSidebar = true,
}) => {
  const [selectedProject, setSelectedProject] = useState<PublicProject | null>(null);
  const [selectedLgaFilter, setSelectedLgaFilter] = useState<string>('ALL');
  const { getRoute } = usePtpRoute();

  useEffect(() => {
    if (initialSelectedId) {
      const found = projects.find((p) => p.id === initialSelectedId || p.slug === initialSelectedId);
      if (found) setSelectedProject(found);
    } else if (projects.length > 0 && !selectedProject) {
      setSelectedProject(projects[0]);
    }
  }, [initialSelectedId, projects]);

  const filteredProjects = selectedLgaFilter === 'ALL'
    ? projects
    : projects.filter((p) => p.lga.toLowerCase() === selectedLgaFilter.toLowerCase());

  const lgas = ['ALL', 'Ikeja', 'Eti-Osa', 'Lagos Mainland', 'Surulere', 'Lagos Island'];

  return (
    <div className={`relative w-full ${heightClassName} bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col md:flex-row`}>
      {/* Interactive Map Area */}
      <div className="relative flex-1 h-full min-h-[350px]">
        {/* Top Floating LGA Filter Chips */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 z-20 pointer-events-none flex items-center justify-between gap-2">
          <div className="pointer-events-auto flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-200/80 shadow-md max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <span className="text-[11px] font-bold text-slate-500 uppercase px-2 shrink-0">District:</span>
            {lgas.map((lga) => (
              <button
                key={lga}
                onClick={() => setSelectedLgaFilter(lga)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  selectedLgaFilter === lga
                    ? 'bg-[#022C4F] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {lga}
              </button>
            ))}
          </div>

          <div className="pointer-events-auto hidden sm:flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-xs font-semibold text-slate-700 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>{filteredProjects.length} Verified Sites</span>
          </div>
        </div>

        {/* Real Leaflet Map */}
        <LeafletMap
          projects={filteredProjects}
          selectedProject={selectedProject}
          onSelectProject={(p) => setSelectedProject(p)}
        />
      </div>

      {/* Selected Project Drawer / Details Panel */}
      {showSidebar && (
        <div className="w-full md:w-80 lg:w-96 bg-white border-t md:border-t-0 md:border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto max-h-[340px] md:max-h-full">
          {selectedProject ? (
            <div className="space-y-4">
              <div className="relative h-36 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                <Image
                  src={selectedProject.cover_image}
                  alt={selectedProject.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className="text-[10px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded">
                    {selectedProject.public_reference}
                  </span>
                </div>
                <div className="absolute bottom-2 right-2">
                  <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/90 backdrop-blur-md px-2 py-0.5 rounded border border-emerald-300">
                    Precision: {selectedProject.location_precision}
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <ProjectStatusBadge status={selectedProject.status} size="sm" />
                  <ComplianceBadge state={selectedProject.compliance_state} size="sm" />
                </div>
                <h3 className="text-base font-bold text-[#022C4F] line-clamp-2">
                  {selectedProject.name}
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedProject.site_address}
                </p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-500">Permit Number:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedProject.permit_number}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Approved Floors:</span>
                  <span className="font-semibold text-slate-800">{selectedProject.number_of_floors} Floors</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Developer:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[170px]">{selectedProject.developer_organization}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Last Inspection:</span>
                  <span className="font-semibold text-slate-800">{selectedProject.last_inspection_date}</span>
                </div>
              </div>

              <Link
                href={getRoute(`/transparency/projects/${selectedProject.slug}`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                <span>View Full Public Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 p-6">
              <MapPin className="w-8 h-8 text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-700">Select a Site on the Map</p>
              <p className="text-xs text-slate-400 mt-1">Click any colored marker to view approved planning details and inspection records.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
