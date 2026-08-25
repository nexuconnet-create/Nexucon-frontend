"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  AlertTriangle, Clock, Filter, CheckCircle2, 
  Volume2, ShieldAlert, Droplet, FileWarning, 
  RefreshCw, SlidersHorizontal, MessageSquare 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  markNotificationRead, markAllNotificationsRead 
} from "@/services/notifications";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function ComplianceAlerts() {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchComplianceAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'COMPLIANCE' };
      if (unreadOnly) params.is_read = false;
      const data = await getNotifications(params);
      setAlerts(data);
    } catch (err) {
      console.error("Failed to load compliance alerts", err);
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchComplianceAlerts();
  }, [fetchComplianceAlerts]);

  const handleOpenAction = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationRead(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Alert acknowledged and marked as read', type: 'info' } 
      }));
      fetchComplianceAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledgeAll = async () => {
    try {
      await markAllNotificationsRead('COMPLIANCE');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All compliance alerts acknowledged', type: 'success' } 
      }));
      fetchComplianceAlerts();
    } catch (err) {
      console.error(err);
    }
  };

  const getAlertIcon = (title: string) => {
    if (title.toLowerCase().includes('noise')) return <Volume2 size={20} />;
    if (title.toLowerCase().includes('water') || title.toLowerCase().includes('silt')) return <Droplet size={20} />;
    return <ShieldAlert size={20} />;
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <AlertTriangle className="text-amber-500" />
              {alerts.some(a => !a.is_read) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            Compliance &amp; Statutory Infractions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Automated statutory threshold violations, non-conformance logs, and CAPA tasks.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrefsOpen(true)}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal size={14} className="text-slate-500" />
            <span>Email Settings</span>
          </button>

          <button 
            onClick={fetchComplianceAlerts}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          
          <button 
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-xs font-bold transition-all cursor-pointer ${
              unreadOnly 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Filter size={14} /> Unread Only
          </button>
          
          <button 
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold cursor-pointer"
          >
            <CheckCircle2 size={14} />
            Acknowledge All
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {alerts.map((alert, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={alert.id}
            className={`flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-3xl border transition-all ${
              !alert.is_read ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-500/10' : 'bg-slate-50/70 border-slate-200 shadow-sm opacity-85'
            }`}
          >
            {/* Icon Column */}
            <div className="shrink-0 pt-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                !alert.is_read ? 'bg-amber-100 text-amber-700' : 'bg-white border border-slate-200 text-slate-400'
              }`}>
                {getAlertIcon(alert.title)}
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className={`text-base font-bold ${!alert.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                  {alert.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-500">{alert.location || 'Monitored Sector Hub'}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {alert.priority} Severity
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {alert.notification_reference}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
                {alert.message}
              </p>
              
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={() => handleOpenAction(alert)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !alert.is_read ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Attend to Infraction</span>
                </button>

                {!alert.is_read && (
                  <button 
                    onClick={() => handleDismiss(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <CheckCircle2 size={14} /> Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {alerts.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No compliance alerts detected.
          </div>
        )}
      </div>

      {/* Quick Action Sidepop Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedNotif}
        onUpdated={fetchComplianceAlerts}
      />

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
