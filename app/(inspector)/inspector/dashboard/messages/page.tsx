"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Send,
  AlertTriangle,
  Hash,
  ShieldCheck,
  Clock,
  RefreshCw,
  UserCheck,
  Languages,
  ChevronDown,
  Check,
  Globe,
  Loader2,
  Lock,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  Trash2,
  FileText,
  Image as ImageIcon,
  Download,
  X,
  Volume2,
  Eye,
  CheckCircle2,
  Radio,
  Building2,
  Sparkles,
} from "lucide-react";
import {
  StakeholderMessage,
  getMessages,
  sendMessage,
  translateMessage,
  MessageTranslation,
} from "@/services/stakeholders";
import { useAuth } from "@/context/AuthContext";

// Voice Note Player Component
function VoiceNotePlayer({ url, duration = 0 }: { url: string; duration?: number }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(duration);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setTotalDuration(Math.round(audio.duration));
      }
    };
    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleSpeed = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextRate = playbackRate === 1 ? 1.5 : playbackRate === 1.5 ? 2 : 1;
    audio.playbackRate = nextRate;
    setPlaybackRate(nextRate);
  };

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md max-w-sm w-full">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-blue-600/30 cursor-pointer"
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 font-bold text-blue-400">
            <Volume2 size={11} className={isPlaying ? "animate-pulse text-blue-400" : ""} />
            <span>Voice Dispatch</span>
          </span>
          <span>
            {formatTime(currentTime)} / {formatTime(totalDuration || duration || 0)}
          </span>
        </div>

        <div className="relative flex items-center">
          <input
            type="range"
            min={0}
            max={totalDuration || duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>

      {/* Playback Speed Toggle */}
      <button
        type="button"
        onClick={toggleSpeed}
        className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-300 transition-colors shrink-0 cursor-pointer"
        title="Toggle audio speed"
      >
        {playbackRate}x
      </button>
    </div>
  );
}

export default function InspectorMessagesPage() {
  const { user } = useAuth();

  // Authentic Inspector sender identity
  const senderName = user
    ? `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || user.email
    : "Field Inspector";
  const senderRole = user?.role_name || "Accredited Field Inspector";

  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState("General Council");
  const [inputMessage, setInputMessage] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // File Attachment State
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [attachedFile, setAttachedFile] = useState<{
    file: File;
    name: string;
    size: string;
    type: string;
    dataUrl: string;
  } | null>(null);

  // Voice Note Recording State
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Translations map: { [messageId]: MessageTranslation }
  const [translatedMap, setTranslatedMap] = useState<Record<string, MessageTranslation>>({});
  const [openTranslateMenuId, setOpenTranslateMenuId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Government Agency Channels
  const channels = [
    {
      name: "General Council",
      title: "Agency Directives & General Council",
      icon: Hash,
      multilingual: false,
      badge: "Statutory Directives",
      description: "Direct communication with Ministry & State Command Center",
    },
    {
      name: "Project Coordination",
      title: "Project Coordination",
      icon: Hash,
      multilingual: true,
      badge: "Yorùbá & Igbo Enabled",
      description: "Field coordination with automated language translation",
    },
    {
      name: "Site Safety & Inspections",
      title: "Site Safety & Enforcement",
      icon: AlertTriangle,
      multilingual: false,
      badge: "HSE Alerts",
      description: "Urgent safety advisories, Stop-Work orders & field violations",
    },
    {
      name: "Direct Executive Messages",
      title: "Executive Command Stream",
      icon: UserCheck,
      multilingual: true,
      badge: "Direct Line",
      description: "Direct priority stream with State Agency leadership",
    },
  ];

  const currentChannelMeta = channels.find((c) => c.name === activeChannel) || channels[0];

  const languages = [
    { code: "yo" as const, label: "Yorùbá (yo)", flag: "🇳🇬" },
    { code: "ig" as const, label: "Igbo (ig)", flag: "🇳🇬" },
    { code: "en" as const, label: "English (en)", flag: "🌐" },
  ];

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getMessages({ channel: activeChannel });

      // Merge with localStorage cache
      let localCache: StakeholderMessage[] = [];
      try {
        const raw =
          typeof window !== "undefined"
            ? localStorage.getItem(`nexucon_channel_msgs_${activeChannel}`)
            : null;
        if (raw) localCache = JSON.parse(raw);
      } catch (e) {}

      const msgMap = new Map<string, StakeholderMessage>();
      data.forEach((m) => msgMap.set(m.id, m));
      localCache.forEach((m) => {
        if (!msgMap.has(m.id)) {
          msgMap.set(m.id, m);
        }
      });

      const merged = Array.from(msgMap.values()).sort(
        (a, b) => new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
      );

      setMessages(merged);
    } catch (err: any) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // 10s live poll
    return () => clearInterval(interval);
  }, [fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Voice Note Recording
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        window.dispatchEvent(
          new CustomEvent("show-toast", {
            detail: { message: "Audio recording is not supported in this browser", type: "error" },
          })
        );
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecordingVoice(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Microphone permission denied", type: "error" },
        })
      );
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
        mediaRecorderRef.current.stop();
      } catch (e) {}
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
    audioChunksRef.current = [];
  };

  const stopAndSendVoiceNote = async () => {
    if (!mediaRecorderRef.current) return;

    const duration = recordingSeconds;
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
    }

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onload = async () => {
        const audioDataUrl = reader.result as string;
        setIsSending(true);

        const optimisticMsg: StakeholderMessage = {
          id: `msg-vn-${Date.now()}`,
          channel_name: activeChannel,
          message_text: inputMessage.trim(),
          voice_note_url: audioDataUrl,
          voice_note_duration: duration,
          is_urgent: isUrgent,
          sender_name: senderName,
          sender_role: senderRole,
          project_name: "",
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInputMessage("");
        setIsUrgent(false);

        try {
          const created = await sendMessage({
            channel_name: activeChannel,
            message_text: optimisticMsg.message_text,
            voice_note_url: audioDataUrl,
            voice_note_duration: duration,
            is_urgent: optimisticMsg.is_urgent,
            sender_name: senderName,
            sender_role: senderRole,
            project_name: "",
          });

          if (created && created.id) {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === optimisticMsg.id
                  ? {
                      ...created,
                      voice_note_url: created.voice_note_url || audioDataUrl,
                      voice_note_duration: created.voice_note_duration || duration,
                    }
                  : m
              )
            );
          }
        } catch (err) {
          console.error("Failed to send voice note dispatch", err);
        } finally {
          setIsSending(false);
          setIsRecordingVoice(false);
          setRecordingSeconds(0);
          audioChunksRef.current = [];
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stop();
  };

  // File Attachment
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        : `${Math.round(file.size / 1024)} KB`;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachedFile({
        file,
        name: file.name,
        size: sizeFormatted,
        type: file.type.startsWith("image/") ? "IMAGE" : "DOCUMENT",
        dataUrl: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  // Send Text / Attachment Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() && !attachedFile) return;

    setIsSending(true);
    const optimisticMsg: StakeholderMessage = {
      id: `msg-opt-${Date.now()}`,
      channel_name: activeChannel,
      message_text: inputMessage.trim(),
      attachment_url: attachedFile?.dataUrl,
      attachment_name: attachedFile?.name,
      attachment_type: attachedFile?.type,
      attachment_size: attachedFile?.size,
      is_urgent: isUrgent,
      sender_name: senderName,
      sender_role: senderRole,
      project_name: "",
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage("");
    setAttachedFile(null);
    setIsUrgent(false);

    try {
      const created = await sendMessage({
        channel_name: activeChannel,
        message_text: optimisticMsg.message_text,
        attachment_url: optimisticMsg.attachment_url,
        attachment_name: optimisticMsg.attachment_name,
        attachment_type: optimisticMsg.attachment_type,
        attachment_size: optimisticMsg.attachment_size,
        is_urgent: optimisticMsg.is_urgent,
        sender_name: senderName,
        sender_role: senderRole,
        project_name: "",
      });

      if (created && created.id) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? created : m)));
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsSending(false);
    }
  };

  // Translation handler
  const handleTranslate = async (messageId: string, targetLang: "yo" | "ig" | "en", text: string) => {
    setTranslatingId(messageId);
    setOpenTranslateMenuId(null);
    try {
      const res = await translateMessage(messageId, targetLang, text);
      if (res && res.translated_content) {
        setTranslatedMap((prev) => ({
          ...prev,
          [messageId]: res,
        }));
      }
    } catch (err) {
      console.error("Translation failed", err);
    } finally {
      setTranslatingId(null);
    }
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-200 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-2xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <MessageSquare size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#022C4F] tracking-tight">
                  Agency Messaging & Dispatch
                </h1>
                <span className="text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Connected to Government
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">
                Direct statutory communication channel with State Headquarters & LASBCA Command Center
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={fetchMessages}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh messages"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
            <span>Sync Dispatch</span>
          </button>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[680px]">
        {/* Left Channel Sidebar */}
        <div className="lg:col-span-1 border-r border-slate-200/90 bg-slate-50/70 p-4 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 px-1">
                Statutory Agency Channels
              </span>
              <div className="space-y-1.5">
                {channels.map((chan) => {
                  const Icon = chan.icon;
                  const isActive = activeChannel === chan.name;
                  return (
                    <button
                      key={chan.name}
                      type="button"
                      onClick={() => setActiveChannel(chan.name)}
                      className={`w-full text-left p-3 rounded-2xl transition-all cursor-pointer flex flex-col gap-1 border ${
                        isActive
                          ? "bg-[#022C4F] text-white border-[#022C4F] shadow-md shadow-[#022C4F]/20"
                          : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200/80"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-bold text-xs">
                          <Icon size={14} className={isActive ? "text-cyan-300" : "text-slate-500"} />
                          <span>{chan.name}</span>
                        </div>
                      </div>
                      <p className={`text-[10px] line-clamp-1 ${isActive ? "text-slate-200" : "text-slate-500"}`}>
                        {chan.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Field Officer Badge Box */}
            <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-200 space-y-1.5 text-xs">
              <span className="text-[10px] font-bold text-cyan-900 uppercase tracking-wider block">
                Connected Inspector
              </span>
              <p className="font-bold text-[#022C4F] truncate">{senderName}</p>
              <p className="text-[11px] text-slate-600 truncate">{senderRole}</p>
              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-cyan-800 font-semibold">
                <ShieldCheck size={13} className="text-cyan-600" />
                <span>Encrypted LASBCA Gov Channel</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 p-2 border-t border-slate-200/60 text-center">
            Multi-Language Yoruba & Igbo Supported
          </div>
        </div>

        {/* Right Chat Stream & Input Area */}
        <div className="lg:col-span-3 flex flex-col justify-between bg-white h-full min-h-[600px]">
          {/* Active Channel Header */}
          <div className="p-4 border-b border-slate-200 bg-slate-50/40 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-[#022C4F]">
                  #{currentChannelMeta.title}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-200">
                  {currentChannelMeta.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                {currentChannelMeta.description}
              </p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 max-h-[460px]">
            {isLoading && messages.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <RefreshCw size={20} className="animate-spin mx-auto mb-2 text-slate-400" />
                <p className="text-xs">Connecting to government channel...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="p-12 text-center text-slate-400 space-y-2">
                <MessageSquare size={32} className="mx-auto text-slate-300" />
                <h4 className="text-xs font-bold text-slate-600">No Messages Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  This channel is ready for communication with the Government Command Center and Ministry officials.
                </p>
              </div>
            ) : (
              messages.map((msg) => {
                const isFromMe =
                  msg.sender_name?.toLowerCase() === senderName.toLowerCase() ||
                  msg.sender_role?.toLowerCase().includes("inspector");
                const translation = translatedMap[msg.id];
                const isTranslatingThis = translatingId === msg.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isFromMe ? "items-end" : "items-start"} space-y-1`}
                  >
                    {/* Sender & Role Tag */}
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 px-1">
                      <span className={`font-bold ${isFromMe ? "text-cyan-800" : "text-[#022C4F]"}`}>
                        {msg.sender_name || (isFromMe ? "You" : "Government Official")}
                      </span>
                      {msg.sender_role && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                          {msg.sender_role}
                        </span>
                      )}
                      <span>
                        {msg.created_at
                          ? new Date(msg.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>

                    {/* Message Bubble Card */}
                    <div
                      className={`p-3.5 rounded-2xl max-w-lg shadow-sm border space-y-2 text-xs leading-relaxed ${
                        msg.is_urgent
                          ? "bg-rose-50 border-rose-300 text-rose-950 ring-1 ring-rose-400"
                          : isFromMe
                          ? "bg-gradient-to-r from-[#022C4F] to-[#033B69] text-white border-[#022C4F]"
                          : "bg-slate-50 border-slate-200 text-slate-800"
                      }`}
                    >
                      {/* Urgent Banner */}
                      {msg.is_urgent && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 pb-1 border-b border-rose-200">
                          <AlertTriangle size={12} className="animate-bounce" />
                          <span>URGENT STATUTORY DISPATCH</span>
                        </div>
                      )}

                      {/* Text Content */}
                      {msg.message_text && (
                        <p className="whitespace-pre-wrap">{msg.message_text}</p>
                      )}

                      {/* Voice Note Player */}
                      {msg.voice_note_url && (
                        <VoiceNotePlayer
                          url={msg.voice_note_url}
                          duration={msg.voice_note_duration || 0}
                        />
                      )}

                      {/* File Attachment Card */}
                      {msg.attachment_url && (
                        <div
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 text-[11px] ${
                            isFromMe
                              ? "bg-white/10 border-white/20 text-white"
                              : "bg-white border-slate-200 text-slate-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            {msg.attachment_type === "IMAGE" ? (
                              <ImageIcon size={15} className="text-cyan-400 shrink-0" />
                            ) : (
                              <FileText size={15} className="text-amber-400 shrink-0" />
                            )}
                            <div className="truncate">
                              <span className="font-bold block truncate">
                                {msg.attachment_name || "Attached Field Document"}
                              </span>
                              {msg.attachment_size && (
                                <span className="text-[10px] opacity-75">{msg.attachment_size}</span>
                              )}
                            </div>
                          </div>

                          <a
                            href={msg.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                              isFromMe
                                ? "bg-white/20 hover:bg-white/30 text-white"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                            }`}
                            title="Download attachment"
                          >
                            <Download size={13} />
                          </a>
                        </div>
                      )}

                      {/* Translation Box if Translated */}
                      {translation && (
                        <div className="mt-2 pt-2 border-t border-indigo-200/50 bg-indigo-50/90 text-indigo-950 p-2.5 rounded-xl space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-bold text-indigo-800">
                            <span className="flex items-center gap-1">
                              <Globe size={11} />
                              <span>{translation.language_name} Channel</span>
                            </span>
                            <span className="text-[9px] text-indigo-600">Translated</span>
                          </div>
                          <p className="text-xs italic leading-relaxed">{translation.translated_content}</p>
                        </div>
                      )}

                      {/* Message Footer Action: Translate Button */}
                      {msg.message_text && (
                        <div className="pt-1 flex items-center justify-between text-[10px]">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenTranslateMenuId(
                                  openTranslateMenuId === msg.id ? null : msg.id
                                )
                              }
                              disabled={isTranslatingThis}
                              className={`flex items-center gap-1 font-bold transition-opacity hover:opacity-100 cursor-pointer ${
                                isFromMe ? "text-cyan-200/90" : "text-indigo-700"
                              }`}
                            >
                              <Languages size={11} />
                              <span>
                                {isTranslatingThis ? "Translating..." : "Translate Channel"}
                              </span>
                              <ChevronDown size={10} />
                            </button>

                            {/* Dropdown Menu */}
                            {openTranslateMenuId === msg.id && (
                              <div className="absolute left-0 bottom-6 z-20 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 p-1.5 min-w-[130px] space-y-1">
                                {languages.map((l) => (
                                  <button
                                    key={l.code}
                                    type="button"
                                    onClick={() =>
                                      handleTranslate(msg.id, l.code, msg.message_text)
                                    }
                                    className="w-full text-left px-2 py-1 rounded-lg hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer text-slate-700"
                                  >
                                    <span>{l.flag}</span>
                                    <span>{l.label}</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Composer Box */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-slate-50/70 space-y-3">
            {/* Attachment Preview Banner */}
            {attachedFile && (
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2 truncate">
                  <Paperclip size={14} className="text-cyan-600 shrink-0" />
                  <span className="font-bold text-slate-800 truncate">{attachedFile.name}</span>
                  <span className="text-[10px] text-slate-500 font-mono">({attachedFile.size})</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAttachedFile(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Live Audio Recording Bar */}
            {isRecordingVoice ? (
              <div className="p-3 bg-gradient-to-r from-slate-900 to-[#022C4F] rounded-2xl text-white flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-bold text-slate-200">Recording Voice Note...</span>
                  <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/80">
                    {Math.floor(recordingSeconds / 60)}:
                    {(recordingSeconds % 60).toString().padStart(2, "0")}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={stopAndSendVoiceNote}
                    disabled={isSending}
                    className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Square size={13} className="fill-white" />
                    <span>Send Audio</span>
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder={`Message ${currentChannelMeta.title}...`}
                    className="flex-1 p-3 rounded-2xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />

                  {/* Audio Recording Button */}
                  <button
                    type="button"
                    onClick={startVoiceRecording}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-cyan-700 transition-colors shadow-sm cursor-pointer"
                    title="Record and send voice note"
                  >
                    <Mic size={16} />
                  </button>

                  {/* Attachment Picker */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 transition-colors shadow-sm cursor-pointer"
                    title="Attach site photo or document"
                  >
                    <Paperclip size={16} />
                  </button>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={(!inputMessage.trim() && !attachedFile) || isSending}
                    className="px-4 sm:px-5 py-3 rounded-2xl bg-[#022C4F] hover:bg-[#033B69] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-[#022C4F]/20 transition-all cursor-pointer"
                  >
                    {isSending ? (
                      <RefreshCw size={15} className="animate-spin" />
                    ) : (
                      <Send size={15} />
                    )}
                    <span className="hidden sm:inline">Send</span>
                  </button>
                </div>

                {/* Urgent Checkbox Toggle */}
                <div className="flex items-center justify-between text-xs px-1 text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isUrgent}
                      onChange={(e) => setIsUrgent(e.target.checked)}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span className={isUrgent ? "font-bold text-rose-700" : "text-slate-600"}>
                      Mark as Urgent Dispatch (Priority Escalation to Command Center)
                    </span>
                  </label>

                  <span className="text-[10px] text-slate-400">
                    Press Enter to send
                  </span>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
