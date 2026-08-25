"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Bell, Briefcase, FileText, Check, Clock, 
  ExternalLink, Filter, CheckCircle2, RefreshCw, 
  SlidersHorizontal, MessageSquare 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  markNotificationRead, markAllNotificationsRead 
} from "@/services/notifications";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function ApplicationNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'APPLICATIONS' };
      if (unreadOnly) params.is_read = false;
      const data = await getNotifications(params);
      setNotifications(data);
    } catch (err) {
      console.error("Failed to load application notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleOpenReview = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationRead(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Notification marked as read', type: 'info' } 
      }));
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead('APPLICATIONS');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All application notifications marked as read', type: 'success' } 
      }));
      fetchApplications();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <Bell className="text-blue-500" />
              {notifications.some(n => !n.is_read) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            New Applications &amp; Submissions
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Recent submissions, permit applications, and documents awaiting initial triage.
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
            onClick={fetchApplications}
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
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-colors shadow-sm text-xs font-bold cursor-pointer"
          >
            <CheckCircle2 size={14} />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {notifications.map((notif, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={notif.id}
            className={`flex flex-col sm:flex-row gap-4 p-5 sm:p-6 rounded-3xl border transition-all ${
              !notif.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-slate-50/70 border-slate-200 shadow-sm opacity-85'
            }`}
          >
            {/* Icon Column */}
            <div className="shrink-0 pt-1">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                !notif.is_read ? 'bg-blue-100 text-blue-600' : 'bg-white border border-slate-200 text-slate-400'
              }`}>
                <Briefcase size={20} />
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-1">
                <h3 className={`text-base font-bold ${!notif.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                  {notif.title}
                </h3>
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-bold text-slate-500">{notif.location || 'Central Directorate'}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {notif.priority} Priority
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">
                  {notif.notification_reference}
                </span>
              </div>
              
              <p className="text-xs sm:text-sm text-slate-600 mb-4 line-clamp-2">
                {notif.message}
              </p>
              
              <div className="flex items-center gap-3 flex-wrap">
                <button 
                  onClick={() => handleOpenReview(notif)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    !notif.is_read ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MessageSquare size={13} />
                  <span>Review &amp; Attend</span>
                </button>

                {!notif.is_read && (
                  <button 
                    onClick={() => handleDismiss(notif.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Check size={14} /> Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {notifications.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No application notifications found.
          </div>
        )}
      </div>

      {/* Quick Action Sidepop Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedNotif}
        onUpdated={fetchApplications}
      />

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
