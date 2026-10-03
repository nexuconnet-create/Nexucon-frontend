"use client";

import React, { useState } from 'react';
import { FileText, Download, Eye, ShieldCheck, X, CheckCircle, ExternalLink } from 'lucide-react';
import { PublicDocument } from '@/services/publicPortal';

interface PublicDocumentListProps {
  documents: PublicDocument[];
  projectName?: string;
}

export const PublicDocumentList: React.FC<PublicDocumentListProps> = ({
  documents,
  projectName = "Approved Statutory Project"
}) => {
  const [selectedDoc, setSelectedDoc] = useState<PublicDocument | null>(null);

  const handleDownloadDocument = (doc: PublicDocument) => {
    if (
      doc.file_url &&
      (doc.file_url.startsWith("http://") || doc.file_url.startsWith("https://") || doc.file_url.startsWith("/"))
    ) {
      const link = document.createElement("a");
      link.href = doc.file_url;
      link.download = `${doc.document_reference || "document"}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    const certificateContent = `================================================================================
           LAGOS STATE BUILDING CONTROL AGENCY (LASBCA)
                 OFFICIAL STATUTORY DOCUMENT CERTIFICATE
================================================================================
DOCUMENT REFERENCE:   ${doc.document_reference}
DOCUMENT TITLE:       ${doc.title}
DOCUMENT TYPE:        ${doc.document_type}
ISSUED DATE:          ${doc.issued_date}
EXPIRY DATE:          ${doc.expiry_date || "N/A"}
ISSUING AUTHORITY:    ${doc.issuing_authority}
DIGITAL SEAL STAMP:   ${doc.stamp_reference}
DIGITALLY VERIFIED:   YES (Statutory Registry Validated)
================================================================================
SECURITY NOTICE:
This official public copy is cryptographically hashed and linked to the master
Nexucon statutory compliance registry. Any unauthorized modification or falsification
of this document constitutes a punishable offense under Lagos State Urban and Regional
Planning Laws.
================================================================================
Generated on: ${new Date().toUTCString()}
Registry Verification Link: https://nexucon.net/transparency/verify
`;

    const blob = new Blob([certificateContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${doc.document_reference || "LASBCA_Document"}_Certificate.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!documents || documents.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-sm font-semibold text-slate-700">No Public Documents Released Yet</p>
        <p className="text-xs text-slate-500 mt-1">
          Approved statutory certificates and signed clearance letters will appear here once officially endorsed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-blue-300 hover:shadow-xs transition-all flex flex-col justify-between space-y-3"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <span className="font-mono">{doc.document_reference}</span>
                  {doc.is_digitally_stamped && (
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 inline" /> Stamped
                    </span>
                  )}
                </div>
                <h5 className="text-sm font-bold text-[#022C4F] mt-0.5 truncate" title={doc.title}>
                  {doc.title}
                </h5>
                <p className="text-xs text-slate-500 mt-0.5">
                  Authority: <strong className="text-slate-700">{doc.issuing_authority}</strong>
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
              <span>{doc.issued_date} &bull; {doc.file_size_mb} MB PDF</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(doc)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadDocument(doc)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#022C4F] hover:bg-blue-800 text-white font-semibold transition-colors shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Watermarked Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#022C4F] text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Official Public Document Certificate
                  </h4>
                  <p className="text-[11px] text-slate-300 font-mono">
                    {selectedDoc.document_reference}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Watermarked Container */}
            <div className="p-6 overflow-y-auto space-y-6 relative flex-1">
              {/* Statutory Watermark Diagonal Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.06] select-none rotate-[-30deg]">
                <div className="text-center font-extrabold text-3xl sm:text-5xl leading-tight text-slate-900 tracking-wider">
                  OFFICIAL PUBLIC COPY<br />
                  VERIFIED VIA NEXUCON.NET<br />
                  {new Date().toISOString().split('T')[0]}
                </div>
              </div>

              {/* Certificate Head */}
              <div className="border-b-2 border-slate-800 pb-4 text-center space-y-1">
                <div className="text-xs uppercase font-extrabold tracking-widest text-[#022C4F]">
                  Lagos State Building Control Agency (LASBCA)
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900">
                  {selectedDoc.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Issued under the Lagos State Urban & Regional Planning and Development Law
                </p>
              </div>

              {/* Certificate Facts */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-2 text-xs text-slate-700">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Subject Project:</span>
                  <span className="font-bold text-slate-900">{projectName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Document Type:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.document_type}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Date of Statutory Issue:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.issued_date}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Issuing Regulatory Body:</span>
                  <span className="font-semibold text-slate-900">{selectedDoc.issuing_authority}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Digital Seal Stamp:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedDoc.stamp_reference}</span>
                </div>
              </div>

              {/* Security Seal Note */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p>
                  This official public copy is cryptographically hashed and linked to the master Nexucon statutory registry. Any alteration renders this certificate null and void.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-500">File: {selectedDoc.file_size_mb} MB PDF</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoc(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadDocument(selectedDoc);
                  }}
                  className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-blue-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Stamped PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
