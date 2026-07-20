'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FolderUp, File } from 'lucide-react';
import Button from '@/components/ui/Button';

interface UploadFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadFolderModal({ isOpen, onClose }: UploadFolderModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setSelectedFolder('Architecture_Drawings_V3');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#0F181F]/60 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-[24px] font-extrabold text-[#022C4F]">Upload Folder</h2>
                <p className="text-[12px] text-gray-500 font-medium mt-1">Upload a complete folder structure into the repository.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
              
              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full h-[240px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-colors ${isDragging ? 'border-[#022C4F] bg-[#022C4F]/5' : 'border-gray-300 bg-gray-50'} mb-6`}
              >
                <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center mb-4">
                  <UploadCloud size={28} className="text-[#022C4F]" />
                </div>
                <h3 className="text-[16px] font-bold text-[#0F181F] mb-2">Drag and Drop Folder Here</h3>
                <p className="text-[12px] text-gray-500 font-medium mb-6">or select a folder from your computer</p>
                <button 
                  onClick={() => setSelectedFolder('Architecture_Drawings_V3')}
                  className="py-2.5 px-6 rounded-full border border-[#022C4F] text-[#022C4F] text-[12px] font-bold hover:bg-[#022C4F] hover:text-white transition-colors"
                >
                  Browse Computer
                </button>
              </div>

              {/* Selected Folder Preview */}
              {selectedFolder && (
                <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
                      <FolderUp size={20} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0F181F]">{selectedFolder}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">Ready to upload • 12 files</p>
                    </div>
                    <button 
                      onClick={() => setSelectedFolder(null)}
                      className="ml-auto text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Dummy file list */}
                  <div className="flex flex-col gap-2 pl-14">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-3">
                        <File size={14} className="text-gray-400" />
                        <span className="text-[11px] text-gray-600 font-medium">Drawing_Sheet_0{i}.pdf</span>
                      </div>
                    ))}
                    <div className="text-[11px] text-gray-400 font-medium italic mt-1">+ 9 more files</div>
                  </div>
                </div>
              )}
              
            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex justify-end gap-4 shrink-0 bg-white">
              <Button 
                variant="outline" 
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Folder uploaded successfully!', type: 'success' } }));
                  onClose();
                  setSelectedFolder(null);
                }}
                disabled={!selectedFolder}
              >
                Upload Folder
              </Button>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
