"use client";

import React, { useState, useEffect } from "react";
import { ChevronLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { getProjects, Project } from "@/services/projects";
import BIMModelPreview from "@/components/dashboard/digital-eye/BIMModelPreview";

/**
 * Professional workspace 3D model viewer. Renders the selected project's
 * real imported BIM model (server-tessellated IFC geometry — RVT uploads are
 * translated via Autodesk first) with element selection, the attributed
 * properties panel and the "Capture 3D View" report-image action.
 *
 * The previous version of this page showed a stock placeholder image with
 * fabricated collaborators, clashes and annotations — replaced wholesale by
 * the real model surface (B8; no fabricated data, ever).
 */
export default function ModelViewerPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    getProjects()
      .then((res) => {
        const pList = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(pList);
        if (pList.length > 0) setSelectedProjectId(pList[0].id);
      })
      .catch((err: any) => {
        // Backend unavailable / route missing — leave the picker empty (honest).
        setProjects([]);
        setLoadError(err?.response?.data?.detail || err?.message || 'Projects could not be loaded.');
      });
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-8rem)] pb-8 animate-in fade-in duration-300">
      {/* Top Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Link
            href="/professional/dashboard/workspace"
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={20} className="text-[#022C4F]" />
          </Link>
          <div>
            <h1 className="text-[20px] font-extrabold text-[#022C4F]">3D Model Viewer</h1>
            <p className="text-[12px] text-gray-500 font-medium">
              The project&apos;s imported BIM model — click an element to inspect its recorded properties.
            </p>
          </div>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-gray-200 rounded-xl text-xs">
          <Building2 size={14} className="text-gray-500" />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="bg-transparent font-semibold text-gray-800 outline-none cursor-pointer max-w-[220px] truncate"
          >
            {projects.length === 0 && <option value="">No projects available</option>}
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loadError && (
        <div className="mb-6 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
          {loadError}
        </div>
      )}

      {/* Real model preview — honest empty state when no model is imported. */}
      {selectedProjectId ? (
        <BIMModelPreview projectId={selectedProjectId} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 flex flex-col items-center text-center text-slate-400">
          <Building2 size={36} className="mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-600">No project selected</p>
          <p className="text-xs mt-1">
            {projects.length === 0
              ? 'No projects are available to your account yet.'
              : 'Choose a project above to view its BIM model.'}
          </p>
        </div>
      )}
    </div>
  );
}
