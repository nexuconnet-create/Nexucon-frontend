"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, Save, Smartphone, Mail, Globe, AlertTriangle, Network, Clock, Trash2, Plus, RefreshCw } from "lucide-react";
import { NotificationCategoryGroup, NotificationRoutingRule, getNotificationPreferences, updateNotificationPreference, getRoutingRules, deleteRoutingRule } from "@/services/settings";
import AddRoutingRuleModal from "@/components/dashboard/AddRoutingRuleModal";

export default function NotificationPreferences() {
  const [categories, setCategories] = useState<NotificationCategoryGroup[]>([]);
  const [routingRules, setRoutingRules] = useState<NotificationRoutingRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddRuleOpen, setIsAddRuleOpen] = useState(false);

  const fetchNotificationData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [catData, ruleData] = await Promise.all([
        getNotificationPreferences(),
        getRoutingRules()
      ]);
      setCategories(catData);
      setRoutingRules(ruleData);
    } catch (err) {
      console.error("Failed to load notification preferences", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotificationData();
  }, [fetchNotificationData]);

  const handleToggle = (cIdx: number, sIdx: number, channel: 'in_app' | 'email' | 'sms') => {
    const updated = [...categories];
    const item = updated[cIdx].settings[sIdx];
    if (item.locked && (channel === 'in_app' || channel === 'email')) return;

    item[channel] = !item[channel];
    setCategories(updated);
  };

  const handleSavePreferences = async () => {
    setIsSaving(true);
    try {
      for (const cat of categories) {
        for (const s of cat.settings) {
          await Promise.all([
            updateNotificationPreference({ category: cat.title, event_label: s.label, channel: 'in_app', enabled: s.in_app }),
            updateNotificationPreference({ category: cat.title, event_label: s.label, channel: 'email', enabled: s.email }),
            updateNotificationPreference({ category: cat.title, event_label: s.label, channel: 'sms', enabled: s.sms }),
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
      await deleteRoutingRule(ruleId);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Routing rule deleted.", type: "info" } 
      }));
      fetchNotificationData();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: "Failed to delete rule", type: "error" } }));
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <Bell className="text-amber-500" />
            Notification Preferences
          </h1>
          <p className="text-gray-500 mt-1">Configure how and when the system sends automated alerts.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchNotificationData}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={handleSavePreferences}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold disabled:opacity-50"
          >
            <Save size={16} />
            {isSaving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>

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
                Notification Routing & SLAs
              </h2>
              <p className="text-xs text-gray-500 mt-1">Define who receives critical notifications and escalation timelines.</p>
            </div>
            <button 
              onClick={() => setIsAddRuleOpen(true)}
              className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-3.5 py-2 rounded-xl border border-blue-100 hover:bg-blue-100 transition-colors"
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
              {routingRules.map((rule) => (
                <div key={rule.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center py-3.5 hover:bg-gray-50/50 transition-colors">
                  <div className="col-span-1">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                      <AlertTriangle size={12} /> {rule.trigger_event}
                    </span>
                  </div>
                  <div className="col-span-1 text-xs font-bold text-gray-800">
                    {rule.primary_recipient}
                  </div>
                  <div className="col-span-1">
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
                      <Clock size={12} /> {rule.sla_timeline}
                    </span>
                  </div>
                  <div className="col-span-1 flex items-center justify-between text-xs font-bold text-purple-700">
                    {rule.escalation_target}
                    <button 
                      onClick={() => handleDeleteRule(rule.id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      title="Delete Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {routingRules.length === 0 && !isLoading && (
                <div className="p-8 text-center text-xs text-gray-400">
                  No routing rules defined.
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Multi-channel toggles */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
        >
          {/* Header Row for Toggles */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50/50 border-b border-gray-100">
             <div className="col-span-6"></div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Globe size={16} /> In-App
             </div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Mail size={16} /> Email
             </div>
             <div className="col-span-2 text-center text-xs font-bold uppercase tracking-wider text-gray-500 flex flex-col items-center gap-1">
                <Smartphone size={16} /> SMS Text
             </div>
          </div>

          {categories.map((cat, idx) => (
             <div key={idx} className="border-b border-gray-100 last:border-0">
                <div className="p-6 bg-gray-50/30">
                   <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-base font-bold text-gray-900">{cat.title}</h2>
                   </div>
                   <p className="text-xs text-gray-500">{cat.description}</p>
                </div>

                <div className="p-6 space-y-6">
                   {cat.settings.map((setting, sIdx) => (
                      <div key={sIdx} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                         <div className="md:col-span-6">
                            <p className="text-sm font-bold text-gray-700">{setting.label}</p>
                            {setting.locked && <p className="text-[10px] uppercase font-bold text-red-500 mt-0.5">System Required (Cannot Disable)</p>}
                         </div>
                         
                         {/* In-App Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div 
                              onClick={() => handleToggle(idx, sIdx, 'in_app')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                               setting.in_app ? 'bg-blue-600' : 'bg-gray-200'
                            } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.in_app ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-xs font-bold text-gray-500">In-App</span>
                         </div>
                         
                         {/* Email Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div 
                              onClick={() => handleToggle(idx, sIdx, 'email')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                               setting.email ? 'bg-blue-600' : 'bg-gray-200'
                            } ${setting.locked ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.email ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-xs font-bold text-gray-500">Email</span>
                         </div>

                         {/* SMS Toggle */}
                         <div className="md:col-span-2 flex justify-start md:justify-center">
                            <div 
                              onClick={() => handleToggle(idx, sIdx, 'sms')}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                               setting.sms ? 'bg-blue-600' : 'bg-gray-200'
                            }`}>
                               <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                  setting.sms ? 'translate-x-6' : 'translate-x-1'
                               }`} />
                            </div>
                            <span className="md:hidden ml-3 text-xs font-bold text-gray-500">SMS</span>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          ))}
        </motion.div>
      </div>

      <AddRoutingRuleModal
        isOpen={isAddRuleOpen}
        onClose={() => setIsAddRuleOpen(false)}
        onSuccess={fetchNotificationData}
      />
    </div>
  );
}
