"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjects, Project } from "@/services/projects";

const formatLocation = (project: Project): string => {
  if (project.location) return project.location;
  if (project.site_address) return project.site_address;
  const parts = [project.lga, project.state].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "—";
};

const getProgress = (project: Project): number | null => {
  if (typeof project.progress === "number") return project.progress;
  const raw = (project as any).progress_percentage;
  return typeof raw === "number" ? raw : null;
};

export default function ProjectList() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getProjects()
      .then((data) => {
        if (!cancelled) setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!cancelled) setProjects([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const renderDropdown = (projectId: string, dropdownClassName: string) => (
    <AnimatePresence>
      {openDropdown === projectId && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          className={dropdownClassName}
        >
          <Link
            href="/client/design-workspace"
            onClick={() => setOpenDropdown(null)}
            className="block w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors"
          >
            Go to Project Workspace
          </Link>
          <Link
            href="/client/design-workspace"
            onClick={() => setOpenDropdown(null)}
            className="block w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors"
          >
            View Timeline
          </Link>
          <Link
            href="/client/messages"
            onClick={() => setOpenDropdown(null)}
            className="block w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors"
          >
            Message Team
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="bg-white rounded-2xl border border-[#022C4F] h-full flex flex-col p-6 shadow-sm relative">
      {/* Invisible Overlay for click outside */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpenDropdown(null)}
        />
      )}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-extrabold text-[#0F181F]">Execution-Ready Projects</h2>
      </div>

      <div className="w-full h-full">
        <div className="hidden md:block w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <table className="w-full text-left border-collapse min-w-[700px]" style={{ borderSpacing: 0 }}>
            <thead className="bg-[#022C4F] text-white text-[10px] capitalize tracking-wider font-bold">
              <tr>
                <th className="py-3 px-6 rounded-l-full w-[22%] font-bold">Name</th>
                <th className="py-3 px-4 w-[18%] font-bold">Location</th>
                <th className="py-3 px-4 w-[15%] font-bold">Design Status</th>
                <th className="py-3 px-4 w-[15%] font-bold">Peer Reviews</th>
                <th className="py-3 px-4 w-[20%] font-bold">Execution Readiness</th>
                <th className="py-3 px-4 rounded-r-full w-[10%] text-center font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 before:content-[''] before:block before:h-4">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[11px] font-semibold text-gray-400 animate-pulse">
                    Loading projects…
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-[11px] font-medium text-gray-500">
                    No projects yet
                  </td>
                </tr>
              ) : (
                projects.map((project) => {
                  const progress = getProgress(project);
                  return (
                    <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-6 py-4 w-[25%]">
                        <span className="text-[11px] font-bold text-[#0F181F]">{project.name}</span>
                      </td>
                      <td className="px-4 py-4 w-[20%]">
                        <span className="text-[11px] font-medium text-gray-500">{formatLocation(project)}</span>
                      </td>
                      <td className="px-4 py-4 w-[15%]">
                        <span className="inline-flex items-center px-3 py-1 rounded-sm text-[9px] font-bold bg-[#6A994E] text-white">
                          {project.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 w-[15%]">
                        <span className="text-[11px] font-medium text-gray-500">—</span>
                      </td>
                      <td className="px-4 py-4 w-[20%]">
                        {progress !== null ? (
                          <div className="flex flex-col gap-1 w-full max-w-[140px]">
                            <div className="flex justify-between text-[9px] font-bold">
                              <span className="text-gray-500">{project.status}</span>
                              <span className="text-[#6A994E]">{progress}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full bg-[#6A994E]"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] font-medium text-gray-500">Not assessed</span>
                        )}
                      </td>
                      <td className="px-4 py-4 w-[10%] text-center relative">
                        <button
                          onClick={() => toggleDropdown(project.id)}
                          className="text-[#022C4F] hover:bg-gray-100 p-1.5 rounded-full transition-colors relative z-50"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {renderDropdown(
                          project.id,
                          "absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 text-left origin-top-right"
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4">
          {isLoading ? (
            <div className="py-10 text-center text-[11px] font-semibold text-gray-400 animate-pulse">
              Loading projects…
            </div>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center text-[11px] font-medium text-gray-500">
              No projects yet
            </div>
          ) : (
            projects.map((project) => {
              const progress = getProgress(project);
              return (
                <div key={project.id} className="border border-[#022C4F] rounded-xl p-4 flex flex-col gap-4 relative">
                  <div className="flex justify-between items-start gap-2 pr-8">
                    <div>
                      <p className="font-bold text-sm text-[#0F181F]">{project.name}</p>
                      <p className="text-xs text-gray-500">{formatLocation(project)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#6A994E] text-white text-[10px] font-bold whitespace-nowrap shrink-0">
                      {project.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-bold">Peer Reviews:</span>
                    <span className="text-[#0F181F] font-bold">—</span>
                  </div>
                  {progress !== null ? (
                    <div className="flex flex-col gap-1 w-full">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                        <span className="text-gray-400">{project.status}</span>
                        <span className="text-[#6A994E]">{progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6A994E]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500 font-bold">Execution Readiness:</span>
                      <span className="text-[#0F181F] font-bold">Not assessed</span>
                    </div>
                  )}

                  <div className="absolute top-4 right-2">
                    <button
                      onClick={() => toggleDropdown(project.id)}
                      className="text-[#022C4F] hover:bg-gray-100 p-1 rounded-full transition-colors relative z-50"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {renderDropdown(
                      project.id,
                      "absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 text-left origin-top-right"
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
