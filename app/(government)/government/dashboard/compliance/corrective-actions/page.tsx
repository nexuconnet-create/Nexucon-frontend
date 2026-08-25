"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, Plus, MoreHorizontal, MessageSquare, Paperclip, 
  Clock, CheckCircle2, RefreshCw, ArrowRight, GripVertical, 
  Search, Filter, ShieldCheck, User 
} from "lucide-react";
import { CorrectiveActionPlan, getCAPAs, transitionCAPA } from "@/services/compliance";
import CreateCAPAModal from "@/components/dashboard/CreateCAPAModal";

export default function CorrectiveActions() {
  const [capas, setCapas] = useState<CorrectiveActionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');

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

  const handleStatusTransition = async (cardId: string, newStatus: 'todo' | 'in-progress' | 'review' | 'closed') => {
    const card = capas.find(c => c.id === cardId);
    if (!card || card.status === newStatus) return;

    const prevStatus = card.status;

    // Optimistic UI update
    setCapas(prev => prev.map(c => c.id === cardId ? { ...c, status: newStatus } : c));

    try {
      await transitionCAPA(cardId, { 
        status: newStatus,
        verification_notes: newStatus === 'closed' ? 'Task verified and completed via Kanban workflow.' : undefined 
      });
      
      const colLabels: Record<string, string> = {
        'todo': 'To Do',
        'in-progress': 'In Progress',
        'review': 'Under Review',
        'closed': 'Closed'
      };

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `CAPA "${card.capa_reference || card.title}" moved to ${colLabels[newStatus]}!`, type: 'success' } 
      }));
    } catch (err: any) {
      // Rollback on failure
      setCapas(prev => prev.map(c => c.id === cardId ? { ...c, status: prevStatus } : c));
      const msg = err.response?.data?.message || 'Failed to update CAPA status';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    }
  };

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('text/plain', cardId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggingCardId(cardId);
  };

  const handleDragEnd = () => {
    setDraggingCardId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnId: string) => {
    const related = e.relatedTarget as Node | null;
    if (e.currentTarget.contains(related)) return;
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, columnId: 'todo' | 'in-progress' | 'review' | 'closed') => {
    e.preventDefault();
    setDragOverColumn(null);
    const cardId = e.dataTransfer.getData('text/plain') || draggingCardId;
    if (cardId) {
      await handleStatusTransition(cardId, columnId);
    }
    setDraggingCardId(null);
  };

  const handleAdvanceStatus = async (capa: CorrectiveActionPlan) => {
    const nextStatusMap: Record<string, 'todo' | 'in-progress' | 'review' | 'closed'> = {
      'todo': 'in-progress',
      'in-progress': 'review',
      'review': 'closed',
      'closed': 'todo'
    };
    const nextStatus = nextStatusMap[capa.status] || 'in-progress';
    await handleStatusTransition(capa.id, nextStatus);
  };

  const columnsConfig: { id: 'todo' | 'in-progress' | 'review' | 'closed'; title: string; color: string; textColor: string; badgeBg: string }[] = [
    { id: "todo", title: "To Do", color: "bg-slate-100", textColor: "text-slate-700", badgeBg: "bg-slate-200" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-50", textColor: "text-blue-700", badgeBg: "bg-blue-200" },
    { id: "review", title: "Under Review", color: "bg-amber-50", textColor: "text-amber-700", badgeBg: "bg-amber-200" },
    { id: "closed", title: "Closed & Verified", color: "bg-emerald-50", textColor: "text-emerald-700", badgeBg: "bg-emerald-200" },
  ];

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'High': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Medium': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Low': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredCapas = capas.filter(c => {
    const matchesSearch = searchQuery === '' || 
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.capa_reference && c.capa_reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.ncr_reference && c.ncr_reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.assignee_name && c.assignee_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPriority = priorityFilter === 'All' || c.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  return (
    <div className="w-full min-h-[calc(100vh-2rem)] pb-12 flex flex-col">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Activity className="text-blue-500" />
            Corrective & Preventive Actions (CAPA) Kanban
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Drag and drop action items across statutory resolution stages to update compliance records in real time.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCAPAs}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md text-xs font-bold cursor-pointer"
          >
            <Plus size={16} />
            New CAPA Task
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
            <input 
              type="text" 
              placeholder="Search CAPAs, Parent NCRs, assignees..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={13} /> Priority:
          </span>
          {['All', 'Critical', 'High', 'Medium', 'Low'].map(p => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                priorityFilter === p 
                  ? 'bg-[#022C4F] text-white shadow-sm' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex items-start gap-5 min-w-max h-full">
          {columnsConfig.map((col) => {
            const colCards = filteredCapas.filter(c => c.status === col.id);
            const isOver = dragOverColumn === col.id;

            return (
              <div 
                key={col.id} 
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={(e) => handleDragLeave(e, col.id)}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`w-80 flex flex-col min-h-[580px] rounded-3xl border transition-all duration-200 p-4 shrink-0 ${
                  isOver 
                    ? 'bg-blue-50/70 border-2 border-dashed border-blue-500 shadow-lg ring-4 ring-blue-500/10' 
                    : 'bg-slate-50/60 border-slate-200/80 shadow-sm'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4 px-1">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-black text-xs uppercase tracking-wider ${col.textColor}`}>{col.title}</h3>
                    <span className={`text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${col.badgeBg} ${col.textColor}`}>
                      {colCards.length}
                    </span>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    {col.id === 'closed' ? 'Verified' : 'Active'}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="flex-1 flex flex-col gap-3.5">
                  {colCards.map((card) => {
                    const isDraggingThis = draggingCardId === card.id;

                    return (
                      <div
                        key={card.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, card.id)}
                        onDragEnd={handleDragEnd}
                        className={`bg-white p-5 rounded-2xl border transition-all duration-200 cursor-grab active:cursor-grabbing flex flex-col select-none relative group ${
                          isDraggingThis 
                            ? 'opacity-40 scale-95 border-blue-400 shadow-2xl rotate-1 ring-2 ring-blue-500' 
                            : 'border-slate-200 hover:border-blue-300 hover:shadow-md'
                        }`}
                      >
                        {/* Drag Handle Indicator */}
                        <div className="absolute right-3.5 top-3.5 text-slate-300 group-hover:text-slate-400 transition-colors">
                          <GripVertical size={15} />
                        </div>

                        {/* Card Top Badges */}
                        <div className="flex items-center gap-2 mb-2.5 pr-5">
                          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border ${getPriorityStyle(card.priority)}`}>
                            {card.priority}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                            {card.capa_reference}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <h4 className="font-bold text-slate-900 text-xs sm:text-sm mb-2 group-hover:text-blue-600 transition-colors leading-snug">
                          {card.title}
                        </h4>

                        {/* Action Plan Text Snippet */}
                        {card.action_plan && (
                          <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                            {card.action_plan}
                          </p>
                        )}

                        {/* Parent NCR Tag */}
                        {card.ncr_reference && (
                          <div className="flex items-center gap-1.5 mb-3.5 text-[10px] font-semibold text-slate-500">
                            <span className="text-slate-400 uppercase">Parent:</span>
                            <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                              {card.ncr_reference}
                            </span>
                          </div>
                        )}

                        {/* Assignee */}
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-medium mb-3">
                          <User size={13} className="text-slate-400" />
                          <span className="truncate">{card.assignee_name}</span>
                        </div>

                        {/* Card Footer */}
                        <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-auto">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-500">
                            <Clock size={12} className={col.id === 'closed' ? 'text-emerald-500' : 'text-amber-500'} />
                            <span>{card.due_date || 'In 7 Days'}</span>
                          </div>
                          
                          <button 
                            onClick={() => handleAdvanceStatus(card)}
                            className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                            title="Move to next stage"
                          >
                            <span>Move</span>
                            <ArrowRight size={10} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {/* Empty drop target placeholder when column has no items */}
                  {colCards.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-slate-200/80 rounded-2xl text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center gap-1">
                      <ShieldCheck size={20} className="text-slate-300" />
                      <span>Drop CAPA cards here</span>
                    </div>
                  )}

                  {/* Add Task Button */}
                  <button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="w-full py-2.5 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/50 transition-colors flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer mt-1"
                  >
                    <Plus size={15} /> Add CAPA Task
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
