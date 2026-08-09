"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Search, Filter, Briefcase, FileCheck, ShieldAlert, Check, X, Clock, AlertTriangle } from "lucide-react";

export default function PermitDecisions() {
  const permits = [
    { 
      id: "PRM-B-8902", 
      title: "Foundation Excavation Permit (Zone 4)", 
      type: "Building", 
      applicant: "Apex Construction", 
      dateFiled: "Oct 10, 2026", 
      status: "Pending",
      urgency: "High"
    },
    { 
      id: "PRM-E-4421", 
      title: "Groundwater Discharge Authorization", 
      type: "Environmental", 
      applicant: "EcoSolve Ltd.", 
      dateFiled: "Oct 01, 2026", 
      status: "Approved",
      urgency: "Normal"
    },
    { 
      id: "PRM-S-1099", 
      title: "Crane Erection & Operation", 
      type: "Safety", 
      applicant: "SkyHigh Cranes", 
      dateFiled: "Oct 08, 2026", 
      status: "Denied",
      urgency: "Normal"
    },
    { 
      id: "PRM-B-8910", 
      title: "Temporary Road Closure (Main St)", 
      type: "Building", 
      applicant: "City Traffic Dept", 
      dateFiled: "Oct 12, 2026", 
      status: "Pending",
      urgency: "Medium"
    }
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Approved': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Denied': return 'text-red-700 bg-red-50 border-red-200';
      case 'Pending': return 'text-amber-700 bg-amber-50 border-amber-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Approved': return <Check size={14} className="text-emerald-500" />;
      case 'Denied': return <X size={14} className="text-red-500" />;
      case 'Pending': return <Clock size={14} className="text-amber-500" />;
      default: return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'Building': return <Briefcase size={20} className="text-blue-500" />;
      case 'Environmental': return <FileCheck size={20} className="text-emerald-500" />;
      case 'Safety': return <ShieldAlert size={20} className="text-amber-500" />;
      default: return <FileCheck size={20} className="text-gray-500" />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-blue-500" />
            Permit Decisions
          </h1>
          <p className="text-gray-500 mt-1">Review, approve, or deny official project permits.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search permits by title or ID..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {permits.map((permit, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={permit.id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-md hover:border-blue-200 transition-all"
          >
            <div className="p-5 flex-1">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                    {getTypeIcon(permit.type)}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold text-gray-500">{permit.id}</span>
                    <span className="block text-xs font-bold text-gray-400 uppercase tracking-wider">{permit.type} Permit</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-md border ${getStatusStyle(permit.status)}`}>
                  {getStatusIcon(permit.status)}
                  {permit.status}
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 leading-snug mb-4 group-hover:text-blue-600 transition-colors">
                {permit.title}
              </h3>

              <div className="grid grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100/50 mb-2">
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Applicant</span>
                  <p className="text-sm font-semibold text-gray-800 truncate">{permit.applicant}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Date Filed</span>
                  <p className="text-sm font-semibold text-gray-800">{permit.dateFiled}</p>
                </div>
              </div>
            </div>

            {permit.status === 'Pending' ? (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
                <button className="flex-1 py-2 bg-emerald-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <Check size={16} /> Approve
                </button>
                <button className="flex-1 py-2 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-bold shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2">
                  <X size={16} /> Deny
                </button>
              </div>
            ) : (
              <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  View Full Application
                </button>
                {permit.status === 'Denied' && (
                  <span className="flex items-center gap-1 text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded">
                    <AlertTriangle size={14} /> See Reason
                  </span>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
