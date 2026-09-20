"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Eye,
  FileEdit,
  GripVertical,
  KeyRound,
  Lock,
  Plus,
  RotateCcw,
  Save,
  Trash2,
} from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  addReportCustomSection,
  deleteReportCustomSection,
  getReportCmsSections,
  getReportStructure,
  reorderReportStructure,
  revertReportCmsSection,
  saveReportCmsSection,
  setReportCmsPassword,
  toggleReportSection,
  updateReportCustomSection,
  type ReportCmsSection,
  type ReportCmsSectionSource,
  type ReportStructureEntry,
} from "@/services/digitalEye";

/**
 * DOCUMENT EDITOR (REFINED EXECUTIVE SUMMARY §2.5, wireframe p17) — built on
 * the report CMS (8 Sep H7 / 4 Sep C4-C5). Two panes:
 *
 *  - SECTIONS: the project's report structure — drag to reorder, checkbox to
 *    include/exclude a section from the generated report, and ➕ Add Custom
 *    Section. Every change is genuine: the backend reorders/disables/adds
 *    through the structure API and BOTH emitters (certified PDF + .docx
 *    working copy) render exactly the configured document.
 *  - SECTION CONTENT: the selected section's editable wording (the report
 *    CMS sections that feed it, password-protected) or its honest
 *    system-generated notice; custom sections edit their own title/body.
 *
 * Without a project selected the structure pane is hidden — section order
 * is per-project — and the wording editors list on their own.
 */

/** Which CMS wording sections feed each built-in report section. */
const SECTION_CMS_KEYS: Record<string, string[]> = {
  cover_page: ["report_reference"],
  executive_summary: ["executive_summary"],
  "1.0": ["introduction", "introduction_project"],
  "2.0": ["purpose_items"],
  "3.0": ["literature_review"],
  "3.1": [],
  "4.0": [],
  "4.1": ["visual_preamble", "visual_observations"],
  "4.2": ["methodology_equipment", "methodology_concrete", "rebar_statement"],
  "5.0": [],
  "5.3": [],
  "6.0": ["recommendation_preamble", "findings_statement"],
  "7.0": ["conclusion_preamble", "conclusion_items"],
  APPENDIX: [],
};

/** Built-in sections with no editable wording — honest notice, per §2.2. */
const SYSTEM_GENERATED_NOTICE = (
  <>
    <strong>System-generated.</strong> This section&apos;s content is computed
    from the project&apos;s recorded data (measurements, result tables, charts)
    — it cannot be edited, exactly as the specification requires. Its wording
    reflects only what was recorded on site.
  </>
);

export default function ReportCmsPanel({
  projectId,
  onPreview,
}: {
  projectId?: string;
  onPreview?: () => void;
}) {
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

  // §2.5 structure state (only meaningful with a project selected).
  const [structure, setStructure] = useState<ReportStructureEntry[]>([]);
  const [structureError, setStructureError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [structureBusy, setStructureBusy] = useState(false);
  // Custom-section drafts (title/body) for the selected custom section.
  const [customDraft, setCustomDraft] = useState<{ title: string; body: string } | null>(null);
  // Add Custom Section form.
  const [addOpen, setAddOpen] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addBody, setAddBody] = useState("");

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

  const loadStructure = useCallback(async () => {
    if (!projectId) {
      setStructure([]);
      setSelectedKey(null);
      return;
    }
    setStructureError(null);
    try {
      const data = await getReportStructure(projectId);
      setStructure(data.sections);
      setSelectedKey((prev) =>
        prev && data.sections.some((s) => s.key === prev)
          ? prev
          : (data.sections[0]?.key ?? null),
      );
    } catch (err: any) {
      setStructure([]);
      setStructureError(errText(err));
    }
  }, [projectId, errText]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadStructure();
  }, [loadStructure]);

  // Keep the custom-section draft in step with the selected section.
  useEffect(() => {
    const entry = structure.find((s) => s.key === selectedKey);
    setCustomDraft(entry?.is_custom
      ? { title: entry.title ?? "", body: entry.body ?? "" }
      : null);
  }, [selectedKey, structure]);

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

  // ------------------------------------------------------ §2.5 structure ops
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id || !projectId) return;
    const oldIndex = structure.findIndex((s) => s.key === active.id);
    const newIndex = structure.findIndex((s) => s.key === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(structure, oldIndex, newIndex);
    setStructure(reordered); // optimistic — the list follows the pointer
    setStructureBusy(true);
    try {
      const data = await reorderReportStructure(
        projectId, reordered.map((s) => s.key));
      setStructure(data.sections);
      toast("Section order saved — the next report prints in this order.",
        "success");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
      await loadStructure();
    } finally {
      setStructureBusy(false);
    }
  };

  const handleToggle = async (entry: ReportStructureEntry, next: boolean) => {
    if (!projectId) return;
    setStructure((prev) => prev.map((s) =>
      s.key === entry.key ? { ...s, is_enabled: next } : s));
    setStructureBusy(true);
    try {
      const data = await toggleReportSection(projectId, entry.key, next);
      setStructure(data.sections);
      toast(next
        ? `${entry.label} will be included in the report.`
        : `${entry.label} is now excluded from the report (re-enable any time).`,
        "info");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
      await loadStructure();
    } finally {
      setStructureBusy(false);
    }
  };

  const handleAddCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    const title = addTitle.trim();
    if (!title) {
      toast("Give the custom section a title.", "error");
      return;
    }
    setStructureBusy(true);
    try {
      const data = await addReportCustomSection(projectId, title, addBody);
      setStructure(data.sections);
      const added = data.sections[data.sections.length - 1];
      if (added?.is_custom) setSelectedKey(added.key);
      toast(`Custom section “${title}” added at the end of the document.`,
        "success");
      setAddOpen(false);
      setAddTitle("");
      setAddBody("");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setStructureBusy(false);
    }
  };

  const handleSaveCustom = async () => {
    if (!projectId || !customDraft || !selectedKey) return;
    setStructureBusy(true);
    try {
      const data = await updateReportCustomSection(projectId, selectedKey, {
        title: customDraft.title.trim(),
        body: customDraft.body,
      });
      setStructure(data.sections);
      toast("Custom section saved.", "success");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setStructureBusy(false);
    }
  };

  const handleDeleteCustom = async (entry: ReportStructureEntry) => {
    if (!projectId) return;
    if (!window.confirm(
      `Remove the custom section “${entry.label}” from the report? `
      + "This cannot be undone.")) {
      return;
    }
    setStructureBusy(true);
    try {
      const data = await deleteReportCustomSection(projectId, entry.key);
      setStructure(data.sections);
      setSelectedKey((prev) =>
        prev === entry.key ? (data.sections[0]?.key ?? null) : prev);
      toast("Custom section removed.", "info");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setStructureBusy(false);
    }
  };

  // ------------------------------------------------------------- rendering
  const cmsByKey = useMemo(
    () => Object.fromEntries(sections.map((s) => [s.key, s])),
    [sections],
  );

  const dirtyCount = useMemo(
    () => sections.filter((s) => (drafts[s.key] ?? "") !== (s.body ?? "")).length,
    [sections, drafts],
  );

  const handleSaveAll = async () => {
    if (!cmsPassword) {
      toast("Enter the report-CMS password to save changes.", "error");
      return;
    }
    const dirty = sections.filter(
      (s) => (drafts[s.key] ?? "") !== (s.body ?? ""));
    if (!dirty.length) return;
    let saved = 0;
    for (const section of dirty) {
      if (section.computed && !projectId) continue;
      try {
        await saveReportCmsSection(section.key, drafts[section.key] ?? "", {
          ...sectionScope(section),
          cmsPassword,
        });
        saved += 1;
      } catch (err: any) {
        toast(`⚠️ ${section.label}: ${errText(err)}`, "error");
      }
    }
    if (saved) {
      toast(`Saved ${saved} section${saved === 1 ? "" : "s"}.`, "success");
      await load();
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

  /** One CMS wording editor (label, badge, help, textarea, count, actions). */
  const CmsSectionEditor = ({ section }: { section: ReportCmsSection }) => {
    const locked = section.source === "unavailable"
      || (section.computed === true && !projectId);
    const draft = drafts[section.key] ?? "";
    const max = section.max_length ?? null;
    return (
      <div className="p-4 rounded-xl border border-gray-100 bg-white">
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
          value={draft}
          onChange={(e) =>
            setDrafts((prev) => ({ ...prev, [section.key]: e.target.value }))
          }
          disabled={locked}
          placeholder={locked
            ? "No recorded wording — nothing to edit yet."
            : undefined}
          className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-400 resize-y font-medium leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <p className="text-[10px] text-gray-400 mt-1.5 font-semibold tabular-nums">
          Character Count: {draft.length}{max ? `/${max}` : ""}
          {max && draft.length > max
            ? " — over the advised length; the report will still print it."
            : max ? " (advised maximum)" : ""}
        </p>
      </div>
    );
  };

  /** One draggable row of the SECTIONS list. */
  const SortableSectionRow = ({ entry }: { entry: ReportStructureEntry }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: entry.key });
    const selected = selectedKey === entry.key;
    return (
      <li
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border text-xs transition-colors ${
          isDragging
            ? "border-blue-300 bg-blue-50 shadow-sm z-10"
            : selected
              ? "border-[#022C4F]/30 bg-slate-100"
              : "border-transparent bg-white hover:bg-slate-50"
        } ${entry.is_enabled ? "" : "opacity-55"}`}
      >
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-1 text-gray-300 hover:text-gray-500 cursor-grab active:cursor-grabbing touch-none shrink-0"
          title="Drag to reorder"
          aria-label={`Reorder ${entry.label}`}
        >
          <GripVertical size={14} />
        </button>
        <input
          type="checkbox"
          checked={entry.is_enabled}
          onChange={(e) => handleToggle(entry, e.target.checked)}
          className="cursor-pointer shrink-0"
          title={entry.is_enabled
            ? "Included in the report — uncheck to exclude"
            : "Excluded from the report — check to include"}
          aria-label={`${entry.is_enabled ? "Exclude" : "Include"} ${entry.label}`}
        />
        <button
          type="button"
          onClick={() => setSelectedKey(entry.key)}
          className={`flex-1 text-left truncate font-semibold cursor-pointer ${
            selected ? "text-[#022C4F]" : "text-gray-700"
          }`}
          title={entry.label}
        >
          {entry.label}
          {entry.is_custom && (
            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-violet-100 text-violet-800 text-[9px] font-bold uppercase">
              custom
            </span>
          )}
        </button>
      </li>
    );
  };

  const selectedEntry = structure.find((s) => s.key === selectedKey) ?? null;

  /** The right pane for the selected section. */
  const contentPane = () => {
    if (!selectedEntry) return null;
    if (selectedEntry.is_custom) {
      return (
        <div className="p-4 rounded-xl border border-gray-100 bg-white">
          <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
            <span className="text-xs font-bold text-gray-900">
              SECTION CONTENT — custom section
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveCustom}
                disabled={structureBusy || !customDraft
                  || !customDraft.title.trim()}
                className="px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-[11px] font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Save size={12} />
                <span>{structureBusy ? "Saving…" : "Save Section"}</span>
              </button>
              <button
                onClick={() => handleDeleteCustom(selectedEntry)}
                disabled={structureBusy}
                className="px-3 py-1.5 bg-white border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-[11px] font-bold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Trash2 size={12} />
                <span>Remove</span>
              </button>
            </div>
          </div>
          <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
            Section title
          </label>
          <input
            value={customDraft?.title ?? ""}
            onChange={(e) => setCustomDraft((prev) =>
              prev ? { ...prev, title: e.target.value } : prev)}
            maxLength={200}
            className="w-full mb-3 p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs outline-none focus:border-blue-400"
          />
          <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
            Section body (blank lines separate paragraphs; **bold** supported)
          </label>
          <textarea
            rows={8}
            value={customDraft?.body ?? ""}
            onChange={(e) => setCustomDraft((prev) =>
              prev ? { ...prev, body: e.target.value } : prev)}
            placeholder="The wording this custom section prints in the report."
            className="w-full p-3 bg-slate-50 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:border-blue-400 resize-y font-medium leading-relaxed"
          />
          <p className="text-[11px] text-gray-400 mt-2 leading-relaxed">
            Custom sections print in the report at the position they hold in
            the list on the left — drag to move them.
          </p>
        </div>
      );
    }
    const cmsKeys = SECTION_CMS_KEYS[selectedEntry.key] ?? [];
    if (!cmsKeys.length) {
      return (
        <div className="p-5 rounded-xl border border-gray-100 bg-white">
          <span className="text-xs font-bold text-gray-900 block mb-2">
            SECTION CONTENT — {selectedEntry.label}
          </span>
          <p className="text-[11px] text-gray-500 leading-relaxed px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100">
            {SYSTEM_GENERATED_NOTICE}
          </p>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <span className="text-xs font-bold text-gray-900 block">
          SECTION CONTENT — {selectedEntry.label}
        </span>
        {cmsKeys.map((key) =>
          cmsByKey[key]
            ? <CmsSectionEditor key={key} section={cmsByKey[key]} />
            : null,
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-[#022C4F] flex items-center gap-2">
            <FileEdit size={18} className="text-amber-600" />
            Document Editor
          </h3>
          <p className="text-xs text-gray-500 mt-0.5 max-w-2xl">
            Arrange the report&apos;s sections and edit its editable wording —
            every change below is real: the next generated report (PDF and
            Word) prints exactly this document. Wording saves need the
            report-CMS password (Directors only); formulas, result tables and
            every figure stay server-computed.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleSaveAll}
            disabled={!dirtyCount}
            className="px-3.5 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-40"
            title={dirtyCount
              ? `Save the ${dirtyCount} unsaved wording section${dirtyCount === 1 ? "" : "s"}`
              : "No unsaved wording changes"}
          >
            <Save size={14} />
            <span>Save{dirtyCount ? ` (${dirtyCount})` : ""}</span>
          </button>
          {onPreview && (
            <button
              onClick={onPreview}
              className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Eye size={14} />
              <span>Preview</span>
            </button>
          )}
          <button
            onClick={() => setPwOpen((v) => !v)}
            className="px-3.5 py-2 bg-white border border-gray-200 hover:bg-slate-50 text-gray-700 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
          >
            {passwordSet ? <KeyRound size={14} /> : <Lock size={14} />}
            <span className="hidden sm:inline">
              {passwordSet ? "Change CMS Password" : "Set CMS Password"}
            </span>
          </button>
        </div>
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
            set one before any template section can be edited. Section order,
            inclusions and custom sections work without it.
          </span>
        </div>
      )}

      {/* Save/revert credentials + scope */}
      <div className="p-4 border-b border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
        <div className="sm:col-span-2">
          <label className="text-[10px] font-bold uppercase text-gray-500 block mb-1">
            CMS password (required to save or revert wording)
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
            Apply wording to ALL projects
          </label>
        ) : (
          <span className="text-[11px] text-gray-400 leading-snug">
            No project selected — wording edits apply platform-wide.
          </span>
        )}
      </div>

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
      ) : projectId ? (
        structureError ? (
          <div className="p-12 text-center text-rose-600 text-xs">
            <AlertTriangle size={32} className="mx-auto text-rose-300 mb-2" />
            <p className="font-semibold">
              The report structure could not be loaded
            </p>
            <p className="text-gray-400 mt-1">{structureError}</p>
          </div>
        ) : (
          /* §2.5 wireframe body: SECTIONS list + SECTION CONTENT pane. */
          <div className="p-4 grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
            <div className="rounded-xl border border-gray-100 bg-slate-50/60 p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  Sections
                </span>
                <span className="text-[10px] text-gray-400 font-semibold">
                  {structureBusy ? "Saving…" : "Drag to reorder"}
                </span>
              </div>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={structure.map((s) => s.key)}
                  strategy={verticalListSortingStrategy}
                >
                  <ul className="space-y-1">
                    {structure.map((entry) => (
                      <SortableSectionRow key={entry.key} entry={entry} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
              {addOpen ? (
                <form onSubmit={handleAddCustom} className="mt-3 space-y-2">
                  <input
                    autoFocus
                    value={addTitle}
                    onChange={(e) => setAddTitle(e.target.value)}
                    maxLength={200}
                    placeholder="New section title"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400"
                  />
                  <textarea
                    value={addBody}
                    onChange={(e) => setAddBody(e.target.value)}
                    rows={4}
                    placeholder="Section wording (optional — can be edited later)"
                    className="w-full p-2.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400 resize-y"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={structureBusy}
                      className="px-3 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-[11px] font-bold disabled:opacity-50 cursor-pointer"
                    >
                      Add Section
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddOpen(false); setAddTitle(""); setAddBody(""); }}
                      className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-slate-50 text-gray-600 rounded-lg text-[11px] font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setAddOpen(true)}
                  disabled={structureBusy}
                  className="mt-3 w-full px-3 py-2 bg-white border border-dashed border-gray-300 hover:border-[#022C4F]/40 hover:bg-slate-50 text-gray-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Plus size={13} />
                  Add Custom Section
                </button>
              )}
              <p className="mt-3 text-[10px] text-gray-400 leading-relaxed">
                Checked sections print in the report, in this order. Unchecking
                removes a section from the generated document (nothing is
                deleted); custom sections can be removed entirely.
              </p>
            </div>
            <div>{contentPane()}</div>
          </div>
        )
      ) : (
        /* No project: wording editors only — section order is per-project. */
        <div className="p-4 space-y-3">
          <p className="px-3 py-2.5 rounded-lg bg-slate-50 border border-gray-100 text-[11px] text-gray-500 leading-relaxed">
            <strong>No project selected.</strong> Wording editors below apply
            platform-wide. Select a project above to arrange its sections —
            order, inclusions and custom sections are configured per project.
          </p>
          {sections.map((section) => (
            <CmsSectionEditor key={section.key} section={section} />
          ))}
        </div>
      )}
    </div>
  );
}
