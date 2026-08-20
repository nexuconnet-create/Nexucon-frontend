"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarSearch, MapPin, CalendarDays, CheckCircle2, Clock, MessageSquare, ShieldCheck, Filter, RefreshCw } from "lucide-react";
import { Notification, getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications";

export default function InspectionRequests() {
  const [requests, setRequests] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInspectionRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'INSPECTIONS' };
      if (unreadOnly) params.unread_only = true;
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
            Inspection Requests & Scheduling
          </h1>
          <p className="text-gray-500 mt-1">Review contractor requests for site walk-throughs and quality sign-offs.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchInspectionRequests}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
              unreadOnly 
                ? 'bg-blue-50 border-blue-200 text-blue-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} /> Unread Only
          </button>
          <button 
            onClick={handleMarkAllRead}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <CheckCircle2 size={16} />
            Mark All as Read
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 max-w-5xl">
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={req.id}
            className={`flex flex-col md:flex-row rounded-3xl border transition-all overflow-hidden ${
              !req.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            {/* Left Content Area */}
            <div className="flex-1 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className={`text-lg font-bold mb-1 ${!req.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                    {req.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <span className="font-mono font-bold text-blue-600">{req.notification_reference}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span>{req.recipient_role || 'Structural Inspection Team'}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              {req.location && (
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium mb-3">
                  <MapPin size={16} className="text-blue-500" /> {req.location}
                </div>
              )}
              
              <p className="text-sm text-gray-600 mb-0 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-100">
                "{req.message}"
              </p>
            </div>

            {/* Right Action Area */}
            <div className={`p-6 border-t md:border-t-0 md:border-l flex flex-col justify-between min-w-[280px] ${!req.is_read ? 'bg-blue-50/30 border-blue-100' : 'border-gray-100'}`}>
              <div className="mb-6">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Proposed Schedule</span>
                <div className="flex items-center gap-2 text-sm font-bold text-gray-900 mb-1">
                  <CalendarDays size={16} className="text-blue-500" /> {req.snippet || 'Oct 18, 2026'}
                </div>
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-600 ml-6">
                  09:00 AM — 11:30 AM
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {!req.is_read ? (
                  <>
                    <button 
                      onClick={() => handleAcceptSchedule(req.id)}
                      className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <ShieldCheck size={16} /> Accept Date & Time
                    </button>
                    <button 
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                          detail: { message: `Proposing alternative walkthrough slot for ${req.notification_reference}...`, type: 'info' } 
                        }));
                      }}
                      className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <CalendarDays size={16} /> Propose New Time
                    </button>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      window.dispatchEvent(new CustomEvent('show-toast', { 
                        detail: { message: `Opening comment thread for ${req.notification_reference}...`, type: 'info' } 
                      }));
                    }}
                    className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <MessageSquare size={16} /> Add Comment
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            No inspection requests found.
          </div>
        )}
      </div>
    </div>
  );
}
