import React from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function CreateTopicSideDrawer({ isOpen, onClose, onCreate }: { isOpen: boolean, onClose: () => void, onCreate?: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[650px] bg-white rounded-[32px] p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h2 className="text-[28px] font-extrabold text-[#0F181F] mb-3 tracking-tight">
            Create Review Topic
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Raise a new review topic to track design issues, request technical clarification, assign reviewers, and collaborate with project stakeholders until the issue is resolved.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-6">Topic Information</h3>
          
          <div className="flex flex-col gap-6 mb-10">
            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Topic Title</label>
              <input type="text" className="w-full h-12 rounded-md border border-[#022C4F] px-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm" />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Topic Category</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-4">Priority</label>
              <div className="flex flex-col gap-3">
                {["Low", "Medium", "High", "Critical"].map((level, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group w-fit">
                    <div className="w-4 h-4 rounded-full border-[1.5px] border-[#022C4F] flex items-center justify-center bg-white">
                      <div className="w-2 h-2 rounded-full bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                    </div>
                    <input type="radio" name="priority" className="hidden" />
                    <span className="text-[12px] text-gray-600">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Discipline</label>
              <div className="relative">
                <select defaultValue="" className="w-full h-12 bg-white rounded-md border border-[#022C4F] px-4 text-[14px] text-gray-700 appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm cursor-pointer">
                  <option value=""></option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#022C4F] w-5 h-5 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Topic Description</label>
              <textarea className="w-full h-32 rounded-md border border-[#022C4F] p-4 text-[14px] resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"></textarea>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-[#022C4F] mb-3">Reviewer Assignments</label>
              <div className="flex flex-col gap-3 p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
                <p className="text-[12px] text-gray-500">
                  Multiple reviewers with specific roles and approval logic can be configured in the next step.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 mt-auto pt-8 pb-4">
            <button 
              onClick={() => {
                if (onCreate) onCreate();
                else onClose();
              }}
              className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Create Topic & Assign Reviewers
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-bold transition-colors text-[13px] shadow-sm"
            >
              Save as Draft
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
