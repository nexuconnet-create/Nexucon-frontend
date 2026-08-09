"use client";

import React from "react";
import { motion } from "framer-motion";
import { LinkIcon, ShieldCheck, ArrowRightLeft, Database, Building } from "lucide-react";

export default function RegulatoryIntegrations() {
  const connections = [
    { name: "National Land Registry", endpoint: "api.landregistry.gov/v1/parcels", direction: "Inbound", status: "Connected" },
    { name: "City Zoning DB", endpoint: "zoning.city.gov/api/zones", direction: "Bidirectional", status: "Connected" },
    { name: "Federal Tax Portal", endpoint: "tax.gov/api/contractors", direction: "Inbound", status: "Failing" },
    { name: "Public Contractor Registry", endpoint: "registry.gov/api/search", direction: "Bidirectional", status: "Connected" },
  ];

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
      </div>

      <div className="space-y-6">
        {connections.map((conn, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row md:items-center justify-between p-6 gap-6"
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                conn.status === 'Connected' ? 'bg-purple-50 text-purple-600' : 'bg-red-50 text-red-600'
              }`}>
                <Database size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg mb-1">{conn.name}</h3>
                <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-100 inline-block">
                  {conn.endpoint}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 md:ml-auto">
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Data Flow</span>
                <span className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <ArrowRightLeft size={14} className="text-blue-500" />
                  {conn.direction}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Status</span>
                <span className={`flex items-center gap-1.5 text-sm font-semibold ${
                  conn.status === 'Connected' ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  <span className={`w-2 h-2 rounded-full ${
                    conn.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'
                  }`}></span>
                  {conn.status}
                </span>
              </div>
              <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-bold shadow-sm transition-colors">
                Settings
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
