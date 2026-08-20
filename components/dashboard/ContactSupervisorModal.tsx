"use client";

import React, { useState } from 'react';
import { X, PhoneCall, Send, User } from 'lucide-react';
import { Notification } from '@/services/notifications';

interface ContactSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  notification: Notification | null;
}

export default function ContactSupervisorModal({
  isOpen,
  onClose,
  notification
}: ContactSupervisorModalProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !notification) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Priority directive sent to Site Safety Supervisor!`, type: 'success' } 
      }));
      setIsSending(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <PhoneCall size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Contact Site Supervisor</h3>
              <p className="text-xs text-slate-500">REF: {notification.notification_reference}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs space-y-1">
            <p className="font-bold text-slate-900">{notification.title}</p>
            <p className="text-slate-600 font-medium">{notification.location || 'Site Sector'}</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Safety Directive / Instruction
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. Halt all excavation in Sector A immediately until structural geo-retaining team arrives on site."
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-1.5"
            >
              <Send size={14} /> {isSending ? 'Sending...' : 'Dispatch Message'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
