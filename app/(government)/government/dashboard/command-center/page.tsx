"use client";

import React, { useState } from 'react';
import {
  ArrowUpRight,
  X,
  Building2,
  FileText,
  AlertTriangle,
  CheckCircle,
  Activity,
  ClipboardList,
  FileSearch,
  MonitorPlay,
  Map,
  Box,
  FolderOpen,
  ShieldCheck,
  BarChart,
  Clock,
  History,
  Plus,
  Calendar,
  MapPin
} from 'lucide-react';
import Link from 'next/link';
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function GovernmentCommandCenter() {
  const [showAlertsModal, setShowAlertsModal] = useState(true);
  const [userRole, setUserRole] = useState<'Agency Head' | 'Director' | 'Inspector'>('Agency Head');

  return (
    <div className="h-full flex flex-col pt-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-lg">
              <Building2 size={20} />
            </div>
            <h1 className="text-[32px] font-bold text-[#022C4F] leading-tight">
              Government Command Center
            </h1>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed ml-[52px]">
            Monitor government-supervised construction projects, regulatory activities, inspections, compliance, approvals, and field operations from a centralized oversight dashboard.
          </p>
        </div>
        <TopRightControls />
      </div>

      {/* Role Toggle for Usability Concern 1 */}
      <div className="flex items-center gap-2 mb-6 p-1 bg-slate-200/50 rounded-xl w-fit border border-slate-200/50">
        <button onClick={() => setUserRole('Agency Head')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Agency Head' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Agency Head</button>
        <button onClick={() => setUserRole('Director')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Director' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Director</button>
        <button onClick={() => setUserRole('Inspector')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${userRole === 'Inspector' ? 'bg-white text-[#022C4F] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Inspector</button>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 pb-8">
        {/* Main Column */}
        <div className="flex-1 flex flex-col gap-8">
          
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { title: "Active Projects", value: "48", icon: Building2, color: "blue" },
              { title: "Under Review", value: "12", icon: FileSearch, color: "amber" },
              { title: "Pending Approvals", value: "18", icon: Clock, color: "purple" },
              { title: "Active Inspections", value: "9", icon: Activity, color: "emerald" },
              { title: "Compliance Issues", value: "7", icon: ShieldCheck, color: "orange" },
              { title: "Critical Alerts", value: "3", icon: AlertTriangle, color: "red" }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white rounded-2xl border border-slate-100 p-4 flex flex-col shadow-sm hover:shadow-md transition-all group border-l-4 border-l-${stat.color}-500`}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.title}</span>
                </div>
                <div className="flex items-end justify-between mt-auto">
                  <span className={`text-3xl font-bold text-${stat.color}-600 group-hover:scale-110 transition-transform origin-left`}>{stat.value}</span>
                  <div className={`p-2 rounded-lg bg-${stat.color}-50 text-${stat.color}-500`}>
                    <stat.icon size={18} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Portfolio */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                  <Building2 size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Project Portfolio</h2>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-1">Construction Progress</h3>
                <p className="text-2xl font-bold text-[#022C4F]">48 Active Projects</p>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">Track overall project progress, construction status, milestones, and regulatory compliance across all government-supervised developments.</p>
              </div>
              <div className="mb-6">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Filters</h4>
                <div className="flex flex-wrap gap-2">
                  {['All Projects', 'On Track', 'At Risk', 'Delayed', 'Critical'].map(filter => (
                    <span key={filter} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 cursor-pointer border border-slate-200 transition-colors">{filter}</span>
                  ))}
                </div>
              </div>
              <button className="mt-auto w-full py-3 bg-[#022C4F] text-white rounded-xl text-sm font-semibold hover:bg-[#033b6a] transition-all flex items-center justify-center gap-2 group-hover:gap-3 shadow-lg shadow-[#022C4F]/20">
                View Project Portfolio <ArrowUpRight size={16} />
              </button>
            </div>
            )}

            {/* Regulatory Workflow */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                  <ClipboardList size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Regulatory Workflow</h2>
              </div>
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Pending Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-xl font-bold text-[#022C4F]">18</span>
                    <span className="text-xs font-medium text-slate-500">Approvals</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-xl font-bold text-[#022C4F]">12</span>
                    <span className="text-xs font-medium text-slate-500">Permit Reviews</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-xl font-bold text-[#022C4F]">9</span>
                    <span className="text-xs font-medium text-slate-500">Inspection Requests</span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <span className="block text-xl font-bold text-[#022C4F]">7</span>
                    <span className="text-xs font-medium text-slate-500">Compliance Actions</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Review Applications</button>
                <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Approve Requests</button>
                <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Schedule Inspection</button>
                <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">View Compliance</button>
              </div>
            </div>
            )}

            {/* Construction Monitoring */}
            {(userRole === 'Agency Head' || userRole === 'Inspector') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                  <MonitorPlay size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Construction Monitoring</h2>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Site Activity (Today)</h3>
                <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                  <span>Site Visits</span><span className="font-bold">14</span>
                </div>
                <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                  <span>Field Observations</span><span className="font-bold">27</span>
                </div>
                <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                  <span>Issues Reported</span><span className="font-bold">11</span>
                </div>
                <div className="flex items-center justify-between px-2 text-sm font-medium text-[#022C4F] mb-1">
                  <span>Progress Updates</span><span className="font-bold">8</span>
                </div>
              </div>
              <div className="mt-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Site Status</h4>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between bg-emerald-50 text-emerald-700 px-3 py-2 rounded-lg text-xs font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Normal</span>
                    <span>32 Projects</span>
                  </div>
                  <div className="flex items-center justify-between bg-amber-50 text-amber-700 px-3 py-2 rounded-lg text-xs font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Attention Required</span>
                    <span>11 Projects</span>
                  </div>
                  <div className="flex items-center justify-between bg-red-50 text-red-700 px-3 py-2 rounded-lg text-xs font-bold">
                    <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-red-500"></div> Critical</span>
                    <span>5 Projects</span>
                  </div>
                </div>
              </div>
            </div>
            )}

            {/* Compliance Overview */}
            {(userRole === 'Agency Head' || userRole === 'Director') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-sky-50 text-sky-600 rounded-xl">
                  <ShieldCheck size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Compliance Overview</h2>
              </div>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Compliance Status</h3>
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700">
                    <span className="flex items-center gap-1.5">🟢 Compliant</span><span>34 Projects</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-50 text-amber-700">
                    <span className="flex items-center gap-1.5">🟡 Under Review</span><span>9 Projects</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-orange-50 text-orange-700">
                    <span className="flex items-center gap-1.5">🟠 Non-Compliant</span><span>4 Projects</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-700">
                    <span className="flex items-center gap-1.5">🔴 Critical Violation</span><span>1 Project</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Priority Actions</h4>
                <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4 mb-4 font-medium">
                  <li>Resolve outstanding inspection findings</li>
                  <li>Review expired permits</li>
                  <li>Verify corrective actions</li>
                </ul>
                <button className="w-full py-2.5 border border-sky-200 text-sky-700 bg-sky-50 rounded-xl text-sm font-semibold hover:bg-sky-100 transition-colors flex items-center justify-center gap-2">
                  View Compliance Dashboard
                </button>
              </div>
            </div>
            )}

            {/* Inspection Overview */}
            {(userRole === 'Agency Head' || userRole === 'Inspector') && (
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all lg:col-span-2 xl:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
                  <FileSearch size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Inspection Overview</h2>
              </div>
              <div className="grid grid-cols-5 gap-2 mb-6">
                <div className="flex flex-col items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-lg font-bold text-[#022C4F]">16</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Scheduled</span>
                </div>
                <div className="flex flex-col items-center bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                  <span className="text-lg font-bold text-emerald-600">9</span>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase mt-0.5">Completed</span>
                </div>
                <div className="flex flex-col items-center bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <span className="text-lg font-bold text-amber-600">7</span>
                  <span className="text-[10px] font-bold text-amber-700 uppercase mt-0.5">Pending</span>
                </div>
                <div className="flex flex-col items-center bg-red-50 p-2 rounded-lg border border-red-100">
                  <span className="text-lg font-bold text-red-600">2</span>
                  <span className="text-[10px] font-bold text-red-700 uppercase mt-0.5">Failed</span>
                </div>
                <div className="flex flex-col items-center bg-orange-50 p-2 rounded-lg border border-orange-100">
                  <span className="text-lg font-bold text-orange-600">4</span>
                  <span className="text-[10px] font-bold text-orange-700 uppercase mt-0.5 text-center leading-none">Re-Insp</span>
                </div>
              </div>
              
              <div className="mt-auto">
                <h3 className="text-sm font-semibold text-slate-500 mb-3">Today's Schedule</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="px-2 py-1 bg-white rounded shadow-sm text-xs font-bold text-[#022C4F]">09:00 AM</div>
                    <div>
                      <p className="text-xs font-bold text-[#022C4F]">Structural Inspection</p>
                      <p className="text-[10px] font-medium text-slate-500 line-clamp-1">Victoria Heights Commercial Dev</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="px-2 py-1 bg-white rounded shadow-sm text-xs font-bold text-[#022C4F]">11:30 AM</div>
                    <div>
                      <p className="text-xs font-bold text-[#022C4F]">Safety Inspection</p>
                      <p className="text-[10px] font-medium text-slate-500 line-clamp-1">Lekki Commercial Plaza</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="px-2 py-1 bg-white rounded shadow-sm text-xs font-bold text-[#022C4F]">02:00 PM</div>
                    <div>
                      <p className="text-xs font-bold text-[#022C4F]">Progress Inspection</p>
                      <p className="text-[10px] font-medium text-slate-500 line-clamp-1">Ikeja Mixed-Use Development</p>
                    </div>
                  </div>
                </div>
                <button className="mt-4 w-full py-2.5 border border-orange-200 text-orange-700 bg-orange-50 rounded-xl text-sm font-semibold hover:bg-orange-100 transition-colors">
                  View Inspection Schedule
                </button>
              </div>
            </div>
            )}

            {/* Tersus Site Positioning */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all lg:col-span-2 xl:col-span-1 bg-gradient-to-br from-white to-slate-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl">
                  <Map size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Tersus Site Positioning</h2>
              </div>
              <div className="mb-4 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-xs font-bold text-emerald-700">Tersus Integration Connected</span>
                </div>
                <span className="text-[10px] font-semibold text-emerald-600">Sync: Today 10:42 AM</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-[#022C4F]">8</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Active Sites</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-[#022C4F]">126</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Verified Pts</span>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 text-center">
                  <span className="block text-2xl font-bold text-amber-600">4</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-1">Pending Check</span>
                </div>
              </div>
              <div className="mt-auto grid grid-cols-2 gap-2">
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><MapPin size={14}/> Site Map</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><Activity size={14}/> GNSS Data</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><CheckCircle size={14}/> Verify Coords</button>
                <button className="py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#022C4F] hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5"><FolderOpen size={14}/> Survey Data</button>
              </div>
            </div>
            
          </div>

          {/* BIM & Digital Oversight Row (Full Width span) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Box size={20} />
              </div>
              <h2 className="text-lg font-bold text-[#022C4F]">BIM & Digital Oversight</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-center">
                <span className="block text-2xl font-bold text-[#022C4F]">24</span>
                <span className="text-xs font-semibold text-slate-500 mt-1">Active BIM Models</span>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-center">
                <span className="block text-2xl font-bold text-amber-600">8</span>
                <span className="text-xs font-semibold text-amber-700 mt-1">Awaiting Review</span>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                <span className="block text-2xl font-bold text-blue-600">13</span>
                <span className="text-xs font-semibold text-blue-700 mt-1">Recent Updates</span>
              </div>
              <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 text-center">
                <span className="block text-2xl font-bold text-orange-600">5</span>
                <span className="text-xs font-semibold text-orange-700 mt-1">Coordination Issues</span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-auto">
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Open BIM Models</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">Review Design</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">View Model Issues</button>
              <button className="py-2.5 border border-[#022C4F]/20 rounded-xl text-xs font-semibold text-[#022C4F] hover:bg-[#022C4F] hover:text-white transition-colors">View Approved Models</button>
            </div>
          </div>

          {/* Structural Risk Index Row (Full Width span) */}
          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col group hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#022C4F]">Structural Risk Index</h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Risk-based prioritization framework for building collapse prevention</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {/* CRITICAL */}
              <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-red-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Critical Risk</span>
                  <span className="text-xl font-bold text-red-600">2<span className="text-[9px] text-red-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Active construction without permit, structural deviation &gt;10%, expired approvals.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-red-700 bg-red-100/50 p-2.5 rounded-lg border border-red-200/50 flex items-center justify-center text-center leading-snug">Immediate site visit, stop-work order</p>
                </div>
              </div>

              {/* HIGH */}
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-orange-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">High Risk</span>
                  <span className="text-xl font-bold text-orange-600">5<span className="text-[9px] text-orange-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Compliance violations, incomplete inspections, pending critical approvals.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-orange-700 bg-orange-100/50 p-2.5 rounded-lg border border-orange-200/50 flex items-center justify-center text-center leading-snug">Urgent inspection within 48 hours</p>
                </div>
              </div>

              {/* MEDIUM */}
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><AlertTriangle size={80} className="text-blue-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Medium Risk</span>
                  <span className="text-xl font-bold text-blue-600">12<span className="text-[9px] text-blue-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Minor deviations, documentation gaps, upcoming permit expiry.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-blue-700 bg-blue-100/50 p-2.5 rounded-lg border border-blue-200/50 flex items-center justify-center text-center leading-snug">Scheduled inspection within 7 days</p>
                </div>
              </div>

              {/* LOW */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex flex-col h-full shadow-sm relative overflow-hidden">
                <div className="absolute -top-4 -right-4 p-3 opacity-10"><ShieldCheck size={80} className="text-emerald-500" /></div>
                <div className="flex items-center justify-between mb-3 relative z-10">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase tracking-wider rounded-md">Low Risk</span>
                  <span className="text-xl font-bold text-emerald-600">29<span className="text-[9px] text-emerald-500/80 ml-1 uppercase">Projects</span></span>
                </div>
                <div className="mb-4 relative z-10 flex-1">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Criteria</h4>
                  <p className="text-xs font-medium text-slate-700 leading-relaxed">Compliant, all approvals current, regular site activity reported.</p>
                </div>
                <div className="mt-auto relative z-10">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Action Required</h4>
                  <p className="text-xs font-bold text-emerald-700 bg-emerald-100/50 p-2.5 rounded-lg border border-emerald-200/50 flex items-center justify-center text-center leading-snug">Routine monitoring & oversight</p>
                </div>
              </div>
            </div>
          </div>

          {/* Critical Alerts & Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Critical Alerts */}
            <div className="bg-white rounded-2xl border border-red-100 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Critical Alerts</h2>
              </div>
              
              <div className="flex flex-col gap-3">
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-red-600 text-white px-1.5 py-0.5 rounded">Critical</span>
                    </div>
                    <h4 className="text-sm font-bold text-red-900 mb-0.5">Structural inspection failed</h4>
                    <p className="text-xs font-medium text-red-700 mb-2">Victoria Heights Commercial Development</p>
                    <button className="text-[11px] font-bold uppercase tracking-wider text-white bg-red-600 px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors">Schedule Re-Inspection</button>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-orange-500 text-white px-1.5 py-0.5 rounded">High</span>
                    </div>
                    <h4 className="text-sm font-bold text-orange-900 mb-0.5">Permit approaching expiration</h4>
                    <p className="text-xs font-medium text-orange-700 mb-2">Lekki Commercial Plaza</p>
                    <button className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-200 px-3 py-1.5 rounded-lg hover:bg-orange-300 transition-colors">Review Renewal</button>
                  </div>
                </div>
                
                <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500 text-white px-1.5 py-0.5 rounded">Medium</span>
                    </div>
                    <h4 className="text-sm font-bold text-amber-900 mb-0.5">Construction activity outside scope</h4>
                    <p className="text-xs font-medium text-amber-700 mb-2">Ikeja Mixed-Use Development</p>
                    <button className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200 px-3 py-1.5 rounded-lg hover:bg-amber-300 transition-colors">Review Evidence</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-[#022C4F]/10 text-[#022C4F] rounded-xl">
                  <Activity size={20} />
                </div>
                <h2 className="text-lg font-bold text-[#022C4F]">Quick Actions</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-auto">
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-blue-500 hover:bg-blue-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center shrink-0"><Plus size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-blue-700">Register Project</span>
                  </div>
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-purple-500 hover:bg-purple-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-purple-100 text-purple-600 flex items-center justify-center shrink-0"><FileText size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-purple-700">Review Application</span>
                  </div>
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-orange-500 hover:bg-orange-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-orange-100 text-orange-600 flex items-center justify-center shrink-0"><Calendar size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-orange-700">Schedule Inspection</span>
                  </div>
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0"><MapPin size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-emerald-700">Verify Site</span>
                  </div>
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-indigo-500 hover:bg-indigo-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0"><Box size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-indigo-700">Review BIM Model</span>
                  </div>
                </button>
                <button className="p-3 border border-slate-200 rounded-xl flex flex-col gap-2 hover:border-sky-500 hover:bg-sky-50 transition-all group items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-sky-100 text-sky-600 flex items-center justify-center shrink-0"><BarChart size={14}/></div>
                    <span className="text-sm font-bold text-[#022C4F] group-hover:text-sky-700">Generate Report</span>
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-[300px] flex flex-col gap-6 shrink-0">
          
          <div className="bg-[#022C4F] text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500/20 rounded-full blur-2xl"></div>
            
            <h3 className="text-lg font-bold mb-6 relative z-10">Agency Status</h3>
            
            <div className="flex flex-col gap-4 relative z-10">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Systems</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Operational
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Tersus Connect</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Connected
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Active Officers</span>
                <span className="text-sm font-bold">24</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-sm font-medium text-white/80">Pending Actions</span>
                <span className="text-sm font-bold text-amber-400">46</span>
              </div>
              <div className="flex items-center justify-between pb-2">
                <span className="text-sm font-medium text-white/80">Data Sync</span>
                <span className="text-xs font-semibold text-white/60">Today • 10:42 AM</span>
              </div>
            </div>

            <button className="w-full mt-6 py-3 bg-white text-[#022C4F] rounded-xl text-sm font-bold hover:bg-blue-50 transition-colors shadow-lg">
              View Project Portfolio
            </button>
            <div className="mt-3 flex flex-col gap-2">
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Review Pending Approvals
              </button>
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Schedule Inspection
              </button>
              <button className="w-full py-2.5 border border-white/20 text-white rounded-xl text-xs font-semibold hover:bg-white/10 transition-colors">
                Open Site Monitoring
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2"><BarChart size={16}/> Performance Snapshot</h3>
            <div className="flex flex-col gap-4">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Projects On Schedule</span>
                  <span className="text-sm font-bold text-emerald-600">78%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[78%] h-full bg-emerald-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Inspection Completion</span>
                  <span className="text-sm font-bold text-blue-600">82%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[82%] h-full bg-blue-500 rounded-full"></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-semibold text-slate-500">Compliance Rate</span>
                  <span className="text-sm font-bold text-[#022C4F]">91%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="w-[91%] h-full bg-[#022C4F] rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-lg font-bold text-[#022C4F]">4.2<span className="text-xs">d</span></span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 block line-clamp-1">Approval Time</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="block text-lg font-bold text-[#022C4F]">87%</span>
                  <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5 block line-clamp-1">Issues Resolved</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex flex-col">
            <h3 className="text-sm font-bold text-[#022C4F] mb-4 flex items-center gap-2"><History size={16}/> Recent Activity</h3>
            <div className="flex flex-col gap-0 relative before:absolute before:inset-y-2 before:left-[11px] before:w-[2px] before:bg-slate-100">
              {[
                { text: "Permit application approved", time: "1h ago", dot: "bg-emerald-500" },
                { text: "Structural inspection completed", time: "2h ago", dot: "bg-blue-500" },
                { text: "New project submitted", time: "4h ago", dot: "bg-purple-500" },
                { text: "Site issue escalated", time: "5h ago", dot: "bg-red-500" },
                { text: "BIM model revision approved", time: "6h ago", dot: "bg-indigo-500" },
                { text: "Tersus data synchronized", time: "Today 10:42", dot: "bg-sky-500" },
                { text: "Compliance report submitted", time: "Yesterday", dot: "bg-orange-500" },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-4 py-2.5 relative z-10">
                  <div className={`w-6 h-6 rounded-full border-4 border-white shrink-0 ${activity.dot} shadow-sm`}></div>
                  <div className="flex flex-col pt-0.5">
                    <span className="text-xs font-bold text-[#022C4F] leading-snug">{activity.text}</span>
                    <span className="text-[10px] font-medium text-slate-400">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-4 text-xs font-bold text-[#022C4F] hover:text-blue-600 transition-colors w-full text-center">View All Activity</button>
          </div>

        </div>
      </div>

      {/* Critical Alerts Modal on Login */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="p-6 bg-red-50 border-b border-red-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-xl">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-red-900 leading-tight">Critical Alerts</h2>
                  <p className="text-sm font-medium text-red-700">Immediate attention required</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="p-2 text-red-500 hover:bg-red-200 hover:text-red-700 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
              <div className="p-4 rounded-xl border border-red-200 bg-red-50 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                <div className="w-full">
                  <h4 className="text-sm font-bold text-red-900 mb-0.5">Structural inspection failed</h4>
                  <p className="text-xs font-medium text-red-700 mb-3">Victoria Heights Commercial Development</p>
                  <button className="text-[11px] font-bold uppercase tracking-wider text-white bg-red-600 px-4 py-2.5 rounded-lg hover:bg-red-700 transition-colors w-full">Schedule Re-Inspection</button>
                </div>
              </div>
              
              <div className="p-4 rounded-xl border border-orange-200 bg-orange-50 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 shrink-0"></div>
                <div className="w-full">
                  <h4 className="text-sm font-bold text-orange-900 mb-0.5">Permit approaching expiration</h4>
                  <p className="text-xs font-medium text-orange-700 mb-3">Lekki Commercial Plaza</p>
                  <button className="text-[11px] font-bold uppercase tracking-wider text-orange-700 bg-orange-200 px-4 py-2.5 rounded-lg hover:bg-orange-300 transition-colors w-full">Review Renewal</button>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                <div className="w-full">
                  <h4 className="text-sm font-bold text-amber-900 mb-0.5">Construction activity outside scope</h4>
                  <p className="text-xs font-medium text-amber-700 mb-3">Ikeja Mixed-Use Development</p>
                  <button className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-200 px-4 py-2.5 rounded-lg hover:bg-amber-300 transition-colors w-full">Review Evidence</button>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setShowAlertsModal(false)}
                className="px-6 py-2.5 bg-[#022C4F] text-white rounded-xl text-sm font-bold hover:bg-[#033b6a] transition-all shadow-md shadow-[#022C4F]/20"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
