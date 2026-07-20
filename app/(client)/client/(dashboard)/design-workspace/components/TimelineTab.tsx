import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";


export default function TimelineTab() {
  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
          <div className="mb-10">
            <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Project Timeline</h3>
            <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
              Track project milestones, design activities, review sessions, approvals, and key deadlines throughout the design and pre-construction lifecycle.
            </p>
          </div>
          
          <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-sm">
            {/* Header Controls */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#FAFAFA]">
               <div className="flex items-center gap-2">
                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:bg-gray-50 transition-colors"><ChevronLeft size={14}/></button>
                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Today executed successfully!', type: 'success' } })); }} className="px-5 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors">Today</button>
                 <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Action executed successfully!', type: 'success' } })); }} className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm text-gray-500 hover:bg-gray-50 transition-colors"><ChevronRight size={14}/></button>
               </div>
               <div className="flex items-center gap-4 text-[11px] font-bold text-gray-500">
                 <span className="hover:text-[#022C4F] cursor-pointer transition-colors">Day</span>
                 <span className="bg-[#E53935] text-white px-4 py-1.5 rounded-full cursor-pointer shadow-sm">Week</span>
                 <span className="hover:text-[#022C4F] cursor-pointer transition-colors">Month</span>
                 <span className="hover:text-[#022C4F] cursor-pointer transition-colors">Year</span>
               </div>
            </div>

            {/* Calendar Grid */}
            <div className="flex overflow-x-auto">
               {/* Time column */}
               <div className="w-16 flex-shrink-0 border-r border-gray-100 bg-[#FAFAFA]">
                  <div className="h-16 border-b border-gray-100 flex items-end justify-center pb-2 text-[8px] text-gray-400 font-bold uppercase leading-tight text-center">
                     EST<br/>GMT-5
                  </div>
                  {[7,8,9,10,11,12,1,2,3,4,5].map((hour, idx) => (
                    <div key={idx} className="h-16 border-b border-gray-100 flex justify-center pt-2">
                       <span className="text-[9px] text-gray-500 font-bold">{hour} {idx < 5 ? 'AM' : (hour === 12 ? 'PM' : 'PM')}</span>
                    </div>
                  ))}
               </div>
               
               {/* Days Columns */}
               <div className="flex-1 min-w-[800px] grid grid-cols-7 relative">
                  {[
                    {day: 'SUN', date: '21'},
                    {day: 'MON', date: '22'},
                    {day: 'TUE', date: '23'},
                    {day: 'WED', date: '24'},
                    {day: 'THU', date: '25'},
                    {day: 'FRI', date: '26'},
                    {day: 'SAT', date: '27'}
                  ].map((d, colIdx) => (
                    <div key={colIdx} className={`border-r border-gray-100 relative ${d.day === 'SUN' || d.day === 'SAT' ? 'bg-[#FAFAFA]/50' : 'bg-white'}`}>
                      {/* Day Header */}
                      <div className="h-16 border-b border-gray-100 flex flex-col items-center justify-center bg-[#FAFAFA]">
                         <span className="text-[9px] text-gray-500 font-bold mb-0.5">{d.day}</span>
                         <span className="text-lg font-extrabold text-[#022C4F]">{d.date}</span>
                      </div>
                      
                      {/* Hour Cells (Background Grid) */}
                      {[...Array(11)].map((_, i) => (
                        <div key={i} className="h-16 border-b border-gray-50"></div>
                      ))}

                      {/* Events (Absolutely positioned within the column relative to the top of the day header) */}
                      {colIdx === 1 && ( /* MON */
                        <>
                          <div className="absolute top-[calc(4rem+1*4rem)] left-1 right-1 h-[calc(2*4rem-4px)] bg-[#E1F5FE] border border-[#B3E5FC] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                            <span className="text-[9px] font-bold text-[#0277BD] mb-1 flex items-center gap-1">8:00 AM <CheckCircle size={8} className="opacity-0 group-hover:opacity-100 transition-opacity"/></span>
                            <span className="text-[10px] font-bold text-[#01579B] leading-tight">Structural Design Review</span>
                          </div>
                          <div className="absolute top-[calc(4rem+6*4rem)] left-1 right-1 h-[calc(1*4rem-4px)] bg-[#E1F5FE] border border-[#B3E5FC] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden">
                            <span className="text-[9px] font-bold text-[#0277BD] mb-1">1:00 PM</span>
                            <span className="text-[10px] font-bold text-[#01579B] leading-tight truncate">Requirements & Planning</span>
                          </div>
                        </>
                      )}

                      {colIdx === 2 && ( /* TUE */
                        <div className="absolute top-[calc(4rem+2*4rem)] left-1 right-1 h-[calc(1*4rem-4px)] bg-[#E1F5FE] border border-[#B3E5FC] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden">
                           <span className="text-[9px] font-bold text-[#0277BD] mb-1">9:00 AM</span>
                           <span className="text-[10px] font-bold text-[#01579B] leading-tight truncate">MEP Design</span>
                        </div>
                      )}

                      {colIdx === 3 && ( /* WED */
                        <div className="absolute top-[calc(4rem+4*4rem)] left-1 right-1 h-[calc(1*4rem-4px)] bg-[#F3E5F5] border border-[#E1BEE7] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                           <span className="text-[9px] font-bold text-[#7B1FA2] mb-1 flex items-center gap-1">11:00 AM <CheckCircle size={8} className="opacity-0 group-hover:opacity-100 transition-opacity"/></span>
                           <span className="text-[10px] font-bold text-[#4A148C] leading-tight truncate">Structural Framework</span>
                        </div>
                      )}

                      {colIdx === 4 && ( /* THU */
                        <div className="absolute top-[calc(4rem+3*4rem)] left-1 right-1 h-[calc(1*4rem-4px)] bg-[#F3E5F5] border border-[#E1BEE7] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                           <span className="text-[9px] font-bold text-[#7B1FA2] mb-1 flex items-center gap-1">10:00 AM <CheckCircle size={8} className="opacity-0 group-hover:opacity-100 transition-opacity"/></span>
                           <span className="text-[10px] font-bold text-[#4A148C] leading-tight truncate">MEP Installation</span>
                        </div>
                      )}

                      {colIdx === 5 && ( /* FRI */
                        <div className="absolute top-[calc(4rem+2*4rem)] left-1 right-1 h-[calc(1*4rem-4px)] bg-[#E1F5FE] border border-[#B3E5FC] rounded-md p-2 flex flex-col shadow-sm z-10 hover:shadow-md transition-all cursor-pointer overflow-hidden group">
                           <span className="text-[9px] font-bold text-[#0277BD] mb-1 flex items-center gap-1">9:00 AM <CheckCircle size={8} className="opacity-0 group-hover:opacity-100 transition-opacity"/></span>
                           <span className="text-[10px] font-bold text-[#01579B] leading-tight truncate">Final Inspection</span>
                        </div>
                      )}

                    </div>
                  ))}
               </div>
            </div>
          </div>
        </div>
  );
}
