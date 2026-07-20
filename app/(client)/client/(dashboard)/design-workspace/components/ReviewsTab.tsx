import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";
import Button from "@/components/ui/Button";


export default function ReviewsTab() {
  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Design Reviews & Peer Review Center</h3>
              <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
                Manage design reviews, peer-review sessions, consultant endorsements, client approvals, and collaborative feedback to ensure project quality before execution.
              </p>
            </div>

            <Button variant="primary">
              Go to Peer Review Center
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm">
              <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">Structural Design Review</h4>

              <div className="flex flex-col gap-5 mb-8">
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Project:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Victoria Heights Residential Estate</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Discipline:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Structural Engineering</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Review Type:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Peer Review</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Reviewers:</span>
                  <span className="text-[11px] text-gray-600 font-medium">4 Assigned</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Status:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Awaiting Final Feedback</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Due Date:</span>
                  <span className="text-[11px] text-gray-600 font-medium">June 20, 2026</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Progress:</span>
                  <span className="text-[11px] text-gray-600 font-medium">3 of 4 Reviews Complete</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4">
                <button className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Open Review</button>
                <button className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">View Comments</button>
                <button className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">Add Feedback</button>
              </div>
            </div>

            {/* Card 2 & 3 Column container to match masonry look if needed, but the design just has them flowing. 
                Using a standard grid flows them left to right. To make Card 3 appear under Card 1, 
                we can use flex-col within grid columns. */}
            <div className="flex flex-col gap-6">
              {/* Card 2 */}
              <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm">
                <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">MEP Coordination Review</h4>

                <div className="flex flex-col gap-5 mb-8">
                  <div className="flex items-center">
                    <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Project:</span>
                    <span className="text-[11px] text-gray-600 font-medium">Green Valley Apartments</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Discipline:</span>
                    <span className="text-[11px] text-gray-600 font-medium">Mechanical & Electrical</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Review Type:</span>
                    <span className="text-[11px] text-gray-600 font-medium">Technical Review</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Status:</span>
                    <span className="text-[11px] text-gray-600 font-medium">In Progress</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Due Date:</span>
                    <span className="text-[11px] text-gray-600 font-medium">June 22, 2026</span>
                  </div>
                </div>

                <div className="flex gap-4 mt-auto pt-4 max-w-[80%]">
                  <button className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Review Package</button>
                  <button className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">View Annotations</button>
                </div>
              </div>
            </div>

            {/* Card 3 (Moved to second row first column if we don't wrap. If we wrap in a grid, it goes here) */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm h-fit">
              <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">Cost Estimation Review</h4>

              <div className="flex flex-col gap-5 mb-8">
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Project:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Crestview Residences</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Discipline:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Quantity Surveying</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[11px] text-[#0F181F] font-bold w-28 shrink-0">Status:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Awaiting Approval</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4 max-w-[80%]">
                <button className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Review BOQ</button>
                <button className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Approve Report</button>
              </div>
            </div>

          </div>
        </div>
  );
}
