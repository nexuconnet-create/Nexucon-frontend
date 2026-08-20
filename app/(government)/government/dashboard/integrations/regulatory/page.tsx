"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LinkIcon, ShieldCheck, ArrowRightLeft, Database, Building, RefreshCw } from "lucide-react";
import { GovernmentAPIIntegration, getGovernmentApis } from "@/services/integrations";
import ManageGovernmentKeyModal from "@/components/dashboard/ManageGovernmentKeyModal";

export default function RegulatoryIntegrations() {
  const [connections, setConnections] = useState<GovernmentAPIIntegration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApi, setSelectedApi] = useState<GovernmentAPIIntegration | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);

  const fetchConnections = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getGovernmentApis();
      setConnections(data);
    } catch (err) {
      console.error("Failed to load regulatory integrations", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Building className="text-purple-500" />
            External Regulatory Systems
          </h1>
          <p className="text-gray-500 mt-1">Connect with federal, state, and local databases for automated cross-checking.</p>
        </div>
        
        <button 
          onClick={fetchConnections}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-4">
        {connections.map((conn, idx) => (
          <motion.div
            key={conn.id || idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 gap-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                conn.status === 'connected' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
              }`}>
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">{conn.name}</h3>
                <p className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 inline-block">
                  {conn.endpoint_url}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 md:ml-auto">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data Flow</span>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-700">
                  <ArrowRightLeft size={14} className="text-blue-500" />
                  {conn.data_flow_direction}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                <span className={`flex items-center gap-1.5 text-xs font-bold ${
                  conn.status === 'connected' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    conn.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                  {conn.status}
                </span>
              </div>
              <button 
                onClick={() => { setSelectedApi(conn); setIsManageOpen(true); }}
                className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-sm transition-colors"
              >
                Settings
              </button>
            </div>
          </motion.div>
        ))}

        {connections.length === 0 && !isLoading && (
          <div className="p-12 text-center text-gray-400 text-xs bg-white rounded-3xl border border-gray-100">
            No regulatory connections found.
          </div>
        )}
      </div>

      <ManageGovernmentKeyModal
        isOpen={isManageOpen}
        onClose={() => setIsManageOpen(false)}
        govApi={selectedApi}
        onSuccess={fetchConnections}
      />
    </div>
  );
}
