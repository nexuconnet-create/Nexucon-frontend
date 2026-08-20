"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { MessageSquare, Send, Paperclip, AlertTriangle, Users, Hash, ShieldCheck, Clock, RefreshCw, UserCheck } from "lucide-react";
import { StakeholderMessage, getMessages, sendMessage } from "@/services/stakeholders";

export default function StakeholderMessages() {
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState('General Council');
  const [inputMessage, setInputMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const channels = [
    { name: "General Council", count: 12, icon: Hash },
    { name: "Project Coordination", count: 8, icon: Hash },
    { name: "Site Safety & Inspections", count: 4, icon: AlertTriangle },
    { name: "Direct Executive Messages", count: 2, icon: UserCheck }
  ];

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMessages({ channel: activeChannel });
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setIsSending(true);
    try {
      await sendMessage({
        channel_name: activeChannel,
        message_text: inputMessage,
        is_urgent: isUrgent,
        sender_name: 'Engr. Babatunde Sanwo',
        sender_role: 'Agency Head / Director General'
      });
      setInputMessage('');
      setIsUrgent(false);
      fetchMessages();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to send message', type: 'error' } }));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <MessageSquare className="text-blue-500" />
            Stakeholder Messaging & Channels
          </h1>
          <p className="text-gray-500 mt-1">Multi-agency communication stream between government regulators, developers, and contractors.</p>
        </div>
        
        <button 
          onClick={fetchMessages}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl h-[650px]">
        {/* Left: Channels Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-2">
              Communication Channels
            </span>
            <div className="space-y-1">
              {channels.map((ch) => {
                const IconComponent = ch.icon;
                const isActive = activeChannel === ch.name;

                return (
                  <button
                    key={ch.name}
                    onClick={() => setActiveChannel(ch.name)}
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-colors ${
                      isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent size={16} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{ch.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-500">
            <p className="font-bold text-slate-800 mb-0.5">Encrypted Channel</p>
            <p className="text-[11px]">All stakeholder messages are logged to the regulatory audit log.</p>
          </div>
        </div>

        {/* Right: Active Chat Stream */}
        <div className="lg:col-span-3 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          
          {/* Channel Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Hash size={16} className="text-blue-500" />
                {activeChannel}
              </h3>
              <p className="text-[11px] text-gray-500 font-medium">Project: Central Metro Transit Hub</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Live Channel
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((msg, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={msg.id}
                className={`flex flex-col ${msg.is_urgent ? 'p-4 rounded-2xl bg-red-50/80 border border-red-200' : 'p-3 rounded-2xl bg-white border border-gray-100 shadow-sm'}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-gray-900">{msg.sender_name}</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                      {msg.sender_role}
                    </span>
                    {msg.is_urgent && (
                      <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                        Urgent Directive
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                    <Clock size={10} /> {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-medium">
                  {msg.message_text}
                </p>
              </motion.div>
            ))}

            {messages.length === 0 && !isLoading && (
              <div className="p-12 text-center text-gray-400 text-xs">
                No messages in this channel yet. Post an update below.
              </div>
            )}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 mb-2">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500"
                />
                Mark as High-Priority / Urgent Directive
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message #${activeChannel}...`}
                className="flex-1 p-3 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-blue-500/20"
              >
                <Send size={14} /> Send
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
