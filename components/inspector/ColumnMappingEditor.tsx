"use client";

import React from "react";
import type {
  AcceptedColumn,
  ColumnMapping,
  ColumnSuggestionResult,
} from "@/services/digitalEye";

/**
 * One row of the mapping editor: a column of an instrument's export, and what
 * the platform should read it as.
 *
 * `header` and `samples` are read from the file and are never typed. `target`
 * and `scale` are the decision, and they default to what the platform proposed
 * rather than to a blank — which is the whole point of the editor. A field
 * engineer should be confirming a proposal, not spelling a column name they
 * can only learn by opening a CSV in Notepad.
 */
export interface MappingRow {
  /** The instrument's own header text, exactly as the export spells it. */
  header: string;
  /** A few of its values as written, so a unit can be checked by eye. */
  samples?: string[];
  /** The contract key to read it as, or "" for "not imported". */
  target: string;
  /** The multiplier from the instrument's unit to the contract's. */
  scale: number;
  /** Why, in one sentence. Empty when there is nothing to say. */
  note?: string;
  /** Where the proposal came from, so the panel can say so honestly. */
  basis?: "exact" | "alias" | "declined" | "unknown";
}

/**
 * The length units an instrument might export a path length in.
 *
 * Only offered on a row mapped to `path_length_l_mm`, which is the one column
 * in the contract that carries a length unit. Offering a multiplier on every
 * row would invite a conversion nobody asked for; offering none anywhere would
 * leave the metres a PL-200 writes with no way to declare them.
 */
const LENGTH_UNITS: { value: number; label: string }[] = [
  { value: 1, label: "as written (mm)" },
  { value: 10, label: "cm → mm (×10)" },
  { value: 1000, label: "m → mm (×1000)" },
  { value: 0.001, label: "µm → mm (×0.001)" },
];

const KEY_WITH_A_LENGTH_UNIT = "path_length_l_mm";

/** Rows from a proposal the server read out of one of the instrument's files. */
export function rowsFromSuggestion(
  result: ColumnSuggestionResult
): MappingRow[] {
  return result.columns.map((column) => ({
    header: column.header,
    samples: column.samples,
    target: column.target ?? "",
    scale: column.scale,
    note: column.note,
    basis: column.basis,
  }));
}

/**
 * Rows from a mapping already saved on the device.
 *
 * Used when an inspector edits what is recorded without a file to hand. The
 * headers are the mapping's own keys, so nothing has to be typed here either.
 */
export function rowsFromMapping(mapping: ColumnMapping): MappingRow[] {
  return Object.entries(mapping || {}).map(([header, value]) => {
    if (value === null || value === undefined) {
      // Declined when it was saved, and shown as declined now. Reading it as
      // anything else would quietly re-map a column somebody set aside.
      return { header, target: "", scale: 1 };
    }
    if (typeof value === "string") {
      return { header, target: value, scale: 1 };
    }
    return {
      header,
      target: value.to ?? "",
      scale: typeof value.scale === "number" ? value.scale : 1,
    };
  });
}

/**
 * The mapping these rows amount to, in the shape the API stores.
 *
 * A row left as *not imported* is written as `null` rather than left out, and
 * the difference is not cosmetic: an omitted column is one the platform was
 * never told about, and the importer refuses the whole file over it. `null` is
 * the inspector having looked at that column and set it aside — which is the
 * only reason an instrument whose export has six columns can be read by a
 * contract that wants two.
 *
 * A scale of 1 is written as the plain key rather than as an object carrying a
 * scale of 1, so a mapping recorded here reads like every mapping recorded
 * before it and stays legible to anyone who opens the field by hand.
 */
export function rowsToMapping(rows: MappingRow[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  for (const row of rows) {
    if (!row.target) {
      mapping[row.header] = null;
      continue;
    }
    if (row.scale && row.scale !== 1) {
      mapping[row.header] = { to: row.target, scale: row.scale };
    } else {
      mapping[row.header] = row.target;
    }
  }
  return mapping;
}

/**
 * What to say about a row that is being left out.
 *
 * A column the platform recognised and declined comes with its own reason, and
 * that reason is the whole point of declining it explicitly. A column it does
 * not recognise has no reason to give — and saying nothing there would make
 * the two look identical on screen, which is precisely where a real
 * measurement would go unread without anybody noticing.
 */
function noteFor(row: MappingRow): string {
  if (row.note) return row.note;
  if (row.basis === "unknown") {
    return (
      "The platform does not recognise this column and has no basis for " +
      "setting it aside. It will not be read unless you map it to a platform " +
      "column."
    );
  }
  return "";
}

interface Props {
  rows: MappingRow[];
  /** The contract, sent by the server so the picker cannot drift from it. */
  accepted: AcceptedColumn[];
  onChange: (rows: MappingRow[]) => void;
  disabled?: boolean;
}

/**
 * The rows that fill an instrument's Export columns panel.
 *
 * Shared by the instrument card and the Telemetry Status page, because a
 * refusal arrives on the second and is fixed by saving on the first — and two
 * editors for one field is how they would come to disagree about what a
 * mapping is.
 */
export default function ColumnMappingEditor({
  rows,
  accepted,
  onChange,
  disabled = false,
}: Props) {
  const measurements = accepted.filter((c) => c.group === "measurement");
  const context = accepted.filter((c) => c.group === "context");

  const update = (index: number, patch: Partial<MappingRow>) => {
    onChange(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  if (rows.length === 0) {
    return (
      <p className="text-[11px] text-slate-500 leading-relaxed">
        No columns to map yet. Read one of this instrument&apos;s exports and
        its own column names will be listed here.
      </p>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200/70 bg-white divide-y divide-slate-200/70 overflow-hidden">
      {rows.map((row, index) => {
        const showUnit = row.target === KEY_WITH_A_LENGTH_UNIT;
        const key = `${index}-${row.header}`;
        return (
          <div key={key} className="p-3 space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="min-w-0 sm:flex-1">
                <div className="text-[11px] font-mono text-slate-800 break-all">
                  {row.header}
                </div>
                {row.samples && row.samples.length > 0 && (
                  <div className="text-[10px] font-mono text-slate-400 break-all">
                    {row.samples.slice(0, 3).join(", ")}
                  </div>
                )}
              </div>

              <select
                value={row.target}
                onChange={(e) => update(index, { target: e.target.value })}
                disabled={disabled}
                aria-label={`Read "${row.header}" as`}
                className="w-full sm:w-60 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F] disabled:opacity-60"
              >
                <option value="">— not imported —</option>
                {measurements.length > 0 && (
                  <optgroup label="Measurements">
                    {measurements.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.label}
                      </option>
                    ))}
                  </optgroup>
                )}
                {context.length > 0 && (
                  <optgroup label="Context">
                    {context.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.label}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>

              {showUnit && (
                <select
                  value={String(row.scale)}
                  onChange={(e) =>
                    update(index, { scale: Number(e.target.value) })
                  }
                  disabled={disabled}
                  aria-label={`Units for "${row.header}"`}
                  className="w-full sm:w-40 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F] disabled:opacity-60"
                >
                  {LENGTH_UNITS.map((unit) => (
                    <option key={unit.value} value={String(unit.value)}>
                      {unit.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {noteFor(row) && (
              <p
                className={
                  row.note
                    ? "text-[11px] text-slate-500 leading-relaxed"
                    : "text-[11px] text-amber-700 leading-relaxed"
                }
              >
                {noteFor(row)}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** What the platform did with each row, said plainly above the Save button. */
export function mappingSummary(rows: MappingRow[]): string {
  const mapped = rows.filter((row) => row.target);
  const left = rows.filter((row) => !row.target);
  if (mapped.length === 0) {
    return rows.length === 1
      ? "The one column in this file will not be imported."
      : `None of the ${rows.length} columns in this file will be imported.`;
  }
  const head =
    mapped.length === 1
      ? "1 column will be read."
      : `${mapped.length} columns will be read.`;
  if (left.length === 0) return head;
  return `${head} ${left.length} will not: ${left
    .map((row) => row.header)
    .join(", ")}.`;
}
