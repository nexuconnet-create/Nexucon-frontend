"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  ShieldAlert, AlertTriangle, CheckCircle2, Clock, 
  MapPin, PhoneCall, RefreshCw, SlidersHorizontal, 
  ExternalLink, Check, BellRing, Mail, MessageSquare 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  markNotificationRead, acknowledgeNotification, 
  markAllNotificationsRead 
} from "@/services/notifications";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function EmergencyNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchEmergency = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'EMERGENCY' };
      if (unreadOnly) params.is_read = false;
      const data = await getNotifications(params);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load emergency alerts", err);
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchEmergency();
  }, [fetchEmergency]);

  const handleOpenAction = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handleAcknowledge = async (id: string) => {
    try {
      await acknowledgeNotification(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Emergency dispatch acknowledged by Authority Lead', type: 'success' } 
      }));
      fetchEmergency();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationRead(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Emergency alert marked as read', type: 'info' } 
      }));
      fetchEmergency();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead('EMERGENCY');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All emergency alerts marked as read', type: 'success' } 
      }));
      fetchEmergency();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-red-600 flex items-center gap-3">
            <div className="relative">
              <ShieldAlert className="text-red-600 animate-pulse" size={32} />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
            Emergency Dispatch &amp; Real-time Alerts
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Immediate statutory field dispatches, scaffold collapse warnings, and critical safety incidents.
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
            onClick={fetchEmergency}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh Incident Feed"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex items-center justify-between gap-4 mb-6 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              unreadOnly 
                ? 'bg-red-600 text-white shadow-sm' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {unreadOnly ? 'Showing Unread Only' : 'Show Unread Only'}
          </button>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <CheckCircle2 size={14} />
          <span>Mark All as Read</span>
        </button>
      </div>

      {/* Emergency Incidents Feed */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-400">
            <ShieldAlert size={40} className="mx-auto mb-2 text-emerald-500" />
            <p className="text-xs font-bold text-slate-700">No active emergency dispatches.</p>
            <p className="text-[11px] text-slate-400 mt-1">All monitored sites operating within normal safety limits.</p>
          </div>
        ) : (
          notifications.map((notif, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              key={notif.id}
              className={`p-5 sm:p-6 rounded-3xl border transition-all ${
                notif.is_acknowledged 
                  ? 'bg-white border-slate-200/90 shadow-sm' 
                  : 'bg-red-50/50 border-red-200 shadow-md ring-1 ring-red-300'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldAlert size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded border border-red-200 uppercase">
                        {notif.priority} PRIORITY
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                        {notif.notification_reference}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock size={12} />
                        {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-black text-slate-900 mt-1.5">{notif.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{notif.message}</p>

                    {notif.location && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-700">
                        <MapPin size={13} className="text-red-500" />
                        <span>{notif.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap">
                  <button
                    onClick={() => handleOpenAction(notif)}
                    className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare size={13} />
                    <span>Attend Dispatch</span>
                  </button>

                  {!notif.is_acknowledged ? (
                    <button
                      onClick={() => handleAcknowledge(notif.id)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={14} />
                      <span>Quick Acknowledge</span>
                    </button>
                  ) : (
                    <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Acknowledged</span>
                    </span>
                  )}

                  {!notif.is_read && (
                    <button
                      onClick={() => handleDismiss(notif.id)}
                      className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                      title="Mark as Read"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Sidepop Action Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedNotif}
        onUpdated={fetchEmergency}
      />

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
