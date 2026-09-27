"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Search,
  MapPin,
  FileCheck,
  FileText,
  AlertTriangle,
  Globe,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useLanguage, LanguageCode } from './LanguageContext';

export function usePtpRoute() {
  const [isPtp, setIsPtp] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.startsWith('ptp.') || host.includes('ptp.localhost') || host.includes('ptp-')) {
        setIsPtp(true);
      }
    }
  }, []);

  const getRoute = (path: string) => {
    if (isPtp) {
      if (path === '/transparency') return '/';
      return path.replace(/^\/transparency/, '') || '/';
    }
    return path;
  };

  return { isPtp, getRoute };
}

export const PublicHeader: React.FC = () => {
  const pathname = usePathname();
  const { language, setLanguage, t } = useLanguage();
  const { isPtp, getRoute } = usePtpRoute();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Close menus on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [pathname]);

  const navItems = [
    { label: t('nav_home'), href: getRoute('/transparency'), icon: Building2 },
    { label: t('nav_search'), href: getRoute('/transparency/search'), icon: Search },
    { label: t('nav_map'), href: getRoute('/transparency/map'), icon: MapPin },
    { label: t('nav_verify'), href: getRoute('/transparency/verify'), icon: FileCheck },
    { label: t('nav_documents'), href: getRoute('/transparency/documents'), icon: FileText },
    { label: t('nav_notices'), href: getRoute('/transparency/notices'), icon: AlertTriangle },
  ];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
    { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
    { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#ffffff] border-b border-slate-200/90 shadow-xs">
      {/* Top Civic Authority Micro-Banner */}
      <div className="bg-[#022C4F] text-white text-[11px] sm:text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-semibold tracking-wide">
              Official Lagos State Building Regulatory Open Data Gateway &bull; LASBCA Co-Platform
            </span>
          </div>
          <div className="hidden md:flex items-center gap-4 text-slate-300">
            <span>Statutory Verification Engine</span>
            <span>&bull;</span>
            <a
              href="https://nexucon.net"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium transition-colors"
            >
              Nexucon Enterprise Platform <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Portal Identity */}
          <Link href={getRoute('/transparency')} className="flex items-center gap-3.5 group">
            <div className="relative">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                alt="Nexucon Crest"
                width={140}
                height={48}
                className="h-10 sm:h-12 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="hidden sm:block border-l border-slate-300 pl-3.5">
              <div className="text-xs uppercase font-extrabold tracking-wider text-[#022C4F]">
                Public Transparency Portal
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Verified Building & Construction Registry
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    active
                      ? 'bg-[#022C4F] text-white shadow-xs'
                      : 'text-slate-700 hover:text-[#022C4F] hover:bg-slate-100/80'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                title="Select Language / Yan Èdè"
                aria-label="Select Language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-36 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-slate-50 ${
                        language === l.code ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.label}</span>
                      <span className="text-sm">{l.flag}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Login & Register CTAs */}
            <Link
              href="/ptp/login"
              className="hidden sm:inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-bold text-[#022C4F] hover:bg-slate-100 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href="/ptp/register"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              Register
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Transparency Navigation
          </div>
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  active ? 'bg-[#022C4F] text-white' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <div className="pt-3 border-t border-slate-100">
            <Link
              href={getRoute('/transparency/report-violation')}
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-red-50 text-red-700 border border-red-200 text-sm font-bold hover:bg-red-100"
            >
              <AlertTriangle className="w-4 h-4" />
              Submit Anonymous Site Violation Report
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
