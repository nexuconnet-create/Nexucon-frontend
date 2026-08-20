"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Clock, Filter, CheckCircle2, Volume2, ShieldAlert, Droplet, FileWarning, RefreshCw } from "lucide-react";
import { Notification, getNotifications, markNotificationRead, markAllNotificationsRead } from "@/services/notifications";

export default function ComplianceAlerts() {
  const [alerts, setAlerts] = useState<Notification[]>([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchComplianceAlerts = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = { category: 'COMPLIANCE' };
      if (unreadOnly) params.unread_only = true;
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

  const handleDismiss = async (id: string) => {
    try {
      await markNotificationRead(id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Alert acknowledged and dismissed', type: 'info' } 
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
            Compliance & Infraction Alerts
          </h1>
          <p className="text-gray-500 mt-1">Automated sensor warnings, drone detections, and inspector-flagged infractions.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchComplianceAlerts}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setUnreadOnly(!unreadOnly)}
            className={`flex items-center gap-2 px-3.5 py-2.5 border rounded-xl text-sm font-semibold transition-all ${
              unreadOnly 
                ? 'bg-amber-50 border-amber-200 text-amber-700' 
                : 'border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} /> Unread Only
          </button>
          <button 
            onClick={handleAcknowledgeAll}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <CheckCircle2 size={16} />
            Acknowledge All
          </button>
        </div>
      </div>

      <div className="space-y-4 max-w-5xl">
        {alerts.map((alert, idx) => (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            key={alert.id}
            className={`flex flex-col sm:flex-row gap-4 p-5 rounded-2xl border transition-all ${
              !alert.is_read ? 'bg-white border-amber-200 shadow-md ring-1 ring-amber-500/10' : 'bg-gray-50/50 border-gray-100 shadow-sm opacity-80'
            }`}
          >
            {/* Icon Column */}
            <div className="shrink-0 pt-1">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                !alert.is_read ? 'bg-amber-100 text-amber-600' : 'bg-white border border-gray-200 text-gray-400'
              }`}>
                {getAlertIcon(alert.title)}
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className={`text-base font-bold ${!alert.is_read ? 'text-gray-900' : 'text-gray-700'}`}>
                  {alert.title}
                </h3>
                <span className="text-xs font-semibold text-gray-400 whitespace-nowrap flex items-center gap-1">
                  <Clock size={12} /> {new Date(alert.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                  {alert.priority} Priority
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                  alert.priority === 'Critical' || alert.priority === 'High' ? 'text-red-600 bg-red-50 border-red-100' : 'text-amber-600 bg-amber-50 border-amber-100'
                }`}>
                  {alert.severity || 'Action Required'}
                </span>
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className="text-xs font-semibold text-gray-500">{alert.location || 'Site Perimeter'}</span>
              </div>
              
              <p className="text-sm text-gray-600 mb-4 bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                {alert.message}
              </p>
              
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('show-toast', { 
                      detail: { message: `Opening NCR Generator for ${alert.notification_reference}...`, type: 'info' } 
                    }));
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                    !alert.is_read ? 'bg-amber-500 text-white hover:bg-amber-600 shadow-sm' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <FileWarning size={14} /> Generate NCR (Non-Conformance)
                </button>
                {!alert.is_read && (
                  <button 
                    onClick={() => handleDismiss(alert.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Acknowledge & Dismiss
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {alerts.length === 0 && !isLoading && (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
            No compliance alerts found.
          </div>
        )}
      </div>
    </div>
  );
}
