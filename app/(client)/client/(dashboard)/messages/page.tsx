"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, ChevronDown, Phone, Paperclip, Send } from "lucide-react";
import { getMessages, sendMessage, StakeholderMessage } from "@/services/stakeholders";
import { useAuth } from "@/context/AuthContext";

const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

const formatRelativeTime = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatFullTime = (value?: string): string => {
  if (!value) return "";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

interface Channel {
  name: string;
  messages: StakeholderMessage[];
}

export default function MessagesPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMessages()
      .then((data) => {
        if (!cancelled) {
          const list = Array.isArray(data) ? data : [];
          setMessages(list);
          // Default to the channel with the most recent activity.
          const latest = [...list].sort(
            (a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          )[0];
          if (latest) setSelectedChannel(latest.channel_name);
        }
      })
      .catch(() => {
        if (!cancelled) setMessages([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Group messages into conversations by channel.
  const channels: Channel[] = useMemo(() => {
    const grouped = new Map<string, StakeholderMessage[]>();
    messages.forEach((message) => {
      const key = message.channel_name || "General";
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(message);
    });
    return Array.from(grouped.entries())
      .map(([name, msgs]) => ({
        name,
        messages: [...msgs].sort(
          (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        ),
      }))
      .sort(
        (a, b) =>
          new Date(b.messages[b.messages.length - 1]?.created_at || 0).getTime() -
          new Date(a.messages[a.messages.length - 1]?.created_at || 0).getTime()
      );
  }, [messages]);

  const filteredChannels = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return channels;
    return channels.filter(
      (channel) =>
        channel.name.toLowerCase().includes(query) ||
        channel.messages.some(
          (m) =>
            m.sender_name?.toLowerCase().includes(query) ||
            m.project_name?.toLowerCase().includes(query) ||
            m.message_text?.toLowerCase().includes(query)
        )
    );
  }, [channels, searchQuery]);

  const activeChannel = channels.find((c) => c.name === selectedChannel) || null;

  const currentUserLabel = user
    ? `${user.first_name} ${user.last_name}`.trim() || user.email
    : "";
  const isOwnMessage = (message: StakeholderMessage) =>
    Boolean(currentUserLabel) &&
    message.sender_name?.trim().toLowerCase() === currentUserLabel.trim().toLowerCase();

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || !activeChannel || isSending) return;
    const channelProject = activeChannel.messages[0]?.project_name || "";
    setIsSending(true);
    try {
      const sent = await sendMessage({
        sender_name: currentUserLabel || "Client",
        sender_role: "Client",
        channel_name: activeChannel.name,
        project_name: channelProject,
        message_text: text,
      });
      setMessages((prev) => [...prev, sent]);
      setDraft("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-full w-full bg-white rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">

      {/* LEFT COLUMN: CONTACTS SIDEBAR */}
      <div className="w-full lg:w-[350px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">

        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3">
          <h2 className="text-[16px] font-extrabold text-[#0F181F] flex items-center gap-2">
            Team Messages <ChevronDown size={16} className="text-gray-500" />
          </h2>
          {!isLoading && (
            <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
              {messages.length}
            </div>
          )}
        </div>

        {/* Search */}
        <div className="px-6 mb-4">
          <div className="bg-gray-50 rounded-xl flex items-center px-4 py-2.5">
            <Search size={14} className="text-gray-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search messages"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none w-full text-xs text-[#0F181F] placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {isLoading ? (
            <div className="py-12 text-center text-[11px] font-semibold text-gray-400 animate-pulse">
              Loading messages…
            </div>
          ) : filteredChannels.length === 0 ? (
            <div className="py-12 text-center text-[11px] font-medium text-gray-500">
              {messages.length === 0 ? "No messages yet" : "No conversations match your search"}
            </div>
          ) : (
            filteredChannels.map((channel) => {
              const lastMessage = channel.messages[channel.messages.length - 1];
              return (
                <div
                  key={channel.name}
                  onClick={() => setSelectedChannel(channel.name)}
                  className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                    selectedChannel === channel.name ? "bg-white shadow-sm border border-gray-100" : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full border border-gray-100 bg-[#022C4F]/10 flex items-center justify-center shrink-0">
                    <span className="text-[11px] font-extrabold text-[#022C4F]">{getInitials(channel.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h3 className="text-xs font-bold text-[#0F181F] truncate">{channel.name}</h3>
                      <span className="text-[10px] font-medium text-gray-400 shrink-0">
                        {formatRelativeTime(lastMessage?.created_at)}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500 leading-snug line-clamp-3 mb-2">
                      {lastMessage?.sender_name ? `${lastMessage.sender_name}: ` : ""}
                      {lastMessage?.message_text}
                    </p>
                    <div className="flex gap-2 items-center flex-wrap">
                      {lastMessage?.sender_role && (
                        <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {lastMessage.sender_role}
                        </span>
                      )}
                      {lastMessage?.project_name && (
                        <span className="bg-green-50 text-green-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {lastMessage.project_name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center text-[11px] font-semibold text-gray-400 animate-pulse">
            Loading conversation…
          </div>
        ) : !activeChannel ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-bold text-[#0F181F]">No conversation selected</p>
            <p className="text-[11px] text-gray-500 font-medium">
              {messages.length === 0
                ? "Messages from your project teams will appear here."
                : "Select a conversation from the list to view it."}
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full border border-gray-100 bg-[#022C4F]/10 flex items-center justify-center shrink-0">
                  <span className="text-[11px] font-extrabold text-[#022C4F]">{getInitials(activeChannel.name)}</span>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F181F]">{activeChannel.name}</h3>
                  {activeChannel.messages[0]?.project_name && (
                    <p className="text-[10px] font-medium text-gray-500 mt-0.5">
                      {activeChannel.messages[0].project_name}
                    </p>
                  )}
                </div>
              </div>

              <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F8] hover:bg-gray-200 text-[#022C4F] rounded-xl transition-colors">
                <Phone size={14} className="fill-current" />
                <span className="text-xs font-bold">Call</span>
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {activeChannel.messages.map((message) => {
                const own = isOwnMessage(message);
                return (
                  <div key={message.id} className={`flex gap-3 max-w-[80%] ${own ? "ml-auto justify-end" : ""}`}>
                    {!own && (
                      <div className="w-8 h-8 rounded-full border border-gray-100 bg-[#022C4F]/10 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-[9px] font-extrabold text-[#022C4F]">
                          {getInitials(message.sender_name || "?")}
                        </span>
                      </div>
                    )}
                    <div>
                      <div
                        className={`px-5 py-3.5 rounded-2xl shadow-sm ${
                          own
                            ? "bg-[#022C4F] rounded-tr-sm"
                            : "bg-[#F4F6F8] border border-gray-100 rounded-tl-sm"
                        }`}
                      >
                        {!own && (
                          <p className="text-[9px] font-bold text-gray-500 mb-1">
                            {message.sender_name}
                            {message.sender_role ? ` · ${message.sender_role}` : ""}
                          </p>
                        )}
                        <p
                          className={`text-[12px] font-medium leading-relaxed ${
                            own ? "text-white" : "text-[#0F181F]"
                          }`}
                        >
                          {message.message_text}
                        </p>
                        {message.is_urgent && (
                          <span className="inline-block mt-2 bg-red-100 text-red-700 text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Urgent
                          </span>
                        )}
                      </div>
                      <p className={`text-[9px] text-gray-400 font-medium mt-1 ${own ? "text-right" : ""}`}>
                        {formatFullTime(message.created_at)}
                      </p>
                    </div>
                    {own && (
                      <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 shrink-0 mt-1">
                        {getInitials(currentUserLabel)}
                      </div>
                    )}
                  </div>
                );
              })}
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
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                  className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-[#0F181F] placeholder-gray-400"
                />
                <button
                  onClick={handleSend}
                  disabled={!draft.trim() || isSending}
                  className="text-[#022C4F] hover:scale-110 transition-transform shrink-0 disabled:opacity-40 disabled:hover:scale-100"
                >
                  <Send size={20} className="fill-current" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
