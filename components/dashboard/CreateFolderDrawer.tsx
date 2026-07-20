import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from '@/components/ui/Button';

interface CreateFolderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateFolderDrawer({ isOpen, onClose }: CreateFolderDrawerProps) {
  const [folderName, setFolderName] = useState('');
  const [folderDescription, setFolderDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const categories = [
    'Design Documents', 'Technical Specifications', 'Construction Handoff',
    'Construction Documents', 'Review & Approval', 'Custom Folder',
    'BOQ & Costing', 'Contracts & Agreements'
  ];

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
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
                <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-2">Create New Folder</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed">
                  Organize project documents and drawings into structured folders for easier access, collaboration, and version control.
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
            <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8">
              
              {/* Folder Name */}
              <div>
                <label className="block text-[13px] font-extrabold text-[#022C4F] mb-3">Folder Name</label>
                <input
                  type="text"
                  value={folderName}
                  onChange={(e) => setFolderName(e.target.value)}
                  className="w-full h-14 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] transition-shadow shadow-sm"
                />
              </div>

              {/* Folder Description */}
              <div>
                <label className="block text-[13px] font-extrabold text-[#022C4F] mb-3">Folder Description</label>
                <textarea
                  value={folderDescription}
                  onChange={(e) => setFolderDescription(e.target.value)}
                  className="w-full h-32 rounded-xl border border-[#022C4F] p-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] transition-shadow shadow-sm resize-none"
                />
              </div>

              {/* Folder Category */}
              <div>
                <label className="block text-[13px] font-extrabold text-[#022C4F] mb-2">Folder Category</label>
                <p className="text-[11px] text-gray-400 font-medium mb-4">Select Category</p>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                  {categories.map((cat) => (
                    <div 
                      key={cat} 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => toggleCategory(cat)}
                    >
                      <div className={`w-5 h-5 flex items-center justify-center border-2 transition-colors ${selectedCategories.includes(cat) ? 'bg-[#0F181F] border-[#0F181F]' : 'border-gray-400 bg-white group-hover:border-gray-500'}`}>
                         {selectedCategories.includes(cat) && <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                      </div>
                      <span className="text-[11px] font-medium text-[#0F181F]">{cat}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex flex-col gap-3">
              <Button 
                variant="primary" 
                className="!w-full h-[48px]"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Folder created successfully!', type: 'success' } }));
                  onClose();
                  setFolderName('');
                  setFolderDescription('');
                  setSelectedCategories([]);
                }}
              >
                Create Folder
              </Button>
              <Button 
                variant="outline" 
                className="!w-full h-[48px] bg-black text-white hover:bg-black/90 border-none"
                onClick={onClose}
              >
                Save Draft
              </Button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
