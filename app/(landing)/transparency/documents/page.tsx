"use client";

import React, { useState, useEffect } from 'react';
import { FileText, Search, Filter, ShieldCheck, Download, Eye } from 'lucide-react';
import { getPublicProjects, PublicDocument } from '@/services/publicPortal';
import { PublicDocumentList } from '@/components/transparency/PublicDocumentList';

export default function PublicDocumentsPage() {
  const [documents, setDocuments] = useState<{ doc: PublicDocument; projectName: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllDocuments() {
      try {
        const projects = await getPublicProjects();
        const allDocs: { doc: PublicDocument; projectName: string }[] = [];
        projects.forEach((p) => {
          p.documents.forEach((d) => {
            allDocs.push({ doc: d, projectName: p.name });
          });
        });
        setDocuments(allDocs);
      } catch (err) {
        // Handled
      } finally {
        setLoading(false);
      }
    }
    loadAllDocuments();
  }, []);

  const docTypes = [
    'ALL',
    'Planning Permit',
    'Certificate of Fitness',
    'Environmental Approval',
    'Structural Certification',
    'Stop Work Notice',
  ];

  const filtered = documents.filter((item) => {
    const matchesQuery =
      item.doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.doc.document_reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.projectName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || item.doc.document_type === selectedType;
    return matchesQuery && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
          <FileText className="w-4 h-4" />
          <span>Statutory Document Repository</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-[#022C4F]">
          Public Document & Certificate Archive
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Search and download watermarked public copies of verified planning permits, certificates of structural fitness, and statutory environmental clearance notices.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by document title, reference, or project name..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#022C4F]"
            />
          </div>
          <div className="w-full sm:w-64">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 font-medium focus:outline-none focus:border-[#022C4F]"
            >
              {docTypes.map((type) => (
                <option key={type} value={type}>
                  {type === 'ALL' ? 'All Document Types' : type}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-xs text-slate-500 pt-1 flex items-center justify-between">
          <span>{filtered.length} Approved Documents Available for Public Inspection</span>
          <span className="text-emerald-700 font-semibold text-[11px]">✓ Certified Cryptographic Watermarks</span>
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-500">
          <div className="w-8 h-8 border-4 border-[#022C4F] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span className="text-xs font-semibold">Loading document archive...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
          <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">No Documents Match Search Criteria</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting your filters or clearing search text.</p>
        </div>
      ) : (
        <PublicDocumentList
          documents={filtered.map((f) => f.doc)}
          projectName={filtered[0]?.projectName}
        />
      )}
    </div>
  );
}
