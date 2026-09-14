"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  FileEdit,
  KeyRound,
  Lock,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  getReportCmsSections,
  revertReportCmsSection,
  saveReportCmsSection,
  setReportCmsPassword,
  type ReportCmsSection,
  type ReportCmsSectionSource,
} from "@/services/digitalEye";

/**
 * Report CMS panel (8 Sep meeting H7; 4 Sep register C4/C5): the statutory
 * NDT report's prose sections as editable template variables,
 * password-protected. The backend registry is the source of truth — this
 * panel only reads it and writes changes through the password-gated API.
 * Computed content (formulas, calibration disclosure, result tables, every
 * figure) is never editable and the section help text says so.
 *
 * 11 Sep: generated-content sections (executive summary, observations,
 * findings ...) arrive pre-filled with the wording computed from the
 * selected project's recorded data, so the operator reviews and rewords
 * exactly what the report will print. A section with no recorded data
 * behind it shows its honest fixed wording and cannot be edited.
 */
export default function ReportCmsPanel({ projectId }: { projectId?: string }) {
  const [sections, setSections] = useState<ReportCmsSection[]>([]);
  const [passwordSet, setPasswordSet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  // One password field for saves/reverts (never stored beyond the field).
  const [cmsPassword, setCmsPassword] = useState("");
  // Scope: with a project selected, edits can target just that project or
  // the platform as a whole.
  const [platformScope, setPlatformScope] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [pwOpen, setPwOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");

  const errText = useCallback((err: any): string => {
    const data = err?.response?.data;
    if (data?.detail) return String(data.detail);
    if (data?.errors) {
      try {
        return Object.values(data.errors).flat().join(" ");
      } catch {
        /* fall through */
      }
    }
    return err?.message || "The request failed.";
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = await getReportCmsSections(projectId || undefined);
      setSections(data.sections);
      setPasswordSet(data.password_set);
      setDrafts(Object.fromEntries(
        data.sections.map((s) => [s.key, s.body ?? ""]),
      ));
    } catch (err: any) {
      setSections([]);
      setLoadError(errText(err));
    } finally {
      setLoading(false);
    }
  }, [projectId, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const scopeOpts = useMemo(
    () => ({
      projectId: platformScope ? undefined : projectId || undefined,
    }),
    [platformScope, projectId],
  );

  // Generated-content sections are per-project: the platform-wide scope
  // checkbox never applies to them — their wording is data-derived.
  const sectionScope = (section: ReportCmsSection) =>
    section.computed ? { projectId: projectId || undefined } : scopeOpts;

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } }),
    );
  };

  const handleSave = async (section: ReportCmsSection) => {
    if (!cmsPassword) {
      toast("Enter the report-CMS password to save changes.", "error");
      return;
    }
    if (section.computed && !projectId) {
      toast("This generated-content section is project-specific — select a "
        + "project above before editing its wording.", "error");
      return;
    }
    setBusyKey(section.key);
    try {
      await saveReportCmsSection(section.key, drafts[section.key] ?? "", {
        ...sectionScope(section),
        cmsPassword,
      });
      toast(`Saved: ${section.label}.`, "success");
      await load();
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const handleRevert = async (section: ReportCmsSection) => {
    if (!cmsPassword) {
      toast("Enter the report-CMS password to revert a section.", "error");
      return;
    }
    if (section.computed && !projectId) {
      toast("This generated-content section is project-specific — select a "
        + "project above before reverting its wording.", "error");
      return;
    }
    setBusyKey(section.key);
    try {
      const result = await revertReportCmsSection(section.key, {
        ...sectionScope(section),
        cmsPassword,
      });
      toast(
        result.reverted
          ? `Reverted: ${section.label} (now ${result.source.replace(/_/g, " ").toLowerCase()}).`
          : `${section.label} was already at its ${result.source} text.`,
        "info",
      );
      await load();
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setBusyKey(null);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setReportCmsPassword({
        new_password: newPassword,
        ...(passwordSet ? { current_password: currentPassword } : {}),
      });
      toast("Report-CMS password saved.", "success");
      setNewPassword("");
      setCurrentPassword("");
      setPwOpen(false);
      setPasswordSet(true);
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    }
  };

  const sourceBadge = (source: ReportCmsSectionSource) => {
    if (source === "project_override") {
      return "bg-amber-100 text-amber-900";
    }
    if (source === "platform_override") {
      return "bg-blue-100 text-blue-900";
    }
    if (source === "computed") {
      return "bg-emerald-100 text-emerald-900";
    }
    if (source === "unavailable") {
      return "bg-gray-100 text-gray-500";
    }
    return "bg-slate-100 text-slate-600";
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
            <FileEdit size={18} className="text-amber-600" />
            Report Template CMS
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Editable wording for the official NDT report&apos;s prose sections —
            password-protected (Directors only). Formulas, calibration
            statements, result tables and every figure stay server-computed.
          </p>
        </div>
        <button
          onClick={() => setPwOpen((v) => !v)}
          className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
        >
          {passwordSet ? <KeyRound size={14} /> : <Lock size={14} />}
          <span>{passwordSet ? "Change CMS Password" : "Set CMS Password"}</span>
        </button>
      </div>

      {/* Password management (Director). First-time set has no current field. */}
      {pwOpen && (
        <form
          onSubmit={handleSetPassword}
          className="p-4 bg-slate-50 border-b border-gray-100 flex flex-col sm:flex-row sm:items-end gap-3"
        >
          {passwordSet && (
            <div className="flex-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
                Current password
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400"
              />
            </div>
          )}
          <div className="flex-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
              New password (min 8 characters)
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-sm cursor-pointer"
          >
            Save Password
          </button>
        </form>
      )}

      {!passwordSet && !pwOpen && (
        <div className="p-4 bg-amber-50 border-b border-amber-100 flex items-start gap-2.5 text-[11px] text-amber-900 leading-relaxed">
          <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
          <span>
            <strong>No report-CMS password is set yet.</strong> A Director must
            set one before any template section can be edited. The sections
            below show the platform&apos;s default wording.
          </span>
        </div>
      )}

      {/* Save/revert credentials + scope */}
      <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
            CMS password (required to save or revert)
          </label>
          <input
            type="password"
            value={cmsPassword}
            onChange={(e) => setCmsPassword(e.target.value)}
            placeholder="Report-CMS password"
            className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400"
          />
        </div>
        {projectId ? (
          <label className="flex items-center gap-2 text-xs text-gray-600 font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={platformScope}
              onChange={(e) => setPlatformScope(e.target.checked)}
              className="cursor-pointer"
            />
            Apply to ALL projects (platform-wide)
          </label>
        ) : (
          <span className="text-[11px] text-gray-400 leading-snug">
            No project selected — edits apply platform-wide.
          </span>
        )}
      </div>

      {/* Section editors */}
      {loading ? (
        <div className="py-12 text-center text-xs font-semibold text-gray-400 animate-pulse">
          Loading template sections…
        </div>
      ) : loadError ? (
        <div className="p-12 text-center text-rose-600 text-xs">
          <AlertTriangle size={32} className="mx-auto text-rose-300 mb-2" />
          <p className="font-semibold">Template sections could not be loaded</p>
          <p className="text-gray-400 mt-1">{loadError}</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {sections.map((section) => {
            // No editable body: either the project has no recorded data
            // behind the section, or it is a generated-content section
            // with no project selected to compute from.
            const locked = section.source === "unavailable"
              || (section.computed === true && !projectId);
            return (
            <div key={section.key} className="p-5">
              <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-gray-900">
                    {section.label}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${sourceBadge(section.source)}`}
                  >
                    {section.source.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSave(section)}
                    disabled={busyKey === section.key || locked}
                    className="px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Save size={12} />
                    <span>{busyKey === section.key ? "Saving…" : "Save"}</span>
                  </button>
                  <button
                    onClick={() => handleRevert(section)}
                    disabled={busyKey === section.key || locked
                      || section.source === "default"
                      || section.source === "computed"}
                    className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
                    title="Delete the override and fall back to the wider scope / default text"
                  >
                    <RotateCcw size={12} />
                    <span>Revert</span>
                  </button>
                </div>
              </div>
              <p className="text-[11px] text-gray-400 mb-2 leading-relaxed">
                {section.help}
                {section.kind === "list"
                  ? " One item per line."
                  : section.kind === "line"
                    ? " One line only."
                    : " Blank lines separate paragraphs."}
              </p>
              {locked && (
                <p className="mb-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
                  {section.source === "unavailable" ? (
                    <>
                      <strong>Not editable yet.</strong> No recorded data backs
                      this section (no test results, observations or rebar
                      survey recorded for the project), so the report prints
                      its honest fixed wording. Record the underlying data
                      first, then the generated wording becomes editable.
                    </>
                  ) : (
                    <>
                      <strong>Select a project to edit this section.</strong>{" "}
                      Generated content is computed from one project&apos;s
                      recorded data, so its wording exists only per project.
                    </>
                  )}
                </p>
              )}
              <textarea
                rows={section.kind === "list" ? 5 : section.kind === "line" ? 2 : 4}
                value={drafts[section.key] ?? ""}
                onChange={(e) =>
                  setDrafts((prev) => ({ ...prev, [section.key]: e.target.value }))
                }
                disabled={locked}
                placeholder={locked
                  ? "No recorded wording — nothing to edit yet."
                  : undefined}
                className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-400 resize-y font-medium leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
