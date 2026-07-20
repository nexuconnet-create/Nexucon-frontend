'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Box, Zap, PenTool, Droplets, Trees, Flame, HardHat, Home, Map, Key, Briefcase } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CreateFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFolderModal({ isOpen, onClose }: CreateFolderModalProps) {
  const [folderName, setFolderName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Compass');

  const icons = [
    { name: 'Compass', icon: Compass },
    { name: 'Box', icon: Box },
    { name: 'Zap', icon: Zap },
    { name: 'PenTool', icon: PenTool },
    { name: 'Droplets', icon: Droplets },
    { name: 'Trees', icon: Trees },
    { name: 'Flame', icon: Flame },
    { name: 'HardHat', icon: HardHat },
    { name: 'Home', icon: Home },
    { name: 'Map', icon: Map },
    { name: 'Key', icon: Key },
    { name: 'Briefcase', icon: Briefcase },
  ];

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
            className="relative w-full max-w-[500px] bg-white rounded-[32px] shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-[24px] font-extrabold text-[#022C4F]">Create New Folder</h2>
                <p className="text-[12px] text-gray-500 font-medium mt-1">Organize your repository with a new custom folder.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 pb-10">
              
              {/* Folder Name */}
              <div className="mb-8">
                <label className="block text-[13px] font-extrabold text-[#022C4F] mb-3">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  placeholder="e.g. Interior Design Concepts"
                  className="w-full h-14 rounded-xl border border-gray-300 px-4 text-[13px] text-[#0F181F] placeholder-gray-400 focus:outline-none focus:border-[#022C4F] transition-colors shadow-sm"
                />
              </div>

              {/* Select Icon */}
              <div>
                <label className="block text-[13px] font-extrabold text-[#022C4F] mb-3">Select Folder Icon</label>
                <div className="grid grid-cols-6 gap-3">
                  {icons.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = selectedIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => setSelectedIcon(item.name)}
                        className={`aspect-square rounded-xl flex items-center justify-center transition-all duration-200 ${
                          isSelected 
                            ? 'bg-[#022C4F] text-[#FFD54F] shadow-md scale-105' 
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200'
                        }`}
                      >
                        <IconComp size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>
              
            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex justify-end gap-4 bg-gray-50/50">
              <Button 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                variant="primary"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Folder created successfully!', type: 'success' } }));
                  onClose();
                  setFolderName('');
                  setSelectedIcon('Compass');
                }}
                disabled={!folderName.trim()}
              >
                Create Folder
              </Button>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
