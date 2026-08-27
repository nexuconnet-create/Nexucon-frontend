"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Save, Smartphone, Mail, Globe, AlertTriangle, Network, Clock, Trash2, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { 
  NotificationPreferenceGroup, NotificationRoutingRule, 
  getNotificationPreferences, updateNotificationPreference, 
  getNotificationRoutingRules, deleteNotificationRoutingRule 
} from "@/services/settings";
import AddRoutingRuleDrawer from "@/components/dashboard/AddRoutingRuleDrawer";

export default function NotificationPreferencesPage() {
  const [categories, setCategories] = useState<NotificationPreferenceGroup[]>([]);
  const [routingRules, setRoutingRules] = useState<NotificationRoutingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchNotificationData = useCallback(async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const [catData, ruleData] = await Promise.all([
        getNotificationPreferences().catch(() => []),
        getNotificationRoutingRules().catch(() => [])
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setRoutingRules(Array.isArray(ruleData) ? ruleData : []);
    } catch (err: any) {
      console.error("Failed to load notification preferences", err);
      setFetchError(err?.message || "Unable to load notification settings from server.");
      setCategories([]);
      setRoutingRules([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificationData();
  }, [fetchNotificationData]);

  const handleToggle = (cIdx: number, sIdx: number, channel: 'in_app' | 'email' | 'sms') => {
    if (!categories[cIdx]) return;
    const updated = [...categories];
    const targetCat = { ...updated[cIdx] };
    const itemsList = Array.isArray(targetCat.items) 
      ? [...targetCat.items] 
      : (Array.isArray(targetCat.settings) ? [...targetCat.settings] : []);

    if (!itemsList[sIdx]) return;

    const item = { ...itemsList[sIdx] };
    const isLocked = item.is_locked ?? item.locked ?? false;
    if (isLocked && (channel === 'in_app' || channel === 'email')) return;

    item[channel] = !item[channel];
    itemsList[sIdx] = item;
    targetCat.items = itemsList;
    targetCat.settings = itemsList;
    updated[cIdx] = targetCat;

    setCategories(updated);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      for (const cat of (categories || [])) {
        const catName = cat?.category || cat?.title || "General";
        const itemsList = Array.isArray(cat?.items) 
          ? cat.items 
          : (Array.isArray(cat?.settings) ? cat.settings : []);

        for (const s of itemsList) {
          const eventLabel = s?.event_label || s?.label || "";
          if (!eventLabel) continue;

          await Promise.all([
            updateNotificationPreference({ category: catName, event_label: eventLabel, channel: 'in_app', enabled: s.in_app ?? true }),
            updateNotificationPreference({ category: catName, event_label: eventLabel, channel: 'email', enabled: s.email ?? true }),
            updateNotificationPreference({ category: catName, event_label: eventLabel, channel: 'sms', enabled: s.sms ?? false }),
          ]);
        }
      }

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Notification delivery preferences updated!", type: "success" } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to save preferences", type: "error" } }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    try {
      await deleteNotificationRoutingRule(ruleId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Routing rule deleted.", type: "info" } 
      }));
      fetchNotificationData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to delete rule", type: "error" } }));
    }
  };

  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeRules = Array.isArray(routingRules) ? routingRules : [];

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Bell className="text-amber-500" />
            Notification Preferences
          </h1>
          <p className="text-gray-500 mt-1">Configure automated event dispatch channels and critical escalation SLA routing.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchNotificationData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-amber-800 text-xs font-semibold">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <span>{fetchError}</span>
          </div>
          <button 
            onClick={fetchNotificationData}
            className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-bold text-xs transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <div className="max-w-4xl space-y-6">
        
        {/* Notification Routing & SLAs */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          <div className="p-6 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-[#022C4F] flex items-center gap-2">
                <Network className="text-blue-500" />
                Notification Routing &amp; Escalation SLAs
              </h2>
              <p className="text-xs text-gray-500 mt-1">Define who receives high-severity safety alerts and automated escalation chains.</p>
            </div>
            <button 
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Routing Rule
            </button>
          </div>
          
          <div className="p-6">
            <div className="hidden md:grid grid-cols-4 gap-4 mb-4 font-bold text-xs uppercase tracking-wider text-gray-500 pb-2 border-b border-gray-100">
              <div className="col-span-1">Trigger Event</div>
              <div className="col-span-1">Primary Recipient</div>
              <div className="col-span-1">SLA / Timeline</div>
              <div className="col-span-1">Escalation Target</div>
            </div>
            
            <div className="divide-y divide-gray-50">
              {safeRules.map((rule, rIdx) => {
                const trigger = rule?.trigger_event || 'Safety Alert';
                const recipient = rule?.primary_recipient || 'Assigned Officer';
                const sla = rule?.sla_timeline || '2 Hours';
                const target = rule?.escalation_target || 'Department Head';

                return (
                  <div key={rule?.id || rIdx} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3.5 hover:bg-gray-50/50 transition-colors">
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                        <AlertTriangle size={12} /> {trigger}
                      </span>
                    </div>
                    <div className="col-span-1 text-xs font-bold text-gray-800">
                      {recipient}
                    </div>
                    <div className="col-span-1">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                        <Clock size={12} /> {sla}
                      </span>
                    </div>
                    <div className="col-span-1 flex items-center justify-between text-xs font-bold text-purple-700">
                      {target}
                      {rule?.id && (
                        <button 
                          onClick={() => handleDeleteRule(rule.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete Rule"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {safeRules.length === 0 && !isLoading && (
                <div className="p-8 text-center text-gray-400 text-xs">
                  No custom routing rules defined. Click &ldquo;Add Routing Rule&rdquo; to configure.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Global Multi-Channel Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Header Row */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Event Dispatch Channels</h2>
            <div className="hidden md:grid grid-cols-3 gap-8 text-center text-xs font-bold text-gray-500 uppercase tracking-wider pr-4">
              <span className="flex items-center gap-1 justify-center"><Globe size={14} /> In-App</span>
              <span className="flex items-center gap-1 justify-center"><Mail size={14} /> Email</span>
              <span className="flex items-center gap-1 justify-center"><Smartphone size={14} /> SMS</span>
            </div>
          </div>

          {safeCategories.map((cat, idx) => {
            const catTitle = cat?.category || cat?.title || `Category ${idx + 1}`;
            const catDesc = cat?.description;
            const itemsList = Array.isArray(cat?.items) 
              ? cat.items 
              : (Array.isArray(cat?.settings) ? cat.settings : []);

            return (
              <div key={idx} className="border-b border-gray-100 last:border-0">
                <div className="p-6 bg-gray-50/30">
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-base font-bold text-gray-900">{catTitle}</h2>
                  </div>
                  {catDesc && <p className="text-xs text-gray-500">{catDesc}</p>}
                </div>

                <div className="p-6 space-y-6">
                  {itemsList.map((setting, sIdx) => {
                    const label = setting?.event_label || setting?.label || `Event ${sIdx + 1}`;
                    const isLocked = setting?.is_locked ?? setting?.locked ?? false;
                    const inApp = setting?.in_app ?? true;
                    const email = setting?.email ?? true;
                    const sms = setting?.sms ?? false;

                    return (
                      <div key={sIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        <div className="md:col-span-6">
                          <p className="text-sm font-bold text-gray-700">{label}</p>
                          {isLocked && <p className="text-[10px] uppercase font-bold text-red-500 mt-0.5">System Required (Cannot Disable)</p>}
                        </div>
                        
                        {/* In-App Toggle */}
                        <div className="md:col-span-2 flex justify-start md:justify-center">
                          <div 
                            onClick={() => handleToggle(idx, sIdx, 'in_app')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              inApp ? 'bg-blue-600' : 'bg-gray-200'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              inApp ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="md:hidden ml-3 text-xs font-bold text-gray-500">In-App</span>
                        </div>
                        
                        {/* Email Toggle */}
                        <div className="md:col-span-2 flex justify-start md:justify-center">
                          <div 
                            onClick={() => handleToggle(idx, sIdx, 'email')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              email ? 'bg-blue-600' : 'bg-gray-200'
                            } ${isLocked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              email ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="md:hidden ml-3 text-xs font-bold text-gray-500">Email</span>
                        </div>

                        {/* SMS Toggle */}
                        <div className="md:col-span-2 flex justify-start md:justify-center">
                          <div 
                            onClick={() => handleToggle(idx, sIdx, 'sms')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                              sms ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              sms ? 'translate-x-6' : 'translate-x-1'
                            }`} />
                          </div>
                          <span className="md:hidden ml-3 text-xs font-bold text-gray-500">SMS</span>
                        </div>
                      </div>
                    );
                  })}

                  {itemsList.length === 0 && (
                    <div className="text-xs text-gray-400 italic">No event rules for this category.</div>
                  )}
                </div>
              </div>
            );
          })}

          {safeCategories.length === 0 && !isLoading && (
            <div className="p-8 text-center text-gray-400 text-xs">
              No notification categories found.
            </div>
          )}
        </motion.div>
      </div>

      <AddRoutingRuleDrawer
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        onSuccess={fetchNotificationData}
      />
    </div>
  );
}
