"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ListTodo, Search, Filter, CheckCircle, AlertTriangle, XCircle, ChevronDown, BookOpen, RefreshCw } from "lucide-react";
import { RegulatoryRequirement, getRequirements, updateRequirementStatus } from "@/services/compliance";

export default function ComplianceRequirements() {
  const [requirements, setRequirements] = useState<RegulatoryRequirement[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>("Environmental Standards");
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchRequirements = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getRequirements({ search: searchQuery });
      setRequirements(data);
    } catch (err) {
      console.error("Failed to load requirements", err);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchRequirements();
  }, [fetchRequirements]);

  const handleToggleStatus = async (item: RegulatoryRequirement) => {
    const cycleMap: Record<string, string> = {
      'Compliant': 'At Risk',
      'At Risk': 'Non-Compliant',
      'Non-Compliant': 'Compliant'
    };
    const nextStatus = cycleMap[item.status] || 'Compliant';
    try {
      if (item.id && item.id.length > 5) {
        await updateRequirementStatus(item.id, { status: nextStatus });
      }
      setRequirements(prev => prev.map(r => r.id === item.id ? { ...r, status: nextStatus as any } : r));
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `${item.requirement_reference} updated to ${nextStatus}!`, type: 'info' } 
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Compliant': return <CheckCircle size={16} className="text-emerald-500" />;
      case 'At Risk': return <AlertTriangle size={16} className="text-amber-500" />;
      case 'Non-Compliant': return <XCircle size={16} className="text-red-500" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'Compliant': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'At Risk': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Non-Compliant': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Group by category
  const categories = Array.from(new Set(requirements.map(r => r.category)));

  const compliantCount = requirements.filter(r => r.status === 'Compliant').length;
  const atRiskCount = requirements.filter(r => r.status === 'At Risk').length;
  const nonCompliantCount = requirements.filter(r => r.status === 'Non-Compliant').length;

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <ListTodo className="text-blue-500" />
            Statutory & Regulatory Requirements
          </h1>
          <p className="text-gray-500 mt-1">Track statutory building codes, environmental regulations, and safety standards.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder="Search by code, title, or authority..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 w-full border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={fetchRequirements}
            className="p-2 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Compliant ({compliantCount})
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> At Risk ({atRiskCount})
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
            <span className="w-2 h-2 rounded-full bg-red-500"></span> Non-Compliant ({nonCompliantCount})
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {categories.map((catName, idx) => {
          const items = requirements.filter(r => r.category === catName);
          const isExpanded = expandedSection === catName;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={catName}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setExpandedSection(isExpanded ? null : catName)}
                className="w-full flex items-center justify-between p-5 bg-gray-50/50 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                    <BookOpen size={20} />
                  </div>
                  <div className="text-left">
                    <h2 className="font-bold text-gray-900">{catName}</h2>
                    <p className="text-xs text-gray-500 font-medium">{items.length} Statutory Codes</p>
                  </div>
                </div>
                <ChevronDown 
                  size={20} 
                  className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="border-t border-gray-100">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-white border-b border-gray-100">
                            <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider w-24">Req ID</th>
                            <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Title / Standard</th>
                            <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Authority</th>
                            <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider">Last Checked</th>
                            <th className="py-3 px-5 font-semibold text-xs text-gray-400 uppercase tracking-wider text-right">Status (Click to toggle)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {items.map(item => (
                            <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="py-3.5 px-5">
                                <span className="text-xs font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md border border-gray-200">
                                  {item.requirement_reference}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 font-semibold text-sm text-gray-800">{item.title}</td>
                              <td className="py-3.5 px-5 text-sm text-gray-600">{item.authority}</td>
                              <td className="py-3.5 px-5 text-sm text-gray-500">{item.last_checked || 'Today'}</td>
                              <td className="py-3.5 px-5 text-right">
                                <button
                                  onClick={() => handleToggleStatus(item)}
                                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded-lg border cursor-pointer hover:opacity-80 transition-opacity ${getStatusBadge(item.status)}`}
                                  title="Click to cycle status"
                                >
                                  {getStatusIcon(item.status)}
                                  {item.status}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
