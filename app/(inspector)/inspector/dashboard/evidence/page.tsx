"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Layers,
  Search,
  Filter,
  Camera,
  Radio,
  FileText,
  MapPin,
  CheckCircle2,
  Hash,
  ShieldCheck,
  RefreshCw,
  Eye,
  ExternalLink,
  X,
  AlertTriangle,
  Mic,
  Volume2,
  Play,
  Pause,
  Globe,
  Languages,
  Headphones,
  Sliders,
} from "lucide-react";
import { getInspectorEvidence, verifyInspectorEvidence } from "@/services/inspector";
import { dateOr, orDash } from "@/lib/display";
import FieldPhotoCaptureModal from "@/components/inspector/FieldPhotoCaptureModal";
import FieldVoiceNoteModal from "@/components/inspector/FieldVoiceNoteModal";

// Inline Voice Note Player for Evidence Cards
function VoiceNoteCardPlayer({ url, duration = 0 }: { url: string; duration?: number }) {
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

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    e.stopPropagation();
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleSpeed = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-md w-full space-y-2">
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={togglePlay}
          className="w-9 h-9 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white flex items-center justify-center transition-all shrink-0 shadow-md shadow-cyan-600/30 cursor-pointer"
          title={isPlaying ? "Pause voice note" : "Play voice note"}
        >
          {isPlaying ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
        </button>

        {/* Waveform & Scrubber */}
        <div className="flex-1 space-y-1 min-w-0">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 font-bold text-cyan-400">
              <Volume2 size={11} className={isPlaying ? "animate-pulse text-cyan-400" : ""} />
              <span>Voice Note</span>
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
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Playback Speed Toggle */}
        <button
          type="button"
          onClick={toggleSpeed}
          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] font-mono font-bold text-slate-300 transition-colors shrink-0 cursor-pointer"
          title="Toggle audio playback rate"
        >
          {playbackRate}x
        </button>
      </div>
    </div>
  );
}

export default function InspectorEvidencePage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [sourceFilter, setSourceFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Modals state
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [selectedPhotoEvidence, setSelectedPhotoEvidence] = useState<any | null>(null);
  const [selectedVoiceEvidence, setSelectedVoiceEvidence] = useState<any | null>(null);

  // Verification state
  const [verifyingMap, setVerifyingMap] = useState<Record<string, boolean>>({});
  const [verifyOutcomeMap, setVerifyOutcomeMap] = useState<Record<string, any>>({});

  // Active translation channel tab per card: { [evidenceId]: 'en' | 'yo' | 'ig' }
  const [cardLangMap, setCardLangMap] = useState<Record<string, "en" | "yo" | "ig">>({});

  const fetchEvidence = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorEvidence({
        source_type: sourceFilter !== "ALL" ? sourceFilter : undefined,
      });
      setEvidenceList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setEvidenceList([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          "Could not reach the evidence registry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (ev: any) => {
    setVerifyingMap((prev) => ({ ...prev, [ev.id]: true }));
    try {
      const result = await verifyInspectorEvidence(ev.id);
      setVerifyOutcomeMap((prev) => ({
        ...prev,
        [ev.id]: {
          ...result,
          check_performed: true,
        },
      }));
    } catch (err: any) {
      setVerifyOutcomeMap((prev) => ({
        ...prev,
        [ev.id]: {
          file_bytes_ok: null,
          check_performed: false,
          error: true,
          note: err?.message || "Verification service unreachable",
        },
      }));
    } finally {
      setVerifyingMap((prev) => ({ ...prev, [ev.id]: false }));
    }
  };

  useEffect(() => {
    fetchEvidence();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceFilter]);

  const setCardLang = (id: string, lang: "en" | "yo" | "ig", e: React.MouseEvent) => {
    e.stopPropagation();
    setCardLangMap((prev) => ({ ...prev, [id]: lang }));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
              <Layers size={20} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Unified Evidence Registry
            </h1>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed sm:ml-[52px]">
            Tamper-evident sensor scans, radargrams, UPV waveforms, field voice notes, and photos linked by cryptographic SHA-256 checksums and reported directly to the Government Command Center.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Record Voice Note Button */}
          <button
            type="button"
            onClick={() => setIsVoiceModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Mic size={16} />
            <span>Record Voice Note</span>
          </button>

          {/* Take Photo Evidence Button */}
          <button
            type="button"
            onClick={() => setIsPhotoModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Camera size={16} />
            <span>Take Photo Evidence</span>
          </button>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={fetchEvidence}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
            title="Refresh evidence"
          >
            <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: "ALL", label: "All Evidence Types" },
          { id: "photo", label: "PHOTOS" },
          { id: "voice_note", label: "VOICE NOTES" },
          { id: "gpr", label: "GPR" },
          { id: "pundit", label: "PUNDIT" },
          { id: "bim_element", label: "BIM" },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSourceFilter(item.id)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-sm ${
              sourceFilter === item.id
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80 font-medium"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="p-10 rounded-2xl bg-white border border-slate-200/80 text-center">
          <RefreshCw size={20} className="animate-spin mx-auto text-slate-400 mb-3" />
          <p className="text-sm text-slate-500">Loading evidence registry…</p>
        </div>
      )}

      {!isLoading && loadError && (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            Evidence registry unavailable
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is shown because nothing could be read. This is not an empty registry.
          </p>
        </div>
      )}

      {!isLoading && !loadError && evidenceList.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-dashed border-slate-300 text-center">
          <Layers size={22} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-600">
            No evidence recorded yet
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {sourceFilter === "ALL"
              ? "No scans, radargrams, voice notes, or field photos have been registered against your projects."
              : `No ${sourceFilter.toUpperCase()} evidence has been registered against your projects.`}
          </p>
        </div>
      )}

      {/* Evidence Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!isLoading &&
          !loadError &&
          evidenceList.map((ev) => {
            const isVoiceNote =
              ev.source_type === "voice_note" ||
              Boolean(ev.payload?.audio_url || ev.audio_url || ev.payload?.transcript);

            const audioUrl =
              ev.audio_url ||
              ev.payload?.audio_url ||
              ev.payload?.voice_note_url ||
              (isVoiceNote ? ev.file?.file_url : null);

            const photoUrl =
              !isVoiceNote
                ? ev.photo_url ||
                  ev.payload?.photo_url ||
                  ev.payload?.url ||
                  ev.file?.file_url
                : null;

            const verification = verifyOutcomeMap[ev.id];
            const isVerifying = verifyingMap[ev.id];

            const currentLang = cardLangMap[ev.id] || "en";
            const transcriptText = ev.payload?.transcript || ev.payload?.description || "";
            const translations = ev.payload?.translations || {};
            const activeText =
              currentLang === "en"
                ? transcriptText
                : translations[currentLang] || transcriptText;

            return (
              <div
                key={ev.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Bar with Reference & SHA-256 Seal status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                      {orDash(ev.evidence_reference, "Unreferenced")}
                    </span>

                    {verification ? (
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                          verification.file_bytes_ok === true
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : verification.file_bytes_ok === false && verification.check_performed
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {verification.file_bytes_ok === true ? (
                          <>
                            <ShieldCheck size={12} />
                            <span>SHA-256 Validated</span>
                          </>
                        ) : verification.file_bytes_ok === false && verification.check_performed ? (
                          <>
                            <AlertTriangle size={12} />
                            <span>Hash Mismatch</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle size={12} />
                            <span>Check Unavailable</span>
                          </>
                        )}
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-600 bg-slate-50 px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                        <Hash size={13} />
                        <span>Digest on file</span>
                      </span>
                    )}
                  </div>

                  {/* Title & Source */}
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className="text-sm font-bold text-[#022C4F]">
                      {isVoiceNote
                        ? "Field Voice Note / Audio Record"
                        : orDash(ev.source_type_display || ev.source_type, "Source not recorded")}
                    </h3>

                    {isVoiceNote && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 flex items-center gap-1">
                        <Mic size={10} />
                        <span>Transcribed</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500">
                    {orDash(ev.project_name, "Project not recorded")}
                  </p>

                  {/* Voice Note Player & Translation Channel Deck */}
                  {isVoiceNote && audioUrl && (
                    <div className="mt-3 space-y-2.5">
                      <VoiceNoteCardPlayer
                        url={audioUrl}
                        duration={ev.payload?.duration_seconds || 0}
                      />

                      {/* Transcribed Notes Box & Nigerian Language Channel Tabs */}
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#022C4F] flex items-center gap-1">
                            <FileText size={12} className="text-cyan-700" />
                            <span>Voice Notes Transcript:</span>
                          </span>

                          {/* Language Switcher Tabs */}
                          <div className="flex items-center gap-1">
                            {[
                              { code: "en" as const, label: "EN" },
                              { code: "yo" as const, label: "YO" },
                              { code: "ig" as const, label: "IG" },
                            ].map((lang) => (
                              <button
                                key={lang.code}
                                type="button"
                                onClick={(e) => setCardLang(ev.id, lang.code, e)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                                  currentLang === lang.code
                                    ? "bg-[#022C4F] text-white"
                                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                                }`}
                              >
                                {lang.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Active Language Channel Notes */}
                        <div className="text-xs text-slate-700 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-slate-200/80">
                          <p className="line-clamp-3 italic">
                            &ldquo;{activeText || "No voice transcript recorded."}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Photo Evidence Preview Banner */}
                  {photoUrl && (
                    <div
                      onClick={() => setSelectedPhotoEvidence(ev)}
                      className="mt-3 relative h-36 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 group cursor-pointer"
                    >
                      <img
                        src={photoUrl}
                        alt="Field test evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-2.5 text-white">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold truncate max-w-[200px]">
                            {ev.payload?.description || ev.payload?.caption || "Field Inspection Photo"}
                          </span>
                          <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono flex items-center gap-1">
                            <Eye size={11} />
                            <span>View Full</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata Attributes */}
                  <div className="mt-3.5 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium text-[11px]">Element Link:</span>
                      <span className="font-bold text-[#022C4F]">
                        {orDash(ev.structural_element_id, "Not linked to an element")}
                      </span>
                    </div>

                    {ev.payload?.category && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Category:</span>
                        <span className="font-semibold text-indigo-700 capitalize">
                          {ev.payload.category.replace(/_/g, " ")}
                        </span>
                      </div>
                    )}

                    {ev.payload?.severity && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Severity:</span>
                        <span
                          className={`px-2 py-0.2 rounded font-bold text-[10px] ${
                            ev.payload.severity === "CRITICAL"
                              ? "text-rose-700 bg-rose-50"
                              : ev.payload.severity === "HIGH"
                              ? "text-amber-800 bg-amber-50"
                              : "text-slate-700 bg-slate-100"
                          }`}
                        >
                          {ev.payload.severity}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-slate-700">
                      <span className="text-slate-500 font-medium text-[11px]">Integrity Hash:</span>
                      <span
                        className="font-mono text-[11px] text-slate-600 truncate max-w-[200px]"
                        title={ev.evidence_hash}
                      >
                        {orDash(ev.evidence_hash, "Not recorded")}
                      </span>
                    </div>

                    {ev.coordinates && (
                      <div className="flex items-center justify-between text-slate-700">
                        <span className="text-slate-500 font-medium text-[11px]">Coordinates:</span>
                        <span className="text-[11px] text-slate-600 font-mono">
                          {ev.coordinates.latitude && ev.coordinates.longitude
                            ? `${ev.coordinates.latitude}, ${ev.coordinates.longitude}`
                            : JSON.stringify(ev.coordinates)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{dateOr(ev.captured_at, "Capture time not recorded")}</span>

                  <div className="flex items-center gap-2">
                    {isVoiceNote && (
                      <button
                        type="button"
                        onClick={() => setSelectedVoiceEvidence(ev)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-indigo-800 text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                      >
                        <Eye size={11} />
                        <span>Voice Dossier</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleVerify(ev)}
                      disabled={isVerifying}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                    >
                      <RefreshCw size={10} className={isVerifying ? "animate-spin" : ""} />
                      <span>{isVerifying ? "Verifying..." : "Verify Hash"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Lightbox / High-Resolution Photo Evidence Modal */}
      {selectedPhotoEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={16} className="text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold truncate">
                    {selectedPhotoEvidence.evidence_reference} — Field Photo Evidence
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    {selectedPhotoEvidence.structural_element_id || "Unlinked Element"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoEvidence(null)}
                className="text-slate-400 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[65vh] bg-black flex items-center justify-center overflow-hidden">
              <img
                src={
                  selectedPhotoEvidence.photo_url ||
                  selectedPhotoEvidence.payload?.photo_url ||
                  selectedPhotoEvidence.payload?.url ||
                  selectedPhotoEvidence.file?.file_url
                }
                alt="High-resolution evidence"
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="p-5 bg-white text-xs text-slate-700 space-y-3">
              {selectedPhotoEvidence.payload?.description && (
                <p className="text-xs text-slate-800 leading-relaxed">
                  <strong>Inspector Remarks:</strong> {selectedPhotoEvidence.payload.description}
                </p>
              )}

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">SHA-256 Digest:</span>
                  <span
                    className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[360px]"
                    title={selectedPhotoEvidence.evidence_hash}
                  >
                    {selectedPhotoEvidence.evidence_hash}
                  </span>
                </div>

                {selectedPhotoEvidence.coordinates && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">GPS Location:</span>
                    <span className="font-mono text-slate-800">
                      {selectedPhotoEvidence.coordinates.latitude}, {selectedPhotoEvidence.coordinates.longitude}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Captured By:</span>
                  <span className="text-slate-800">
                    {selectedPhotoEvidence.inspector_name ||
                      selectedPhotoEvidence.payload?.inspector_name ||
                      "Field Inspector"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Voice Note Dossier & Multilingual Modal */}
      {selectedVoiceEvidence && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-gradient-to-r from-[#022C4F] to-[#011B31] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic size={16} className="text-cyan-400" />
                <div>
                  <h3 className="text-xs font-bold truncate">
                    {selectedVoiceEvidence.evidence_reference} — Field Voice Note Dossier
                  </h3>
                  <p className="text-[10px] text-slate-300">
                    {selectedVoiceEvidence.structural_element_id || "Unlinked Element"} •{" "}
                    {selectedVoiceEvidence.project_name || "Assigned Project"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVoiceEvidence(null)}
                className="text-slate-300 hover:text-white p-1 rounded-xl hover:bg-white/10 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Audio Playback Player */}
              {(selectedVoiceEvidence.payload?.audio_url ||
                selectedVoiceEvidence.audio_url ||
                selectedVoiceEvidence.file?.file_url) && (
                <VoiceNoteCardPlayer
                  url={
                    selectedVoiceEvidence.payload?.audio_url ||
                    selectedVoiceEvidence.audio_url ||
                    selectedVoiceEvidence.file?.file_url
                  }
                  duration={selectedVoiceEvidence.payload?.duration_seconds || 0}
                />
              )}

              {/* Multilingual Translation Channels: English, Yoruba, Igbo */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#022C4F] flex items-center gap-1.5">
                    <Globe size={14} className="text-indigo-600" />
                    <span>Transcribed Voice Channels (English, Yorùbá, Igbo)</span>
                  </h4>
                  <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full font-bold">
                    Official Translation
                  </span>
                </div>

                {/* English Channel */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-800">
                    <span className="flex items-center gap-1">
                      <span>🌐</span>
                      <span>English Original Transcript</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Source Voice</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-sans">
                    {selectedVoiceEvidence.payload?.transcript ||
                      selectedVoiceEvidence.payload?.description ||
                      "No transcript recorded."}
                  </p>
                </div>

                {/* Yorùbá Channel */}
                <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-amber-950">
                    <span className="flex items-center gap-1">
                      <span>🇳🇬</span>
                      <span>Yorùbá Translation Channel</span>
                    </span>
                    <span className="text-[10px] text-amber-800 font-mono">Yorùbá (yo)</span>
                  </div>
                  <p className="text-xs text-amber-900 leading-relaxed font-sans">
                    {selectedVoiceEvidence.payload?.translations?.yo ||
                      "Translation channel pending."}
                  </p>
                </div>

                {/* Igbo Channel */}
                <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-bold text-emerald-950">
                    <span className="flex items-center gap-1">
                      <span>🇳🇬</span>
                      <span>Igbo Translation Channel</span>
                    </span>
                    <span className="text-[10px] text-emerald-800 font-mono">Igbo (ig)</span>
                  </div>
                  <p className="text-xs text-emerald-900 leading-relaxed font-sans">
                    {selectedVoiceEvidence.payload?.translations?.ig ||
                      "Translation channel pending."}
                  </p>
                </div>
              </div>

              {/* Cryptographic & Forensic Metadata */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">SHA-256 Digest:</span>
                  <span
                    className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 truncate max-w-[360px]"
                    title={selectedVoiceEvidence.evidence_hash}
                  >
                    {selectedVoiceEvidence.evidence_hash}
                  </span>
                </div>

                {selectedVoiceEvidence.coordinates && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-semibold">GPS Coordinates:</span>
                    <span className="font-mono text-slate-800">
                      {selectedVoiceEvidence.coordinates.latitude},{" "}
                      {selectedVoiceEvidence.coordinates.longitude}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Inspector:</span>
                  <span className="text-slate-800">
                    {selectedVoiceEvidence.inspector_name ||
                      selectedVoiceEvidence.payload?.inspector_name ||
                      "Field Inspector"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Field Photo Capture Modal */}
      <FieldPhotoCaptureModal
        isOpen={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        onEvidenceCreated={() => {
          fetchEvidence();
        }}
      />

      {/* Field Voice Note Modal */}
      <FieldVoiceNoteModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onEvidenceCreated={() => {
          fetchEvidence();
        }}
      />
    </div>
  );
}
