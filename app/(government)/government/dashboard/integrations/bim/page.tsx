"use client";

import React from "react";
import { motion } from "framer-motion";
import { LinkIcon, Box, CheckCircle2, AlertTriangle, RefreshCw, Plus, ExternalLink } from "lucide-react";

export default function BimIntegrations() {
  const platforms = [
    { name: "Autodesk Construction Cloud", status: "Connected", lastSync: "10 mins ago", models: 142, icon: "A" },
    { name: "Procore", status: "Connected", lastSync: "1 hour ago", models: 89, icon: "P" },
    { name: "Bentley Systems", status: "Disconnected", lastSync: "2 days ago", models: 0, icon: "B" },
    { name: "Trimble Connect", status: "Connected", lastSync: "5 mins ago", models: 34, icon: "T" },
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Box className="text-blue-500" />
            BIM & Design Platforms
          </h1>
          <p className="text-gray-500 mt-1">Connect and synchronize 3D models from external BIM platforms.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Plus size={16} />
            Add Integration
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platforms.map((platform, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-center text-xl font-black text-[#022C4F]">
                  {platform.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{platform.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${platform.status === 'Connected' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                    <span className="text-xs font-semibold text-gray-500">{platform.status}</span>
                  </div>
                </div>
              </div>
              <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <ExternalLink size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Synced Models</span>
                <span className="text-xl font-black text-[#022C4F]">{platform.models}</span>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Last Sync</span>
                <span className="text-sm font-bold text-gray-700 mt-2 block">{platform.lastSync}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
                <RefreshCw size={14} /> Sync Now
              </button>
              <button className="flex-1 flex justify-center items-center gap-2 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-bold">
                <LinkIcon size={14} /> Configure
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
