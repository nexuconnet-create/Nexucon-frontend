"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ShieldCheck, MapPin, AlertTriangle, FileCheck, ArrowRight, Building2, CheckCircle2 } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { usePtpRoute } from './PublicHeader';

interface ProjectSearchHeroProps {
  onOpenReportModal?: () => void;
}

export const ProjectSearchHero: React.FC<ProjectSearchHeroProps> = ({ onOpenReportModal }) => {
  const [query, setQuery] = useState('');
  const router = useRouter();
  const { t } = useLanguage();
  const { getRoute } = usePtpRoute();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(getRoute(`/transparency/search?q=${encodeURIComponent(query.trim())}`));
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#022C4F] via-[#022440] to-[#011B30] text-white pt-14 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Decorative Background Mesh */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Civic Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/80 text-emerald-300 text-xs font-semibold border border-emerald-500/30 backdrop-blur-md shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Lagos State Building Control Regulatory Registry &bull; Public Transparency Window</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight max-w-4xl mx-auto">
          {t('hero_title')}
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          {t('hero_subtitle')}
        </p>

        {/* Big Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="max-w-3xl mx-auto pt-3 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 bg-white/10 p-2 sm:p-2.5 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl"
        >
          <div className="relative flex-1 w-full">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 font-medium"
            />
          </div>
          <button
            type="submit"
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 shrink-0"
          >
            <span>{t('search_btn')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 3 Rapid Action Shortcuts */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
          <Link
            href={getRoute('/transparency/verify')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-xs"
          >
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <span>{t('quick_verify')}</span>
          </Link>
          <Link
            href={getRoute('/transparency/map')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-all backdrop-blur-xs"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>{t('quick_map')}</span>
          </Link>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 border border-red-500/40 text-white transition-all backdrop-blur-xs"
          >
            <AlertTriangle className="w-4 h-4 text-red-200" />
            <span>{t('quick_report')}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
