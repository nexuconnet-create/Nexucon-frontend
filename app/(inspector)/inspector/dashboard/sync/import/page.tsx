"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Upload,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Info,
  RefreshCw,
  Table,
} from "lucide-react";
import {
  commitImportBatch,
  downloadImportTemplate,
  getImportBatchStatus,
  getImportBatches,
  getImportRecordTypes,
  uploadImportFile,
  validateImportBatch,
  type ImportBatch,
  type ImportBatchStatus,
  type ImportRecordType,
} from "@/services/dataImport";
import { getAssignableProjects, getInspectorInspections } from "@/services/inspector";
import { describeBlobError } from "@/lib/apiErrors";
import { dateTimeOr, orDash } from "@/lib/display";

/**
 * The import lifecycle, in the order the server runs it.
 *
 * Rendered as a real sequence rather than as decoration: upload does not parse,
 * validate writes nothing, commit writes everything or nothing. An inspector
 * who does not know that will read a FAILED validation as a failed import and
 * re-upload the same file.
 */
const STAGES = [
  {
    key: "upload",
    label: "Store the file",
    detail: "The bytes are written and hashed. Nothing is read from them yet.",
  },
  {
    key: "validate",
    label: "Check every row",
    detail: "Each row is validated. No registry row is written.",
  },
  {
    key: "commit",
    label: "Write the rows",
    detail: "All rows are written together, or none are.",
  },
] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-slate-100 text-slate-700 border-slate-200",
  VALIDATED: "bg-blue-50 text-blue-700 border-blue-200",
  IMPORTED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  FAILED: "bg-rose-50 text-rose-700 border-rose-200",
  PARTIAL: "bg-amber-50 text-amber-700 border-amber-200",
};

function errorOf(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.error ||
    err?.message ||
    fallback
  );
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "size not recorded";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function InspectorManualImportPage() {
  const [recordTypes, setRecordTypes] = useState<ImportRecordType[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [inspections, setInspections] = useState<any[]>([]);
  const [batches, setBatches] = useState<ImportBatch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [projectId, setProjectId] = useState("");
  const [inspectionId, setInspectionId] = useState("");
  const [recordType, setRecordType] = useState("");

  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyBatchId, setBusyBatchId] = useState<string | null>(null);
  const [batchStatus, setBatchStatus] = useState<ImportBatchStatus | null>(null);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);

  const readBatches = useCallback(async () => {
    try {
      setBatches(await getImportBatches());
    } catch {
      // A failed batch-list read must not blank the form. It is reported by
      // omission here and by the upload path's own errors below; the list is
      // history, not the thing being operated on.
      //
      // KNOWN GAP (reported to the user 17 Sep 2026, NOT fixed here): this
      // branch renders as "You have not uploaded any files yet." — so a
      // dropped request tells the inspector they have never imported
      // anything, which is a claim about their own record the client just
      // failed to read. The import wizard was explicitly excluded from the
      // honesty sweep, so the fix (a `batchesError` state rendered in place
      // of the empty-list line) is left for whoever owns this surface.
      setBatches([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);
    Promise.all([
      getImportRecordTypes(),
      // The assignable list, not the registry browse. The hint under this
      // picker has always told the officer "Only projects assigned to you are
      // listed", but `/projects/` is unscoped by design and lists every
      // project on the platform — so the sentence was untrue, and the upload
      // behind it resolves the project through `scoped_projects(user)`,
      // refusing anything outside it. This returns what the upload accepts.
      getAssignableProjects(),
      getInspectorInspections(),
      getImportBatches(),
    ])
      .then(([types, projectRows, inspectionRows, batchRows]) => {
        if (cancelled) return;
        setRecordTypes(types);
        setProjects(projectRows);
        setInspections(inspectionRows);
        setBatches(batchRows);
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          errorOf(
            err,
            "The import registry could not be read from the server."
          )
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType = recordTypes.find((t) => t.record_type === recordType) || null;

  const handleTemplate = async (format: "csv" | "json") => {
    if (!recordType) return;
    setIsDownloadingTemplate(true);
    setActionError(null);
    try {
      const blob = await downloadImportTemplate(recordType, format);
      // The download is started from the blob the server returned. The filename
      // is derived from the record type rather than read from the response's
      // Content-Disposition, because the interceptor returns the body and not
      // the headers — so this names the file honestly rather than pretending to
      // reproduce the server's own name.
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `nexucon-${recordType.toLowerCase()}-template.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setNotice(
        `Template downloaded. Fill it in and upload it back — the columns are the contract, and a renamed column will be reported as a missing one.`
      );
    } catch (err) {
      setActionError(
        await describeBlobError(
          err,
          "The template could not be downloaded from the server."
        )
      );
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectId) return;
    setIsUploading(true);
    setActionError(null);
    setNotice(null);
    setBatchStatus(null);
    setUploadProgress(0);
    try {
      const batch = await uploadImportFile(
        {
          file,
          project: projectId,
          inspection: inspectionId || null,
          recordType: recordType || undefined,
        },
        setUploadProgress
      );
      setFile(null);
      setNotice(
        batch.deduplicated
          ? `These exact bytes were already uploaded as ${batch.batch_reference}. That batch was returned rather than a second copy being stored.`
          : `Stored as ${batch.batch_reference} — SHA-256 ${batch.sha256_hash.slice(0, 16)}… Nothing has been read from it yet. Validate it to check the rows.`
      );
      await readBatches();
      const status = await getImportBatchStatus(batch.id);
      setBatchStatus(status);
    } catch (err) {
      setActionError(errorOf(err, "The file could not be uploaded."));
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleValidate = async (batchId: string) => {
    setBusyBatchId(batchId);
    setActionError(null);
    setNotice(null);
    try {
      const status = await validateImportBatch(batchId);
      setBatchStatus(status);
      if (status.import_status === "VALIDATED") {
        setNotice(
          `All ${status.valid_record_count} row${
            status.valid_record_count === 1 ? "" : "s"
          } passed validation. Nothing has been written yet — commit to write them.`
        );
      } else {
        setNotice(
          `Validation refused this file: ${status.invalid_record_count} of ${status.record_count} row${
            status.record_count === 1 ? " is" : "s are"
          } invalid. Nothing was written.`
        );
      }
      await readBatches();
    } catch (err) {
      setActionError(errorOf(err, "Validation could not be run."));
    } finally {
      setBusyBatchId(null);
    }
  };

  const handleCommit = async (batchId: string) => {
    setBusyBatchId(batchId);
    setActionError(null);
    setNotice(null);
    try {
      const batch = await commitImportBatch(batchId);
      setNotice(
        `${batch.valid_record_count} record${
          batch.valid_record_count === 1 ? "" : "s"
        } written to ${batch.record_type || "the registry"}.`
      );
      await readBatches();
      setBatchStatus(await getImportBatchStatus(batchId));
    } catch (err) {
      // A refusal here means nothing was written — the rows and the status are
      // committed in one transaction. Said explicitly, because "commit failed"
      // otherwise leaves the inspector unsure whether half a file landed.
      setActionError(
        `${errorOf(err, "The import was refused.")} Nothing was written to the registry.`
      );
      await readBatches();
    } finally {
      setBusyBatchId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 mb-1">
            Manual Import is unavailable
          </h2>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            The record types, the projects and your upload history all come from
            the server. Nothing is shown in their place, because a form built
            from a guessed list of columns would file rows the registry cannot
            accept.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      <div>
        <h1 className="text-xl font-bold text-[#022C4F]">Manual Import</h1>
        <p className="text-xs text-slate-500 mt-1">
          Bring a CSV or JSON file of field readings into the registry.
        </p>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* The three stages, as the server runs them. */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STAGES.map((stage, index) => (
          <div
            key={stage.key}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-1"
          >
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Step {index + 1}
            </div>
            <div className="text-xs font-bold text-[#022C4F]">{stage.label}</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              {stage.detail}
            </p>
          </div>
        ))}
      </div>

      <form
        onSubmit={handleUpload}
        className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4"
      >
        <h2 className="text-sm font-bold text-[#022C4F]">New import</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="import-project"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Project
            </label>
            <select
              id="import-project"
              value={projectId}
              onChange={(e) => {
                setProjectId(e.target.value);
                setInspectionId("");
              }}
              required
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">Select the project this file belongs to</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.reference_number ? ` (${project.reference_number})` : ""}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              {projects.length === 0
                ? "No project is assigned to you, so no file can be filed against one."
                : "Only projects assigned to you are listed."}
            </p>
          </div>

          <div>
            <label
              htmlFor="import-inspection"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
            >
              Site visit (optional)
            </label>
            <select
              id="import-inspection"
              value={inspectionId}
              onChange={(e) => setInspectionId(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">Not tied to one visit</option>
              {inspections
                .filter((insp) => !projectId || insp.project === projectId)
                .map((insp) => (
                  <option key={insp.id} value={insp.id}>
                    {insp.inspection_reference} — {insp.inspection_type}
                  </option>
                ))}
            </select>
            <p className="text-[11px] text-slate-500 mt-1">
              A finding row must have a visit. Either name one above, or put its
              reference in the file&apos;s INSPECTION column.
            </p>
          </div>
        </div>

        <div>
          <label
            htmlFor="import-record-type"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            What the file contains
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              id="import-record-type"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
            >
              <option value="">
                Let the server decide from the file&apos;s columns
              </option>
              {recordTypes.map((type) => (
                <option key={type.record_type} value={type.record_type}>
                  {type.record_type} — {type.description}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => void handleTemplate("csv")}
              disabled={!recordType || isDownloadingTemplate}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={13} />
              <span>CSV template</span>
            </button>
            <button
              type="button"
              onClick={() => void handleTemplate("json")}
              disabled={!recordType || isDownloadingTemplate}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm flex items-center gap-1.5 disabled:opacity-50"
            >
              <Download size={13} />
              <span>JSON</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Naming the type is a claim about the file, not an instruction. If the
            bytes say something else the upload is refused and both are named —
            so a file cannot be silently reinterpreted as the wrong record type.
          </p>
        </div>

        {selectedType && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1.5">
              <Table size={12} />
              {selectedType.record_type} writes to {selectedType.model_label}
            </div>
            {selectedType.groups_consecutive_rows && (
              <p className="text-[11px] text-slate-600">
                Consecutive rows for one structural element form a single record.
              </p>
            )}
            <div className="flex flex-wrap gap-1.5">
              {selectedType.columns.map((column) => {
                const required = selectedType.required_columns.includes(column);
                return (
                  <span
                    key={column}
                    className={`px-2 py-0.5 rounded-md border text-[10px] font-mono ${
                      required
                        ? "bg-rose-50 text-rose-700 border-rose-200 font-bold"
                        : "bg-white text-slate-600 border-slate-200"
                    }`}
                  >
                    {column}
                  </span>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              Columns in red are required on every row.
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="import-file"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
          >
            File
          </label>
          <input
            id="import-file"
            type="file"
            accept=".csv,.json,.pdf,text/csv,application/json,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-xs text-slate-700 file:mr-3 file:px-3.5 file:py-2 file:rounded-xl file:border-0 file:bg-slate-100 file:text-[#022C4F] file:text-xs file:font-semibold hover:file:bg-slate-200 cursor-pointer"
          />
          {file && (
            <p className="text-[11px] text-slate-500 mt-1">
              {file.name} · {formatBytes(file.size)}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!file || !projectId || isUploading}
          className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isUploading ? (
            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Upload size={14} />
          )}
          <span>
            {isUploading
              ? `Storing… ${Math.round(uploadProgress * 100)}%`
              : "Store and check"}
          </span>
        </button>

        <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
          <Info size={12} className="shrink-0 mt-0.5" />
          <span>
            A PDF is accepted and stored, and validation will refuse it with the
            reason: reading a table out of a PDF means guessing which column
            holds which measurement, and a mis-mapped transit time would corrupt
            a statutory registry silently. Use CSV or JSON.
          </span>
        </p>
      </form>

      {/* The batch just operated on, with its per-row refusals. */}
      {batchStatus && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-[#022C4F]">
              {batchStatus.batch_reference}
            </h2>
            <span
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                STATUS_STYLES[batchStatus.import_status] ||
                "bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {batchStatus.import_status}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Rows read", value: batchStatus.record_count },
              { label: "Valid", value: batchStatus.valid_record_count },
              { label: "Invalid", value: batchStatus.invalid_record_count },
              { label: "Skipped", value: batchStatus.skipped_row_count },
            ].map((tile) => (
              <div
                key={tile.label}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="text-lg font-bold text-[#022C4F]">{tile.value}</div>
                <div className="text-[11px] text-slate-500">{tile.label}</div>
              </div>
            ))}
          </div>

          <div className="text-[11px] text-slate-500 font-mono break-all">
            {batchStatus.file_name} · SHA-256 {batchStatus.sha256_hash}
          </div>

          {batchStatus.errors.length > 0 && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/60 overflow-hidden">
              <div className="px-3 py-2 text-[11px] font-bold text-rose-800 border-b border-rose-200">
                {batchStatus.error_count} row
                {batchStatus.error_count === 1 ? "" : "s"} refused
                {batchStatus.errors_truncated
                  ? " — this list is capped, and the counts above are complete"
                  : ""}
              </div>
              <div className="divide-y divide-rose-100 max-h-80 overflow-y-auto">
                {batchStatus.errors.map((row, index) => (
                  <div key={index} className="px-3 py-2 text-[11px] text-rose-800">
                    <span className="font-mono font-bold">
                      {row.row_label ||
                        (row.row_number ? `Row ${row.row_number}` : "Row")}
                    </span>
                    {" — "}
                    {String(row.message || row.error || JSON.stringify(row))}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleValidate(batchStatus.id)}
              disabled={busyBatchId === batchStatus.id}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
            >
              {busyBatchId === batchStatus.id ? "Working…" : "Re-run validation"}
            </button>
            <button
              type="button"
              onClick={() => void handleCommit(batchStatus.id)}
              disabled={
                busyBatchId === batchStatus.id ||
                !batchStatus.can_commit ||
                batchStatus.import_status === "IMPORTED"
              }
              className="px-3.5 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer disabled:opacity-50"
            >
              {batchStatus.import_status === "IMPORTED"
                ? "Already written"
                : "Write these rows"}
            </button>
          </div>

          {!batchStatus.can_commit && batchStatus.import_status !== "IMPORTED" && (
            <p className="text-[11px] text-amber-700">
              This batch cannot be written yet — the server only commits a batch
              whose every row passed validation. A file with 9 good rows and 1
              bad one writes nothing at all, which is why the counts above are
              shown rather than only the verdict.
            </p>
          )}
        </div>
      )}

      {/* Upload history */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-[#022C4F]">Your uploads</h2>
          <button
            type="button"
            onClick={() => void readBatches()}
            className="p-2 rounded-xl bg-white border border-slate-200/80 hover:bg-slate-50 text-slate-600 transition-colors shadow-sm cursor-pointer"
            title="Re-read your upload history"
          >
            <RefreshCw size={14} />
          </button>
        </div>

        {batches.length === 0 ? (
          <p className="text-xs text-slate-500">
            You have not uploaded any files yet.
          </p>
        ) : (
          <div className="space-y-2">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                    <FileSpreadsheet size={13} className="shrink-0 text-slate-400" />
                    <span className="break-all">{batch.file_name}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {batch.batch_reference} · {orDash(batch.record_type, "type not recorded")} ·{" "}
                    {batch.record_count} row{batch.record_count === 1 ? "" : "s"}
                    {batch.invalid_record_count > 0
                      ? ` (${batch.invalid_record_count} invalid)`
                      : ""}{" "}
                    · {dateTimeOr(batch.created_at, "at an unrecorded time")}
                  </div>
                  {batch.imported_at && (
                    <div className="text-[11px] text-emerald-700">
                      Written {dateTimeOr(batch.imported_at, "at an unrecorded time")}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                      STATUS_STYLES[batch.import_status] ||
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    {batch.import_status}
                  </span>
                  <button
                    type="button"
                    onClick={() => void handleValidate(batch.id)}
                    disabled={busyBatchId === batch.id || batch.import_status === "IMPORTED"}
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Validate
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCommit(batch.id)}
                    disabled={
                      busyBatchId === batch.id ||
                      !batch.can_commit ||
                      batch.import_status === "IMPORTED"
                    }
                    className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    Write
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {batches.some((b) => b.import_status === "FAILED") && (
          <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
            <AlertTriangle size={12} className="shrink-0 mt-0.5 text-amber-600" />
            <span>
              A FAILED batch was read and refused. Nothing from it is in the
              registry, and the file is still stored — open it here to see which
              rows were refused.
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
