"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { FileText, Search, Filter, MoreVertical, Paperclip, MessageCircle, Plus, Check, RefreshCw } from "lucide-react";
import { BIMAnnotation, BIMModel, getBIMAnnotations, getBIMModels, resolveBIMAnnotation } from "@/services/bim";
import AddBIMAnnotationModal from "@/components/dashboard/AddBIMAnnotationModal";

export default function ModelAnnotations() {
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [annotations, setAnnotations] = useState<BIMAnnotation[]>([]);
  const [models, setModels] = useState<BIMModel[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (filter !== 'all') params.status = filter;
      if (searchQuery) params.search = searchQuery;

      const [annData, modelData] = await Promise.all([
        getBIMAnnotations(params),
        getBIMModels()
      ]);
      setAnnotations(annData);
      setModels(modelData);
    } catch (err) {
      console.error("Failed to load annotations", err);
    } finally {
      setIsLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResolve = async (annId: string) => {
    try {
      await resolveBIMAnnotation(annId, { notes: 'Marked resolved by agency reviewer.' });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Annotation thread marked resolved!', type: 'success' } 
      }));
      fetchData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to resolve annotation', type: 'error' } }));
    }
  };

  const getStatusStyle = (status: string) => {
    switch(status.toLowerCase()) {
      case 'open': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'in progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch(priority.toLowerCase()) {
      case 'critical':
      case 'high': return 'text-rose-600 bg-rose-100/50';
      case 'medium': return 'text-amber-600 bg-amber-100/50';
      default: return 'text-blue-600 bg-blue-100/50';
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileText className="text-blue-500" />
            Model Annotations & BCF Markups
          </h1>
          <p className="text-gray-500 mt-1">Track and manage markups, questions, and action items across registered models.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-900/20 text-sm font-semibold"
          >
            <Plus size={18} />
            <span>Add Annotation</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search annotations by text, reference, or author..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button 
            onClick={fetchData}
            className="p-2 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
          {(['all', 'open', 'resolved'] as const).map(f => (
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
        {isLoading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading model annotations...</div>
        ) : annotations.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText size={40} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-bold text-slate-700">No annotations matching query.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">ID</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Observation</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Model</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Priority</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500">Author</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {annotations.map((ann, idx) => (
                <motion.tr 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={ann.id} 
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  <td className="py-4 px-6 font-mono text-xs font-bold text-gray-700">{ann.annotation_reference}</td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{ann.text}</p>
                  </td>
                  <td className="py-4 px-6 text-xs text-gray-600 font-medium">{ann.model_name || 'Downtown Metro'}</td>
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
                  <td className="py-4 px-6 text-xs text-gray-500">
                    <span className="font-semibold text-gray-800 block">{ann.author_name}</span>
                    <span className="text-[10px] text-gray-400">{ann.author_role}</span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    {ann.status !== 'Resolved' ? (
                      <button 
                        onClick={() => handleResolve(ann.id)}
                        className="px-3 py-1 bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors"
                      >
                        Resolve
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold flex items-center justify-end gap-1">
                        <Check size={14} /> Resolved
                      </span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddBIMAnnotationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        models={models}
        onSuccess={fetchData}
      />
    </div>
  );
}
