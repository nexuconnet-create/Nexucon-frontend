"use client";

import React, { useState, useEffect } from "react";
import { AtSign, Sparkles, CheckCircle2, AlertTriangle, Mail, Save, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import api from "@/services/api";

export default function UsernameSettingsCard() {
  const { user, refreshUser } = useAuth();
  const [username, setUsername] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const currentUsername = user?.username || "";
  const needsUpdate =
    user?.needs_username_update ||
    !currentUsername ||
    currentUsername.includes("@") ||
    (user?.email && currentUsername.toLowerCase() === user.email.toLowerCase());

  useEffect(() => {
    if (user?.username && !user.username.includes("@")) {
      setUsername(user.username);
    } else if (user && !username) {
      handleAutoGenerate(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.username, user?.email]);

  const validateClientUsername = (val: string): string | null => {
    const clean = val.trim().replace(/^@+/, "").toLowerCase();
    if (!clean) return "Username is required.";
    if (clean.length < 3) return "Username must be at least 3 characters.";
    if (clean.length > 35) return "Username cannot exceed 35 characters.";
    if (clean.includes("@")) return "Username cannot be an email address or contain '@'.";
    if (!/^[a-z0-9_.-]+$/.test(clean)) {
      return "Use only lowercase letters, numbers, underscores (_), dots (.), or hyphens (-).";
    }
    return null;
  };

  const handleAutoGenerate = async (silent = false) => {
    if (!silent) setStatusMsg(null);
    setIsGenerating(true);
    try {
      const res: any = await api.post("/auth/generate-username/", {
        first_name: user?.first_name || "",
        last_name: user?.last_name || "",
        email: user?.email || "",
        role: user?.role_name || "",
      });
      const payload = res?.data?.data || res?.data || {};
      const primary = payload.username;
      const list = Array.isArray(payload.suggestions) ? payload.suggestions : [];
      if (primary) {
        setUsername(primary);
      }
      if (list.length > 0) {
        setSuggestions(list);
      }
      if (!silent) {
        setStatusMsg({
          type: "success",
          text: "Generated available platform username suggestions! Click Save Username to apply.",
        });
      }
    } catch {
      const base = (
        `${user?.first_name || ""}_${user?.last_name || ""}`
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, "")
          .replace(/^_+|_+$/g, "") ||
        (user?.email || "user").split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "")
      ).slice(0, 22);
      const rand = Math.floor(100 + Math.random() * 900);
      const fallback = `${base}_${rand}`;
      setUsername(fallback);
      setSuggestions([fallback, `${base}_nx`, `${base}_${rand + 7}`]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    const clean = username.trim().replace(/^@+/, "").toLowerCase();
    const validationErr = validateClientUsername(clean);
    if (validationErr) {
      setStatusMsg({ type: "error", text: validationErr });
      return;
    }

    setIsSaving(true);
    try {
      const res: any = await api.post("/auth/update-username/", { username: clean });
      const data = res?.data;
      if (data?.success !== false) {
        setUsername(clean);
        await refreshUser();
        setStatusMsg({
          type: "success",
          text: `Username updated to @${clean}. You can now sign in using "${clean}".`,
        });
        if (typeof window !== "undefined") {
          window.dispatchEvent(
            new CustomEvent("show-toast", {
              detail: { message: `Username updated to @${clean}`, type: "success" },
            })
          );
        }
      } else {
        setStatusMsg({
          type: "error",
          text: data?.message || "Could not update username.",
        });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to update username. Please try another username.";
      setStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendUpdateEmail = async () => {
    setStatusMsg(null);
    setIsSendingEmail(true);
    try {
      const res: any = await api.post("/auth/notify-username-update/", {});
      const msg =
        res?.data?.message ||
        `Username update instructions and auto-generated suggestion sent to ${user?.email}.`;
      setStatusMsg({ type: "success", text: msg });
    } catch (err: any) {
      setStatusMsg({
        type: "error",
        text:
          err?.response?.data?.message ||
          "Could not dispatch email notification right now.",
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-[#022C4F]/5 via-sky-50/50 to-transparent flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#022C4F] text-white flex items-center justify-center shadow-sm shrink-0">
            <AtSign size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-extrabold text-[#022C4F]">
                Platform Login Username &amp; Handle
              </h2>
              {needsUpdate ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
                  <AlertTriangle size={11} /> Action Required
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <CheckCircle2 size={11} /> Active (@{currentUsername})
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Use your unique Nexucon username to sign in across the platform and be tagged in Council Meetings &amp; Inspections.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSendUpdateEmail}
          disabled={isSendingEmail}
          className="self-start sm:self-center inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-[#022C4F] transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
          title="Send username update instructions & auto-generated handle to your registered email"
        >
          <Mail size={13} className="text-[#0284C7]" />
          {isSendingEmail ? "Sending Email..." : "Email Me Update Link"}
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-5">
        {needsUpdate && (
          <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">
                Your account is still using an email address as its login identifier.
              </p>
              <p className="text-amber-800 leading-relaxed">
                Nexucon now requires a dedicated username for all existing and new users. Enter your preferred username below or click <strong>Auto-Generate</strong>, then click <strong>Save Username</strong>.
              </p>
            </div>
          </div>
        )}

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${
              statusMsg.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-rose-50 border-rose-200 text-rose-700"
            }`}
          >
            {statusMsg.type === "success" ? (
              <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            )}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveUsername} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#022C4F] uppercase tracking-wider mb-2">
              Unique Platform Username <span className="text-rose-500">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="relative flex-1">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono font-bold text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.replace(/\s+/g, "").toLowerCase())
                  }
                  placeholder="e.g. engr_babatunde"
                  required
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0284C7] font-mono font-bold text-slate-900 text-xs sm:text-sm bg-slate-50/50"
                />
              </div>

              <button
                type="button"
                onClick={() => handleAutoGenerate(false)}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-[#0284C7] border border-sky-200 font-bold text-xs transition-all cursor-pointer shrink-0 disabled:opacity-60"
              >
                {isGenerating ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                Auto-Generate
              </button>

              <button
                type="submit"
                disabled={isSaving || !username.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] hover:bg-[#033a66] text-white font-bold text-xs transition-all cursor-pointer shrink-0 disabled:opacity-60 shadow-sm"
              >
                <Save size={14} />
                {isSaving ? "Saving..." : "Save Username"}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1.5">
              3–35 characters. Allowed: lowercase letters, numbers, underscores (<code>_</code>), dots (<code>.</code>), and hyphens (<code>-</code>). No spaces or <code>@</code> symbol.
            </p>
          </div>

          {suggestions.length > 0 && (
            <div className="pt-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                Available Auto-Generated Suggestions (Click to select):
              </span>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    onClick={() => setUsername(sug)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-all cursor-pointer ${
                      username === sug
                        ? "bg-[#022C4F] text-white border-[#022C4F]"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50 hover:border-sky-300 hover:text-[#0284C7]"
                    }`}
                  >
                    @{sug}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

