"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ExternalLink, Filter, CheckCircle2, FileSignature, AlertCircle, FileSearch, RefreshCw } from "lucide-react";
import { Notification, getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications";
import Link from "next/link";

export default function ApprovalRequestsNotifications() {
  const [requests, setRequests] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApprovalNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'APPROVALS' };
      if (unreadOnly) params.unread_only = true;
      const data = await getNotifications(params);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load approval notifications", err);
    } finally {
      setIsLoading(false);
    }
  }, [unreadOnly]);

  useEffect(() => {
    fetchApprovalNotifications();
  }, [fetchApprovalNotifications]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead('APPROVALS');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'All approval notifications marked as read', type: 'success' } 
      }));
      fetchApprovalNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const getTypeIcon = (title: string) => {
    if (title.toLowerCase().includes('sign')) return <FileSignature size={20} />;
    if (title.toLowerCase().includes('technical')) return <FileSearch size={20} />;
    return <CheckCircle size={20} />;
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <div className="relative">
              <CheckCircle className="text-blue-500" />
              {requests.some(r => !r.is_read) && (
                <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            Approval Queue Notifications
          </h1>
          <p className="text-gray-500 mt-1">Notifications for items currently sitting in your approval queue.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchApprovalNotifications}
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

      <div className="space-y-4 max-w-5xl">
        {requests.map((req, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={req.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-all ${
              !req.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 mt-1 ${
                !req.is_read ? 'bg-blue-100 text-blue-600' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                {getTypeIcon(req.title)}
              </div>
              
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    req.priority === 'High' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                  }`}>
                    {req.priority} Priority
                  </span>
                  <span className="text-xs font-semibold text-gray-400 flex items-center gap-1">
                    <Clock size={12} /> {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <h3 className={`text-base font-bold mb-1 leading-snug ${!req.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {req.title}
                </h3>
                
                <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-500">
                  <span>REF: {req.notification_reference}</span>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span>Target: {req.location || 'Central Project'}</span>
                </div>
              </div>
            </div>

            <div className="w-full sm:w-auto shrink-0 mt-2 sm:mt-0">
               <Link
                 href="/government/dashboard/approvals/pending"
                 onClick={() => markNotificationRead(req.id)}
                 className={`w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                   !req.is_read ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                 }`}
               >
                 Go to Action Center <ExternalLink size={16} />
               </Link>
            </div>
          </motion.div>
        ))}

        {requests.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            No approval requests sitting in queue.
          </div>
        )}
      </div>
    </div>
  );
}
