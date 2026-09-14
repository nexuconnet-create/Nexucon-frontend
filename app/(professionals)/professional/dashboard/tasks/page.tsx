"use client";

import React, { useState } from "react";
import { ArrowUpRight, Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import CreateTaskSideDrawer from "@/components/dashboard/CreateTaskSideDrawer";
import TaskTemplatesModal from "@/components/dashboard/TaskTemplatesModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import Link from "next/link";

export default function TasksDashboard() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  // No Task model/API exists on the backend yet, so no task counts, lists,
  // progress curves, or deadlines can be shown. Every section below renders
  // an honest empty state instead of fabricated task data.

  return (
    <>
      <div className="w-full animate-in fade-in duration-500 flex flex-col gap-10">

        {/* Header & Actions */}
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="max-w-[750px]">
            <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F] mb-4">Tasks</h1>
            <p className="text-[12px] md:text-[14px] text-gray-500 font-medium leading-relaxed">
              Plan, assign, and monitor project tasks across all design disciplines. Track progress, priorities, deadlines, dependencies, and deliverables to keep the project on schedule and ensure accountability throughout the design and review lifecycle.
            </p>
          </div>

          <TopRightControls />
        </div>


        <div className="flex items-center justify-end gap-4 shrink-0 mt-2 lg:mt-0">
          <button
            onClick={() => setIsTemplatesModalOpen(true)}
            className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm text-[12px]"
          >
            Task Templates
          </button>
          <button
            onClick={() => setIsCreateDrawerOpen(true)}
            className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm text-[12px]"
          >
            Create New Task
          </button>
          <Link href="/professional/dashboard/tasks/kanban">
            <button
              className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-8 py-3.5 rounded-full font-bold transition-colors shadow-sm text-[12px]"
            >
              View Kanban Board
            </button>
          </Link>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">Total Tasks</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">—</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">Completed</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">—</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">In Progress</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">—</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">Overdue</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">—</span>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-[500px]">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by task name, assignee, discipline, milestone, or keyword..."
              className="w-full h-12 rounded-full border border-gray-400 bg-white pl-12 pr-6 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] placeholder:text-gray-500 font-medium"
            />
          </div>
          <button className="h-12 rounded-full border border-gray-400 bg-white px-6 flex items-center gap-6 hover:bg-gray-50 transition-colors text-[12px] font-extrabold text-[#022C4F]">
            All Tasks
            <Filter size={16} />
          </button>
        </div>

        {/* My Assigned Tasks */}
        <div className="flex flex-col gap-6">
          <h2 className="text-[16px] font-extrabold text-[#022C4F]">My Assigned Tasks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#022C4F]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 shadow-sm min-h-[280px] col-span-1 md:col-span-2 lg:col-span-3">
              <p className="text-[13px] font-extrabold text-[#022C4F]">No tasks recorded yet</p>
              <p className="text-[11px] text-gray-500 font-medium max-w-[380px] leading-relaxed">
                Tasks assigned to you will appear here once tasks have been created for your projects.
              </p>
              <button
                onClick={() => setIsCreateDrawerOpen(true)}
                className="mt-2 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-8 py-3 rounded-full font-bold transition-colors shadow-sm text-[12px]"
              >
                Create New Task
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Split Layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 pb-12">

          {/* Team Task Board */}
          <div className="bg-white rounded-2xl p-6 border border-[#022C4F]/20 shadow-sm flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h2 className="text-[16px] font-extrabold text-[#022C4F]">Team Task Board</h2>
              <div className="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center shadow-sm">
                  <ChevronLeft size={14} />
                </button>
                <div className="flex items-center gap-1 px-1 text-gray-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F]" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                </div>
                <button className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center shadow-sm">
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#022C4F] text-white">
                    <th className="py-3 px-6 text-[10px] font-extrabold rounded-l-full w-[35%]">Task</th>
                    <th className="py-3 px-6 text-[10px] font-extrabold text-center">Assignee</th>
                    <th className="py-3 px-6 text-[10px] font-extrabold text-center">Discipline</th>
                    <th className="py-3 px-6 text-[10px] font-extrabold text-center">Priority</th>
                    <th className="py-3 px-6 text-[10px] font-extrabold text-center rounded-r-full">Due Date</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] text-[#022C4F] font-bold">
                  <tr>
                    <td colSpan={5} className="py-12 px-6 text-center text-gray-500 font-medium">
                      No tasks recorded yet
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Task Progress & Deadlines */}
          <div className="bg-white rounded-2xl border border-[#022C4F]/20 shadow-sm flex flex-col relative overflow-hidden">
            <div className="p-6 flex flex-col gap-6">
              <h2 className="text-[16px] font-extrabold text-[#022C4F] text-center">Task Progress</h2>

              {/* Area Chart Area */}
              <div className="w-full h-[200px] mt-2 flex flex-col items-center justify-center text-center gap-2">
                <p className="text-[12px] font-extrabold text-[#022C4F]">No task progress recorded yet</p>
                <p className="text-[10px] text-gray-500 font-medium max-w-[240px] leading-relaxed">
                  Progress against expected completion will be charted here once tasks are recorded.
                </p>
              </div>

              <div className="mt-8">
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-4">Upcoming Deadlines</h3>
                <p className="text-[10px] text-gray-500 font-medium">No upcoming deadlines recorded</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      <CreateTaskSideDrawer
        isOpen={isCreateDrawerOpen}
        onClose={() => setIsCreateDrawerOpen(false)}
      />

      <TaskTemplatesModal
        isOpen={isTemplatesModalOpen}
        onClose={() => setIsTemplatesModalOpen(false)}
      />
    </>
  );
}
