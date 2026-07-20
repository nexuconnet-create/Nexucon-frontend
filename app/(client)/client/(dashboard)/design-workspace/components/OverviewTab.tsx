import React, { useState, useRef } from "react";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";


export default function OverviewTab() {
  const [previewDrawing, setPreviewDrawing] = useState<{title: string, imageUrl: string} | null>(null);
  const [previewDocument, setPreviewDocument] = useState<File | null>(null);

  const handleOpenDrawing = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setPreviewDrawing({ 
      title: "Architectural_Plan_v2", 
      imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444888/Download_free_image_of_Architectural_drawing_blueprints_about_blueprint_building_construction_engineering_and_city_blueprint_445831_1_mft62b.png" 
    });
  };

  const handleOpenDocument = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setPreviewDocument(new File([""], "Structural_Specs_v2.4.pdf", { type: "application/pdf" }));
  };

  return (
    <>
      <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400 ease-out fill-mode-both">
          <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-8">Design Deliverables</h3>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col justify-between min-h-[300px] shadow-sm">
              <div>
                <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">Architectural Design Package</h4>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Status:</span>
                  <span className="bg-[#4CAF50] text-white text-[10px] font-bold px-5 py-1.5 rounded-full text-center">Approved</span>
                </div>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Version:</span>
                  <span className="text-[11px] text-gray-600 font-medium">v4.1</span>
                </div>

                <div className="flex items-center gap-10 mb-10">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Last updated:</span>
                  <span className="text-[11px] text-gray-600 font-medium">June 15, 2026</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4">
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'View executed successfully!', type: 'success' } })); }} className="flex-1 py-3.5 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View</button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Download executed successfully!', type: 'success' } })); }} className="flex-1 py-3.5 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Download</button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Share executed successfully!', type: 'success' } })); }} className="flex-1 py-3.5 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">Share</button>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col justify-between min-h-[300px] shadow-sm">
              <div>
                <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">Structural Design Package</h4>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Status:</span>
                  <span className="bg-[#D4AC0D] text-white text-[10px] font-bold px-5 py-1.5 rounded-full text-center">Under Review</span>
                </div>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Version:</span>
                  <span className="text-[11px] text-gray-600 font-medium">v3.0</span>
                </div>

                <div className="flex items-center gap-10 mb-10">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Last updated:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Today</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4 max-w-[65%]">
                <button onClick={handleOpenDrawing} className="flex-1 py-3.5 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View</button>
                <button onClick={handleOpenDrawing} className="flex-1 py-3.5 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Annotate</button>
                <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Approve executed successfully!', type: 'success' } })); }} className="flex-1 py-3.5 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">Approve</button>
              </div>
            </div>

            {/* Card 3 */}
            <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col justify-between min-h-[300px] shadow-sm">
              <div>
                <h4 className="text-[15px] font-bold text-[#022C4F] mb-8">MEP Coordination Package</h4>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Status:</span>
                  <span className="bg-[#4CAF50] text-white text-[10px] font-bold px-5 py-1.5 rounded-full text-center">In Progress</span>
                </div>

                <div className="flex items-center gap-10 mb-6">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Version:</span>
                  <span className="text-[11px] text-gray-600 font-medium">v2.4</span>
                </div>

                <div className="flex items-center gap-10 mb-10">
                  <span className="text-[11px] text-[#0F181F] font-bold w-16">Last updated:</span>
                  <span className="text-[11px] text-gray-600 font-medium">Yesterday</span>
                </div>
              </div>

              <div className="flex gap-4 mt-auto pt-4 max-w-[65%]">
                <button onClick={handleOpenDocument} className="flex-1 py-3.5 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View</button>
                <button onClick={handleOpenDocument} className="flex-1 py-3.5 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Comment</button>
              </div>
            </div>
          </div>
        </div>

        <DrawingPreviewModal 
          isOpen={!!previewDrawing} 
          onClose={() => setPreviewDrawing(null)} 
          imageUrl={previewDrawing?.imageUrl || ''}
          title={previewDrawing?.title || ''}
        />
        
        <DocumentPreviewModal 
          isOpen={!!previewDocument} 
          onClose={() => setPreviewDocument(null)} 
          file={previewDocument} 
        />
    </>
  );
}
