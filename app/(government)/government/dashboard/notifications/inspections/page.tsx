"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarSearch, MapPin, CalendarDays, CheckCircle2, Clock, X, MessageSquare, ShieldCheck, Filter } from "lucide-react";

export default function InspectionRequests() {
  const requests = [
    {
      id: "INSP-REQ-502",
      contractor: "Apex Construction",
      type: "Structural Framing",
      location: "Zone 3, Level 2",
      proposedDate: "Oct 18, 2026",
      proposedTime: "09:00 AM - 11:30 AM",
      submittedAt: "1 hour ago",
      isUnread: true,
      notes: "Requesting sign-off on structural framing before drywall installation begins."
    },
    {
      id: "INSP-REQ-501",
      contractor: "EcoSolve Ltd.",
      type: "Environmental Audit",
      location: "Site Perimeter & Water Runoff",
      proposedDate: "Oct 20, 2026",
      proposedTime: "01:00 PM - 04:00 PM",
      submittedAt: "4 hours ago",
      isUnread: true,
      notes: "Standard monthly environmental check. Silt fences have been re-secured."
    },
    {
      id: "INSP-REQ-498",
      contractor: "Spark Electric",
      type: "MEP Rough-in",
      location: "Zone 1, Level 5",
      proposedDate: "Oct 15, 2026",
      proposedTime: "10:00 AM - 12:00 PM",
      submittedAt: "1 day ago",
      isUnread: false,
      notes: "Ready for first-fix electrical inspection."
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <CalendarSearch className="text-blue-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            Inspection Requests
          </h1>
          <p className="text-gray-500 mt-1">Review contractor requests for site walk-throughs and quality sign-offs.</p>
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

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={req.id}
            className={`flex flex-col md:flex-row rounded-2xl border transition-all overflow-hidden ${
              req.isUnread ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            {/* Left Content Area */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${req.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {req.type} Inspection
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span>{req.contractor}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-mono">{req.id}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {req.submittedAt}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-3">
                <MapPin size={16} className="text-blue-500" /> {req.location}
              </div>
              
              <p className="text-sm text-gray-600 mb-0 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                "{req.notes}"
              </p>
            </div>

            {/* Right Action Area */}
            <div className={`p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between min-w-[280px] ${req.isUnread ? 'bg-blue-50/30 border-blue-100' : 'border-gray-100'}`}>
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Proposed Schedule</span>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                  <CalendarDays size={16} className="text-blue-500" /> {req.proposedDate}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 ml-6">
                  {req.proposedTime}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {req.isUnread ? (
                  <>
                    <button className="w-full py-2 bg-emerald-600 text-white rounded-lg font-bold shadow-sm hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2">
                      <ShieldCheck size={16} /> Accept Date & Time
                    </button>
                    <button className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                      <CalendarDays size={16} /> Propose New Time
                    </button>
                  </>
                ) : (
                  <button className="w-full py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2">
                    <MessageSquare size={16} /> Add Comment
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
