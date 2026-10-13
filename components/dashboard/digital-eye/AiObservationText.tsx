"use client";

import React from "react";

/**
 * Renders one AI observation the way the certified report prints it.
 *
 * A run that answers in prose rather than tables arrives as markdown: a
 * lead-in line, a `| … |` table, then whatever the writer added after it.
 * This shows each part as what it is — a real table, real paragraphs —
 * instead of printing the pipes and dashes on screen.
 */

type ObservationBlock =
  | { kind: "text"; body: string }
  | { kind: "table"; headers: string[]; rows: string[][] };

const SEPARATOR_ROW = /^\|?[\s:|-]*-[\s:|-]*\|?$/;

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

export function parseObservationBlocks(text: string): ObservationBlock[] {
  const blocks: ObservationBlock[] = [];
  let textLines: string[] = [];
  let tableLines: string[] = [];

  const flushText = () => {
    const body = textLines.join("\n").trim();
    textLines = [];
    if (body) blocks.push({ kind: "text", body });
  };

  const flushTable = () => {
    if (tableLines.length === 0) return;
    const parsed = tableLines
      .filter((line) => !SEPARATOR_ROW.test(line))
      .map(splitTableRow);
    tableLines = [];
    if (parsed.length >= 2) {
      const headers = parsed[0];
      const rows = parsed
        .slice(1)
        .map((row) => [...row, ...Array(Math.max(0, headers.length - row.length))].slice(0, headers.length));
      blocks.push({ kind: "table", headers, rows });
    } else if (parsed.length === 1) {
      blocks.push({ kind: "text", body: parsed[0].join(" ") });
    }
  };

  for (const line of String(text ?? "").split(/\r?\n/)) {
    if (line.trim().startsWith("|")) {
      flushText();
      tableLines.push(line.trim());
    } else {
      flushTable();
      textLines.push(line);
    }
  }
  flushTable();
  flushText();
  return blocks;
}

/** `**bold**` runs the report prints bold are printed bold here too. */
function Inline({ text }: { text: string }) {
  const parts = String(text ?? "").split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, index) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
          <strong key={index} className="font-bold">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={index}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export default function AiObservationText({
  text,
  tone = "light",
  className = "",
}: {
  text: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  const source = String(text ?? "");
  const blocks = parseObservationBlocks(source);

  if (!blocks.some((block) => block.kind === "table")) {
    return <Inline text={source} />;
  }

  const border = tone === "dark" ? "border-slate-700" : "border-gray-200";
  const headBg = tone === "dark" ? "bg-slate-900" : "bg-slate-100";
  const headText = tone === "dark" ? "text-slate-200" : "text-gray-700";

  return (
    <div className={`space-y-2 ${className}`}>
      {blocks.map((block, index) =>
        block.kind === "table" ? (
          <div key={index} className="overflow-x-auto">
            <table className={`w-full text-[11px] border-collapse ${border}`}>
              <thead>
                <tr>
                  {block.headers.map((header, column) => (
                    <th
                      key={column}
                      className={`border ${border} ${headBg} ${headText} px-1.5 py-1 text-left font-bold uppercase tracking-wide text-[10px]`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 1 ? (tone === "dark" ? "bg-slate-900/40" : "bg-slate-50/70") : ""}>
                    {row.map((cell, column) => (
                      <td key={column} className={`border ${border} px-1.5 py-1 align-top`}>
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p key={index} className="leading-relaxed">
            <Inline text={block.body} />
          </p>
        )
      )}
    </div>
  );
}
