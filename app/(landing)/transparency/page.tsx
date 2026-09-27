"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Building2,
  ShieldCheck,
  MapPin,
  FileCheck,
  AlertTriangle,
  ArrowRight,
  Activity,
  Layers,
  FileText,
  CheckCircle2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  getPublicProjects,
  getPublicStats,
  getPublicNotices,
  PublicProject,
  PublicStats,
  PublicNotice,
  CURATED_PUBLIC_STATS,
} from '@/services/publicPortal';
import { ProjectSearchHero } from '@/components/transparency/ProjectSearchHero';
import { PublicStatCard } from '@/components/transparency/PublicStatCard';
import { ProjectCard } from '@/components/transparency/ProjectCard';
import { ViolationReportModal } from '@/components/transparency/ViolationReportModal';
import { useLanguage } from '@/components/transparency/LanguageContext';
import { usePtpRoute } from '@/components/transparency/PublicHeader';

export default function PublicTransparencyHome() {
  const [stats, setStats] = useState<PublicStats>(CURATED_PUBLIC_STATS);
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [notices, setNotices] = useState<PublicNotice[]>([]);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();
  const { getRoute } = usePtpRoute();

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, projectsData, noticesData] = await Promise.all([
          getPublicStats(),
          getPublicProjects(),
          getPublicNotices(),
        ]);
        setStats(statsData);
        setProjects(projectsData);
        setNotices(noticesData);
      } catch (err) {
        // Handled by service fallbacks
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const featuredProjects = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. Hero Search & Quick Action Section */}
      <ProjectSearchHero onOpenReportModal={() => setReportModalOpen(true)} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 sm:space-y-16 -mt-16 sm:-mt-20 relative z-20">
        {/* 2. Public Impact Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <PublicStatCard
            label={t('stat_active_sites')}
            value={stats.active_sites.toLocaleString()}
            subtext="Active permitted sites under audit"
            icon={Building2}
            variant="blue"
          />
          <PublicStatCard
            label={t('stat_permits')}
            value={stats.verified_permits.toLocaleString()}
            subtext="Digitally signed planning approvals"
            icon={FileCheck}
            variant="emerald"
          />
          <PublicStatCard
            label={t('stat_compliance')}
            value={`${stats.compliance_rate}%`}
            subtext="Sites meeting structural safety codes"
            icon={ShieldCheck}
            variant="emerald"
          />
          <PublicStatCard
            label={t('stat_inspections')}
            value={stats.completed_inspections.toLocaleString()}
            subtext="On-site regulatory engineering audits"
            icon={Activity}
            variant="slate"
          />
        </div>

        {/* 3. Featured Statutory Projects */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                <span>Verified Developments</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
                {t('featured_projects')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
                Recent building projects that have completed statutory stage clearance inspections and obtained planning endorsements.
              </p>
            </div>
            <Link
              href={getRoute('/transparency/search')}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#022C4F] hover:text-blue-700 transition-colors"
            >
              <span>Explore All Verified Projects</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>

        {/* 4. Interactive GIS Map Teaser */}
        <section className="bg-gradient-to-br from-[#022C4F] to-[#011B30] rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-15 pointer-events-none hidden md:block">
            <div className="w-full h-full bg-[radial-gradient(#2563EB_1px,transparent_1px)] [background-size:16px_16px]" />
          </div>

          <div className="max-w-2xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <MapPin className="w-3.5 h-3.5" />
              <span>Lagos State Geospatial Planning Map</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-extrabold text-white leading-tight">
              Explore Active Construction Sites Across All 20 LGAs
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Navigate our interactive GIS map to see certified building projects in your neighborhood. Check approval stages, developer credentials, and recent field audit outcomes with complete coordinate privacy masking.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href={getRoute('/transparency/map')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md"
              >
                <MapPin className="w-4 h-4" />
                <span>Launch Interactive GIS Map</span>
              </Link>
              <Link
                href={getRoute('/transparency/verify')}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs sm:text-sm font-bold tracking-wide transition-all"
              >
                <FileCheck className="w-4 h-4 text-emerald-400" />
                <span>Verify Site Permit</span>
              </Link>
            </div>
          </div>
        </section>

        {/* 5. Recent Safety & Enforcement Bulletins */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-600 mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Statutory Bulletins</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
                {t('recent_notices')}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Enforcement stop-work notices, weather safety advisories, and building code regulatory updates.
              </p>
            </div>
            <Link
              href={getRoute('/transparency/notices')}
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-red-700 hover:text-red-900 transition-colors"
            >
              <span>View All Statutory Bulletins</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {notices.slice(0, 3).map((notice) => {
              const isStopWork = notice.notice_type === 'STOP_WORK';
              return (
                <div
                  key={notice.id}
                  className={`bg-white border rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                    isStopWork ? 'border-red-200 bg-red-50/20' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          isStopWork
                            ? 'bg-red-100 text-red-800 border border-red-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {notice.notice_type.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">
                        {notice.effective_date}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-[#022C4F] line-clamp-2">
                      {notice.title}
                    </h4>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                      {notice.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-slate-700">{notice.target_lga}</span>
                    <Link
                      href={getRoute('/transparency/notices')}
                      className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900"
                    >
                      <span>Read Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* 6. Educational Primer: "How Nexucon Protects Your Community" */}
        <section className="bg-slate-50 border border-slate-200/90 rounded-3xl p-8 sm:p-12 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/60">
              The 4 Pillars of Regulatory Oversight
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F]">
              {t('how_protects')}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every building project in the public portal undergoes a multi-layer verification chain, transforming complex technical inspections into simple, transparent civic safety data.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                1
              </div>
              <h4 className="text-base font-bold text-[#022C4F]">Statutory Planning Permits</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Physical plans, architectural drawings, and structural calculations are verified and sealed by COREN-certified engineers and LASBCA before groundbreaking.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                2
              </div>
              <h4 className="text-base font-bold text-[#022C4F]">Independent Field Audits</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Authorized government building inspectors visit sites at every critical stage gate (foundation, slab pours, column alignment) before the next floor can proceed.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                3
              </div>
              <h4 className="text-base font-bold text-[#022C4F]">Digital Eye NDT Sensors</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Advanced PUNDIT ultrasonic pulse velocity and ground-penetrating radar instruments verify concrete compressive strength and rebar depth without damaging structures.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                4
              </div>
              <h4 className="text-base font-bold text-[#022C4F]">Open Civic Transparency</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Approved outcomes, certificates of fitness, and stop-work orders are projected publicly into this portal so citizens can verify building safety in real time.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Citizen Tip-off CTA */}
        <section className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 rounded-3xl p-8 sm:p-10 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-white" />
              <span>Community Safety Watch</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Notice an Unapproved or Dangerous Construction Site?
            </h3>
            <p className="text-xs sm:text-sm text-red-100 leading-relaxed">
              Help prevent building collapse. Submit an anonymous tipoff directly to the LASBCA Zonal Enforcement Directorate. All citizen reports receive a tracking reference.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setReportModalOpen(true)}
            className="px-6 py-3.5 rounded-xl bg-white text-red-700 hover:bg-red-50 text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all shrink-0 flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4 text-red-600" />
            <span>Submit Anonymous Report</span>
          </button>
        </section>
      </div>

      {/* Violation Tipoff Modal */}
      <ViolationReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  );
}
