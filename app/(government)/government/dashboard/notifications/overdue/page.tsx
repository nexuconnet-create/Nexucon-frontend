"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Clock, Filter, CheckCircle2, UserCircle, BellRing, Mail, MessageSquare, RefreshCw } from "lucide-react";
import { Notification, getNotifications, pingAssignee, markAllNotificationsRead } from "@/services/notifications";

export default function OverdueActions() {
  const [actions, setActions] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const handlePing = async (id: string, method: 'Email' | 'Chat' | 'Bell') => {
    try {
      const res = await pingAssignee(id, method);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: res.message || `Ping dispatched via ${method}!`, type: 'success' } 
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
            Overdue Actions & SLA Breaches
          </h1>
          <p className="text-gray-500 mt-1">System-generated alerts for tasks that have missed their regulatory SLA.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchOverdueActions}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {actions.map((action, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={action.id}
            className={`flex flex-col p-6 rounded-3xl border transition-all ${
              !action.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className={`text-base font-bold mb-1 ${!action.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {action.title}
                </h3>
                <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                  <span className="font-mono font-bold text-blue-600">{action.notification_reference}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>{action.location || 'Site Sector'}</span>
                </div>
              </div>
              
              {/* Overdue Badge */}
              <div className="shrink-0 flex flex-col items-end">
                <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-xs font-bold border bg-red-50 text-red-700 border-red-200">
                  4 Days Overdue
                </span>
                <span className="text-[10px] text-gray-400 font-bold uppercase mt-1">Due: Oct 05, 2026</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-6 bg-red-50/30 p-3 rounded-2xl border border-red-100/40">
              {action.message}
            </p>
            
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                  <UserCircle size={18} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Assignee</p>
                  <p className="text-xs font-bold text-gray-900">{action.snippet || 'Sarah Jenkins (Environmental)'}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <button 
                  onClick={() => handlePing(action.id, 'Email')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                  title="Send Email Reminder"
                >
                  <Mail size={16} />
                </button>
                <button 
                  onClick={() => handlePing(action.id, 'Chat')}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors" 
                  title="Send Chat Message"
                >
                  <MessageSquare size={16} />
                </button>
                <button 
                  onClick={() => handlePing(action.id, 'Bell')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
                    !action.is_read ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <BellRing size={14} /> Ping Assignee
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {actions.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500 col-span-2">
            No overdue actions at this time.
          </div>
        )}
      </div>
    </div>
  );
}
