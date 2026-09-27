"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Building, Calendar, Layers, ShieldCheck, ArrowRight, ExternalLink } from 'lucide-react';
import { PublicProject } from '@/services/publicPortal';
import { ProjectStatusBadge, ComplianceBadge } from './ProjectStatusBadge';
import { VerificationBadge } from './VerificationBadge';
import { usePtpRoute } from './PublicHeader';

interface ProjectCardProps {
  project: PublicProject;
  viewMode?: 'grid' | 'list';
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode = 'grid' }) => {
  const { getRoute } = usePtpRoute();
  const profileUrl = getRoute(`/transparency/projects/${project.slug}`);

  if (viewMode === 'list') {
    return (
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 hover:border-blue-400 hover:shadow-md transition-all duration-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 group">
        <div className="flex items-start gap-4 flex-1">
          <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-slate-100 hidden sm:block border border-slate-200">
            <Image
              src={project.cover_image}
              alt={project.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {project.public_reference}
              </span>
              <ProjectStatusBadge status={project.status} size="sm" />
              <ComplianceBadge state={project.compliance_state} size="sm" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors">
              <Link href={profileUrl}>{project.name}</Link>
            </h3>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {project.lga}, Lagos
              </span>
              <span className="flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {project.project_type} &bull; {project.number_of_floors} Floors
              </span>
              <span className="font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                {project.permit_number}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <Link
            href={profileUrl}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span>View Profile</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all duration-300 flex flex-col group">
      {/* Card Image Banner */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <Image
          src={project.cover_image}
          alt={project.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="text-[11px] font-mono font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20">
            {project.public_reference}
          </span>
          <VerificationBadge isVerified={true} variant="compact" />
        </div>

        {/* Bottom Image Overlay Labels */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <span className="bg-[#022C4F]/90 backdrop-blur-xs px-2.5 py-1 rounded-md text-[11px] font-semibold border border-white/10">
            {project.project_type}
          </span>
          <span className="text-[11px] text-white/90 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded">
            {project.number_of_floors} Floors
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <ProjectStatusBadge status={project.status} size="sm" />
            <ComplianceBadge state={project.compliance_state} size="sm" />
          </div>

          <h3 className="text-base sm:text-lg font-bold text-[#022C4F] group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
            <Link href={profileUrl}>{project.name}</Link>
          </h3>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{project.site_address}</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] border-t border-slate-100">
              <span className="text-slate-500">Statutory Permit:</span>
              <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                {project.permit_number}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Last Inspected: {project.last_inspection_date}
          </span>
          <Link
            href={profileUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 group-hover:text-blue-900 transition-colors"
          >
            <span>Details</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
      </div>
    </div>
  );
};
