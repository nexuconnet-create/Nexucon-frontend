"use client";

import React from "react";
import { motion } from "framer-motion";
import { LinkIcon, Save, Key, RefreshCw, EyeOff, CheckCircle2, ShieldAlert, Code2, Landmark } from "lucide-react";

export default function IntegrationSettings() {
  const apiKeys = [
    { name: "Tersus GNSS Production API", prefix: "pk_prod_892a", created: "Oct 01, 2026", status: "Active" },
    { name: "Contractor Portal Webhook", prefix: "wh_sec_b29c", created: "Sep 15, 2026", status: "Active" },
    { name: "Legacy DB Sync (Deprecated)", prefix: "pk_test_110f", created: "Jan 12, 2025", status: "Revoked" }
  ];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <LinkIcon className="text-purple-500" />
            Integration & API Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage secure API keys, webhooks, and third-party software connections.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm font-bold">
            <Save size={16} />
            Save Webhooks
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* National & State Database Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                   <Landmark size={20} className="text-emerald-600" /> National & State Database Integrations
                </h2>
                <p className="text-sm text-gray-500">Live API connections to Nigerian government and regulatory registries.</p>
             </div>
          </div>
          
          <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "LASG LASRRA", desc: "Lagos State Residents Registration", priority: "CRITICAL", status: "Connected" },
                  { name: "CAC", desc: "Corporate Affairs Commission (Company verification)", priority: "CRITICAL", status: "Connected" },
                  { name: "Lagos e-GIS", desc: "Land title & approval verification", priority: "CRITICAL", status: "Connected" },
                  { name: "FMW", desc: "Federal Ministry of Works coordination", priority: "HIGH", status: "Pending Configuration" },
                  { name: "NIA", desc: "Nigerian Insurance Association (Bond verification)", priority: "HIGH", status: "Connected" },
                  { name: "National Building Code", desc: "Automated code compliance checking", priority: "HIGH", status: "Connected" }
                ].map((integration, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-xl bg-gray-50 hover:bg-white transition-colors shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900">{integration.name}</h3>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                          integration.priority === 'CRITICAL' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}>
                          {integration.priority}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{integration.desc}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        integration.status === 'Connected' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                         {integration.status === 'Connected' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                         {integration.status === 'Pending Configuration' && <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>}
                         {integration.status}
                      </span>
                      <button className="text-[10px] font-bold text-gray-600 hover:text-blue-600 bg-white border border-gray-200 px-2 py-1 rounded shadow-sm">Configure</button>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>

        {/* Webhooks Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Code2 size={20} className="text-blue-500" /> Webhook Endpoints
                </h2>
                <p className="text-sm text-gray-500">Configure URLs to receive real-time event payloads.</p>
             </div>
             <button className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-lg shadow-sm">
                Add Endpoint
             </button>
          </div>

          <div className="p-8 space-y-6">
             <div className="p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-3">
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                         <CheckCircle2 size={10} /> Active
                      </span>
                      <span className="text-sm font-bold text-gray-900">Contractor Sync</span>
                   </div>
                </div>
                <div className="space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Endpoint URL</label>
                      <input 
                         type="url" 
                         defaultValue="https://api.contractorsync.dev/v1/nexucon/events" 
                         className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-mono text-sm"
                      />
                   </div>
                   <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Events to send</label>
                      <div className="flex flex-wrap gap-2">
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600">permit.created</span>
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600">permit.updated</span>
                         <span className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-semibold text-gray-600">inspection.failed</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </motion.div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Key size={20} className="text-purple-500" /> API Keys
                </h2>
                <p className="text-sm text-gray-500">Manage secret keys used to authenticate external systems.</p>
             </div>
             <button className="text-sm font-bold text-white bg-gray-900 hover:bg-gray-800 px-4 py-2 rounded-lg shadow-sm">
                Generate New Key
             </button>
          </div>

          <div className="p-8">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Key Name</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Token</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Created</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {apiKeys.map((key, idx) => (
                         <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  {key.status === 'Revoked' && <ShieldAlert size={14} className="text-red-500" />}
                                  <span className={`font-bold text-sm ${key.status === 'Revoked' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                     {key.name}
                                  </span>
                               </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                     {key.prefix}************************
                                  </span>
                                  <button className="text-gray-400 hover:text-gray-600 transition-colors" title="Keys cannot be viewed again after creation">
                                     <EyeOff size={14} />
                                  </button>
                               </div>
                            </td>
                            <td className="py-4 whitespace-nowrap text-sm font-semibold text-gray-500">
                               {key.created}
                            </td>
                            <td className="py-4 whitespace-nowrap text-right">
                               <button 
                                 className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors inline-flex items-center gap-1 bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-gray-50 disabled:opacity-50"
                                 disabled={key.status === 'Revoked'}
                               >
                                  <RefreshCw size={12} /> Revoke Key
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
