"use client";

import React, { useState, useEffect } from "react";
import { Search, Share2, Upload, Plus, ChevronDown, MessageCircle, CheckCircle2, MoreHorizontal, Filter, Clock } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import TaskDetailsSideDrawer from "@/components/dashboard/TaskDetailsSideDrawer";
import UploadFileModal from "@/components/dashboard/UploadFileModal";
import CreateTaskSideDrawer from "@/components/dashboard/CreateTaskSideDrawer";

// --- Types ---
type Task = {
  id: string;
  title: string;
  description: string;
  priority: string;
  priorityColor: string;
  comments: string;
  checks: string;
  project?: string;
  discipline?: string;
  dueDate?: string;
  progress?: number;
  timeLogged?: string;
};

// --- Sortable Task Card Component ---
function SortableTaskCard({ id, task, onClick }: { id: string, task: Task, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="touch-none group">
      <div 
        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing relative"
      >
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            className="text-gray-400 hover:text-[#022C4F] bg-white rounded-full p-1 shadow-sm border border-gray-100" 
            onPointerDown={(e) => e.stopPropagation()}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
        <div className="mb-4 flex items-center gap-2">
          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-extrabold ${task.priorityColor}`}>
            {task.priority}
          </span>
          <span className="text-[10px] font-extrabold text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
            {task.id}
          </span>
        </div>
        
        {/* We use onPointerDown stopPropagation so we can click title to open drawer without dragging, or we can just let it bubble and use onClick */}
        <h3 
          className="text-[14px] font-extrabold text-[#0F181F] mb-3 leading-tight hover:text-[#022C4F] transition-colors" 
          onPointerDown={(e) => { e.stopPropagation(); onClick(); }}
        >
          {task.title}
        </h3>
        
        <p className="text-[12px] text-gray-500 leading-relaxed mb-4 font-medium flex-1 line-clamp-3">
          {task.description}
        </p>
        
        {/* Progress & Assignees */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[8px] font-bold border-2 border-white">PM</div>
            <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold border-2 border-white">ME</div>
          </div>
          {task.progress !== undefined && (
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#022C4F] rounded-full" style={{ width: `${task.progress}%` }} />
              </div>
              <span className="text-[10px] font-bold text-[#022C4F]">{task.progress}%</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] font-bold">
            <Clock size={12} />
            <span>{task.dueDate || "No Due Date"}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-400 text-[11px] font-extrabold">
            <div className="flex items-center gap-1.5">
              <MessageCircle size={14} className="text-gray-400" fill="currentColor" />
              <span>{task.comments}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-gray-400" fill="currentColor" />
              <span>{task.checks}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Page Component ---
export default function KanbanBoard() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const initialColumns: Record<string, Task[]> = {
    "To Do": [
      {
        id: "TSK-005",
        priority: "Low",
        priorityColor: "bg-green-50 text-green-500",
        title: "Review Initial Schematics",
        description: "First pass on the structural schematics before sending to client.",
        comments: "2",
        checks: "0",
        progress: 0,
        dueDate: "Jul 30, 2026",
      }
    ],
    "In Progress": [
      {
        id: "TSK-001",
        priority: "Medium",
        priorityColor: "bg-blue-50 text-blue-600",
        title: "Architectural Floor Plan Revision",
        description: "Updating the ground floor layout to incorporate the latest client feedback, accessibility improvements, and revised room configurations before peer review.",
        comments: "11",
        checks: "187",
        progress: 65,
        dueDate: "Jul 25, 2026",
        timeLogged: "4h 30m"
      },
      {
        id: "TSK-002",
        priority: "Medium",
        priorityColor: "bg-blue-50 text-blue-600",
        title: "Structural Beam Coordination",
        description: "Reviewing beam placements and reinforcement details to resolve coordination conflicts identified during the BIM clash detection process.",
        comments: "32",
        checks: "115",
        progress: 40,
        dueDate: "Jul 22, 2026",
      },
      {
        id: "TSK-003",
        priority: "High",
        priorityColor: "bg-orange-50 text-orange-500",
        title: "MEP Services Coordination",
        description: "Aligning mechanical, electrical, and plumbing layouts with the approved architectural model to eliminate routing conflicts and optimize service distribution.",
        comments: "987",
        checks: "21.8k",
        progress: 85,
        dueDate: "Jul 21, 2026",
      },
      {
        id: "TSK-004",
        priority: "Critical",
        priorityColor: "bg-red-50 text-red-500",
        title: "Bill of Quantities Verification",
        description: "Validating material quantities, cost estimates, and measurement schedules to ensure consistency with the latest approved design package.",
        comments: "5",
        checks: "11",
        progress: 20,
        dueDate: "Jul 20, 2026",
      }
    ],
    "Under Review": [
      {
        id: "TSK-006",
        priority: "Medium",
        priorityColor: "bg-blue-50 text-blue-600",
        title: "Final Architectural Design Package",
        description: "The complete architectural drawing set is undergoing multidisciplinary peer review to verify compliance with project standards and design requirements.",
        comments: "8",
        checks: "112",
        progress: 100,
        dueDate: "Jul 15, 2026",
      },
      {
        id: "TSK-007",
        priority: "Medium",
        priorityColor: "bg-blue-50 text-blue-600",
        title: "Structural Foundation Design",
        description: "Foundation layouts, reinforcement schedules, and structural calculations are currently being reviewed for technical accuracy before final approval.",
        comments: "221",
        checks: "87.2k",
        progress: 100,
        dueDate: "Jul 18, 2026",
      }
    ],
    "Completed": [
      {
        id: "TSK-008",
        priority: "Critical",
        priorityColor: "bg-red-50 text-red-500",
        title: "Site Survey Documentation",
        description: "Completed the site survey report, including topographical data, boundary verification, and existing site conditions for design reference.",
        comments: "108k",
        checks: "997",
        progress: 100,
        dueDate: "Jun 30, 2026",
      },
      {
        id: "TSK-009",
        priority: "Low",
        priorityColor: "bg-green-50 text-green-500",
        title: "Concept Design Approval",
        description: "Lorem ipsum dolor sit amet, libre unst consectetur adispicing elit.",
        comments: "17",
        checks: "0",
        progress: 100,
      },
      {
        id: "TSK-010",
        priority: "High",
        priorityColor: "bg-orange-50 text-orange-500",
        title: "BIM Model Setup",
        description: "Established the project's federated BIM model with architectural, structural, and MEP disciplines configured for collaborative coordination.",
        comments: "888",
        checks: "12",
        progress: 100,
      }
    ]
  };

  const [columns, setColumns] = useState(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const [activeTab, setActiveTab] = useState("By Total Tasks");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsDrawerOpen(true);
  };

  const findContainer = (id: string) => {
    if (id in columns) {
      return id;
    }
    return Object.keys(columns).find((key) => columns[key].find((t) => t.id === id));
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const container = findContainer(active.id as string);
    if (container) {
      const task = columns[container].find((t) => t.id === active.id);
      setActiveTask(task || null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];

      const activeIndex = activeItems.findIndex((t) => t.id === activeId);
      const overIndex = overItems.findIndex((t) => t.id === overId);

      let newIndex;
      if (overId in prev) {
        newIndex = overItems.length + 1;
      } else {
        const isBelowLastItem = over && overIndex === overItems.length - 1;
        const modifier = isBelowLastItem ? 1 : 0;
        newIndex = overIndex >= 0 ? overIndex + modifier : overItems.length + 1;
      }

      return {
        ...prev,
        [activeContainer]: [
          ...prev[activeContainer].filter((item) => item.id !== activeId)
        ],
        [overContainer]: [
          ...prev[overContainer].slice(0, newIndex),
          prev[activeContainer][activeIndex],
          ...prev[overContainer].slice(newIndex, prev[overContainer].length)
        ]
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeContainer = findContainer(activeId as string);
    const overContainer = findContainer(overId as string);

    if (!activeContainer || !overContainer) return;

    if (activeContainer === overContainer) {
      setColumns((prev) => {
        const activeIndex = prev[activeContainer].findIndex((t) => t.id === activeId);
        const overIndex = prev[overContainer].findIndex((t) => t.id === overId);
        
        if (activeIndex !== overIndex) {
          return {
            ...prev,
            [activeContainer]: arrayMove(prev[activeContainer], activeIndex, overIndex)
          };
        }
        return prev;
      });
    }
  };

  const getColumnColor = (title: string) => {
    switch (title) {
      case "To Do": return "bg-gray-500";
      case "In Progress": return "bg-[#022C4F]";
      case "Under Review": return "bg-[#0F181F]";
      case "Completed": return "bg-[#8A9A00]";
      default: return "bg-gray-500";
    }
  };

  if (!isMounted) {
    return <div className="h-[calc(100vh-64px)] w-full flex items-center justify-center">Loading board...</div>;
  }

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col pt-2 pb-2 w-full animate-in fade-in duration-500 overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
        <h1 className="text-[32px] md:text-[40px] font-extrabold text-[#022C4F]">
          Kanban
        </h1>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tasks, IDs..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium focus:outline-none focus:border-[#022C4F] w-48 md:w-64 transition-colors"
            />
          </div>
          <div className="relative">
            <button 
              onClick={() => setIsShareOpen(!isShareOpen)}
              className="bg-[#0F181F] hover:bg-black text-white px-5 py-2.5 rounded-full font-bold flex items-center gap-2 text-sm transition-colors shadow-sm"
            >
              Share
              <Share2 size={16} />
            </button>
            {isShareOpen && (
              <div className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50">
                <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-3">Share Board</h3>
                <input type="text" value="https://nexucon.com/b/1a2b3c" readOnly className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3 focus:outline-none" />
                <button className="w-full bg-[#022C4F] text-white py-2 rounded-xl text-[12px] font-bold hover:bg-[#033A6B] transition-colors">Copy Link</button>
              </div>
            )}
          </div>
          <button 
            onClick={() => setIsUploadModalOpen(true)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white"
          >
            <Upload size={18} />
          </button>
          <button 
            onClick={() => setIsCreateTaskOpen(true)}
            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors bg-white"
          >
            <Plus size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-gray-200 mb-8 gap-4">
        <div className="flex items-center gap-8 overflow-x-auto hide-scrollbar">
          {["By Status", "By Total Tasks", "Tasks Due", "Extra Tasks", "Tasks Completed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-[13px] font-bold flex items-center gap-2 whitespace-nowrap transition-colors ${
                activeTab === tab 
                  ? "text-[#022C4F] border-b-2 border-[#022C4F]" 
                  : "text-gray-500 hover:text-gray-900 border-b-2 border-transparent"
              }`}
            >
              {tab}
              {tab === "By Total Tasks" && activeTab === "By Total Tasks" && (
                <span className="bg-[#EEF2F6] text-[#022C4F] text-[10px] px-2 py-0.5 rounded-full">12</span>
              )}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 pb-2 lg:pb-0">
          <div className="relative">
            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 text-[12px] font-bold text-gray-600 bg-white hover:bg-gray-50"
            >
              Filter
              <Filter size={14} />
            </button>
            {isFilterOpen && (
              <div className="absolute top-full mt-2 right-0 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50">
                <div className="px-4 py-2 text-[12px] font-extrabold text-[#0F181F] border-b border-gray-100">Filter By</div>
                <button className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50 font-bold transition-colors">Priority</button>
                <button className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50 font-bold transition-colors">Discipline</button>
                <button className="w-full text-left px-4 py-2 text-[12px] text-gray-600 hover:bg-gray-50 font-bold transition-colors">Assignee</button>
              </div>
            )}
          </div>
          <span className="text-[12px] font-bold text-gray-900">Sort By</span>
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-300 text-[12px] font-bold text-gray-600 bg-white hover:bg-gray-50">
            Newest
            <ChevronDown size={14} />
          </button>
        </div>
      </div>

      {/* Kanban Board Columns - DnD Context */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 items-start h-full min-w-full w-max md:w-full">
            {Object.keys(columns).map((colId) => (
              <div key={colId} className="flex flex-col gap-4 flex-1 min-w-[280px] w-[350px] md:w-auto h-full">
                {/* Column Header */}
                <div className={`${getColumnColor(colId)} rounded-full p-2 flex items-center shadow-sm shrink-0`}>
                  <div className={`w-8 h-8 rounded-full bg-white flex items-center justify-center text-[12px] font-extrabold shrink-0 ${getColumnColor(colId).replace("bg", "text")}`}>
                    {columns[colId].length}
                  </div>
                  <span className="text-white font-bold text-[14px] ml-3 flex-1">{colId}</span>
                  <button className="w-8 h-8 flex items-center justify-center text-white hover:bg-white/10 rounded-full transition-colors mr-1">
                    <Plus size={20} />
                  </button>
                </div>

                {/* Sortable Area */}
                <div className="flex flex-col gap-4 flex-1 overflow-y-auto rounded-3xl p-1 hide-scrollbar pb-10">
                  <SortableContext 
                    id={colId} 
                    items={columns[colId].map(t => t.id)} 
                    strategy={verticalListSortingStrategy}
                  >
                    {columns[colId].map(task => (
                      <SortableTaskCard key={task.id} id={task.id} task={task} onClick={() => handleTaskClick(task)} />
                    ))}
                  </SortableContext>
                </div>
              </div>
            ))}
          </div>

          {/* Drag Overlay for smooth animations */}
          <DragOverlay>
            {activeTask ? <SortableTaskCard id={activeTask.id} task={activeTask} onClick={() => {}} /> : null}
          </DragOverlay>
        </DndContext>
      </div>

      <TaskDetailsSideDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        task={selectedTask} 
      />

      <UploadFileModal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
      />
      
      <CreateTaskSideDrawer 
        isOpen={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)} 
      />

    </div>
  );
}
