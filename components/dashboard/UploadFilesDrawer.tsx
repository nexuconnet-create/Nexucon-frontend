import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CloudUpload } from 'lucide-react';
import Button from '@/components/ui/Button';

interface UploadFilesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadFilesDrawer({ isOpen, onClose }: UploadFilesDrawerProps) {
  const [isDragging, setIsDragging] = useState(false);

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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-4 top-4 bottom-4 w-[500px] bg-white rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-2">Upload Project Files</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                  Upload drawings, reports, specifications, contracts, images, and other project documents to the selected folder for collaboration, review, and approval.
                </p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0 -mt-2 -mr-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col">
              
              {/* Upload Destination */}
              <div className="mb-8">
                <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Upload Destination</h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-8">
                    <div>
                      <p className="text-[11px] font-bold text-[#0F181F] mb-1">Project</p>
                      <p className="text-[11px] text-gray-500 font-medium">Victoria Heights Residential Estate</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#0F181F] mb-1">Folder</p>
                      <p className="text-[11px] text-gray-500 font-medium">Structural Design Package V3.0</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="primary" className="!h-8 px-4 text-[10px]">
                    Change Folder
                  </Button>
                </div>
              </div>

              <div className="w-full h-[1px] bg-gray-200 mb-8"></div>

              {/* Drag and Drop Zone */}
              <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full aspect-video rounded-xl border-2 border-dashed flex flex-col items-center justify-center transition-colors cursor-pointer mb-2 ${
                  isDragging ? 'border-[#022C4F] bg-[#022C4F]/5' : 'border-[#022C4F] bg-white hover:bg-gray-50'
                }`}
              >
                <CloudUpload size={48} className="text-[#0F181F] mb-4" strokeWidth={2.5} />
                <p className="text-[13px] text-[#0F181F] font-bold">
                  Drag and Drop Files here or <span className="text-[#022C4F] hover:underline cursor-pointer">Choose File</span>
                </p>
              </div>

              {/* Sub Text */}
              <div className="flex justify-between items-center text-gray-400 font-medium text-[11px]">
                <p>File Supported in jpeg, png, pdf</p>
                <p>Maximum Size: 5MB</p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex flex-col gap-3 mt-auto">
              <Button 
                variant="primary" 
                className="!w-full h-[48px]"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Files uploaded successfully!', type: 'success' } }));
                  onClose();
                }}
              >
                Upload Folder
              </Button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
