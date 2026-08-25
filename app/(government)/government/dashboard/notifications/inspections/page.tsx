"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  CalendarSearch, MapPin, CalendarDays, CheckCircle2, 
  Clock, MessageSquare, ShieldCheck, Filter, RefreshCw, 
  SlidersHorizontal 
} from "lucide-react";
import { 
  Notification, getNotifications, 
  markNotificationRead, markAllNotificationsRead 
} from "@/services/notifications";
import NotificationActionDrawer from "@/components/dashboard/NotificationActionDrawer";
import NotificationPreferencesModal from "@/components/dashboard/NotificationPreferencesModal";

export default function InspectionRequests() {
  const [requests, setRequests] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPrefsOpen, setIsPrefsOpen] = useState(false);

  const fetchInspectionRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'INSPECTIONS' };
      if (unreadOnly) params.is_read = false;
      const data = await getNotifications(params);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load inspection requests", err);
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchInspectionRequests();
  }, [fetchInspectionRequests]);

  const handleOpenAction = (notif: Notification) => {
    setSelectedNotif(notif);
    setIsDrawerOpen(true);
  };

  const handleAcceptSchedule = async (id: string) => {
    try {
      await markNotificationRead(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Inspection date and time accepted! Officer scheduled.', type: 'success' } 
      }));
      fetchInspectionRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead('INSPECTIONS');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All inspection notifications marked as read', type: 'success' } 
      }));
      fetchInspectionRequests();
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
              <CalendarSearch className="text-blue-500" />
              {requests.some(r => !r.is_read) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            Inspection Requests &amp; Scheduling
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Review contractor requests for site walk-throughs and quality sign-offs.
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
            onClick={fetchInspectionRequests}
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

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
            key={req.id}
            className={`flex flex-col md:flex-row rounded-3xl border transition-all overflow-hidden ${
              !req.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-slate-50/70 border-slate-200 shadow-sm opacity-85'
            }`}
          >
            {/* Left Content Area */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className={`text-base sm:text-lg font-bold mb-1 ${!req.is_read ? 'text-slate-900' : 'text-slate-700'}`}>
                    {req.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                    <span className="font-mono font-bold text-blue-600">{req.notification_reference}</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                    <span>{req.recipient_role || 'Inspection Directorate'}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {req.location && (
                <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-3">
                  <MapPin size={14} className="text-blue-500" /> {req.location}
                </div>
              )}
              
              <p className="text-xs sm:text-sm text-slate-600 mb-0 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
                "{req.message}"
              </p>
            </div>

            {/* Right Action Area */}
            <div className={`p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between min-w-[280px] ${!req.is_read ? 'bg-blue-50/30 border-blue-100' : 'border-slate-200'}`}>
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Proposed Schedule</span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-1">
                  <CalendarDays size={15} className="text-blue-500" /> {req.snippet || 'Scheduled Date Slot'}
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 ml-6">
                  09:00 AM — 11:30 AM
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => handleOpenAction(req)}
                  className="w-full py-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-md shadow-blue-600/20 hover:bg-blue-700 transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare size={14} /> Review &amp; Attend Request
                </button>

                {!req.is_read && (
                  <button 
                    onClick={() => handleAcceptSchedule(req.id)}
                    className="w-full py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold shadow-sm hover:bg-slate-50 transition-colors text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <ShieldCheck size={14} /> Quick Accept Date
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && !isLoading && (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-12 text-center text-slate-500">
            No inspection requests found.
          </div>
        )}
      </div>

      {/* Quick Action Sidepop Drawer */}
      <NotificationActionDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notification={selectedNotif}
        onUpdated={fetchInspectionRequests}
      />

      {/* Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPrefsOpen}
        onClose={() => setIsPrefsOpen(false)}
      />
    </div>
  );
}
