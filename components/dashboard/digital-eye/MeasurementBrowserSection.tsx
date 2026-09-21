"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, Download, RefreshCw } from "lucide-react";
import {
  curveTypeLabel,
  exportPunditMeasurementsJson,
  formatVelocityMs,
  getPunditTests,
  type MeasurementExportFilters,
  type PunditTest,
} from "@/services/digitalEye";

/** The filters this browser can put on the table and on the export. Held as
 *  one shape so the two can never be given different values. */
interface BrowserFilters {
  dateFrom: string;
  dateTo: string;
  operator: string;
  curve: string;
}

const NO_FILTERS: BrowserFilters = {
  dateFrom: "",
  dateTo: "",
  operator: "",
  curve: "",
};

/** A stored timestamp as a plain calendar date, or "—". en-GB to match the BS
 *  standards the readings are assessed against. Two honest states produce the
 *  same dash and are both distinct from a date: nothing recorded, and something
 *  recorded that will not parse. */
function formatDay(value?: string | null): string {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";
  return parsed.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** One rendered line: a single measurement point. */
interface PointRow {
  key: string;
  date: string;
  point: string;
  testReference: string;
  velocityMs: number | null;
  strengthMpa: number | null;
  curveType: string | null;
}

/**
 * The reporting browser (spec A5): filter the recorded measurements, read them
 * as a table, and export exactly that view as JSON.
 *
 * Three rules this section holds to, all of them about not letting the screen
 * overstate what it knows:
 *
 * 1. **The table is the server's own filtered result.** Filtering happens in
 *    the query, not in the browser, so what is shown and what the export writes
 *    are produced by the same code path and cannot drift apart.
 * 2. **The dropdown options come from the data.** They are built from the
 *    project's real recorded operators and curves, so the UI can never offer an
 *    operator or a curve that no record carries.
 * 3. **What the filters cannot reach is stated.** A test with no recorded
 *    operator can never match an operator filter, and one with no test date can
 *    never match a date range — so those rows are absent from a filtered view.
 *    The counts are shown next to the filters rather than left to be discovered.
 */
export default function MeasurementBrowserSection({
  projectId,
}: {
  projectId?: string;
}) {
  const [open, setOpen] = useState(false);

  // The rows the table shows — fetched with the APPLIED filters.
  const [tests, setTests] = useState<PunditTest[]>([]);
  // The project's unfiltered set, used ONLY to build the dropdown options. Kept
  // separate deliberately: deriving the options from the filtered list would
  // shrink the operator dropdown to the operators already filtered for, so a
  // second operator could never be selected.
  const [optionSource, setOptionSource] = useState<PunditTest[]>([]);
  const [optionsFailed, setOptionsFailed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Draft is what the inputs hold; applied is what the query was built from.
  // They are split so typing a date does not fire a request per keystroke.
  const [draft, setDraft] = useState<BrowserFilters>(NO_FILTERS);
  const [applied, setApplied] = useState<BrowserFilters>(NO_FILTERS);
  // The project the two above were set for. An operator recorded on project A
  // is not a filter anyone means on project B, and carrying it across would
  // return nothing for B and read as "no measurements recorded".
  const [filtersProject, setFiltersProject] = useState<string | undefined>(
    projectId,
  );
  const [exportedAt, setExportedAt] = useState<string | null>(null);

  // Declared BEFORE the load effect below, so a project switch clears the
  // filters first and the load never runs against the previous project's.
  useEffect(() => {
    if (filtersProject === projectId) return;
    setDraft(NO_FILTERS);
    setApplied(NO_FILTERS);
    setFiltersProject(projectId);
  }, [projectId, filtersProject]);

  const loadRows = useCallback(async () => {
    // A project switch is mid-flight: its filters are cleared by the effect
    // above and the reload that follows will use them.
    if (filtersProject !== projectId) return;
    setLoading(true);
    setError(null);
    try {
      const rows = await getPunditTests({
        project: projectId || undefined,
        date_from: applied.dateFrom || undefined,
        date_to: applied.dateTo || undefined,
        operator: applied.operator || undefined,
        curve: applied.curve || undefined,
      });
      setTests(rows);
    } catch (err: any) {
      setError(
        err?.response?.data?.detail ||
          err?.message ||
          "The recorded measurements could not be loaded.",
      );
      setTests([]);
    } finally {
      setLoading(false);
    }
  }, [projectId, applied, filtersProject]);

  useEffect(() => {
    if (open) loadRows();
  }, [open, loadRows]);

  // The options list is an affordance, not data: a failure to load it must not
  // blank the table, but it must not pass silently either — the two dropdowns
  // are disabled and say why, and every other filter still works.
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      try {
        const all = await getPunditTests({ project: projectId || undefined });
        if (!cancelled) {
          setOptionSource(all);
          setOptionsFailed(false);
        }
      } catch {
        if (!cancelled) {
          setOptionSource([]);
          setOptionsFailed(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, projectId]);

  const operatorOptions = useMemo(() => {
    const seen = new Set<string>();
    for (const test of optionSource) {
      const name = (test.operator_name || "").trim();
      // An operator is recorded by a person, never inferred from the logged-in
      // account (models.py: "No fabricated operator attribution"). A test with
      // none recorded is simply absent from this list.
      if (name) seen.add(name);
    }
    return Array.from(seen).sort((a, b) => a.localeCompare(b));
  }, [optionSource]);

  const curveOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const test of optionSource) {
      for (const reading of test.readings) {
        const snapshot = reading.strength_curve_snapshot;
        if (snapshot?.curve_id) {
          byId.set(snapshot.curve_id, snapshot.name || snapshot.curve_id);
        }
      }
    }
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [optionSource]);

  // The filters that would remove a row from view without the row looking
  // filtered out. Both counts are of the real project set, and both are only
  // stated when they are non-zero and the set actually loaded.
  const unreachable = useMemo(() => {
    if (optionsFailed || optionSource.length === 0) return null;
    const noOperator = optionSource.filter(
      (t) => !(t.operator_name || "").trim(),
    ).length;
    const noDate = optionSource.filter((t) => !t.test_date).length;
    if (noOperator === 0 && noDate === 0) return null;
    const phrase = (count: number, noun: string) =>
      `${count} ${count === 1 ? "carries" : "carry"} no ${noun}`;
    const summary = [
      noOperator > 0 ? phrase(noOperator, "operator") : null,
      noDate > 0 ? phrase(noDate, "test date") : null,
    ]
      .filter(Boolean)
      .join(" and ");
    return { total: optionSource.length, summary };
  }, [optionSource, optionsFailed]);

  const rows = useMemo<PointRow[]>(() => {
    const out: PointRow[] = [];
    for (const test of tests) {
      test.readings.forEach((reading, index) => {
        // The spec's point id "COL-1-A" is the structural element plus the
        // point label. Both are recorded parts; when the test is not anchored
        // to a BIM element there is no element to name, so the test reference
        // carries the identity rather than an invented element name.
        const element = (test.structural_element_name || "").trim();
        const label = (reading.point_label || "").trim();
        out.push({
          key: `${test.id}:${index}`,
          date: formatDay(test.test_date),
          point: `${element || test.test_reference} · ${label || "—"}`,
          testReference: test.test_reference,
          velocityMs:
            reading.velocity_km_s != null ? reading.velocity_km_s * 1000 : null,
          strengthMpa: reading.ecs_mpa,
          curveType: reading.strength_curve_snapshot?.curve_type ?? null,
        });
      });
    }
    return out;
  }, [tests]);

  // A test with no per-point readings contributes no rows here — and, for the
  // same reason, none to the export, which is also built per reading. Stated
  // rather than left to look like absent data.
  const testsWithoutPoints = useMemo(
    () => tests.filter((t) => t.readings.length === 0).length,
    [tests],
  );

  const anyFilterApplied = Object.values(applied).some((v) => v !== "");

  const exportFilters = useCallback(
    (): MeasurementExportFilters => ({
      project: projectId || undefined,
      date_from: applied.dateFrom || undefined,
      date_to: applied.dateTo || undefined,
      operator: applied.operator || undefined,
      curve: applied.curve || undefined,
    }),
    [projectId, applied],
  );

  const runExport = async () => {
    setExporting(true);
    setError(null);
    try {
      const { filename, payload } = await exportPunditMeasurementsJson(
        exportFilters(),
      );
      setExportedAt(payload.meta.exported_at);
      const recorded = Object.entries(payload.meta.filters || {});
      const scope = recorded.length
        ? recorded.map(([k, v]) => `${k}=${v}`).join(", ")
        : "none";
      // The file and the table are built from the same filtered query, so they
      // should agree row for row. If they do not, something changed underneath
      // between the two reads — say so rather than let the file be trusted as
      // an exact picture of the screen.
      const mismatch = payload.meta.row_count !== rows.length;
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: {
            message: mismatch
              ? `⚠️ ${filename} holds ${payload.meta.row_count} point row(s) but the table shows ${rows.length}. The records changed while the export was being produced — reload and export again.`
              : `⬇️ ${filename} — ${payload.meta.row_count} point row(s) from ${payload.meta.test_count} test(s). Filters recorded in the file: ${scope}.`,
            type: mismatch ? "error" : "success",
          },
        }),
      );
    } catch (err: any) {
      setError(err?.message || "The export could not be produced.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <section
      className="rounded-xl border border-slate-200 bg-white p-5"
      aria-label="Measurement browser"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-2 text-left cursor-pointer"
        aria-expanded={open}
      >
        <span className="mt-0.5 text-[#6B7A85]">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </span>
        <span className="flex-1">
          <span className="font-semibold text-[#0F181F] block">
            Recorded Measurements
          </span>
          <span className="text-xs text-[#6B7A85] leading-relaxed block mt-1">
            Filter the recorded UPV measurements by date, curve and operator,
            read them point by point, and export exactly that view as JSON.
          </span>
        </span>
      </button>

      {open && (
        <div className="mt-5">
          {error && (
            <div
              className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Filters */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  From date
                </span>
                <input
                  type="date"
                  value={draft.dateFrom}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateFrom: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  To date
                </span>
                <input
                  type="date"
                  value={draft.dateTo}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, dateTo: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
                />
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Curve
                </span>
                <select
                  value={draft.curve}
                  disabled={optionsFailed || curveOptions.length === 0}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, curve: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {optionsFailed
                      ? "Options unavailable"
                      : curveOptions.length === 0
                        ? "No curve recorded on any test"
                        : "All curves"}
                  </option>
                  {curveOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[10px] font-semibold uppercase text-gray-500 mb-1">
                  Operator
                </span>
                <select
                  value={draft.operator}
                  disabled={optionsFailed || operatorOptions.length === 0}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, operator: e.target.value }))
                  }
                  className="w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs disabled:bg-slate-100 disabled:text-slate-400"
                >
                  <option value="">
                    {optionsFailed
                      ? "Options unavailable"
                      : operatorOptions.length === 0
                        ? "No operator recorded on any test"
                        : "All operators"}
                  </option>
                  {operatorOptions.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setApplied(draft)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#022C4F] hover:bg-[#033c6c] px-3 py-1.5 text-xs font-bold text-white cursor-pointer"
              >
                Apply filters
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(NO_FILTERS);
                  setApplied(NO_FILTERS);
                }}
                disabled={!anyFilterApplied && !Object.values(draft).some((v) => v !== "")}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={loadRows}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Reload
              </button>
              <button
                type="button"
                onClick={runExport}
                disabled={exporting || loading || filtersProject !== projectId}
                className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-[#0A3D2E]/30 bg-[#0A3D2E]/5 px-3 py-1.5 text-xs font-bold text-[#0A3D2E] hover:bg-[#0A3D2E]/10 disabled:opacity-50 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                {exporting ? "Exporting…" : "Export JSON"}
              </button>
            </div>

            {/* What the filters can and cannot reach. Without this, a row that
                no filter could ever match reads as a row that is not there. */}
            <p className="mt-3 text-[11px] leading-relaxed text-[#6B7A85]">
              Operators and curves are listed from the records themselves, so
              every option is one that measurements actually carry. The export
              covers exactly the rows below and records the filters that
              produced it.
              {unreachable && (
                <>
                  {" "}
                  Of the {unreachable.total} recorded test(s) in this project,{" "}
                  {unreachable.summary} — those rows cannot match the filter
                  that would select them and are absent from any filtered view.
                </>
              )}
            </p>
          </div>

          {/* Table */}
          <div className="mt-4 overflow-x-auto">
            {loading ? (
              <div className="py-10 text-center text-xs font-semibold text-gray-400 animate-pulse">
                Loading recorded measurements…
              </div>
            ) : rows.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-500">
                {anyFilterApplied
                  ? "No measurements match these filters."
                  : "No measurements recorded for this project yet."}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 font-semibold uppercase text-[11px] border-b border-gray-100">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Point</th>
                    <th className="py-2.5 px-3 text-right">UPV (m/s)</th>
                    <th className="py-2.5 px-3 text-right">Strength (MPa)</th>
                    <th className="py-2.5 px-3">Curve type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((row) => (
                    <tr key={row.key} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-gray-700 whitespace-nowrap font-mono text-[11px]">
                        {row.date}
                      </td>
                      <td className="py-2 px-3 text-gray-800">
                        {row.point}
                        <span className="block text-[10px] text-gray-400 mt-0.5">
                          {row.testReference}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-700">
                        {formatVelocityMs(row.velocityMs)}
                      </td>
                      {/* A strength that was never computed — no curve applied,
                          or the velocity fell outside the curve's recorded
                          range — is "—". A 0 here would be read as a real
                          strength, and an alarming one. */}
                      <td className="py-2 px-3 text-right font-mono text-gray-800">
                        {row.strengthMpa != null ? row.strengthMpa.toFixed(1) : "—"}
                      </td>
                      <td className="py-2 px-3 text-gray-700">
                        {row.curveType
                          ? curveTypeLabel(row.curveType)
                          : "Not recorded"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {rows.length > 0 && (
            <p className="mt-3 text-[11px] text-[#6B7A85]">
              {rows.length} point row(s) from {tests.length} test(s).
              {testsWithoutPoints > 0 && (
                <>
                  {" "}
                  {testsWithoutPoints} of those test(s) carr
                  {testsWithoutPoints === 1 ? "ies" : "y"} no per-point
                  readings, so they appear in neither this table nor the export.
                </>
              )}
              {exportedAt && (
                <> Last export produced {formatDay(exportedAt)}.</>
              )}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
