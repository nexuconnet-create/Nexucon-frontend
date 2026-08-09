"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Clock, AlertCircle, FileText, User, Calendar, Check, X, MessageSquare, ChevronRight } from "lucide-react";

export default function PendingApprovals() {
  const [selectedItem, setSelectedItem] = useState<string | null>("REQ-8892");

  const pendingItems = [
    {
      id: "REQ-8892",
      title: "Phase 2 Environmental Impact Addendum",
      type: "Document",
      priority: "High",
      submittedBy: "EcoSolve Ltd.",
      submittedDate: "Oct 12, 2026",
      dueDate: "Oct 15, 2026",
      description: "Additional assessment required for the eastern boundary soil disruption. Needs expedited approval to prevent delay in foundation pour."
    },
    {
      id: "REQ-8891",
      title: "Structural Steel Shop Drawings (Z3)",
      type: "Technical",
      priority: "Medium",
      submittedBy: "Apex Engineering",
      submittedDate: "Oct 10, 2026",
      dueDate: "Oct 20, 2026",
      description: "Final shop drawings for zone 3 structural steel. Includes revised connection details per RFI-142."
    },
    {
      id: "REQ-8885",
      title: "Night Shift Work Permit - November",
      type: "Permit",
      priority: "Low",
      submittedBy: "J. Jenkins (Site Lead)",
      submittedDate: "Oct 05, 2026",
      dueDate: "Oct 25, 2026",
      description: "Standard monthly renewal for night shift operations. All noise mitigation protocols remain unchanged."
    }
  ];

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-red-700 bg-red-50 border-red-200';
      case 'Medium': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Low': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch(priority) {
      case 'High': return <AlertCircle size={14} className="text-red-500" />;
      case 'Medium': return <Clock size={14} className="text-amber-500" />;
      case 'Low': return <CheckCircle size={14} className="text-emerald-500" />;
      default: return null;
    }
  };

  const activeItem = pendingItems.find(item => item.id === selectedItem);

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <CheckCircle className="text-blue-500" />
            Action Center: Pending Approvals
          </h1>
          <p className="text-gray-500 mt-1">Review and action items currently awaiting your decision.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        {/* Left Column: Inbox List */}
        <div className="lg:w-1/3 flex flex-col gap-4">
          {pendingItems.map((item, idx) => (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={item.id}
              onClick={() => setSelectedItem(item.id)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedItem === item.id 
                  ? 'bg-blue-50/50 border-blue-200 shadow-md ring-1 ring-blue-500/20' 
                  : 'bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityStyle(item.priority)}`}>
                  {getPriorityIcon(item.priority)}
                  {item.priority}
                </span>
                <span className="text-[10px] font-mono font-bold text-gray-500">{item.id}</span>
              </div>
              <h3 className={`font-bold text-sm leading-snug mb-3 ${selectedItem === item.id ? 'text-blue-700' : 'text-gray-900'}`}>
                {item.title}
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <User size={12} /> {item.submittedBy}
                </div>
                <div className={`font-semibold ${item.priority === 'High' ? 'text-red-600' : ''}`}>
                  Due: {item.dueDate}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Detail View */}
        <div className="lg:w-2/3">
          <AnimatePresence mode="wait">
            {activeItem && (
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full min-h-[500px]"
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 uppercase tracking-wider">
                      {activeItem.type} Approval
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-400">
                      {activeItem.id}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {activeItem.title}
                  </h2>

                  <div className="flex flex-wrap items-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500 text-xs">
                        {activeItem.submittedBy.charAt(0)}
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Submitted By</p>
                        <p className="font-semibold">{activeItem.submittedBy}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Calendar size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Submitted Date</p>
                        <p className="font-semibold">{activeItem.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeItem.priority === 'High' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                        <Clock size={14} />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-gray-400 leading-none mb-0.5">Decision Required By</p>
                        <p className={`font-bold ${activeItem.priority === 'High' ? 'text-red-600' : 'text-amber-600'}`}>{activeItem.dueDate}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 bg-gray-50/30">
                  <h4 className="text-sm font-bold text-gray-900 mb-2">Description & Context</h4>
                  <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    {activeItem.description}
                  </p>

                  <h4 className="text-sm font-bold text-gray-900 mb-3">Attached Artifacts</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:border-blue-300 transition-colors cursor-pointer w-72">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-semibold text-gray-800 truncate">{activeItem.title}.pdf</p>
                        <p className="text-xs text-gray-400 mt-0.5">2.4 MB • Version 1.0</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-t border-gray-100 bg-white rounded-b-2xl flex items-center gap-4">
                  <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600 text-white rounded-xl font-bold shadow-md hover:bg-emerald-700 transition-colors">
                    <Check size={18} />
                    Approve Request
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-red-200 text-red-600 rounded-xl font-bold shadow-sm hover:bg-red-50 transition-colors">
                    <X size={18} />
                    Reject
                  </button>
                  <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors">
                    <MessageSquare size={18} />
                    Request Info
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
