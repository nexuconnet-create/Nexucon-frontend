import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";


export default function DrawingsTab({ DRAWINGS, setPreviewDrawing }: { DRAWINGS: any[], setPreviewDrawing: any }) {
  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-10">Drawing Repository</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {DRAWINGS.map((drawing) => (
              <div
                key={drawing.id}
                className="flex flex-col items-center group cursor-pointer"
                onClick={() => setPreviewDrawing(drawing)}
              >
                <div className="w-full aspect-[3/4] bg-white border border-gray-200 rounded-xl shadow-sm mb-4 overflow-hidden relative group-hover:shadow-lg transition-all group-hover:border-[#022C4F]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={drawing.imageUrl} alt={drawing.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="text-[11px] font-bold text-[#0F181F] tracking-wide">{drawing.title}</p>
              </div>
            ))}
          </div>
        </div>
  );
}
