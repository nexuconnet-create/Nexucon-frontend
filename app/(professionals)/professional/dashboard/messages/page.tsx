"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Phone, Paperclip, Send, AlertTriangle, FileText } from "lucide-react";
import { StakeholderMessage, getMessages } from "@/services/stakeholders";

// Derive initials from a real sender name (never a stock photo).
const getInitials = (name: string): string => {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "—";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// Relative time from the real created_at timestamp.
const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFullDate = (iso?: string): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [reloadCounter, setReloadCounter] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    getMessages()
      .then((data) => {
        if (cancelled) return;
        // Most recent first; senders are grouped from the real message stream.
        setMessages([...data].sort(
          (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        ));
      })
      .catch((err) => {
        console.error("Failed to load messages", err);
        if (!cancelled) setLoadError("Messages could not be loaded. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, [reloadCounter]);

  // Contacts are derived from the real message data: one entry per sender,
  // anchored to their most recent message.
  const contacts = useMemo(() => {
    const bySender = new Map<string, StakeholderMessage>();
    for (const msg of messages) {
      if (!bySender.has(msg.sender_name)) {
        bySender.set(msg.sender_name, msg);
      }
    }
    return Array.from(bySender.entries()).map(([name, latest]) => ({
      id: name,
      name,
      latest,
    }));
  }, [messages]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return contacts;
    const q = search.trim().toLowerCase();
    return contacts.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.latest.message_text.toLowerCase().includes(q) ||
      (c.latest.project_name || "").toLowerCase().includes(q)
    );
  }, [contacts, search]);

  const selectedContact = filteredContacts.find(c => c.id === selectedContactId)
    || contacts.find(c => c.id === selectedContactId)
    || contacts[0]
    || null;

  // The conversation pane shows the sender's real messages, oldest first.
  const contactMessages = useMemo(() => {
    if (!selectedContact) return [];
    return messages
      .filter(m => m.sender_name === selectedContact.name)
      .sort((a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime());
  }, [messages, selectedContact]);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-[calc(100vh-80px)] w-full bg-white rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500 border border-gray-100">

      {/* LEFT COLUMN: CONTACTS SIDEBAR */}
      <div className="w-full lg:w-[350px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">

        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3">
          <h2 className="text-[16px] font-extrabold text-[#0F181F] flex items-center gap-2">
            Team Messages <ChevronDown size={16} className="text-gray-500" />
          </h2>
          <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            {contacts.length}
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-4">
          <div className="bg-gray-50 rounded-xl flex items-center px-4 py-2.5 gap-2">
            <Search size={14} className="text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search messages"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-[#0F181F] placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            <div className="py-12 text-center text-[12px] text-gray-400 font-medium">Loading messages...</div>
          ) : loadError ? (
            <div className="py-12 px-4 text-center">
              <p className="text-[12px] text-red-500 font-medium mb-2">{loadError}</p>
              <button
                onClick={() => setReloadCounter(c => c + 1)}
                className="text-[11px] font-bold text-[#022C4F] hover:underline"
              >
                Retry
              </button>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="py-12 text-center text-[12px] text-gray-400 font-medium">
              {messages.length === 0 ? "No messages yet" : "No conversations match your search"}
            </div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContactId(contact.id)}
                className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                  selectedContact?.id === contact.id ? "bg-white shadow-sm border border-gray-100" : "hover:bg-gray-50 border border-transparent"
                }`}
              >
                <div className="relative shrink-0">
                  <div className="w-10 h-10 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[12px] font-bold border border-gray-100">
                    {getInitials(contact.name)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-xs font-bold text-[#0F181F] truncate">{contact.name}</h3>
                    <span className="text-[10px] font-medium text-gray-400 shrink-0">{formatRelativeTime(contact.latest.created_at)}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 leading-snug line-clamp-3 mb-2">
                    {contact.latest.message_text}
                  </p>
                  <div className="flex gap-2 items-center flex-wrap">
                    {contact.latest.is_urgent && (
                      <span className="bg-red-50 text-red-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        Urgent
                      </span>
                    )}
                    <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {contact.latest.sender_role}
                    </span>
                    {contact.latest.project_name && (
                      <span className="bg-green-50 text-green-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                        {contact.latest.project_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">

        {/* Chat Header */}
        {selectedContact && (
          <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[12px] font-bold border border-gray-100">
                  {getInitials(selectedContact.name)}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-[#0F181F]">{selectedContact.name}</h3>
                <span className="text-[10px] font-medium text-gray-500">{selectedContact.latest.sender_role}</span>
              </div>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F8] hover:bg-gray-200 text-[#022C4F] rounded-xl transition-colors">
              <Phone size={14} className="fill-current" />
              <span className="text-xs font-bold">Call</span>
            </button>
          </div>
        )}

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {isLoading ? (
            <div className="h-full flex items-center justify-center text-[12px] text-gray-400 font-medium">Loading conversation...</div>
          ) : !selectedContact ? (
            <div className="h-full flex flex-col items-center justify-center text-center gap-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <Search size={22} />
              </div>
              <p className="text-[13px] font-bold text-gray-600">No conversations yet</p>
              <p className="text-[11px] text-gray-400">Messages from your project stakeholders will appear here.</p>
            </div>
          ) : contactMessages.length === 0 ? (
            <div className="h-full flex items-center justify-center text-[12px] text-gray-400 font-medium">
              No messages recorded with this contact yet.
            </div>
          ) : (
            contactMessages.map((msg) => (
              <div key={msg.id} className="flex gap-3 max-w-[80%]">
                <div className="w-8 h-8 shrink-0 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold border border-gray-100 mt-1">
                  {getInitials(msg.sender_name)}
                </div>
                <div className="bg-[#F4F6F8] px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
                  {msg.is_urgent && (
                    <div className="flex items-center gap-1.5 text-red-600 text-[10px] font-bold mb-2">
                      <AlertTriangle size={12} />
                      <span>Urgent</span>
                    </div>
                  )}
                  <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
                    {msg.message_text}
                  </p>
                  {msg.attachment_url && msg.attachment_name && (
                    <div className="flex items-center gap-2 mt-3 bg-white border border-gray-200 rounded-xl px-3 py-2">
                      <FileText size={14} className="text-[#022C4F] shrink-0" />
                      <span className="text-[10px] font-bold text-[#022C4F] truncate">{msg.attachment_name}</span>
                      {msg.attachment_size && (
                        <span className="text-[9px] text-gray-400 font-medium shrink-0">{msg.attachment_size}</span>
                      )}
                    </div>
                  )}
                  <p className="text-[9px] text-gray-400 font-medium mt-2">
                    {formatFullDate(msg.created_at)}{msg.channel_name ? ` • ${msg.channel_name}` : ""}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#FAFAFA]">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm">
            <button className="text-gray-400 hover:text-[#0F181F] transition-colors shrink-0">
              <Paperclip size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message"
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-[#0F181F] placeholder-gray-400"
            />
            <button className="text-[#022C4F] hover:scale-110 transition-transform shrink-0">
              <Send size={20} className="fill-current" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
