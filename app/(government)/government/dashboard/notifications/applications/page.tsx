"use client";

import React from "react";
import { motion } from "framer-motion";
import { Bell, Briefcase, FileText, Check, Clock, ExternalLink, Filter, CheckCircle2 } from "lucide-react";

export default function ApplicationNotifications() {
  const notifications = [
    {
      id: "NOT-9102",
      title: "New Subcontractor Prequalification Submitted",
      applicant: "Vertex Engineering Solutions",
      type: "Prequalification",
      submittedAt: "2 hours ago",
      isUnread: true,
      priority: "Medium",
      snippet: "Vertex Engineering has submitted their QA/QC manual and past performance logs for review to bid on MEP packages."
    },
    {
      id: "NOT-9101",
      title: "Phase 3 Zoning Variance Request",
      applicant: "Nexucon Master Dev",
      type: "Permit Application",
      submittedAt: "5 hours ago",
      isUnread: true,
      priority: "High",
      snippet: "Requesting a 15ft variance on the western boundary setback to accommodate updated structural footings."
    },
    {
      id: "NOT-9088",
      title: "Updated Night-Shift Operations Plan",
      applicant: "Apex Construction",
      type: "Operational",
      submittedAt: "1 day ago",
      isUnread: false,
      priority: "Medium",
      snippet: "Revised noise mitigation strategy and lighting plan for Q4 night shift operations."
    },
    {
      id: "NOT-9085",
      title: "Environmental Impact Baseline Report",
      applicant: "EcoSolve Ltd.",
      type: "Document Submission",
      submittedAt: "2 days ago",
      isUnread: false,
      priority: "Low",
      snippet: "Initial baseline readings for soil composition in Sector 4 prior to mass excavation."
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <Bell className="text-blue-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            New Applications
          </h1>
          <p className="text-gray-500 mt-1">Recent submissions, permit applications, and documents awaiting initial triage.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Unread Only
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <CheckCircle2 size={16} />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {notifications.map((notif, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={notif.id}
            className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all ${
              notif.isUnread ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            {/* Icon Column */}
            <div className="shrink-0 pt-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                notif.isUnread ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                {notif.type === 'Permit Application' ? <Briefcase size={20} /> : <FileText size={20} />}
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className={`text-base font-bold ${notif.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {notif.title}
                </h3>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {notif.submittedAt}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-gray-500">{notif.applicant}</span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {notif.type}
                </span>
                {notif.priority === 'High' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    High Priority
                  </span>
                )}
              </div>
              
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {notif.snippet}
              </p>
              
              <div className="flex items-center gap-3">
                <button className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  notif.isUnread ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  Review Application <ExternalLink size={14} />
                </button>
                {notif.isUnread && (
                  <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <Check size={14} /> Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
