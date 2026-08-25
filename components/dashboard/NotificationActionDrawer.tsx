"use client";

import React, { useState } from 'react';
import { 
  X, Bell, CheckCircle2, AlertTriangle, ShieldAlert, 
  MapPin, Clock, FileText, Send, ExternalLink, User, 
  Check, ArrowUpRight, MessageSquare, ShieldCheck, Mail, RefreshCw 
} from 'lucide-react';
import Link from 'next/link';
import { Notification, markNotificationRead, acknowledgeNotification } from '@/services/notifications';

interface NotificationActionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
  onUpdated?: () => void;
}

export default function NotificationActionDrawer({
  isOpen,
  onClose,
  notification,
  onUpdated
}: NotificationActionDrawerProps) {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  if (!isOpen || !notification) return null;

  const getCategoryColor = (cat: string) => {
    switch (cat?.toUpperCase()) {
      case 'EMERGENCY':
      case 'CRITICAL':
        return 'text-red-700 bg-red-50 border-red-200';
      case 'APPLICATIONS':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'INSPECTIONS':
        return 'text-indigo-700 bg-indigo-50 border-indigo-200';
      case 'APPROVALS':
        return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'COMPLIANCE':
      case 'OVERDUE':
        return 'text-amber-700 bg-amber-50 border-amber-200';
      default:
        return 'text-slate-700 bg-slate-50 border-slate-200';
    }
  };

  const getPriorityBadge = (pri: string) => {
    switch (pri) {
      case 'Critical':
        return 'bg-red-600 text-white';
      case 'High':
        return 'bg-amber-500 text-white';
      case 'Medium':
        return 'bg-blue-600 text-white';
      default:
        return 'bg-slate-500 text-white';
    }
  };

  const handleMarkAsRead = async () => {
    try {
      await markNotificationRead(notification.id);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Notification marked as read', type: 'info' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAcknowledge = async () => {
    try {
      await acknowledgeNotification(notification.id);
      setActionSuccess('Incident acknowledged & recorded in official log.');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Notification acknowledged by officer', type: 'success' } 
      }));
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDirective = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      // Mark as read and record statutory response
      await markNotificationRead(notification.id);
      setActionSuccess(`Official directive dispatched: "${comment}"`);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Statutory directive submitted and logged!', type: 'success' } 
      }));
      setComment('');
      if (onUpdated) onUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[130] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over sidepop */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-[560px] bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200 animate-in slide-in-from-right duration-300">
          
          {/* Top Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-lg border ${getCategoryColor(notification.category)}`}>
                  {notification.category}
                </span>
                <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md ${getPriorityBadge(notification.priority)}`}>
                  {notification.priority} Priority
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-sm">
                  {notification.notification_reference}
                </span>
              </div>

              <button 
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-200/60 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <h2 className="text-lg font-black text-slate-900 leading-snug">
              {notification.title}
            </h2>

            <div className="flex items-center gap-4 mt-2 text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <Clock size={12} className="text-slate-400" />
                {new Date(notification.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notification.created_at).toLocaleDateString()}
              </span>
              {notification.email_sent && (
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <Mail size={12} />
                  <span>Email Dispatched</span>
                </span>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-7 flex-1 overflow-y-auto space-y-6">
            
            {actionSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{actionSuccess}</span>
              </div>
            )}

            {/* Notification Statement */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Official Incident / Request Details
              </h4>
              <p className="text-xs sm:text-sm text-slate-800 font-medium leading-relaxed">
                {notification.message}
              </p>

              {notification.location && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-200/60 text-xs font-bold text-slate-700">
                  <MapPin size={14} className="text-red-500 shrink-0" />
                  <span>{notification.location}</span>
                </div>
              )}
            </div>

            {/* Structured Metadata */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Role</span>
                <span className="font-bold text-slate-800 mt-0.5 block">{notification.recipient_role || 'All Directorate'}</span>
              </div>
              <div className="p-3 bg-white border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                <span className="font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  {notification.is_acknowledged ? (
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={12} /> Acknowledged</span>
                  ) : (
                    <span className="text-amber-600 flex items-center gap-1"><Clock size={12} /> Pending Action</span>
                  )}
                </span>
              </div>
            </div>

            {/* Response & Statutory Directive Form */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                <MessageSquare size={15} className="text-blue-600" />
                <span>Attend / Dispatch Officer Directive</span>
              </h4>

              <form onSubmit={handleSendDirective} className="space-y-3">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Enter regulatory directive, site instruction, or review comments..."
                  rows={3}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                  {!notification.is_acknowledged && (
                    <button
                      type="button"
                      onClick={handleAcknowledge}
                      className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 size={13} />
                      <span>Quick Acknowledge</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !comment.trim()}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ml-auto"
                  >
                    <Send size={13} />
                    <span>{isSubmitting ? 'Sending...' : 'Send Directive'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Direct Deep-link to Operational Console */}
            {notification.action_url && (
              <div className="p-4 bg-blue-50/60 border border-blue-200/80 rounded-2xl flex items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-black text-blue-950">Open Source Operational Record</h4>
                  <p className="text-[11px] text-blue-800/80 mt-0.5">Jump directly to the relevant review queue or case console.</p>
                </div>
                <Link
                  href={notification.action_url}
                  onClick={onClose}
                  className="px-4 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                >
                  <span>Open Console</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            )}

          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck size={14} className="text-blue-600" />
              <span>Government Audit Reference Code: {notification.notification_reference}</span>
            </div>

            <div className="flex items-center gap-2">
              {!notification.is_read && (
                <button
                  onClick={handleMarkAsRead}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Check size={14} />
                  <span>Mark as Read</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
