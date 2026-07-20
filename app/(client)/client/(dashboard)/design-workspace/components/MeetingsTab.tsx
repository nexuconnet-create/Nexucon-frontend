import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import Button from "@/components/ui/Button";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";


export default function MeetingsTab() {
  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
            <div>
              <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Upcoming Meetings</h3>
              <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
                Schedule, manage, and participate in project meetings, design reviews, stakeholder discussions, peer-review sessions, and coordination workshops throughout the project lifecycle.
              </p>
            </div>
            
          <Button 
            variant="primary"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Schedule Meeting executed successfully!', type: 'success' } })); }}
          >
            Schedule Meeting
          </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[400px]">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-[15px] font-bold text-[#022C4F] pr-4">Design Coordination Meeting</h4>
                <span className="bg-[#E1F5FE] text-[#0277BD] text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 border border-[#B3E5FC]">Virtual</span>
              </div>
              
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">June 20, 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">10:00 AM – 11:30 AM</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-[#E53935]" />
                  <span className="text-[11px] text-gray-600 font-medium">Virtual Meeting</span>
                </div>
              </div>

              <h5 className="text-[13px] font-bold text-[#022C4F] mb-4">Project Details</h5>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Project:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Organizer:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Participants:</span>
                </div>
                <div className="flex items-start flex-col gap-2">
                  <span className="text-[11px] text-[#0F181F] font-bold shrink-0">Agenda:</span>
                  <ul className="flex flex-col gap-2 pl-2 mt-1">
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F] mt-1.5 shrink-0"></div>
                      <span className="text-[11px] text-gray-600">Structural design progress review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F] mt-1.5 shrink-0"></div>
                      <span className="text-[11px] text-gray-600">Open design issues</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F] mt-1.5 shrink-0"></div>
                      <span className="text-[11px] text-gray-600">Coordination between disciplines</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#022C4F] mt-1.5 shrink-0"></div>
                      <span className="text-[11px] text-gray-600">Upcoming approval deadlines</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4 mt-auto pt-4">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Join Meeting executed successfully!', type: 'success' } })); }} className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">Join Meeting</button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'View Agenda executed successfully!', type: 'success' } })); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">View Agenda</button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Add Notes executed successfully!', type: 'success' } })); }} className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">Add Notes</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[400px]">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-[15px] font-bold text-[#022C4F] pr-4">Structural Peer Review Session</h4>
                <span className="bg-[#FFF3E0] text-[#E65100] text-[9px] font-bold px-2.5 py-1 rounded-full shrink-0 border border-[#FFE0B2]">On-Site</span>
              </div>
              
              <div className="flex flex-col gap-3 mb-8">
                <div className="flex items-center gap-3">
                  <Calendar size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">June 22, 2026</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={14} className="text-[#0277BD]" />
                  <span className="text-[11px] text-gray-600 font-medium">2:00 PM – 4:00 PM</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-[#E53935]" />
                  <a href="#" className="text-[11px] text-[#0277BD] font-medium hover:underline flex items-center gap-1">Victoria Heights Site, Lekki (View Map)</a>
                </div>
              </div>

              <h5 className="text-[13px] font-bold text-[#022C4F] mb-4">Project Details</h5>
              
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Project:</span>
                </div>
                <div className="flex items-start">
                  <span className="text-[11px] text-[#0F181F] font-bold w-24 shrink-0">Reviewer:</span>
                </div>
                <div className="flex items-start flex-col gap-2 mt-4">
                  <span className="text-[11px] text-[#0F181F] font-bold shrink-0">Objective:</span>
                  <span className="text-[11px] text-gray-600 pl-2">Review structural framework directly at the foundation site.</span>
                </div>
                <div className="flex items-start flex-col gap-2 mt-2">
                  <span className="text-[11px] text-[#0F181F] font-bold shrink-0">Parking Info:</span>
                  <span className="text-[11px] text-gray-600 pl-2">Use North Gate entrance. Reserved spots available for visitors.</span>
                </div>
                <div className="flex items-start flex-col gap-2 mt-2">
                  <span className="text-[11px] text-[#0F181F] font-bold shrink-0">Point of Contact:</span>
                  <span className="text-[11px] text-gray-600 pl-2">Site Manager (08012345678)</span>
                </div>
              </div>
              
              <div className="flex gap-4 mt-auto pt-4 max-w-[90%]">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Check-In executed successfully!', type: 'success' } })); }} className="flex-1 py-3 border border-[#E53935] text-[#E53935] rounded-xl text-[11px] font-bold hover:bg-[#FFEBEE] transition-colors shadow-sm flex items-center justify-center gap-2">
                  <MapPin size={12} /> Check-In
                </button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Review Package executed successfully!', type: 'success' } })); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Review Package</button>
              </div>
            </div>

          </div>
        </div>
  );
}
