"use client";

import React, { useState } from "react";
import { MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  name: string;
  location: string;
  designStatus: string;
  peerReviews: string;
  readinessLabel: string;
  readinessProgress: number;
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Lekki Commercial Plaza",
    location: "Victoria Island, Lagos",
    designStatus: "Active",
    peerReviews: "Completed",
    readinessLabel: "Completed",
    readinessProgress: 100
  },
  {
    id: "2",
    name: "Green Valley Apartments",
    location: "Ikeja, Lagos",
    designStatus: "Approved",
    peerReviews: "Completed",
    readinessLabel: "Tender/Procurement",
    readinessProgress: 60
  },
  {
    id: "3",
    name: "Harmony Business Complex",
    location: "Port Harcourt, Rivers State",
    designStatus: "Active",
    peerReviews: "Endorsed",
    readinessLabel: "Completed",
    readinessProgress: 100
  },
];

export default function ProjectList() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const toggleDropdown = (id: string) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

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

        {/* Pagination Controls */}
        <div className="flex items-center gap-2">
          <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
            <ChevronLeft size={14} />
          </button>
          <div className="flex gap-1 items-center bg-gray-100 rounded-full px-2 py-1">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-600"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
          </div>
          <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#022C4F]/90 transition-colors">
            <ChevronRight size={14} />
          </button>
        </div>
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
              {mockProjects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-6 py-4 w-[25%]">
                    <span className="text-[11px] font-bold text-[#0F181F]">{project.name}</span>
                  </td>
                  <td className="px-4 py-4 w-[20%]">
                    <span className="text-[11px] font-medium text-gray-500">{project.location}</span>
                  </td>
                  <td className="px-4 py-4 w-[15%]">
                    <span className="inline-flex items-center px-3 py-1 rounded-sm text-[9px] font-bold bg-[#6A994E] text-white">
                      {project.designStatus}
                    </span>
                  </td>
                  <td className="px-4 py-4 w-[15%]">
                    <span className="text-[11px] font-medium text-gray-500">
                      {project.peerReviews}
                    </span>
                  </td>
                  <td className="px-4 py-4 w-[20%]">
                    <div className="flex flex-col gap-1 w-full max-w-[140px]">
                      <div className="flex justify-between text-[9px] font-bold">
                        <span className="text-gray-500">{project.readinessLabel}</span>
                        <span className="text-[#6A994E]">{project.readinessProgress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-[#6A994E]"
                          style={{ width: `${project.readinessProgress}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 w-[10%] text-center relative">
                    <button 
                      onClick={() => toggleDropdown(project.id)}
                      className="text-[#022C4F] hover:bg-gray-100 p-1.5 rounded-full transition-colors relative z-50"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === project.id && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -10, scale: 0.95 }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute right-8 top-10 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 text-left origin-top-right"
                        >
                          <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                            Go to Project Workspace
                          </button>
                          <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                            View Timeline
                          </button>
                          <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                            Message Team
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col gap-4">
          {mockProjects.map((project) => (
            <div key={project.id} className="border border-[#022C4F] rounded-xl p-4 flex flex-col gap-4 relative">
              <div className="flex justify-between items-start gap-2 pr-8">
                <div>
                  <p className="font-bold text-sm text-[#0F181F]">{project.name}</p>
                  <p className="text-xs text-gray-500">{project.location}</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#6A994E] text-white text-[10px] font-bold whitespace-nowrap shrink-0">
                  {project.designStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold">Peer Reviews:</span>
                <span className="text-[#0F181F] font-bold">{project.peerReviews}</span>
              </div>
              <div className="flex flex-col gap-1 w-full">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="text-gray-400">{project.readinessLabel}</span>
                  <span className="text-[#6A994E]">{project.readinessProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#6A994E]"
                    style={{ width: `${project.readinessProgress}%` }}
                  />
                </div>
              </div>
              
              <div className="absolute top-4 right-2">
                <button 
                  onClick={() => toggleDropdown(project.id)}
                  className="text-[#022C4F] hover:bg-gray-100 p-1 rounded-full transition-colors relative z-50"
                >
                  <MoreHorizontal size={18} />
                </button>
                <AnimatePresence>
                  {openDropdown === project.id && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className="absolute right-0 top-8 w-48 bg-white border border-gray-100 shadow-xl rounded-xl py-2 z-50 text-left origin-top-right"
                    >
                      <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                        Go to Project Workspace
                      </button>
                      <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                        View Timeline
                      </button>
                      <button className="w-full px-4 py-2 text-xs font-semibold text-[#0F181F] hover:bg-gray-50 text-left transition-colors">
                        Message Team
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
