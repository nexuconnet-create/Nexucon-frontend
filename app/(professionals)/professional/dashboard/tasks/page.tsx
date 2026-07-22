"use client";

import React, { useState } from "react";
import { ArrowUpRight, Search, Bell, Filter, ChevronLeft, ChevronRight, MoreHorizontal, Asterisk } from "lucide-react";
import CreateTaskSideDrawer from "@/components/dashboard/CreateTaskSideDrawer";
import TaskTemplatesModal from "@/components/dashboard/TaskTemplatesModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function TasksDashboard() {
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);

  const taskProgressData = [
    { week: "Week 1", completed: 30, expected: 50 },
    { week: "Week 2", completed: 45, expected: 65 },
    { week: "Week 3", completed: 70, expected: 80 },
    { week: "Week 4", completed: 95, expected: 100 },
    { week: "Week 5", completed: 120, expected: 120 },
  ];

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
            <span className="text-[36px] font-extrabold text-[#022C4F]">148</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">Completed</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">89</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">In Progress</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">39</span>
          </div>
          <div className="bg-white rounded-xl p-6 flex flex-col gap-6 border border-[#022C4F]/20 shadow-sm">
            <div className="flex justify-between items-center">
              <span className="text-[12px] font-extrabold text-[#022C4F]">Overdue</span>
              <div className="w-7 h-7 rounded-full border border-[#022C4F] flex items-center justify-center">
                <ArrowUpRight size={14} className="text-[#022C4F]" />
              </div>
            </div>
            <span className="text-[36px] font-extrabold text-[#022C4F]">5</span>
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

            {/* Task Card 1 */}
            <div className="bg-white border border-[#022C4F]/20 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-[14px] font-extrabold text-[#022C4F]">Review Architectural Floor Plans</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Task ID</span>
                  <span className="text-[11px] text-gray-500 font-medium">TSK-1042</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Due Date</span>
                  <span className="text-[11px] text-gray-500 font-medium">July 10, 2026</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Assigned By</span>
                  <span className="text-[11px] text-gray-500 font-medium">Project Manager</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Progress</span>
                  <span className="text-[11px] text-gray-500 font-medium">75%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Priority</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                    <span className="text-[11px] text-gray-500 font-medium">High</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Status</span>
                  <span className="text-[11px] text-gray-500 font-medium">In Progress</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  View Task
                </button>
                <button className="flex-1 bg-[#022C4F] text-white hover:bg-[#033A6B] py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  Mark Complete
                </button>
                <button className="flex-1 bg-[#0F181F] text-white hover:bg-black py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  Comment
                </button>
              </div>
            </div>

            {/* Task Card 2 */}
            <div className="bg-white border border-[#022C4F]/20 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-[14px] font-extrabold text-[#022C4F]">Resolve Structural Beam Coordination</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Task ID</span>
                  <span className="text-[11px] text-gray-500 font-medium">TSK-1038</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Due Date</span>
                  <span className="text-[11px] text-gray-500 font-medium">Tomorrow</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Assigned By</span>
                  <span className="text-[11px] text-gray-500 font-medium">Lead Structural Engineer</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Progress</span>
                  <span className="text-[11px] text-gray-500 font-medium">75%</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Priority</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                    <span className="text-[11px] text-gray-500 font-medium">High</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Status</span>
                  <span className="text-[11px] text-gray-500 font-medium">In Progress</span>
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  View Task
                </button>
                <button className="flex-1 bg-[#022C4F] text-white hover:bg-[#033A6B] py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  Update Progress
                </button>
              </div>
            </div>

            {/* Task Card 3 */}
            <div className="bg-white border border-[#022C4F]/20 rounded-2xl p-6 flex flex-col gap-6 shadow-sm">
              <h3 className="text-[14px] font-extrabold text-[#022C4F]">Verify Electrical Panel Layout</h3>
              <div className="grid grid-cols-2 gap-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Task ID</span>
                  <span className="text-[11px] text-gray-500 font-medium">TSK-1032</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Due Date</span>
                  <span className="text-[11px] text-gray-500 font-medium">July 12, 2026</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Assigned By</span>
                  <span className="text-[11px] text-gray-500 font-medium">Project Manager</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Status</span>
                  <span className="text-[11px] text-gray-500 font-medium">Not Started</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold text-[#022C4F]">Priority</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="text-[11px] text-gray-500 font-medium">Medium</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-auto">
                <button className="flex-1 bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 py-2.5 rounded-md text-[9px] font-extrabold transition-colors">
                  Start Task
                </button>
              </div>
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
                  <tr className="border-b border-gray-200">
                    <td className="py-5 px-6">Architectural Coordination</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Olivia Thompson</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Architecture</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">High</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Jul 09</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-5 px-6">Foundation Review</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Michael Adeyemi</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Structural</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">High</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Jul 11</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-5 px-6">HVAC Coordination</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Daniel Okoro</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Mechanical</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Medium</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Jul 12</td>
                  </tr>
                  <tr className="border-b border-gray-200">
                    <td className="py-5 px-6">Electrical Design Check</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">James Ibrahim</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Electrical</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Medium</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Jul 13</td>
                  </tr>
                  <tr>
                    <td className="py-5 px-6">BOQ Verification</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Samuel Bello</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Quantity Surveying</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">High</td>
                    <td className="py-5 px-6 text-center text-gray-500 font-medium">Jul 14</td>
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
              <div className="w-full h-[200px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={taskProgressData}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F472B6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F472B6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="week" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 'bold' }} 
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ fontWeight: 'bold', color: '#022C4F', marginBottom: '4px' }}
                    />
                    <Area type="monotone" dataKey="expected" stroke="#F472B6" strokeWidth={2} fillOpacity={1} fill="url(#colorExpected)" />
                    <Area type="monotone" dataKey="completed" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-8">
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-4">Upcoming Deadlines</h3>
                <h4 className="text-[12px] font-extrabold text-[#0F181F] mb-3">Today</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <Asterisk size={12} className="text-[#022C4F]" />
                    <span className="text-[10px] text-gray-600 font-medium">Submit Architectural Review</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Asterisk size={12} className="text-[#022C4F]" />
                    <span className="text-[10px] text-gray-600 font-medium">Resolve Drawing Annotation #24</span>
                  </div>
                </div>
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
