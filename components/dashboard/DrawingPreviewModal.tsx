import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut } from 'lucide-react';

interface DrawingPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
}

export default function DrawingPreviewModal({ isOpen, onClose, imageUrl, title }: DrawingPreviewModalProps) {
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#022C4F]/80 backdrop-blur-sm animate-in fade-in duration-300">
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors border border-white/20"
      >
        <X size={24} />
      </button>

      <div className="bg-[#0F181F] rounded-[24px] w-[90%] max-w-5xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-300 overflow-hidden border border-white/10">
        {/* Top: Image Section */}
        <div className="relative w-full h-[65vh] bg-white overflow-hidden p-2 rounded-t-[24px]">
          <div
            className={`w-full h-full rounded-[20px] overflow-hidden flex items-center justify-center ${zoomScale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="object-contain w-full h-full"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out'
              }}
              draggable={false}
            />
          </div>
        </div>

        {/* Bottom: Details & Controls */}
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-white text-lg font-bold mb-1">{title}</h2>
            <p className="text-gray-400 text-sm">Victoria Heights Residential Estate</p>
          </div>

          <div className="flex bg-[#022C4F] rounded-lg overflow-hidden border border-white/5 shadow-inner self-start md:self-auto shrink-0">
            <button
              onClick={() => setZoomScale(s => Math.min(s + 0.3, 4))}
              className="px-5 py-3 text-white hover:bg-[#033A6B] transition-colors flex items-center justify-center"
            >
              <ZoomIn size={20} />
            </button>
            <div className="w-[1px] bg-white/20 my-2"></div>
            <button
              onClick={() => setZoomScale(s => {
                const newScale = Math.max(s - 0.3, 0.5);
                if (newScale <= 1) setPosition({ x: 0, y: 0 });
                return newScale;
              })}
              className="px-5 py-3 text-white hover:bg-[#033A6B] transition-colors flex items-center justify-center"
            >
              <ZoomOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
