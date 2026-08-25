"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Send, Paperclip, AlertTriangle, Users, 
  Hash, ShieldCheck, Clock, RefreshCw, UserCheck, Languages, 
  ChevronDown, Check, Sparkles, Globe 
} from "lucide-react";
import { 
  StakeholderMessage, getMessages, sendMessage, 
  translateMessage, MessageTranslation 
} from "@/services/stakeholders";

export default function StakeholderMessages() {
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState('General Council');
  const [inputMessage, setInputMessage] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Translations map: { [messageId]: MessageTranslation }
  const [translatedMap, setTranslatedMap] = useState<Record<string, MessageTranslation>>({});
  const [openTranslateMenuId, setOpenTranslateMenuId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const channels = [
    { name: "General Council", count: 12, icon: Hash },
    { name: "Project Coordination", count: 8, icon: Hash },
    { name: "Site Safety & Inspections", count: 4, icon: AlertTriangle },
    { name: "Direct Executive Messages", count: 2, icon: UserCheck }
  ];

  const languages = [
    { code: 'yo' as const, label: 'Yorùbá (yo)', flag: '🇳🇬' },
    { code: 'ig' as const, label: 'Igbo (ig)', flag: '🇳🇬' },
    { code: 'ha' as const, label: 'Hausa (ha)', flag: '🇳🇬' },
    { code: 'en' as const, label: 'English (Original)', flag: '🌐' },
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
        message_text: inputMessage.trim(),
        is_urgent: isUrgent,
        sender_name: 'Engr. Babatunde Sanwo',
        sender_role: 'Agency Head / Director General'
      });
      setInputMessage('');
      setIsUrgent(false);
      fetchMessages();
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Message broadcasted to #${activeChannel}`, type: 'success' }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to send message', type: 'error' } }));
    } finally {
      setIsSending(false);
    }
  };

  const handleTranslate = async (messageId: string, langCode: 'yo' | 'ig' | 'ha' | 'en') => {
    setOpenTranslateMenuId(null);
    if (langCode === 'en') {
      // Revert to original text
      setTranslatedMap(prev => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
      return;
    }

    setTranslatingId(messageId);
    try {
      const result = await translateMessage(messageId, langCode);
      setTranslatedMap(prev => ({
        ...prev,
        [messageId]: result
      }));
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { 
          message: `Translated to ${result.language_name} (${result.provider})`, 
          type: 'success' 
        }
      }));
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Translation service unavailable', type: 'error' }
      }));
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <MessageSquare className="text-blue-500" />
            Stakeholder Messaging &amp; Nigerian Language Channels
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Multi-agency communication stream with real-time Google Cloud Translation into Yorùbá, Igbo, and Hausa.
          </p>
        </div>
        
        <button 
          onClick={fetchMessages}
          className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors bg-white cursor-pointer"
          title="Refresh"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl h-[680px]">
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
                    className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#022C4F] text-white shadow-md shadow-[#022C4F]/20' 
                        : 'text-gray-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <IconComponent size={15} className={isActive ? 'text-white' : 'text-slate-400'} />
                      <span className="truncate">{ch.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 rounded-2xl text-xs text-slate-600">
            <div className="flex items-center gap-2 mb-1">
              <Globe size={14} className="text-blue-700" />
              <p className="font-black text-[#022C4F]">Multilingual Engine</p>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Google Cloud Translation with preserved terminology for <strong>BIM, GPR, GNSS, NCR, &amp; COREN</strong>.
            </p>
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
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Encrypted &amp; Audited
              </span>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((msg, idx) => {
              const activeTranslation = translatedMap[msg.id];
              const isMenuOpen = openTranslateMenuId === msg.id;
              const isTranslating = translatingId === msg.id;

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  key={msg.id}
                  className={`flex flex-col relative ${
                    msg.is_urgent 
                      ? 'p-4 rounded-2xl bg-red-50/80 border border-red-200' 
                      : 'p-4 rounded-2xl bg-white border border-gray-100 shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-xs text-gray-900">{msg.sender_name}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {msg.sender_role}
                      </span>
                      {msg.is_urgent && (
                        <span className="text-[10px] uppercase font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded border border-red-200 animate-pulse">
                          Urgent Directive
                        </span>
                      )}
                      {activeTranslation && (
                        <span className="text-[10px] uppercase font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                          <Languages size={10} /> {activeTranslation.language_name}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-semibold flex items-center gap-1">
                        <Clock size={10} /> {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                      </span>

                      {/* Translate Menu Button */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenTranslateMenuId(isMenuOpen ? null : msg.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Languages size={11} className="text-blue-600" />
                          <span>{isTranslating ? 'Translating...' : activeTranslation ? activeTranslation.language_name : 'Translate'}</span>
                          <ChevronDown size={10} />
                        </button>

                        {/* Dropdown */}
                        <AnimatePresence>
                          {isMenuOpen && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95, y: 5 }}
                              animate={{ opacity: 1, scale: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95, y: 5 }}
                              className="absolute right-0 top-7 z-30 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 p-1.5 space-y-1"
                            >
                              <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                Translate Message
                              </div>
                              {languages.map((lang) => {
                                const isCurrent = activeTranslation 
                                  ? activeTranslation.target_language === lang.code 
                                  : lang.code === 'en';
                                return (
                                  <button
                                    key={lang.code}
                                    onClick={() => handleTranslate(msg.id, lang.code)}
                                    className={`w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                                      isCurrent 
                                        ? 'bg-blue-50 text-blue-700' 
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                                  >
                                    <span className="flex items-center gap-1.5">
                                      <span>{lang.flag}</span>
                                      <span>{lang.label}</span>
                                    </span>
                                    {isCurrent && <Check size={12} />}
                                  </button>
                                );
                              })}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  </div>

                  {/* Message Content */}
                  <p className="text-xs text-gray-800 leading-relaxed font-medium">
                    {activeTranslation ? activeTranslation.translated_content : msg.message_text}
                  </p>

                  {/* Translation Subtitle / Original Toggle */}
                  {activeTranslation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Original: &ldquo;{activeTranslation.original_content}&rdquo;</span>
                      <button
                        onClick={() => handleTranslate(msg.id, 'en')}
                        className="text-blue-600 font-bold hover:underline cursor-pointer"
                      >
                        Show Original
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}

            {messages.length === 0 && !isLoading && (
              <div className="p-12 text-center text-gray-400 text-xs">
                No messages in this channel yet. Post an official update below.
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
                  className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Mark as High-Priority / Urgent Directive</span>
              </label>
            </div>
            
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Message #${activeChannel}...`}
                className="flex-1 p-3 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
              />
              <button
                type="submit"
                disabled={isSending || !inputMessage.trim()}
                className="px-5 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-[#022C4F]/20 cursor-pointer"
              >
                <Send size={14} /> <span>{isSending ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
