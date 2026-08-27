"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { LinkIcon, Save, Key, RefreshCw, EyeOff, CheckCircle2, ShieldAlert, Code2, Landmark, Plus, Trash2, Database, Layers } from "lucide-react";
import { WebhookSubscription, getWebhookSubscriptions, deleteWebhookSubscription } from "@/services/settings";
import { GovernmentAPIIntegration, APIKeyCredential, getGovernmentApis, getApiKeys, getDocumentSystems } from "@/services/integrations";
import AddWebhookDrawer from "@/components/dashboard/AddWebhookDrawer";

export default function IntegrationSettingsPage() {
  const [govApis, setGovApis] = useState<GovernmentAPIIntegration[]>([]);
  const [apiKeys, setApiKeys] = useState<APIKeyCredential[]>([]);
  const [docSystems, setDocSystems] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddWebhookOpen, setIsAddWebhookOpen] = useState(false);

  const fetchIntegrationsData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [govData, keysData, hooksData, dmsData] = await Promise.all([
        getGovernmentApis().catch(() => []),
        getApiKeys().catch(() => []),
        getWebhookSubscriptions().catch(() => []),
        getDocumentSystems().catch(() => [])
      ]);
      setGovApis(Array.isArray(govData) ? govData : []);
      setApiKeys(Array.isArray(keysData) ? keysData : []);
      setWebhooks(Array.isArray(hooksData) ? hooksData : []);
      setDocSystems(Array.isArray(dmsData) ? dmsData : []);
    } catch (err) {
      console.error("Failed to load integration settings", err);
      setGovApis([]);
      setApiKeys([]);
      setWebhooks([]);
      setDocSystems([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIntegrationsData();
  }, [fetchIntegrationsData]);

  const handleDeleteWebhook = async (hookId: string) => {
    try {
      await deleteWebhookSubscription(hookId);
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
            Integration &amp; API Settings
          </h1>
          <p className="text-gray-500 mt-1">Manage global enterprise integrations, active document systems, and webhook subscriptions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchIntegrationsData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Document & Cloud Storage Systems (Real: Cloudflare R2 & Cloudinary) */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                   <Database size={20} className="text-blue-600" /> Enterprise Document &amp; Media Storage
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Verified storage providers configured for statutory artifacts.</p>
             </div>
          </div>
          
          <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {docSystems.map((dms, idx) => (
                  <div key={dms.id || idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900">{dms.name}</h3>
                      </div>
                      <p className="text-xs font-mono text-gray-500">{dms.bucket_or_drive_name || 'Production Storage Bucket'}</p>
                      <p className="text-[11px] text-gray-400 mt-1">{dms.synced_files_count || 0} Files Synchronized</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        dms.status === 'Connected' ? 'text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200' : 'text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200'
                      }`}>
                         {dms.status === 'Connected' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>}
                         {dms.status}
                      </span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </motion.div>

        {/* National & State Database Integrations */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                   <Landmark size={20} className="text-emerald-600" /> National &amp; State Regulatory APIs
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Live API bridges to CAC, LASRRA, and Lagos e-GIS registries.</p>
             </div>
          </div>
          
          <div className="p-6">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {govApis.map((integration, idx) => (
                  <div key={integration.id || idx} className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-gray-50 shadow-sm">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-sm text-gray-900">{integration.name}</h3>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-1 font-mono">{integration.endpoint_url}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        integration.status === 'connected' ? 'text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200' : 'text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200'
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
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
             <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                   <Code2 size={20} className="text-blue-500" /> Webhook Event Listeners ({webhooks.length})
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">Configure HTTPS callback listeners to receive real-time updates.</p>
             </div>
             <button 
                onClick={() => setIsAddWebhookOpen(true)}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm flex items-center gap-1 cursor-pointer"
             >
                <Plus size={14} /> Add Webhook
             </button>
          </div>

          <div className="p-6 space-y-4">
             {webhooks.map((hook) => (
               <div key={hook.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                           <CheckCircle2 size={10} /> {hook.status}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{hook.name}</span>
                     </div>
                     <button 
                       onClick={() => handleDeleteWebhook(hook.id)}
                       className="text-slate-400 hover:text-red-500 transition-colors p-1 cursor-pointer"
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
               <div className="p-8 text-center text-gray-400 text-xs">
                 No webhook endpoints configured. Click &ldquo;Add Webhook&rdquo; to register a listener.
               </div>
             )}
          </div>
        </motion.div>
      </div>

      <AddWebhookDrawer
        isOpen={isAddWebhookOpen}
        onClose={() => setIsAddWebhookOpen(false)}
        onSuccess={fetchIntegrationsData}
      />
    </div>
  );
}
