"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  AtSign,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import api from "@/services/api";

interface UsernameActivationModalProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export default function UsernameActivationModal({
  forceOpen = false,
  onClose,
}: UsernameActivationModalProps) {
  const { user, refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [primarySuggestion, setPrimarySuggestion] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const currentUsername = user?.username || "";
  const isUsernameUnset =
    !currentUsername ||
    currentUsername.includes("@") ||
    (user?.email && currentUsername.toLowerCase() === user.email.toLowerCase());

  // Determine if modal should open automatically
  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      return;
    }

    if (!user) return;

    const queryRequested =
      searchParams?.get("activate_username") === "true" ||
      searchParams?.get("activate-username") === "true" ||
      searchParams?.get("action") === "activate-username";

    let sessionRequested = false;
    let sessionDismissed = false;
    if (typeof window !== "undefined") {
      sessionRequested =
        sessionStorage.getItem("nexucon_activate_username") === "true";
      sessionDismissed =
        sessionStorage.getItem("nexucon_username_modal_dismissed") === "true";
    }

    const needsActivation = user.needs_username_update || isUsernameUnset;

    if (queryRequested || sessionRequested) {
      setIsOpen(true);
      return;
    }

    if (needsActivation && !sessionDismissed) {
      setIsOpen(true);
    }
  }, [user, searchParams, forceOpen, isUsernameUnset]);

  // Listen to manual open triggers from custom events
  useEffect(() => {
    const handleOpen = () => {
      setIsSuccess(false);
      setStatusMsg(null);
      setIsOpen(true);
    };
    window.addEventListener("open-username-activation-modal", handleOpen);
    return () => {
      window.removeEventListener("open-username-activation-modal", handleOpen);
    };
  }, []);

  const handleFetchSuggestions = useCallback(
    async (pickFirst = false) => {
      if (!user) return;
      setIsGenerating(true);
      try {
        const res: any = await api.post("/auth/generate-username/", {
          first_name: user.first_name || "",
          last_name: user.last_name || "",
          email: user.email || "",
          role: user.role_name || "",
        });
        const data = res?.data?.data || res?.data || {};
        const primary = data.username || "";
        const list: string[] = Array.isArray(data.suggestions)
          ? data.suggestions
          : [];

        if (primary) {
          setPrimarySuggestion(primary);
          if (pickFirst && !username) {
            setUsername(primary);
          }
        }
        if (list.length > 0) {
          setSuggestions(list);
        }
      } catch {
        const base = (
          `${user.first_name || ""}_${user.last_name || ""}`
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "")
            .replace(/^_+|_+$/g, "") ||
          (user.email || "user").split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
        ).slice(0, 20);
        const rand = Math.floor(100 + Math.random() * 900);
        const fallback = `${base}_${rand}`;
        setPrimarySuggestion(fallback);
        if (pickFirst && !username) {
          setUsername(fallback);
        }
        setSuggestions([fallback, `${base}_nxc`, `${base}_${rand + 11}`]);
      } finally {
        setIsGenerating(false);
      }
    },
    [user, username]
  );

  // When modal opens, auto-generate suggestions
  useEffect(() => {
    if (isOpen && !username && !primarySuggestion) {
      handleFetchSuggestions(true);
    }
  }, [isOpen, username, primarySuggestion, handleFetchSuggestions]);

  const cleanParamFromUrl = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("nexucon_activate_username");
      if (searchParams?.get("activate_username") || searchParams?.get("activate-username")) {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("activate_username");
        params.delete("activate-username");
        params.delete("action");
        const query = params.toString() ? `?${params.toString()}` : "";
        window.history.replaceState({}, "", `${pathname}${query}`);
      }
    }
  };

  const handleDismiss = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nexucon_username_modal_dismissed", "true");
    }
    cleanParamFromUrl();
    setIsOpen(false);
    if (onClose) onClose();
  };

  const validateClientUsername = (val: string): string | null => {
    const clean = val.trim().replace(/^@+/, "").toLowerCase();
    if (!clean) return "Please enter a username handle.";
    if (clean.length < 3) return "Username must be at least 3 characters.";
    if (clean.length > 35) return "Username cannot exceed 35 characters.";
    if (clean.includes("@")) return "Username cannot contain '@' or be an email address.";
    if (!/^[a-z0-9_.-]+$/.test(clean)) {
      return "Only lowercase letters, numbers, underscores (_), dots (.), and hyphens (-) are permitted.";
    }
    return null;
  };

  const handleSaveUsername = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setStatusMsg(null);

    const clean = username.trim().replace(/^@+/, "").toLowerCase();
    const validationErr = validateClientUsername(clean);
    if (validationErr) {
      setStatusMsg({ type: "error", text: validationErr });
      return;
    }

    setIsSaving(true);
    try {
      const res: any = await api.post("/auth/update-username/", {
        username: clean,
      });
      const data = res?.data;
      if (data?.success !== false) {
        setUsername(clean);
        setIsSuccess(true);
        cleanParamFromUrl();

        if (typeof window !== "undefined") {
          sessionStorage.setItem("nexucon_username_modal_dismissed", "true");
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: {
                message: `Username activated as @${clean}!`,
                type: "success",
              },
            })
          );
        }

        await refreshUser();

        setTimeout(() => {
          setIsOpen(false);
          if (onClose) onClose();
        }, 2200);
      } else {
        setStatusMsg({
          type: "error",
          text: data?.message || "Could not activate username.",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.response?.data?.errors?.username?.[0] ||
        err?.message ||
        "Failed to update username. Please try another handle.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-[#022C4F] via-[#033c6c] to-[#022C4F] text-white relative">
          <button
            type="button"
            onClick={handleDismiss}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Dismiss / Remind Later"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner shrink-0 text-sky-300">
              <AtSign size={22} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-sky-400/20 text-sky-200 border border-sky-400/30 mb-1">
                <Sparkles size={11} /> Account Activation Required
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold leading-tight">
                Activate Your Nexucon Username
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Nexucon has upgraded authentication to unique usernames. Claim your official handle for fast sign-in, council meetings, and accredited field tagging.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {isSuccess ? (
            <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={36} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-[#022C4F]">
                  Username Activated!
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Your platform login handle is now{" "}
                  <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    @{username}
                  </span>
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  You can now use either <b>@{username}</b> or your email to sign in across all Nexucon dashboards.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-[#022C4F] text-white font-bold text-sm hover:bg-[#033c6c] transition-all shadow-md cursor-pointer"
              >
                Continue to Dashboard →
              </button>
            </div>
          ) : (
            <>
              {/* Account current info */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/90 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <span className="text-slate-500 block text-[11px] font-medium uppercase">
                    Account Identity
                  </span>
                  <p className="font-bold text-slate-900 truncate">
                    {user?.first_name || user?.last_name
                      ? `${user?.first_name || ""} ${user?.last_name || ""}`.trim()
                      : user?.email}
                  </p>
                  <p className="text-[11px] text-slate-500 font-mono truncate">
                    {user?.email}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-extrabold uppercase tracking-wider border border-amber-300">
                    Pending Username
                  </span>
                </div>
              </div>

              {/* Recommended Suggestion Box */}
              {primarySuggestion && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50/50 border border-sky-200 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                      <Sparkles size={11} /> Recommended Available Handle
                    </span>
                    <p className="text-sm font-bold text-[#022C4F] font-mono mt-0.5 truncate">
                      @{primarySuggestion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUsername(primarySuggestion);
                      setStatusMsg(null);
                    }}
                    className="shrink-0 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <Check size={13} />
                    Use This
                  </button>
                </div>
              )}

              {/* Username Input Form */}
              <form onSubmit={handleSaveUsername} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-800 flex items-center gap-1">
                      <span>Choose Your Custom Username</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleFetchSuggestions(true)}
                      disabled={isGenerating || isSaving}
                      className="text-[11px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw
                        size={12}
                        className={isGenerating ? "animate-spin" : ""}
                      />
                      <span>Auto-Generate</span>
                    </button>
                  </div>

                  <div className="relative rounded-xl shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold font-mono">
                      @
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => {
                        setUsername(
                          e.target.value.toLowerCase().replace(/[^a-z0-9_.-]/g, "")
                        );
                        setStatusMsg(null);
                      }}
                      placeholder="e.g. engr_idowu or official_inspector"
                      maxLength={35}
                      autoFocus
                      disabled={isSaving}
                      className="w-full pl-9 pr-10 py-3 rounded-xl border border-slate-300 focus:border-[#022C4F] focus:ring-2 focus:ring-[#022C4F]/20 text-slate-900 font-mono text-sm font-medium transition-all outline-none"
                    />
                    {username && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        {validateClientUsername(username) ? (
                          <AlertCircle size={16} className="text-amber-500" />
                        ) : (
                          <CheckCircle2 size={16} className="text-emerald-500" />
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    3-35 characters. Lowercase letters, numbers, underscores, dots, or hyphens.
                  </p>
                </div>

                {/* Suggestions Pills */}
                {suggestions.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-slate-600 block mb-1.5">
                      Available Suggestions:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {suggestions.map((cand) => (
                        <button
                          key={cand}
                          type="button"
                          onClick={() => {
                            setUsername(cand);
                            setStatusMsg(null);
                          }}
                          className={`text-xs font-mono font-medium px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                            username === cand
                              ? "bg-[#022C4F] text-white border-[#022C4F] shadow-sm font-bold"
                              : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          @{cand}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status / Error Message */}
                {statusMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs flex items-start gap-2 ${
                      statusMsg.type === "success"
                        ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                        : "bg-rose-50 border border-rose-200 text-rose-800"
                    }`}
                  >
                    {statusMsg.type === "success" ? (
                      <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle size={14} className="shrink-0 mt-0.5" />
                    )}
                    <span>{statusMsg.text}</span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    disabled={isSaving || !username}
                    className="flex-1 py-3 px-4 rounded-xl bg-[#022C4F] hover:bg-[#033c6c] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw size={15} className="animate-spin" />
                        <span>Activating Username...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck size={16} />
                        <span>Activate &amp; Save Username</span>
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    disabled={isSaving}
                    className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer text-center"
                  >
                    Remind Me Later
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

