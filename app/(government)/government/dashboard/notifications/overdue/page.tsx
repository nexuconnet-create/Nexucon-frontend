"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  Clock, Filter, CheckCircle2, UserCircle, 
  BellRing, Mail, MessageSquare, RefreshCw, 
  SlidersHorizontal 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  pingAssignee, markAllNotificationsRead 
} from "@/services/notifications";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function OverdueActions() {
  const [actions, setActions] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchOverdueActions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getNotifications({ category: 'OVERDUE' });
      setActions(data);
    } catch (err) {
      console.error("Failed to load overdue actions", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverdueActions();
  }, [fetchOverdueActions]);

  const handleOpenAction = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handlePing = async (id: string, method: 'Email' | 'Chat' | 'Bell') => {
    try {
      const res = await pingAssignee(id, method);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: res.message || `SLA Ping dispatched via ${method}!`, type: 'success' } 
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to dispatch ping', type: 'error' } }));
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead('OVERDUE');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All overdue actions marked as read', type: 'success' } 
      }));
      fetchOverdueActions();
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
              <Clock className="text-blue-500" />
              {actions.some(a => !a.is_read) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            Overdue Actions &amp; SLA Reminders
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Tracking overdue technical reviews, permit turnaround breaches, and contractor milestones.
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
            onClick={fetchOverdueActions}
            className="p-2.5 border border-slate-200 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors cursor-pointer bg-white"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
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
        {actions.map((act, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={act.id}
            className={`p-5 sm:p-6 rounded-3xl border transition-all ${
              !act.is_read ? 'bg-white border-red-200 shadow-md ring-1 ring-red-500/10' : 'bg-slate-50/70 border-slate-200 shadow-sm opacity-85'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    Overdue Breach
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-500">
                    {act.notification_reference}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    • Logged {new Date(act.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {act.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {act.message}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <UserCircle size={14} className="text-slate-400" />
                    <span>Target: {act.recipient_role || 'Directorate Lead'}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                <button
                  onClick={() => handlePing(act.id, 'Email')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                  title="Dispatch Reminder Email"
                >
                  <Mail size={12} /> Ping Email
                </button>

                <button
                  onClick={() => handleOpenAction(act)}
                  className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquare size={13} />
                  <span>Attend / Directive</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {actions.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No overdue actions. All SLAs operating within threshold.
          </div>
        )}
      </div>

      {/* Quick Action Sidepop Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedNotif}
        onUpdated={fetchOverdueActions}
      />

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
