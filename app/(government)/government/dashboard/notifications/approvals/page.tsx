"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ExternalLink, Filter, CheckCircle2, FileSignature, AlertCircle, FileSearch } from "lucide-react";

export default function ApprovalRequestsNotifications() {
  const requests = [
    {
      id: "NOT-4421",
      refId: "TR-502",
      title: "Action Required: Technical Review (HVAC Load)",
      type: "Technical Review",
      dueDate: "Tomorrow",
      submittedAt: "2 hours ago",
      isUnread: true,
      priority: "High",
      from: "MEP Dept"
    },
    {
      id: "NOT-4420",
      refId: "DOC-992",
      title: "Signature Required: Master Subcontractor Agreement",
      type: "Document Sign-off",
      dueDate: "In 3 Days",
      submittedAt: "4 hours ago",
      isUnread: true,
      priority: "Medium",
      from: "Legal Dept"
    },
    {
      id: "NOT-4418",
      refId: "PRM-B-8902",
      title: "Permit Decision Pending: Foundation Excavation",
      type: "Permit Approval",
      dueDate: "Oct 15, 2026",
      submittedAt: "1 day ago",
      isUnread: false,
      priority: "High",
      from: "Building Dept"
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Document Sign-off': return <FileSignature size={20} />;
      case 'Technical Review': return <FileSearch size={20} />;
      case 'Permit Approval': return <CheckCircle size={20} />;
      default: return <AlertCircle size={20} />;
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <CheckCircle className="text-blue-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            Approval Requests
          </h1>
          <p className="text-gray-500 mt-1">Notifications for items currently sitting in your approval queue.</p>
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
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={req.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
              req.isUnread ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                req.isUnread ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                {getTypeIcon(req.type)}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.priority === 'High' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                  }`}>
                    {req.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {req.submittedAt}
                  </span>
                </div>
                
                <h3 className={`text-base font-bold mb-1 leading-snug ${req.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {req.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                  <span>From: {req.from}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="font-mono text-gray-400">REF: {req.refId}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className={`flex items-center gap-1 ${req.dueDate === 'Tomorrow' ? 'text-amber-600' : ''}`}>
                    Due: {req.dueDate}
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
               <button className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                 req.isUnread ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
               }`}>
                 Go to Action Center <ExternalLink size={16} />
               </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
