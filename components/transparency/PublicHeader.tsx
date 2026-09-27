"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Globe,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
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
  const { language, setLanguage } = useLanguage();
  const { isPtp, getRoute } = usePtpRoute();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  // Close menus on path change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLangMenuOpen(false);
  }, [pathname]);

  const getSectionHref = (hash: string) => {
    if (pathname === '/transparency' || pathname === '/') {
      return hash;
    }
    return isPtp ? hash : `/transparency${hash}`;
  };

  const navItems = [
    { label: 'About', href: getSectionHref('#about') },
    { label: 'Features', href: getSectionHref('#features') },
    { label: 'How It Works', href: getSectionHref('#how-it-works') },
    { label: 'FAQ', href: getSectionHref('#faq') },
  ];

  const languages: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'yo', label: 'Yorùbá', flag: '🇳🇬' },
    { code: 'ig', label: 'Igbo', flag: '🇳🇬' },
    { code: 'ha', label: 'Hausa', flag: '🇳🇬' },
  ];

  const loginHref = isPtp ? '/login' : '/ptp/login';
  const registerHref = isPtp ? '/register' : '/ptp/register';

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
            <a
              href="https://nexucon.net"
              target="_blank"
              rel="noreferrer"
              className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 font-medium transition-colors"
            >
              Nexucon Platform <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Portal Identity */}
          <Link href={getRoute('/transparency')} className="flex items-center gap-3 group">
            <div className="relative">
              <Image
                src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                alt="Nexucon Crest"
                width={130}
                height={44}
                className="h-9 sm:h-10 w-auto object-contain transition-transform group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="hidden sm:block border-l border-slate-300 pl-3">
              <div className="text-xs uppercase font-extrabold tracking-wider text-[#022C4F]">
                Public Transparency Portal
              </div>
              <div className="text-[10px] text-slate-500 font-medium">
                Verified Building &amp; Planning Registry
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links - Clean, minimal text links */}
          <nav className="hidden md:flex items-center gap-7 lg:gap-9">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-semibold text-slate-600 hover:text-[#022C4F] transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Bar */}
          <div className="flex items-center gap-3">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
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
              href={loginHref}
              className="hidden sm:inline-flex text-xs font-bold text-[#022C4F] hover:text-blue-700 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Sign In
            </Link>

            <Link
              href={registerHref}
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#033E6E] text-white text-xs font-bold shadow-xs hover:shadow transition-all"
            >
              Register
            </Link>

            {/* Mobile Menu Toggle Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors ml-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Menu
          </div>
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center px-3 py-2.5 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#022C4F] transition-colors"
            >
              <span>{item.label}</span>
            </Link>
          ))}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <Link
              href={loginHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-[#022C4F] hover:bg-slate-50"
            >
              Sign In
            </Link>
            <Link
              href={registerHref}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-full py-2.5 rounded-xl bg-[#022C4F] text-white text-sm font-bold hover:bg-[#033E6E]"
            >
              Register Free Account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
