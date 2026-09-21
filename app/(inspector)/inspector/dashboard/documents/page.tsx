"use client";

import React, { useState, useEffect } from "react";
import {
  FolderOpen,
  FileText,
  Download,
  ExternalLink,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { getInspectorDocuments } from "@/services/inspector";
import { Document } from "@/services/documents";
import { orDash, dateOr } from "@/lib/display";

/**
 * Document groups, mapped onto the backend's real `document_type` values.
 *
 * The chips on this page used to read "Permits", "Drawings", "Technical
 * Reports", "Compliance" — labels that matched nothing in the API and filtered
 * a hardcoded array. These are the groups `DocumentViewSet` actually
 * understands, sent as the `type` query parameter, so every chip is a real
 * server-side filter.
 */
const DOCUMENT_GROUPS: { label: string; type?: string }[] = [
  { label: "All Documents" },
  { label: "Permits", type: "PERMIT_ATTACHMENT" },
  { label: "Drawings", type: "DRAWING" },
  { label: "Technical Reports", type: "TECHNICAL_REPORT" },
  { label: "Compliance", type: "COMPLIANCE_DOCUMENT" },
  { label: "Inspection Reports", type: "INSPECTION_REPORT" },
  { label: "Approvals", type: "APPROVAL_RECORD" },
];

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  CHANGES_REQUESTED: "bg-rose-50 text-rose-700 border-rose-200",
  REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRED: "bg-rose-50 text-rose-700 border-rose-200",
  EXPIRING_SOON: "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED: "bg-slate-100 text-slate-600 border-slate-200",
};

const humanise = (value?: string | null) =>
  value ? value.replace(/_/g, " ").toLowerCase().replace(/^./, (c) => c.toUpperCase()) : null;

export default function InspectorDocumentsPage() {
  const [groupIndex, setGroupIndex] = useState(0);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorDocuments({
        document_type: DOCUMENT_GROUPS[groupIndex].type,
      });
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setDocuments([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.response?.data?.error ||
          err?.message ||
          "Could not reach the documents register."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [groupIndex]);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
            <FolderOpen size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Statutory &amp; Project Documents
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
              Permits, drawings, technical reports and certificates registered against the projects in your scope.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchDocuments}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh documents"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {DOCUMENT_GROUPS.map((group, idx) => (
          <button
            key={group.label}
            type="button"
            onClick={() => setGroupIndex(idx)}
            className={`px-3.5 py-2 rounded-xl text-xs transition-colors cursor-pointer shrink-0 shadow-sm ${
              groupIndex === idx
                ? "bg-[#022C4F] text-white font-bold"
                : "bg-white text-slate-600 hover:text-[#022C4F] border border-slate-200/80 font-medium"
            }`}
          >
            {group.label}
          </button>
        ))}
      </div>

      {/* Documents Table */}
      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            The documents register could not be read
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is listed because nothing could be read. This is not an
            empty register.
          </p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-20 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <FolderOpen size={36} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No Documents In This Group
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No documents of this type have been registered against the projects
            in your scope. Documents are uploaded against a project, not from
            this screen.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm">
          <div className="divide-y divide-slate-100">
            {documents.map((doc) => {
              // The two controls here used to render with no handler at all —
              // a Download and a View button that did nothing on every row.
              // They are now rendered only when the record actually carries a
              // file location; a button that cannot act is not shown.
              const href = doc.file_url || null;
              return (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-[#022C4F]/5 border border-[#022C4F]/10 text-[#022C4F] flex items-center justify-center shrink-0">
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs sm:text-sm font-bold text-[#022C4F] truncate">
                        {orDash(doc.title, "Document title not recorded")}
                      </h3>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-0.5">
                        <span className="font-mono text-[11px]">
                          {orDash(doc.document_reference, "No reference")}
                        </span>
                        <span>&bull;</span>
                        <span>{orDash(doc.project_name, "Project not recorded")}</span>
                        <span>&bull;</span>
                        <span>{orDash(humanise(doc.discipline), "Discipline not recorded")}</span>
                        {doc.file_size && (
                          <>
                            <span>&bull;</span>
                            <span>{doc.file_size}</span>
                          </>
                        )}
                        <span>&bull;</span>
                        <span>{dateOr(doc.created_at)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            STATUS_STYLES[doc.status] ||
                            "bg-slate-100 text-slate-600 border-slate-200"
                          }`}
                        >
                          {orDash(humanise(doc.status), "Status not recorded")}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {orDash(doc.current_version, "Version not recorded")}
                        </span>
                        {doc.is_digitally_stamped && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200 inline-flex items-center gap-1">
                            <ShieldCheck size={11} />
                            <span>Digitally stamped</span>
                          </span>
                        )}
                        {doc.expiry_status === "expired" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-rose-50 text-rose-700 border-rose-200 inline-flex items-center gap-1">
                            <AlertTriangle size={11} />
                            <span>Expired {dateOr(doc.expiry_date)}</span>
                          </span>
                        )}
                        {doc.expiry_status === "expiring_soon" && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border bg-amber-50 text-amber-700 border-amber-200 inline-flex items-center gap-1">
                            <AlertTriangle size={11} />
                            <span>Expires {dateOr(doc.expiry_date)}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {href ? (
                      <>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer shadow-sm"
                          title="Open document"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <a
                          href={href}
                          download
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer shadow-sm"
                          title="Download document"
                        >
                          <Download size={14} />
                        </a>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2">
                        No file attached to this record
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
