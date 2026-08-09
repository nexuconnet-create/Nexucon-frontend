"use client";

import React from "react";
import { motion } from "framer-motion";
import { LinkIcon, FileText, CheckCircle2, FolderSync, Plus, HardDrive, Cloud } from "lucide-react";

export default function DocumentIntegrations() {
  const systems = [
    { name: "Microsoft SharePoint", type: "Enterprise Storage", status: "Active", syncedFiles: "12,450", icon: Cloud },
    { name: "Google Drive (Agency Docs)", type: "Cloud Storage", status: "Active", syncedFiles: "3,892", icon: Cloud },
    { name: "Local On-Prem Server", type: "Network Drive", status: "Syncing", syncedFiles: "45,910", icon: HardDrive },
    { name: "Aconex", type: "Construction Docs", status: "Paused", syncedFiles: "840", icon: FileText },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <FolderSync className="text-emerald-500" />
            Document Systems
          </h1>
          <p className="text-gray-500 mt-1">Manage integrations with external Document Management Systems (DMS).</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Plus size={16} />
            Connect System
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">System Name</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Type</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Status</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500">Synced Files</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {systems.map((system, idx) => {
                const Icon = system.icon;
                return (
                  <motion.tr 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                          <Icon size={18} />
                        </div>
                        <span className="font-bold text-gray-900">{system.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-600">{system.type}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        system.status === 'Active' ? 'bg-emerald-50 text-emerald-700' :
                        system.status === 'Syncing' ? 'bg-blue-50 text-blue-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {system.status === 'Active' && <CheckCircle2 size={10} />}
                        {system.status === 'Syncing' && <FolderSync size={10} className="animate-spin-slow" />}
                        {system.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="text-sm font-bold text-gray-700">{system.syncedFiles}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <button className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors opacity-0 group-hover:opacity-100">
                        Manage Setup
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
