import React, { useState } from "react";
import { X, Clock, User, Link as LinkIcon, Upload, Paperclip, MessageCircle, MoreHorizontal, CheckCircle2, ChevronRight, BrainCircuit, Play, PenLine, FileText } from "lucide-react";

interface TaskDetailsSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  task: any | null;
}

export default function TaskDetailsSideDrawer({ isOpen, onClose, task }: TaskDetailsSideDrawerProps) {
  const [activeTab, setActiveTab] = useState("Details");

  if (!isOpen || !task) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-full max-w-2xl h-full bg-[#F4F7F9] z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          } shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-extrabold text-[#022C4F] bg-[#EEF2F6] px-2 py-0.5 rounded-full">
                {task.id || "TSK-001"}
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${task.priorityColor || "bg-gray-100 text-gray-600"}`}>
                {task.priority || "Medium"}
              </span>
              <span className="text-[10px] font-extrabold text-[#8A9A00] bg-[#8A9A00]/10 px-2 py-0.5 rounded-full">
                {task.status || "In Progress"}
              </span>
            </div>
            <h2 className="text-[20px] font-extrabold text-[#022C4F] mt-2">
              {task.title}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors">
              <MoreHorizontal size={20} />
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Action Bar */}
        <div className="bg-white px-6 py-3 border-b border-gray-200 flex items-center gap-3 shrink-0 overflow-x-auto hide-scrollbar">
          <button className="bg-[#022C4F] text-white px-4 py-2 rounded-full text-[11px] font-bold hover:bg-[#033A6B] transition-colors whitespace-nowrap">
            Update Progress
          </button>
          <button className="bg-white border border-[#022C4F] text-[#022C4F] px-4 py-2 rounded-full text-[11px] font-bold hover:bg-gray-50 transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <Play size={12} />
            Start Timer
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-[11px] font-bold hover:bg-gray-50 transition-colors whitespace-nowrap">
            Submit Task
          </button>
          <button className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-full text-[11px] font-bold hover:bg-gray-50 transition-colors whitespace-nowrap">
            Add Annotation
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center border-b border-gray-200 bg-white px-6 shrink-0">
          {["Details", "Activity", "Attachments", "AI Insights"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-4 text-[13px] font-bold border-b-2 transition-colors ${activeTab === tab
                  ? "border-[#022C4F] text-[#022C4F]"
                  : "border-transparent text-gray-500 hover:text-gray-900"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {activeTab === "Details" && (
            <>
              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500">Project</span>
                  <span className="text-[12px] font-bold text-[#0F181F]">{task.project || "Downtown Highrise"}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-gray-500">Discipline</span>
                  <span className="text-[12px] font-bold text-[#0F181F]">{task.discipline || "Architecture"}</span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Assigned By</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[8px] font-bold">PM</div>
                    <span className="text-[12px] font-bold text-[#0F181F]">Project Manager</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Assigned To</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[8px] font-bold">ME</div>
                    <span className="text-[12px] font-bold text-[#0F181F]">Me</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Due Date</span>
                  <span className="text-[12px] font-bold text-[#0F181F]">{task.dueDate || "Jul 25, 2026"}</span>
                </div>
                <div className="flex flex-col gap-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-500">Time Logged</span>
                  <span className="text-[12px] font-bold text-[#0F181F]">{task.timeLogged || "4h 30m"}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#0F181F]">Progress</span>
                  <span className="text-[12px] font-bold text-[#022C4F]">{task.progress || 65}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#022C4F] rounded-full"
                    style={{ width: `${task.progress || 65}%` }}
                  />
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-3">
                <h3 className="text-[14px] font-extrabold text-[#022C4F]">Description</h3>
                <p className="text-[12px] text-gray-600 font-medium leading-relaxed bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                  {task.description}
                </p>
              </div>

              {/* Checklist */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-extrabold text-[#022C4F]">Checklist</h3>
                  <span className="text-[10px] font-bold text-gray-500">2 / 4 Completed</span>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-3">
                  {["Verify structural load", "Cross-check MEP layout", "Update 3D Model", "Submit for Peer Review"].map((item, i) => (
                    <label key={i} className="flex items-start gap-3 cursor-pointer group">
                      <div className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${i < 2 ? "bg-[#8A9A00] border-[#8A9A00]" : "border-gray-300 group-hover:border-[#022C4F]"}`}>
                        {i < 2 && <CheckCircle2 size={12} className="text-white" />}
                      </div>
                      <span className={`text-[12px] font-medium ${i < 2 ? "text-gray-400 line-through" : "text-[#0F181F]"}`}>
                        {item}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === "Activity" && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-6">
              <div className="relative pl-6 border-l-2 border-gray-100 flex flex-col gap-6">
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 bg-white border-2 border-[#022C4F] rounded-full" />
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#0F181F]">Task Created</span>
                    <span className="text-[10px] text-gray-500 font-medium">By Project Manager • Jul 18, 2:00 PM</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 bg-[#EEF2F6] border-2 border-white rounded-full flex items-center justify-center">
                    <MessageCircle size={8} className="text-[#022C4F]" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#0F181F]">Comment added by Olivia</span>
                    <p className="text-[11px] text-gray-600 bg-gray-50 p-3 rounded-xl mt-1">
                      "Make sure to check the new electrical drawings."
                    </p>
                    <span className="text-[10px] text-gray-500 font-medium mt-1">Yesterday, 10:30 AM</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] w-4 h-4 bg-green-100 border-2 border-white rounded-full flex items-center justify-center">
                    <CheckCircle2 size={8} className="text-green-600" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-bold text-[#0F181F]">Progress updated to 65%</span>
                    <span className="text-[10px] text-gray-500 font-medium">By You • Today, 9:00 AM</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] text-white flex items-center justify-center text-[10px] font-bold shrink-0">ME</div>
                <div className="flex-1 relative">
                  <input type="text" placeholder="Add a comment... (@ to mention)" className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#022C4F]" />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 bg-[#022C4F] rounded-full flex items-center justify-center">
                    <CheckCircle2 size={12} className="text-white" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "Attachments" && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col gap-4">
              <button className="w-full border-2 border-dashed border-gray-300 rounded-xl py-8 flex flex-col items-center justify-center gap-2 hover:border-[#022C4F] hover:bg-[#EEF2F6]/50 transition-colors">
                <div className="w-10 h-10 bg-[#EEF2F6] rounded-full flex items-center justify-center">
                  <Upload size={18} className="text-[#022C4F]" />
                </div>
                <span className="text-[12px] font-bold text-[#0F181F]">Click to upload or drag & drop</span>
                <span className="text-[10px] text-gray-500">PDF, DWG, RVT, JPG (max 50MB)</span>
              </button>

              <div className="flex flex-col gap-3 mt-4">
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                      <FileText size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#0F181F]">Floor_Plan_v2.pdf</span>
                      <span className="text-[10px] text-gray-500">2.4 MB • Uploaded Yesterday</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-[#022C4F]"><MoreHorizontal size={16} /></button>
                </div>
                <div className="flex items-center justify-between p-3 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <LinkIcon size={16} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-[#0F181F]">BIM_Model_Federated.rvt</span>
                      <span className="text-[10px] text-gray-500">Autodesk Docs Link</span>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-[#022C4F]"><MoreHorizontal size={16} /></button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "AI Insights" && (
            <div className="bg-gradient-to-br from-[#EEF2F6] to-white p-5 rounded-2xl shadow-sm border border-[#022C4F]/10 flex flex-col gap-4">
              <div className="flex items-center gap-2 mb-2">
                <BrainCircuit size={18} className="text-[#022C4F]" />
                <h3 className="text-[14px] font-extrabold text-[#022C4F]">Nexus AI Assistant</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#0F181F]">Risk Assessment</span>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  Based on current progress (65%) and the upcoming deadline (Jul 25), this task has a <span className="font-bold text-orange-500">Moderate Risk</span> of delay.
                </p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-gray-100 flex flex-col gap-2">
                <span className="text-[12px] font-bold text-[#0F181F]">Suggested Next Actions</span>
                <ul className="text-[11px] text-gray-600 flex flex-col gap-2 list-disc pl-4">
                  <li>Request peer review from the MEP lead regarding the clash in zone 3.</li>
                  <li>Complete checklist item #3 (Update 3D Model).</li>
                </ul>
              </div>
              <button className="bg-[#022C4F] text-white w-full py-2.5 rounded-xl text-[12px] font-bold hover:bg-[#033A6B] transition-colors mt-2">
                Generate Full Summary
              </button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
