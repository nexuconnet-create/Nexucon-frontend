"use client";

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Phone, Mail, MapPin, ExternalLink, FileText, CheckCircle2 } from 'lucide-react';
import { usePtpRoute } from './PublicHeader';
import { useLanguage } from './LanguageContext';

export const PublicFooter: React.FC = () => {
  const { getRoute } = usePtpRoute();
  const { t } = useLanguage();

  return (
    <footer className="bg-[#022C4F] text-white pt-14 pb-10 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 pb-12 border-b border-slate-700/60">
          {/* Column 1: Identity & Statutory Mandate */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white tracking-wide">
                  Public Transparency Portal
                </h4>
                <p className="text-[11px] text-slate-300">
                  Lagos State Building Regulatory Gateway
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Operating under the statutory authority of the Lagos State Building Control Agency (LASBCA) and the Ministry of Physical Planning & Urban Development. Built to safeguard lives and ensure transparent, verified construction standards.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-500/30">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>100% Verified Statutory Public Ledger</span>
            </div>
          </div>

          {/* Column 2: Public Navigation */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Public Portal Directory
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li>
                <Link href={getRoute('/transparency')} className="hover:text-white transition-colors">
                  Transparency Portal Home
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/search')} className="hover:text-white transition-colors">
                  Search Approved Building Projects
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/map')} className="hover:text-white transition-colors">
                  Interactive GIS Regulatory Map
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/verify')} className="hover:text-white transition-colors">
                  Verify Permit Authenticity (Instant)
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/documents')} className="hover:text-white transition-colors">
                  Public Document & Certificate Archive
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/notices')} className="hover:text-white transition-colors">
                  Statutory Stop-Work & Safety Bulletins
                </Link>
              </li>
              <li>
                <Link href={getRoute('/transparency/report-violation')} className="hover:text-red-400 text-red-300 font-semibold transition-colors">
                  Anonymous Citizen Violation Report
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Regulatory Compliance Standards */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Statutory Authorities & Codes
            </h5>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>Lagos State Urban & Regional Planning Law 2019 (LASBCA Mandate)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>Council for the Regulation of Engineering in Nigeria (COREN)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>Nigerian National Building Code (NBC) 2006 (Rev. 2021)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>BS EN 12390 Non-Destructive Concrete Testing (PUNDIT / UPV)</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-emerald-400 font-bold">&bull;</span>
                <span>Freedom of Information (FOI) Civic Transparency Framework</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Regulatory Emergency Contacts */}
          <div>
            <h5 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4">
              Regulatory Enforcement Contacts
            </h5>
            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>LASBCA Headquarters, Old Secretariat, Oba Akinjobi Way, Ikeja, Lagos</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Enforcement Hotline: 0800-LASBCA-CHECK (Toll-Free)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>public-transparency@nexucon.net</span>
              </div>
              <div className="pt-2">
                <a
                  href="https://nexucon.net"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-xs text-emerald-300 hover:bg-slate-700 font-medium transition-colors"
                >
                  <span>Nexucon Core Platform</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Legal Disclaimer & Data Protection Notice */}
        <div className="pt-8 text-center sm:text-left text-xs text-slate-400 space-y-2">
          <p className="leading-relaxed">
            <strong>Public Data Governance Notice:</strong> The Public Transparency Portal is strictly an information projection layer. In compliance with the Nigeria Data Protection Act (NDPA) and regulatory privacy standards, raw sensor files, unredacted staff notes, and private personal contacts are strictly excluded from public display. All published records reflect authenticated statutory approvals.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 text-[11px] text-slate-400">
            <p>&copy; {new Date().getFullYear()} NEXUCON.NET & SITESUPERVISE. All rights reserved.</p>
            <div className="flex items-center gap-4 mt-2 sm:mt-0">
              <Link href="/privacy" className="hover:text-white">Privacy Policy</Link>
              <span>&bull;</span>
              <Link href="/terms" className="hover:text-white">Terms of Public Access</Link>
              <span>&bull;</span>
              <Link href="/transparency/verify" className="hover:text-white">Permit Verification</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
