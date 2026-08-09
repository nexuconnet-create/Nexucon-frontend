"use client";

import React from "react";
import { motion } from "framer-motion";
import { Clock, Filter, CheckCircle2, UserCircle, BellRing, Mail, MessageSquare } from "lucide-react";

export default function OverdueActions() {
  const actions = [
    {
      id: "ACT-092",
      title: "Environmental Impact Review (Phase 2)",
      assignee: "Sarah Jenkins",
      department: "Environmental",
      dueDate: "Oct 05, 2026",
      daysOverdue: 4,
      isUnread: true
    },
    {
      id: "ACT-091",
      title: "Sign-off: Concrete Pour #44 (Foundation)",
      assignee: "Marcus Chen",
      department: "Structural",
      dueDate: "Oct 07, 2026",
      daysOverdue: 2,
      isUnread: true
    },
    {
      id: "ACT-085",
      title: "Approve Subcontractor Safety Credentials",
      assignee: "David Rivera",
      department: "Safety",
      dueDate: "Sep 28, 2026",
      daysOverdue: 11,
      isUnread: false
    }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <Clock className="text-blue-500" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
            </div>
            Overdue Actions
          </h1>
          <p className="text-gray-500 mt-1">System-generated alerts for tasks that have missed their SLA.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors shrink-0 text-sm font-semibold shadow-sm">
            <Filter size={16} /> Filter by Dept
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            <CheckCircle2 size={16} />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {actions.map((action, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            key={action.id}
            className={`flex flex-col p-6 rounded-2xl border transition-all ${
              action.isUnread ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-base font-bold mb-1 ${action.isUnread ? 'text-gray-900' : 'text-gray-700'}`}>
                  {action.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono">{action.id}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{action.department}</span>
                </div>
              </div>
              
              {/* Overdue Badge */}
              <div className="shrink-0 flex flex-col items-end">
                <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-sm font-bold border ${
                  action.daysOverdue > 5 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {action.daysOverdue} Days Overdue
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Due: {action.dueDate}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</p>
                  <p className="text-sm font-bold text-gray-900">{action.assignee}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Send Email Reminder">
                  <Mail size={16} />
                </button>
                <button className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" title="Send Chat Message">
                  <MessageSquare size={16} />
                </button>
                <button className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${
                  action.isUnread ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}>
                  <BellRing size={16} /> Ping Assignee
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
