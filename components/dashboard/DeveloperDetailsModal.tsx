"use client";

import React from 'react';
import { 
  X, Building2, MapPin, Briefcase, Mail, Phone, 
  ExternalLink, ShieldCheck, ShieldAlert, ChevronRight,
  DollarSign, Layers, Calendar, CheckCircle2
} from 'lucide-react';
import { Developer } from '@/services/stakeholders';
import Link from 'next/link';

interface DeveloperDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  developer: Developer | null;
  onToggleSanction?: (dev: Developer) => void;
}

export default function DeveloperDetailsModal({
  isOpen,
  onClose,
  developer,
  onToggleSanction
}: DeveloperDetailsModalProps) {
  if (!isOpen || !developer) return null;

  const projects = developer.projects || [];
  const contactName = developer.primary_contact_name || developer.name || 'Primary Representative';
  const contactEmail = developer.primary_contact_email || developer.email || '';
  const contactPhone = developer.primary_contact_phone || '';

  const getInitials = (text: string) => {
    if (!text) return 'DV';
    const parts = text.trim().split(/\s+/);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-[150] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
          
          {/* Header Banner */}
          <div className="p-6 bg-gradient-to-r from-slate-900 via-[#022C4F] to-blue-900 text-white relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider bg-white/10 px-2.5 py-1 rounded-lg border border-white/20 text-blue-200">
                  {developer.developer_id}
                </span>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                  developer.status === 'Verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                }`}>
                  <ShieldCheck size={11} /> {developer.status}
                </span>
                {developer.is_blacklisted && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-400/30">
                    <ShieldAlert size={11} /> Sanctioned
                  </span>
                )}
              </div>

              <button
                onClick={onClose}
                className="p-2 text-white/70 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-lg border-2 border-white/30 shrink-0 ${developer.color_theme || 'bg-blue-600'}`}>
                {getInitials(developer.name)}
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-xl font-bold truncate text-white">{developer.name}</h2>
                <p className="text-xs text-blue-200 flex items-center gap-1 mt-1 truncate">
                  <MapPin size={12} className="shrink-0" /> {developer.hq_location || 'Lagos, Nigeria'}
                </p>
              </div>
            </div>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <Briefcase size={12} className="text-blue-600" /> Active Projects
                </p>
                <p className="text-2xl font-black text-[#022C4F]">
                  {developer.active_projects_count || projects.length || 0}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                  <DollarSign size={12} className="text-emerald-600" /> Portfolio Value
                </p>
                <p className="text-lg font-black text-emerald-600 truncate">
                  {developer.portfolio_value || 'Commercial Portfolio'}
                </p>
              </div>
            </div>

            {/* Primary Contact Person Box */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                Corporate Primary Representative
              </h3>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                  {getInitials(contactName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">{contactName}</p>
                  <p className="text-xs text-slate-500">Authorized Liaison Officer</p>
                </div>
              </div>

              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-200/60">
                {contactEmail && (
                  <a
                    href={`mailto:${contactEmail}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  >
                    <Mail size={12} /> {contactEmail}
                  </a>
                )}
                {contactPhone && (
                  <a
                    href={`tel:${contactPhone}`}
                    className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:shadow-sm transition-all"
                  >
                    <Phone size={12} /> {contactPhone}
                  </a>
                )}
              </div>
            </div>

            {/* Associated Building Projects */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Layers size={13} className="text-blue-600" />
                  Associated Building Projects ({projects.length})
                </h3>
                
                <Link
                  href="/government/dashboard/projects/all"
                  className="text-[11px] font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
                >
                  All Projects <ChevronRight size={11} />
                </Link>
              </div>

              {projects.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-xs text-slate-400">
                  No active projects currently cataloged under this developer entity.
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-[10px] bg-slate-100 text-blue-900 px-1.5 py-0.5 rounded font-bold border border-slate-200">
                            {proj.reference_number}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {proj.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 truncate">{proj.name}</h4>
                        <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin size={10} /> {proj.location}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {proj.estimated_value && (
                          <div className="text-right hidden sm:block">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Estimated Value</p>
                            <p className="text-xs font-bold text-slate-800">{proj.estimated_value}</p>
                          </div>
                        )}

                        <Link
                          href={`/government/dashboard/projects/view/${proj.id}`}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-sm transition-colors cursor-pointer"
                        >
                          <span>View Project</span>
                          <ExternalLink size={11} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Drawer Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {onToggleSanction && (
              <button
                onClick={() => {
                  onToggleSanction(developer);
                  onClose();
                }}
                className={`text-xs font-bold px-3 py-2 rounded-xl transition-colors cursor-pointer ${
                  developer.is_blacklisted
                    ? 'text-emerald-700 hover:bg-emerald-50'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                {developer.is_blacklisted ? 'Lift Regulatory Sanction' : 'Flag / Sanction Developer'}
              </button>
            )}

            <button
              onClick={onClose}
              className="ml-auto px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              Close Dossier
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

