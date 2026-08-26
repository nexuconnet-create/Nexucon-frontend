"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MessageSquare, Send, AlertTriangle, 
  Hash, ShieldCheck, Clock, RefreshCw, UserCheck, Languages, 
  ChevronDown, Check, Globe, Loader2, Lock, Paperclip, 
  Mic, MicOff, Square, Play, Pause, Trash2, FileText, 
  Image as ImageIcon, Download, X, Volume2, FileArchive,
  Eye, CheckCircle2, CornerDownRight
} from "lucide-react";
import { 
  StakeholderMessage, getMessages, sendMessage, 
  translateMessage, MessageTranslation 
} from "@/services/stakeholders";

// Custom Voice Note Player Component
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
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0;

  return (
    <div className="flex items-center gap-3 p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md max-w-sm w-full">
      <audio ref={audioRef} src={url} preload="metadata" />

      {/* Play/Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-blue-600/30 cursor-pointer"
        title={isPlaying ? "Pause voice note" : "Play voice note"}
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
      </button>

      {/* Waveform & Scrubber */}
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
          <span className="flex items-center gap-1 font-bold text-blue-400">
            <Volume2 size={11} className={isPlaying ? "animate-pulse text-blue-400" : ""} />
            <span>Voice Dispatch</span>
          </span>
          <span>{formatTime(currentTime)} / {formatTime(totalDuration || duration || 0)}</span>
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

export default function StakeholderMessages() {
  const [messages, setMessages] = useState<StakeholderMessage[]>([]);
  const [activeChannel, setActiveChannel] = useState('General Council');
  const [inputMessage, setInputMessage] = useState('');
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

  // Lightbox Image Preview Modal State
  const [lightboxImage, setLightboxImage] = useState<{ url: string; name: string } | null>(null);

  // Translations map: { [messageId]: MessageTranslation }
  const [translatedMap, setTranslatedMap] = useState<Record<string, MessageTranslation>>({});
  const [openTranslateMenuId, setOpenTranslateMenuId] = useState<string | null>(null);
  const [translatingId, setTranslatingId] = useState<string | null>(null);

  const channels = [
    { 
      name: "General Council", 
      icon: Hash,
      multilingual: false,
      languageBadge: "English Standard",
      description: "Official Statutory Record" 
    },
    { 
      name: "Project Coordination", 
      icon: Hash,
      multilingual: true,
      languageBadge: "3 Nigerian Languages",
      description: "Yorùbá, Igbo & Hausa Supported" 
    },
    { 
      name: "Site Safety & Inspections", 
      icon: AlertTriangle,
      multilingual: false,
      languageBadge: "English HSE",
      description: "Mandatory Safety Directives" 
    },
    { 
      name: "Direct Executive Messages", 
      icon: UserCheck,
      multilingual: true,
      languageBadge: "3 Nigerian Languages",
      description: "Executive Multi-Language Stream" 
    }
  ];

  const currentChannelMeta = channels.find(c => c.name === activeChannel) || channels[0];
  const isMultilingual = currentChannelMeta.multilingual;

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
    } catch (err: any) {
      console.error("Failed to load messages", err);
    } finally {
      setIsLoading(false);
    }
  }, [activeChannel]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // File Upload Helper
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read as Base64 Data URL for persistent preview & storage
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setAttachedFile({
        file,
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type || 'application/octet-stream',
        dataUrl
      });
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Attached: ${file.name} (${formatFileSize(file.size)})`, type: 'info' }
      }));
    };
    reader.readAsDataURL(file);

    // Reset input
    e.target.value = '';
  };

  // Voice Note Recording Controls
  const startVoiceRecording = async () => {
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { message: 'Audio recording is not supported in this browser', type: 'error' }
        }));
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
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Microphone permission denied', type: 'error' }
      }));
    }
  };

  const cancelVoiceRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      mediaRecorderRef.current.stop();
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
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onload = async () => {
        const audioDataUrl = reader.result as string;
        setIsSending(true);

        const optimisticMsg: StakeholderMessage = {
          id: `temp-${Date.now()}`,
          channel_name: activeChannel,
          message_text: inputMessage.trim(),
          voice_note_url: audioDataUrl,
          voice_note_duration: duration,
          is_urgent: isUrgent,
          sender_name: 'Engr. Babatunde Sanwo',
          sender_role: 'Agency Head / Director General',
          project_name: 'Central Metro Transit Hub',
          created_at: new Date().toISOString()
        };

        setMessages((prev) => [...prev, optimisticMsg]);
        setInputMessage('');
        setIsUrgent(false);

        try {
          const created = await sendMessage({
            channel_name: activeChannel,
            message_text: optimisticMsg.message_text,
            voice_note_url: audioDataUrl,
            voice_note_duration: duration,
            is_urgent: optimisticMsg.is_urgent,
            sender_name: 'Engr. Babatunde Sanwo',
            sender_role: 'Agency Head / Director General',
            project_name: 'Central Metro Transit Hub'
          });

          if (created && created.id) {
            setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? created : m)));
          }

          window.dispatchEvent(new CustomEvent('show-toast', {
            detail: { message: '🎤 Voice note dispatch transmitted', type: 'success' }
          }));
        } catch (err) {
          console.error("Failed to send voice note", err);
        } finally {
          setIsSending(false);
        }
      };
      reader.readAsDataURL(audioBlob);
    };

    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    mediaRecorderRef.current.stop();
    setIsRecordingVoice(false);
    setRecordingSeconds(0);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = inputMessage.trim();
    if (!textToSend && !attachedFile) return;

    setIsSending(true);

    // Optimistic message placeholder
    const optimisticMsg: StakeholderMessage = {
      id: `temp-${Date.now()}`,
      channel_name: activeChannel,
      message_text: textToSend,
      attachment_url: attachedFile?.dataUrl,
      attachment_name: attachedFile?.name,
      attachment_type: attachedFile?.type,
      attachment_size: attachedFile?.size,
      is_urgent: isUrgent,
      sender_name: 'Engr. Babatunde Sanwo',
      sender_role: 'Agency Head / Director General',
      project_name: 'Central Metro Transit Hub',
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');
    const prevAttached = attachedFile;
    const prevUrgent = isUrgent;
    setAttachedFile(null);
    setIsUrgent(false);

    try {
      const created = await sendMessage({
        channel_name: activeChannel,
        message_text: textToSend,
        attachment_url: prevAttached?.dataUrl,
        attachment_name: prevAttached?.name,
        attachment_type: prevAttached?.type,
        attachment_size: prevAttached?.size,
        is_urgent: prevUrgent,
        sender_name: 'Engr. Babatunde Sanwo',
        sender_role: 'Agency Head / Director General',
        project_name: 'Central Metro Transit Hub'
      });

      if (created && created.id) {
        setMessages((prev) => prev.map((m) => (m.id === optimisticMsg.id ? created : m)));
      }

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Message broadcasted to #${activeChannel}`, type: 'success' }
      }));
      fetchMessages();
    } catch (err: any) {
      console.error("Failed to send message", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Failed to broadcast message';
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Send notice: ${errMsg}`, type: 'error' } 
      }));
    } finally {
      setIsSending(false);
    }
  };

  const handleTranslate = async (messageId: string, langCode: 'yo' | 'ig' | 'ha' | 'en', originalText?: string) => {
    setOpenTranslateMenuId(null);
    if (langCode === 'en') {
      // Revert to original text
      setTranslatedMap((prev) => {
        const next = { ...prev };
        delete next[messageId];
        return next;
      });
      return;
    }

    setTranslatingId(messageId);
    try {
      const result = await translateMessage(messageId, langCode, originalText);
      if (result && result.translated_content) {
        setTranslatedMap((prev) => ({
          ...prev,
          [messageId]: result
        }));
        window.dispatchEvent(new CustomEvent('show-toast', {
          detail: { 
            message: `Translated to ${result.language_name} (${result.provider})`, 
            type: 'success' 
          }
        }));
      }
    } catch (err: any) {
      console.error("Translation error:", err);
      const errMsg = err?.response?.data?.error || err?.response?.data?.detail || err?.message || 'Translation service unavailable';
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: `Translation: ${errMsg}`, type: 'error' }
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
            Stakeholder Messaging &amp; Voice Channels
          </h1>
          <p className="text-gray-500 mt-1 text-xs sm:text-sm">
            Statutory inter-agency communications with voice notes, file attachments, and real-time Google Cloud Translation for Nigerian languages.
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-6xl h-[720px]">
        {/* Left: Channels Sidebar */}
        <div className="lg:col-span-1 bg-white rounded-3xl border border-gray-100 shadow-sm p-4 flex flex-col justify-between">
          <div>
            <span className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-3 px-2">
              Communication Channels
            </span>
            <div className="space-y-1.5">
              {channels.map((ch) => {
                const IconComponent = ch.icon;
                const isActive = activeChannel === ch.name;

                return (
                  <button
                    key={ch.name}
                    onClick={() => {
                      setActiveChannel(ch.name);
                      setTranslatedMap({});
                    }}
                    className={`w-full flex flex-col p-3 rounded-2xl text-left transition-all cursor-pointer ${
                      isActive 
                        ? 'bg-[#022C4F] text-white shadow-md shadow-[#022C4F]/20' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs flex items-center gap-2">
                        <IconComponent size={14} className={isActive ? "text-blue-300" : "text-gray-400"} />
                        {ch.name}
                      </span>
                    </div>
                    <span className={`text-[10px] mt-1 ${isActive ? "text-blue-200" : "text-gray-400"}`}>
                      {ch.description}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded w-fit ${
                      isActive 
                        ? "bg-blue-400/20 text-blue-200" 
                        : ch.multilingual 
                          ? "bg-purple-50 text-purple-700 border border-purple-200" 
                          : "bg-slate-100 text-slate-600"
                    }`}>
                      {ch.languageBadge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 mt-4 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <ShieldCheck size={14} className="text-emerald-600" />
              <p className="font-black text-[#022C4F]">Statutory Protocol</p>
            </div>
            <ul className="text-[11px] text-slate-600 space-y-1 leading-tight">
              <li>• <strong>Voice Notes:</strong> WebRTC Media Stream</li>
              <li>• <strong>Attachments:</strong> CAD, BIM, PDF &amp; Images</li>
              <li>• <strong>Languages:</strong> Yorùbá • Igbo • Hausa</li>
            </ul>
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
              {isMultilingual ? (
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5">
                  <Languages size={12} /> Yorùbá • Igbo • Hausa • English
                </span>
              ) : (
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 flex items-center gap-1">
                  <Lock size={10} /> Strictly English Statutory Standard
                </span>
              )}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/40">
            {messages.map((msg, idx) => {
              const activeTranslation = translatedMap[msg.id];
              const isMenuOpen = openTranslateMenuId === msg.id;
              const isTranslating = translatingId === msg.id;
              const isImage = msg.attachment_type?.startsWith('image/') || (msg.attachment_url && msg.attachment_url.startsWith('data:image/'));

              return (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.02 }}
                  key={msg.id || idx}
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

                      {/* Multilingual Channel Translation Button */}
                      {isMultilingual && msg.message_text && (
                        <div className="relative">
                          <button
                            type="button"
                            disabled={isTranslating}
                            onClick={() => setOpenTranslateMenuId(isMenuOpen ? null : msg.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            {isTranslating ? (
                              <Loader2 size={11} className="animate-spin text-blue-600" />
                            ) : (
                              <Languages size={11} className="text-blue-600" />
                            )}
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
                                  Nigerian Languages
                                </div>
                                {languages.map((lang) => {
                                  const isCurrent = activeTranslation 
                                    ? activeTranslation.target_language === lang.code 
                                    : lang.code === 'en';
                                  return (
                                    <button
                                      key={lang.code}
                                      onClick={() => handleTranslate(msg.id, lang.code, msg.message_text)}
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
                      )}
                    </div>
                  </div>

                  {/* Text Content */}
                  {msg.message_text && (
                    <p className="text-xs text-gray-800 leading-relaxed font-medium mb-2">
                      {activeTranslation ? activeTranslation.translated_content : msg.message_text}
                    </p>
                  )}

                  {/* Voice Note Audio Player */}
                  {msg.voice_note_url && (
                    <div className="my-1.5">
                      <VoiceNotePlayer url={msg.voice_note_url} duration={msg.voice_note_duration} />
                    </div>
                  )}

                  {/* File Attachment Card */}
                  {msg.attachment_url && (
                    <div className="mt-2">
                      {isImage ? (
                        <div className="relative group max-w-sm rounded-2xl overflow-hidden border border-slate-200 bg-slate-950/5 shadow-md">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={msg.attachment_url}
                            alt={msg.attachment_name || "Attachment"}
                            className="w-full max-h-64 object-cover cursor-pointer transition-transform group-hover:scale-105"
                            onClick={() => setLightboxImage({ url: msg.attachment_url!, name: msg.attachment_name || 'Attachment' })}
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            <button
                              onClick={() => setLightboxImage({ url: msg.attachment_url!, name: msg.attachment_name || 'Attachment' })}
                              className="p-2 rounded-xl bg-white/90 text-slate-900 font-bold text-xs flex items-center gap-1 shadow cursor-pointer hover:bg-white"
                            >
                              <Eye size={13} /> <span>Preview</span>
                            </button>
                            <a
                              href={msg.attachment_url}
                              download={msg.attachment_name || "image.png"}
                              className="p-2 rounded-xl bg-white/90 text-slate-900 font-bold text-xs flex items-center gap-1 shadow cursor-pointer hover:bg-white"
                            >
                              <Download size={13} />
                            </a>
                          </div>
                        </div>
                      ) : (
                        <a
                          href={msg.attachment_url}
                          download={msg.attachment_name || "document"}
                          className="flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 transition-colors max-w-md cursor-pointer group"
                        >
                          <div className="flex items-center gap-3 truncate">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shrink-0 border border-blue-100">
                              <FileText size={18} />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                {msg.attachment_name || "Attached Document"}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {msg.attachment_size || "File Attachment"} • Click to Download
                              </p>
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-white text-slate-600 shadow-sm border border-slate-100 group-hover:text-blue-600 shrink-0">
                            <Download size={15} />
                          </div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* Translation Subtitle / Original Toggle */}
                  {activeTranslation && (
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Original: &ldquo;{activeTranslation.original_content}&rdquo;</span>
                      <button
                        onClick={() => handleTranslate(msg.id, 'en', msg.message_text)}
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
                No messages in this channel yet. Post an official update, file attachment, or voice note below.
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.ifc,.rvt,.zip"
          />

          {/* Message Input Box & Actions */}
          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white space-y-3">
            
            {/* Urgent Flag & Pre-Upload File Pill */}
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isUrgent}
                  onChange={(e) => setIsUrgent(e.target.checked)}
                  className="rounded text-red-600 focus:ring-red-500 cursor-pointer"
                />
                <span>Mark as High-Priority / Urgent Directive</span>
              </label>

              {/* Pre-Upload Attached File Pill */}
              {attachedFile && (
                <div className="flex items-center gap-2 p-1.5 px-3 bg-blue-50 border border-blue-200 rounded-xl text-xs font-bold text-blue-900">
                  <Paperclip size={13} className="text-blue-600" />
                  <span className="truncate max-w-[200px]">{attachedFile.name}</span>
                  <span className="text-[10px] text-blue-600 font-mono">({attachedFile.size})</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFile(null)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Remove attachment"
                  >
                    <X size={12} />
                  </button>
                </div>
              )}
            </div>
            
            {/* Input Row OR Live Voice Recorder Bar */}
            {isRecordingVoice ? (
              <div className="p-3 bg-red-50 border-2 border-red-300 rounded-2xl flex items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
                  <span className="text-xs font-black text-red-700 uppercase tracking-wider">
                    Recording Voice Dispatch...
                  </span>
                  <span className="text-xs font-mono font-bold text-red-900 bg-red-200/80 px-2 py-0.5 rounded-md">
                    {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={cancelVoiceRecording}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 size={14} />
                    <span>Cancel</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopAndSendVoiceNote}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg shadow-red-600/30 transition-all cursor-pointer"
                  >
                    <Square size={14} />
                    <span>Send Voice Note</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* File Attachment Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer shrink-0"
                  title="Attach CAD, PDF, Image or Document"
                >
                  <Paperclip size={18} />
                </button>

                {/* Voice Note Record Trigger Button */}
                <button
                  type="button"
                  onClick={startVoiceRecording}
                  className="p-3 rounded-2xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                  title="Record and send voice note"
                >
                  <Mic size={18} />
                </button>

                {/* Main Text Input */}
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={attachedFile ? "Add an accompanying note (optional)..." : `Message #${activeChannel}...`}
                  className="flex-1 p-3 border border-slate-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none bg-slate-50"
                />

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={isSending || (!inputMessage.trim() && !attachedFile)}
                  className="px-5 py-3 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-2xl text-xs font-bold flex items-center gap-2 transition-colors disabled:opacity-50 shadow-md shadow-[#022C4F]/20 cursor-pointer shrink-0"
                >
                  {isSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
                </button>
              </div>
            )}

          </form>

        </div>
      </div>

      {/* Lightbox Modal for Image Attachments */}
      <AnimatePresence>
        {lightboxImage && (
          <div 
            className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-[85vh] rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-2xl flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 bg-slate-950 flex items-center justify-between border-b border-slate-800 text-white">
                <span className="text-xs font-bold truncate max-w-md">{lightboxImage.name}</span>
                <button
                  onClick={() => setLightboxImage(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-black/50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.name}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
