"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, MoreVertical, Paperclip, MessageCircle } from "lucide-react";

export default function ModelAnnotations() {
  const [filter, setFilter] = useState('all');

  const annotations = [
    { id: "ANN-104", desc: "HVAC ducting clash with secondary steel beams in Zone A", model: "Downtown Metro - MEP", status: "Open", priority: "High", comments: 3, attachments: 1, date: "Oct 12, 2026" },
    { id: "ANN-103", desc: "Missing fire damper specifications on level 2", model: "City Hospital - Architecture", status: "In Progress", priority: "Medium", comments: 5, attachments: 2, date: "Oct 11, 2026" },
    { id: "ANN-102", desc: "Verify clearance height for platform screen doors", model: "Downtown Metro - Arch", status: "Resolved", priority: "High", comments: 2, attachments: 0, date: "Oct 09, 2026" },
    { id: "ANN-101", desc: "Update structural concrete grade to C40/50", model: "Highway Bridge A4 - Str", status: "Resolved", priority: "Medium", comments: 1, attachments: 1, date: "Oct 08, 2026" },
    { id: "ANN-100", desc: "Inconsistent lighting fixture families used", model: "Riverside Commercial - MEP", status: "Closed", priority: "Low", comments: 0, attachments: 0, date: "Oct 05, 2026" },
  ];

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Open': return 'bg-red-50 text-red-700 border-red-200';
      case 'In Progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority) {
      case 'High': return 'text-red-600 bg-red-100/50';
      case 'Medium': return 'text-amber-600 bg-amber-100/50';
      default: return 'text-blue-600 bg-blue-100/50';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Model Annotations
          </h1>
          <p className="text-gray-500 mt-1">Track and manage markups, questions, and action items across models.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search annotations..." 
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
            <Filter size={18} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {['all', 'open', 'resolved'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">ID</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Description</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Model</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Priority</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500">Activity</th>
              <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {annotations.filter(a => filter === 'all' || a.status.toLowerCase() === filter).map((ann, idx) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={ann.id} 
                className="hover:bg-gray-50/50 transition-colors cursor-pointer group"
              >
                <td className="py-4 px-6 font-mono text-sm font-bold text-gray-700">{ann.id}</td>
                <td className="py-4 px-6">
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{ann.desc}</p>
                </td>
                <td className="py-4 px-6 text-sm text-gray-600">{ann.model}</td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getStatusStyle(ann.status)}`}>
                    {ann.status}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${getPriorityStyle(ann.priority)}`}>
                    {ann.priority}
                  </span>
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="flex items-center gap-1 text-xs font-semibold" title="Comments">
                      <MessageCircle size={14} className={ann.comments > 0 ? "text-blue-500" : ""} />
                      {ann.comments}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold" title="Attachments">
                      <Paperclip size={14} className={ann.attachments > 0 ? "text-blue-500" : ""} />
                      {ann.attachments}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-right">
                  <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-all">
                    <MoreVertical size={16} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
