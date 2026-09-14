'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UploadCloud, FolderUp, File } from 'lucide-react';
import Button from '@/components/ui/Button';

interface UploadFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Folder name from the real selection: the first path segment of the first
// file's relative path when a folder was picked, otherwise a neutral label.
const getFolderName = (files: File[]): string => {
  const first = files[0] as (File & { webkitRelativePath?: string }) | undefined;
  const rel = first?.webkitRelativePath;
  if (rel && rel.includes('/')) return rel.split('/')[0];
  return 'Selected Files';
};

export default function UploadFolderModal({ isOpen, onClose }: UploadFolderModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Enable native folder picking on the hidden input.
  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute('webkitdirectory', '');
    }
  }, [isOpen]);

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
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length > 0) setSelectedFiles(files);
  };

  const handleFolderSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) setSelectedFiles(files);
    e.target.value = '';
  };

  const folderName = selectedFiles.length > 0 ? getFolderName(selectedFiles) : null;
  const visibleFiles = selectedFiles.slice(0, 8);
  const remainingCount = selectedFiles.length - visibleFiles.length;

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
                <p className="text-[12px] text-gray-500 font-medium mb-6">
                  {selectedFiles.length > 0
                    ? `${selectedFiles.length} file${selectedFiles.length === 1 ? '' : 's'} selected`
                    : 'or select a folder from your computer'}
                </p>
                <input
                  ref={folderInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFolderSelect}
                />
                <button
                  onClick={() => folderInputRef.current?.click()}
                  className="py-2.5 px-6 rounded-full border border-[#022C4F] text-[#022C4F] text-[12px] font-bold hover:bg-[#022C4F] hover:text-white transition-colors"
                >
                  Browse Computer
                </button>
              </div>

              {/* Selected Folder Preview — the user's actual selection */}
              {folderName && (
                <div className="bg-[#f8f9fa] rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-[#022C4F]/10 flex items-center justify-center text-[#022C4F]">
                      <FolderUp size={20} />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#0F181F]">{folderName}</h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        Ready to upload • {selectedFiles.length} file{selectedFiles.length === 1 ? '' : 's'}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedFiles([])}
                      className="ml-auto text-[11px] font-bold text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  </div>

                  {/* Real file list from the selection */}
                  <div className="flex flex-col gap-2 pl-14">
                    {visibleFiles.map((file, i) => (
                      <div key={`${file.name}-${i}`} className="flex items-center gap-3">
                        <File size={14} className="text-gray-400 shrink-0" />
                        <span className="text-[11px] text-gray-600 font-medium truncate">{file.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium shrink-0">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                    {remainingCount > 0 && (
                      <div className="text-[11px] text-gray-400 font-medium italic mt-1">+ {remainingCount} more file{remainingCount === 1 ? '' : 's'}</div>
                    )}
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
                  setSelectedFiles([]);
                }}
                disabled={selectedFiles.length === 0}
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
