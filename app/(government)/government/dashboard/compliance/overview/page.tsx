"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ShieldCheck, AlertTriangle, Activity, FileCheck, ArrowUpRight, ArrowDownRight,
  Clock, RefreshCw, Filter, Building2, CheckCircle2, AlertCircle, Calendar,
  BarChart3, ChevronRight, ExternalLink
} from "lucide-react";
import {
  ComplianceStats, getComplianceStats, getNCRs, getComplianceCertificates,
  getCAPAs, generateComplianceReport, NonConformanceReport, ComplianceCertificate,
  CorrectiveActionPlan
} from "@/services/compliance";
import { getProjects, Project } from "@/services/projects";
import Link from "next/link";

function ComplianceOverviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialProjectId = searchParams.get('project') || 'all';

  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(initialProjectId);
  const [stats, setStats] = useState<ComplianceStats | null>(null);
  const [ncrs, setNcrs] = useState<NonConformanceReport[]>([]);
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>([]);
  const [capas, setCapas] = useState<CorrectiveActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [viewMode, setViewMode] = useState<'disciplines' | 'trend'>('disciplines');

  // Load project list once
  useEffect(() => {
    getProjects()
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Failed to load projects", err));
  }, []);

  // Fetch real compliance data whenever selected project changes
  const fetchComplianceData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = selectedProjectId !== 'all' ? { project: selectedProjectId } : undefined;
      const [statsData, ncrData, certData, capaData] = await Promise.all([
        getComplianceStats(params),
        getNCRs(params),
        getComplianceCertificates(params),
        getCAPAs(params),
      ]);
      setStats(statsData);
      setNcrs(ncrData);
      setCertificates(certData);
      setCapas(capaData);
    } catch (err) {
      console.error("Failed to load real compliance data", err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  const handleProjectChange = (projectId: string) => {
    setSelectedProjectId(projectId);
    const newParams = new URLSearchParams(window.location.search);
    if (projectId === 'all') {
      newParams.delete('project');
    } else {
      newParams.set('project', projectId);
    }
    router.replace(`/government/dashboard/compliance/overview${newParams.toString() ? `?${newParams.toString()}` : ''}`);
  };

  const selectedProjectObj = useMemo(() => {
    return projects.find(p => p.id === selectedProjectId);
  }, [projects, selectedProjectId]);

  // Real upcoming statutory deadlines computed from real certificates and CAPAs
  const realDeadlines = useMemo(() => {
    const deadlines: Array<{
      id: string;
      title: string;
      category: string;
      date: string;
      daysLeft: number;
      type: 'certificate' | 'capa';
      projectRef?: string;
    }> = [];

    const now = new Date();

    // Expiring certificates
    certificates.forEach((cert) => {
      if (cert.expiry_date) {
        const expDate = new Date(cert.expiry_date);
        const diffTime = expDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        deadlines.push({
          id: `cert-${cert.id}`,
          title: cert.title || `Certificate ${cert.certificate_reference}`,
          category: cert.category || 'Regulatory Certificate',
          date: cert.expiry_date,
          daysLeft,
          type: 'certificate',
          projectRef: cert.project_name
        });
      }
    });

    // Pending CAPAs with due dates
    capas.forEach((capa) => {
      if (capa.due_date && capa.status !== 'closed') {
        const dueDate = new Date(capa.due_date);
        const diffTime = dueDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        deadlines.push({
          id: `capa-${capa.id}`,
          title: capa.title || `CAPA ${capa.capa_reference}`,
          category: `CAPA (${capa.priority})`,
          date: capa.due_date,
          daysLeft,
          type: 'capa',
          projectRef: capa.project_name
        });
      }
    });

    // Sort by days left ascending (most urgent first)
    return deadlines.sort((a, b) => a.daysLeft - b.daysLeft);
  }, [certificates, capas]);

  // Real recent compliance log items
  const realActivities = useMemo(() => {
    const logs: Array<{
      id: string;
      title: string;
      subtitle: string;
      time: string;
      type: 'critical' | 'warning' | 'positive';
      link?: string;
    }> = [];

    ncrs.forEach((ncr) => {
      const isClosed = ncr.status === 'Closed';
      logs.push({
        id: `ncr-${ncr.id}`,
        title: `${ncr.ncr_reference}: ${ncr.title}`,
        subtitle: `${ncr.category} • ${ncr.project_name || 'Project'} • ${ncr.status}`,
        time: ncr.date_logged ? new Date(ncr.date_logged).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        type: isClosed ? 'positive' : ncr.severity === 'Critical' ? 'critical' : 'warning',
        link: '/government/dashboard/compliance/non-conformances'
      });
    });

    certificates.forEach((cert) => {
      logs.push({
        id: `cert-${cert.id}`,
        title: `${cert.certificate_reference}: ${cert.title}`,
        subtitle: `${cert.category} • Issued by ${cert.authority}`,
        time: cert.issue_date ? new Date(cert.issue_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently',
        type: 'positive',
        link: '/government/dashboard/compliance/certificates'
      });
    });

    // Return the top 6 most recent
    return logs.slice(0, 6);
  }, [ncrs, certificates]);

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Generating comprehensive regulatory compliance report...', type: 'info' } 
      }));
      const params = selectedProjectId !== 'all' ? { project: selectedProjectId } : undefined;
      const res = await generateComplianceReport(params);
      if (res?.report_download_url) {
        window.open(res.report_download_url, '_blank');
      }
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Regulatory Compliance Audit Report generated successfully!', type: 'success' } 
      }));
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Failed to generate compliance report', type: 'error' } 
      }));
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const scoreVal = stats?.score_numeric ?? 100;
  const isHealthy = scoreVal >= 80;
  const isWarning = scoreVal < 80 && scoreVal >= 60;

  return (
    <div className="w-full min-h-screen pb-16 bg-[#F8FAFC]">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-6 mb-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                Statutory Regulatory Dashboard
              </span>
              {selectedProjectId !== 'all' && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  Project Scoped
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#022C4F] flex items-center gap-3">
              <ShieldCheck className="text-blue-600 w-8 h-8" />
              Compliance Overview
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              Live regulatory analysis, statutory audit tracking, and field non-conformance remediation.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Project Filter Select */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm">
              <Building2 size={16} className="text-slate-500 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-2 max-w-[200px] truncate"
              >
                <option value="all">All Projects (Portfolio)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.reference_number})
                  </option>
                ))}
              </select>
            </div>

            <button 
              onClick={fetchComplianceData} 
              disabled={isLoading}
              className="p-2.5 border border-slate-200 bg-white rounded-xl text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Refresh Live Data"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin text-blue-600" : ""} />
            </button>

            <button 
              onClick={handleGenerateReport}
              disabled={isGeneratingReport}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20 text-sm font-bold cursor-pointer disabled:opacity-60"
            >
              <FileCheck size={16} />
              {isGeneratingReport ? 'Generating...' : 'Audit Report PDF'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        {/* Selected Project Scope Notice if filtered */}
        {selectedProjectObj && (
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0">
                <Building2 size={20} />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">Filtered by Project</p>
                <h3 className="text-base font-bold text-slate-900">{selectedProjectObj.name}</h3>
                <p className="text-xs text-slate-500">
                  Ref: <span className="font-semibold text-slate-700">{selectedProjectObj.reference_number}</span> • Developer: {selectedProjectObj.developer_name || selectedProjectObj.developer_organization || 'Registered Developer'} • Jurisdiction: {selectedProjectObj.lga || 'Lagos'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={`/government/dashboard/projects/view/${selectedProjectObj.id}/monitoring?tab=overview`}
                className="text-xs font-bold text-blue-700 bg-white border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                View Project Monitoring <ExternalLink size={12} />
              </Link>
              <button
                onClick={() => handleProjectChange('all')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2 py-1"
              >
                Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Real Scorecard Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* 1. Overall Score */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isHealthy ? 'bg-emerald-50 text-emerald-600' : isWarning ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
              }`}>
                <ShieldCheck size={26} />
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                isHealthy ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                isWarning ? 'bg-amber-50 text-amber-700 border-amber-200' :
                'bg-red-50 text-red-700 border-red-200'
              }`}>
                {isHealthy ? 'Compliant' : isWarning ? 'Under Watch' : 'Critical Action'}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Overall Adherence</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.overall_score || '100%'}</h3>
            <p className="text-xs text-slate-500 mt-2">
              {(stats?.open_ncrs_count ?? 0) === 0 
                ? 'No active non-conformances logged.' 
                : `${stats?.open_ncrs_count} non-conformances impacting score.`}
            </p>
          </motion.div>

          {/* 2. Open NCRs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <AlertTriangle size={26} />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {(stats?.critical_ncrs_count ?? 0) > 0 ? (
                  <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded-md">
                    {stats?.critical_ncrs_count} Critical
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                    0 Critical
                  </span>
                )}
              </div>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Non-Conformances</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.open_ncrs_count ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-2">
              {stats?.closed_ncrs_count ? `${stats.closed_ncrs_count} closed & verified` : 'Total resolved: 0'}
            </p>
          </motion.div>

          {/* 3. Pending CAPAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Activity size={26} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Corrective Actions
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Open CAPA Plans</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.pending_capas_count ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-2">
              Action plans requiring contractor verification.
            </p>
          </motion.div>

          {/* 4. Valid Certificates */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCheck size={26} />
              </div>
              {(stats?.expired_certificates_count ?? 0) > 0 ? (
                <span className="text-[11px] font-bold bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">
                  {stats?.expired_certificates_count} Expired
                </span>
              ) : (
                <span className="text-[11px] font-bold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full border border-emerald-200">
                  Active
                </span>
              )}
            </div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Statutory Certificates</p>
            <h3 className="text-3xl font-black text-slate-900">{stats?.valid_certificates_count ?? 0}</h3>
            <p className="text-xs text-slate-500 mt-2">
              {(stats?.expiring_soon_certificates_count ?? 0) > 0
                ? `${stats?.expiring_soon_certificates_count} expiring within 30 days`
                : 'All certificates in active standing'}
            </p>
          </motion.div>
        </div>

        {/* Real Analytics Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area: Real Discipline Breakdown & Monthly Incident Record */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 mb-6">
                <div>
                  <h2 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
                    <BarChart3 size={18} className="text-blue-600" />
                    Regulatory Compliance Analysis
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real-time verification breakdown computed from database logs and audit findings.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setViewMode('disciplines')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'disciplines' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Disciplines
                  </button>
                  <button
                    onClick={() => setViewMode('trend')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      viewMode === 'trend' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    6-Month Trend
                  </button>
                </div>
              </div>

              {viewMode === 'disciplines' ? (
                <div className="space-y-5">
                  {stats?.discipline_breakdown && stats.discipline_breakdown.length > 0 ? (
                    stats.discipline_breakdown.map((item, idx) => {
                      const isClear = item.open_ncrs === 0;
                      return (
                        <div key={idx} className="p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${
                                item.status === 'Critical' ? 'bg-red-500' : item.status === 'Needs Action' ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}></span>
                              <h4 className="text-sm font-bold text-slate-800">{item.discipline}</h4>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-medium text-slate-500">
                                {isClear ? 'No infractions' : `${item.open_ncrs} open / ${item.total_ncrs} total`}
                              </span>
                              <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                                isClear ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                              }`}>
                                {item.compliance_rate}% Adherence
                              </span>
                            </div>
                          </div>

                          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-700 ${
                                item.compliance_rate >= 80 ? 'bg-emerald-500' : item.compliance_rate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${item.compliance_rate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-12 text-center text-slate-500">
                      <CheckCircle2 size={36} className="mx-auto text-emerald-500 mb-2" />
                      <p className="text-sm font-bold text-slate-800">No disciplinary violations found</p>
                      <p className="text-xs text-slate-500 mt-1">This scope has a clean regulatory compliance record.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-6 gap-2 text-center pt-4">
                    {stats?.monthly_trend?.map((item, idx) => (
                      <div key={idx} className="flex flex-col items-center">
                        <div className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-end h-40">
                          <div className="space-y-1.5 flex flex-col items-center justify-end h-full">
                            {item.logged > 0 && (
                              <div
                                style={{ height: `${Math.min(100, item.logged * 25)}px` }}
                                className="w-full max-w-[28px] bg-red-400 rounded-t-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                title={`${item.logged} infractions logged`}
                              >
                                {item.logged}
                              </div>
                            )}
                            {item.resolved > 0 && (
                              <div
                                style={{ height: `${Math.min(100, item.resolved * 25)}px` }}
                                className="w-full max-w-[28px] bg-emerald-500 rounded-t-md flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                                title={`${item.resolved} resolved & closed`}
                              >
                                {item.resolved}
                              </div>
                            )}
                            {item.logged === 0 && item.resolved === 0 && (
                              <div className="text-[10px] text-slate-400 my-auto">Clean</div>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-700 mt-2">{item.month}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-6 pt-4 text-xs font-medium text-slate-600">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-red-400"></span>
                      Infractions Logged
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-sm bg-emerald-500"></span>
                      Resolved & Verified
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Action Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/government/dashboard/compliance/non-conformances"
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    Non-Conformance Register <ChevronRight size={16} />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Manage corrective action plans, inspect site breaches, and escalate stop-work notices.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertTriangle size={20} />
                </div>
              </Link>

              <Link
                href="/government/dashboard/compliance/certificates"
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group flex items-start justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                    Statutory Certificates <ChevronRight size={16} />
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Issue LASBCA/LASEPA clearance seals and verify QR cryptographic authenticity.
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FileCheck size={20} />
                </div>
              </Link>
            </div>
          </div>

          {/* Right Column: Real Upcoming Deadlines & Recent Activities */}
          <div className="lg:col-span-1 space-y-6">
            {/* Real Upcoming Statutory Deadlines */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  Upcoming Statutory Deadlines
                </h3>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {realDeadlines.length} Due
                </span>
              </div>

              {realDeadlines.length > 0 ? (
                <div className="space-y-3">
                  {realDeadlines.slice(0, 5).map((deadline) => {
                    const isUrgent = deadline.daysLeft <= 14;
                    const isSoon = deadline.daysLeft <= 30;
                    return (
                      <div
                        key={deadline.id}
                        className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors flex items-start gap-3"
                      >
                        <div className={`w-10 h-10 rounded-lg flex flex-col items-center justify-center shrink-0 font-bold ${
                          isUrgent ? 'bg-red-50 text-red-600' : isSoon ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          <span className="text-[9px] uppercase leading-none">
                            {new Date(deadline.date).toLocaleDateString('en-US', { month: 'short' })}
                          </span>
                          <span className="text-base leading-none">
                            {new Date(deadline.date).getDate()}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-slate-900 truncate">{deadline.title}</h5>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">{deadline.category}</p>
                          <div className="flex items-center gap-1.5 mt-1.5 text-[10px] font-semibold">
                            <Clock size={11} className={isUrgent ? 'text-red-500' : 'text-slate-400'} />
                            <span className={isUrgent ? 'text-red-600 font-bold' : isSoon ? 'text-amber-600' : 'text-slate-500'}>
                              {deadline.daysLeft < 0 ? `${Math.abs(deadline.daysLeft)} days overdue` : `${deadline.daysLeft} days remaining`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 size={28} className="mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">All filings in order</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                    No certificates expiring or CAPAs overdue for the selected scope.
                  </p>
                </div>
              )}
            </motion.div>

            {/* Real Recent Compliance Log */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                  <Activity size={16} className="text-blue-600" />
                  Recent Regulatory Log
                </h3>
              </div>

              {realActivities.length > 0 ? (
                <div className="space-y-3">
                  {realActivities.map((act) => (
                    <Link
                      key={act.id}
                      href={act.link || '#'}
                      className="p-3 rounded-xl border border-slate-100 hover:border-blue-200 bg-white hover:bg-slate-50/50 transition-colors block group"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          act.type === 'critical' ? 'bg-red-500' : act.type === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}></span>
                        <h5 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors flex-1 break-words">
                          {act.title}
                        </h5>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-3.5 break-words">{act.subtitle}</p>
                      <p className="text-[10px] text-slate-400 pl-3.5 mt-1 font-medium">{act.time}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <AlertCircle size={28} className="mx-auto text-slate-400 mb-2 opacity-60" />
                  <p className="text-xs font-bold text-slate-700">No log entries found</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 max-w-[200px] mx-auto">
                    New infractions, certificates, and reviews will appear here in real-time.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ComplianceOverview() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen pb-16 bg-[#F8FAFC] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="text-xs font-bold text-slate-500">Loading statutory compliance data...</p>
          </div>
        </div>
      }
    >
      <ComplianceOverviewContent />
    </Suspense>
  );
}
