"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Plus, MoreHorizontal, MessageSquare, Paperclip, Clock, CheckCircle2 } from "lucide-react";

export default function CorrectiveActions() {
  const columns = [
    {
      id: "todo",
      title: "To Do",
      color: "bg-gray-100",
      textColor: "text-gray-700",
      count: 2,
      cards: [
        { id: "CAPA-092", title: "Install extra tie-offs on Sector 4 scaffolding", priority: "High", ncr: "NCR-104", dueDate: "Oct 14, 2026", comments: 2, attachments: 0 },
        { id: "CAPA-093", title: "Update subcontractor approval list in system", priority: "Medium", ncr: "NCR-101", dueDate: "Oct 15, 2026", comments: 0, attachments: 1 },
      ]
    },
    {
      id: "in-progress",
      title: "In Progress",
      color: "bg-blue-50",
      textColor: "text-blue-700",
      count: 1,
      cards: [
        { id: "CAPA-091", title: "Retest Concrete Batch B with independent lab", priority: "Critical", ncr: "NCR-103", dueDate: "Oct 13, 2026", comments: 5, attachments: 2 },
      ]
    },
    {
      id: "review",
      title: "Under Review",
      color: "bg-amber-50",
      textColor: "text-amber-700",
      count: 1,
      cards: [
        { id: "CAPA-089", title: "Repair damaged environmental silt fence", priority: "High", ncr: "NCR-099", dueDate: "Oct 10, 2026", comments: 1, attachments: 3 },
      ]
    },
    {
      id: "closed",
      title: "Closed",
      color: "bg-emerald-50",
      textColor: "text-emerald-700",
      count: 1,
      cards: [
        { id: "CAPA-090", title: "Install warning signage at Loading Bay 2", priority: "Low", ncr: "NCR-102", dueDate: "Oct 09, 2026", comments: 0, attachments: 1 },
      ]
    }
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700';
      case 'High': return 'bg-amber-100 text-amber-700';
      case 'Medium': return 'bg-blue-100 text-blue-700';
      case 'Low': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-blue-500" />
            Corrective & Preventive Actions (CAPA)
          </h1>
          <p className="text-gray-500 mt-1">Manage task workflows to resolve compliance deviations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold">
            View as List
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold">
            <Plus size={16} />
            New CAPA
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-6 min-w-max h-full">
          {columns.map((col, colIdx) => (
            <div key={col.id} className="w-80 flex flex-col h-full bg-gray-50/50 rounded-2xl border border-gray-100 p-4 shrink-0">
              <div className="flex items-center justify-between mb-4 px-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-bold text-sm uppercase tracking-wider ${col.textColor}`}>{col.title}</h3>
                  <span className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${col.color} ${col.textColor}`}>
                    {col.count}
                  </span>
                </div>
                <button className="text-gray-400 hover:text-gray-700 transition-colors">
                  <MoreHorizontal size={18} />
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {col.cards.map((card, cardIdx) => (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: (colIdx * 0.1) + (cardIdx * 0.05) }}
                    key={card.id}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${getPriorityStyle(card.priority)}`}>
                        {card.priority}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-500">{card.id}</span>
                    </div>
                    
                    <h4 className="font-bold text-gray-900 text-sm mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                      {card.title}
                    </h4>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase">Related:</span>
                      <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                        {card.ncr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                        <Clock size={12} className={col.id === 'closed' ? 'text-emerald-500' : 'text-amber-500'} />
                        {card.dueDate}
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        {card.comments > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            <MessageSquare size={12} /> {card.comments}
                          </div>
                        )}
                        {card.attachments > 0 && (
                          <div className="flex items-center gap-1 text-[11px] font-bold">
                            <Paperclip size={12} /> {card.attachments}
                          </div>
                        )}
                        {col.id === 'closed' && <CheckCircle2 size={14} className="text-emerald-500" />}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Task Button */}
                <button className="w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-sm font-semibold">
                  <Plus size={16} /> Add CAPA
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
