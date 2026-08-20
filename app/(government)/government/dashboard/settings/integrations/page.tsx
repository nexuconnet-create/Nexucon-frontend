"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LinkIcon, Save, Key, RefreshCw, EyeOff, CheckCircle2, ShieldAlert, Code2, Landmark, Plus, Trash2 } from "lucide-react";
import { WebhookSubscription, getWebhooks, deleteWebhook } from "@/services/settings";
import { GovernmentAPIIntegration, APIKeyCredential, getGovernmentApis, getApiKeys } from "@/services/integrations";
import AddWebhookModal from "@/components/dashboard/AddWebhookModal";

export default function IntegrationSettings() {
  const [govApis, setGovApis] = useState<GovernmentAPIIntegration[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeyCredential[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);

  const fetchIntegrationsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [govData, keysData, hooksData] = await Promise.all([
        getGovernmentApis(),
        getApiKeys(),
        getWebhooks()
      ]);
      setGovApis(govData);
      setApiKeys(keysData);
      setWebhooks(hooksData);
    } catch (err) {
      console.error("Failed to load integration settings", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrationsData();
  }, [fetchIntegrationsData]);

  const handleDeleteWebhook = async (hookId: string) => {
    try {
      await deleteWebhook(hookId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Webhook subscription deleted.", type: "info" } 
      }));
      fetchIntegrationsData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to delete webhook", type: "error" } }));
    }
  };

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
          <button 
            onClick={fetchIntegrationsData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* National & State Database Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                   <Landmark size={20} className="text-emerald-600" /> National & State Database Integrations
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Live API connections to Nigerian government and regulatory registries.</p>
             </div>
          </div>
          
          <div className="p-8">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {govApis.map((integration, idx) => (
                  <div key={integration.id || idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50 hover:bg-white transition-colors shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900">{integration.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1">{integration.description || integration.endpoint_url}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        integration.status === 'connected' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>
                         {integration.status === 'connected' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                         {integration.status}
                      </span>
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
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Code2 size={20} className="text-blue-500" /> Webhook Endpoints ({webhooks.length})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure URLs to receive real-time event payloads.</p>
             </div>
             <button 
                onClick={() => setIsAddWebhookOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-1"
             >
                <Plus size={14} /> Add Endpoint
             </button>
          </div>

          <div className="p-8 space-y-4">
             {webhooks.map((hook) => (
               <div key={hook.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                           <CheckCircle2 size={10} /> {hook.status}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{hook.name}</span>
                     </div>
                     <button 
                       onClick={() => handleDeleteWebhook(hook.id)}
                       className="text-slate-400 hover:text-red-500 transition-colors p-1"
                       title="Delete Webhook"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                  <div className="space-y-2">
                     <p className="font-mono text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200 truncate">
                        {hook.target_url}
                     </p>
                     <div className="flex flex-wrap gap-1.5">
                        {hook.events?.map(evt => (
                          <span key={evt} className="px-2 py-0.5 bg-white border border-gray-200 rounded-md text-[11px] font-semibold text-gray-600">
                             {evt}
                          </span>
                        ))}
                     </div>
                  </div>
               </div>
             ))}

             {webhooks.length === 0 && !isLoading && (
               <div className="p-8 text-center text-xs text-gray-400">
                 No webhook subscriptions active.
               </div>
             )}
          </div>
        </motion.div>

        {/* API Keys Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Key size={20} className="text-purple-500" /> Active API Keys ({apiKeys.length})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Manage secret keys used to authenticate external systems.</p>
             </div>
          </div>

          <div className="p-8">
             <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                   <thead>
                      <tr className="border-b border-gray-100">
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Key Name</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Token Prefix</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Tier</th>
                         <th className="pb-3 text-xs font-bold uppercase tracking-wider text-gray-500 text-right">Status</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-gray-100">
                      {apiKeys.map((key) => (
                         <tr key={key.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 whitespace-nowrap">
                               <div className="flex items-center gap-2">
                                  {key.status === 'Revoked' && <ShieldAlert size={14} className="text-red-500" />}
                                  <span className={`font-bold text-sm ${key.status === 'Revoked' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                     {key.name}
                                  </span>
                               </div>
                            </td>
                            <td className="py-4 whitespace-nowrap">
                               <span className="font-mono text-xs font-bold text-gray-600 bg-gray-100 px-2 py-1 rounded-lg border border-gray-200">
                                  {key.key_prefix}************************
                               </span>
                            </td>
                            <td className="py-4 whitespace-nowrap text-xs font-semibold text-gray-600">
                               {key.volume_tier}
                            </td>
                            <td className="py-4 whitespace-nowrap text-right">
                               <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                                  {key.status}
                               </span>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </motion.div>
      </div>

      <AddWebhookModal
        isOpen={isAddWebhookOpen}
        onClose={() => setIsAddWebhookOpen(false)}
        onSuccess={fetchIntegrationsData}
      />
    </div>
  );
}
