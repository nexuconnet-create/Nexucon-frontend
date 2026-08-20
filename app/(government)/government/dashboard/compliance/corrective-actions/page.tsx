"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Activity, Plus, MoreHorizontal, MessageSquare, Paperclip, Clock, CheckCircle2, RefreshCw, ArrowRight } from "lucide-react";
import { CorrectiveActionPlan, getCAPAs, transitionCAPA } from "@/services/compliance";
import CreateCAPAModal from "@/components/dashboard/CreateCAPAModal";

export default function CorrectiveActions() {
  const [capas, setCapas] = useState<CorrectiveActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchCAPAs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCAPAs();
      setCapas(data);
    } catch (err) {
      console.error("Failed to load CAPAs", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCAPAs();
  }, [fetchCAPAs]);

  const handleAdvanceStatus = async (capa: CorrectiveActionPlan) => {
    const nextStatusMap: Record<string, string> = {
      'todo': 'in-progress',
      'in-progress': 'review',
      'review': 'closed',
      'closed': 'todo'
    };
    const nextStatus = nextStatusMap[capa.status] || 'in-progress';
    try {
      await transitionCAPA(capa.id, { status: nextStatus });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `CAPA "${capa.capa_reference}" moved to ${nextStatus.toUpperCase()}!`, type: 'info' } 
      }));
      fetchCAPAs();
    } catch (err) {
      console.error(err);
    }
  };

  const columnsConfig = [
    { id: "todo", title: "To Do", color: "bg-gray-100", textColor: "text-gray-700" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50", textColor: "text-blue-700" },
    { id: "review", title: "Under Review", color: "bg-amber-50", textColor: "text-amber-700" },
    { id: "closed", title: "Closed", color: "bg-emerald-50", textColor: "text-emerald-700" },
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
            Corrective & Preventive Actions (CAPA) Kanban
          </h1>
          <p className="text-gray-500 mt-1">Manage task workflows and statutory corrective actions to close compliance deviations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCAPAs}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-sm font-semibold"
          >
            <Plus size={16} />
            New CAPA Task
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-6 min-w-max h-full">
          {columnsConfig.map((col, colIdx) => {
            const colCards = capas.filter(c => c.status === col.id);
            return (
              <div key={col.id} className="w-80 flex flex-col h-full bg-gray-50/50 rounded-3xl border border-gray-100 p-4 shrink-0">
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-sm uppercase tracking-wider ${col.textColor}`}>{col.title}</h3>
                    <span className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${col.color} ${col.textColor}`}>
                      {colCards.length}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-4">
                  {colCards.map((card, cardIdx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (colIdx * 0.05) + (cardIdx * 0.03) }}
                      key={card.id}
                      className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group flex flex-col"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${getPriorityStyle(card.priority)}`}>
                          {card.priority}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-gray-500">{card.capa_reference}</span>
                      </div>
                      
                      <h4 className="font-bold text-gray-900 text-sm mb-3 group-hover:text-blue-600 transition-colors leading-snug">
                        {card.title}
                      </h4>

                      {card.ncr_reference && (
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase">Parent NCR:</span>
                          <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded-md">
                            {card.ncr_reference}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center justify-between border-t border-gray-100 pt-3 mt-auto">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                          <Clock size={12} className={col.id === 'closed' ? 'text-emerald-500' : 'text-amber-500'} />
                          {card.due_date || 'In 7 Days'}
                        </div>
                        <button 
                          onClick={() => handleAdvanceStatus(card)}
                          className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
                          title="Advance Status"
                        >
                          <span>Move</span>
                          <ArrowRight size={10} />
                        </button>
                      </div>
                    </motion.div>
                  ))}

                  {/* Add Task Button */}
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-3 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 text-xs font-bold"
                  >
                    <Plus size={16} /> Add CAPA
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <CreateCAPAModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchCAPAs}
      />
    </div>
  );
}
