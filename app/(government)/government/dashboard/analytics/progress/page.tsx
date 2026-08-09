"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, CalendarDays, CheckCircle2, Circle, ArrowRight, Flag, Calendar, Target, MoveRight } from "lucide-react";

export default function ConstructionProgress() {
  const milestones = [
    { id: 1, title: "Site Mobilization", date: "Jan 15, 2026", status: "completed" },
    { id: 2, title: "Foundation Complete", date: "Mar 30, 2026", status: "completed" },
    { id: 3, title: "Structural Steel 50%", date: "Jul 15, 2026", status: "completed" },
    { id: 4, title: "Building Topped Out", date: "Oct 25, 2026", status: "in-progress" },
    { id: 5, title: "Facade Watertight", date: "Jan 10, 2027", status: "upcoming" },
    { id: 6, title: "MEP Final Commissioning", date: "Apr 05, 2027", status: "upcoming" },
    { id: 7, title: "Substantial Completion", date: "Jun 30, 2027", status: "upcoming" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-blue-500" />
            Construction Progress
          </h1>
          <p className="text-gray-500 mt-1">Track physical progress, EVM metrics, and critical path milestones.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* EVM Overview */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Earned Value Management (EVM)</h2>
            <select className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 rounded-lg px-3 py-1.5 focus:outline-none">
              <option>Project to Date</option>
              <option>Last 30 Days</option>
              <option>Current Quarter</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Planned Value (PV)</span>
              <p className="text-xl font-bold text-gray-900 mt-1">$45.2M</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Earned Value (EV)</span>
              <p className="text-xl font-bold text-emerald-600 mt-1">$43.1M</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Actual Cost (AC)</span>
              <p className="text-xl font-bold text-blue-600 mt-1">$41.5M</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Estimate at Comp.</span>
              <p className="text-xl font-bold text-gray-900 mt-1">$118.5M</p>
            </div>
          </div>

          <div className="h-64 bg-gray-50/50 rounded-xl border border-dashed border-gray-200 relative overflow-hidden flex items-end p-6 gap-0">
             {/* S-Curve CSS Representation */}
             <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               {/* Grid lines */}
               <path d="M0,25 L100,25 M0,50 L100,50 M0,75 L100,75" stroke="#F3F4F6" strokeWidth="0.5" fill="none" />
               {/* Planned Value (PV) Curve - Gray */}
               <path d="M0,90 Q30,90 50,50 T100,10" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeDasharray="4 4" />
               {/* Earned Value (EV) Curve - Emerald */}
               <path d="M0,90 Q25,85 40,60 T60,45" fill="none" stroke="#10B981" strokeWidth="3" />
               {/* Actual Cost (AC) Curve - Blue */}
               <path d="M0,90 Q25,80 40,55 T60,42" fill="none" stroke="#3B82F6" strokeWidth="3" />
             </svg>

             {/* Legend */}
             <div className="absolute top-4 left-4 bg-white/90 backdrop-blur border border-gray-100 shadow-sm p-3 rounded-lg text-xs font-semibold flex flex-col gap-2">
                <div className="flex items-center gap-2 text-gray-500"><span className="w-4 border-t-2 border-dashed border-gray-400"></span> Planned Value (PV)</div>
                <div className="flex items-center gap-2 text-emerald-700"><span className="w-4 border-t-2 border-solid border-emerald-500"></span> Earned Value (EV)</div>
                <div className="flex items-center gap-2 text-blue-700"><span className="w-4 border-t-2 border-solid border-blue-500"></span> Actual Cost (AC)</div>
             </div>
          </div>
        </div>

        {/* Schedule Variance */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarDays className="text-amber-500" /> Schedule Variance
          </h2>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-8">
              <span className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 text-amber-600 font-bold text-3xl mb-3 shadow-inner">
                -14
              </span>
              <h3 className="text-gray-900 font-bold">Days Behind Schedule</h3>
              <p className="text-xs text-gray-500 mt-1">Variance against baseline (SV)</p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Top Delay Factors</h4>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Steel Delivery (Zone 3)</span>
                <span className="text-xs font-bold text-red-600">-8 Days</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Weather (Rain)</span>
                <span className="text-xs font-bold text-red-600">-4 Days</span>
              </div>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-700">Permit Approval Lag</span>
                <span className="text-xs font-bold text-red-600">-2 Days</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Milestones Timeline */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg font-bold text-gray-900">Critical Path Milestones</h2>
          <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:text-blue-700">
            View Full Gantt <MoveRight size={16} />
          </button>
        </div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 hidden md:block"></div>
          
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2 relative z-10">
            {milestones.map((milestone, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                key={milestone.id}
                className="flex md:flex-col items-center gap-4 md:gap-3 flex-1"
              >
                {/* Mobile line connecting vertically */}
                {idx !== milestones.length - 1 && (
                   <div className="absolute left-[19px] top-10 w-0.5 h-12 bg-gray-100 md:hidden"></div>
                )}
                
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10 ${
                  milestone.status === 'completed' ? 'bg-emerald-500 text-white' :
                  milestone.status === 'in-progress' ? 'bg-blue-500 text-white animate-pulse' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  {milestone.status === 'completed' ? <CheckCircle2 size={20} /> :
                   milestone.status === 'in-progress' ? <Target size={20} /> :
                   <Circle size={20} />}
                </div>

                <div className="md:text-center">
                  <h4 className={`text-sm font-bold leading-tight mb-1 ${
                    milestone.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                  }`}>
                    {milestone.title}
                  </h4>
                  <div className={`text-xs font-semibold flex items-center md:justify-center gap-1 ${
                    milestone.status === 'completed' ? 'text-emerald-600' :
                    milestone.status === 'in-progress' ? 'text-blue-600' :
                    'text-gray-400'
                  }`}>
                    <Calendar size={12} /> {milestone.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
