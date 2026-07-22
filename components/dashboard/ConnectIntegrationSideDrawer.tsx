import React from 'react';
import { X, Search } from 'lucide-react';

export default function ConnectIntegrationSideDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[650px] bg-white rounded-[32px] p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors z-10"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex-1 overflow-y-auto pr-4 -mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h2 className="text-[28px] font-extrabold text-[#0F181F] mb-3 tracking-tight">
            Connect New Integration
          </h2>
          <p className="text-[13px] text-gray-600 mb-12 max-w-[550px] leading-relaxed">
            Browse and connect additional third-party applications to enhance your project workflows.
          </p>

          <div className="relative mb-8">
            <input 
              type="text" 
              placeholder="Search integrations..." 
              className="w-full h-12 rounded-md border border-[#022C4F] pl-12 pr-4 text-[14px] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="flex flex-col gap-4">
            <div className="p-5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#022C4F]/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E0E5E9] rounded-lg flex items-center justify-center font-bold text-[#022C4F]">S</div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Slack</h4>
                  <p className="text-[12px] text-gray-500">Receive project notifications directly in Slack channels.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#022C4F] text-white text-[12px] font-bold rounded-full hover:bg-[#033A6B] transition-colors">
                Connect
              </button>
            </div>
            
            <div className="p-5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#022C4F]/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E0E5E9] rounded-lg flex items-center justify-center font-bold text-[#022C4F]">Z</div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Zoom</h4>
                  <p className="text-[12px] text-gray-500">Schedule and launch design review meetings via Zoom.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#022C4F] text-white text-[12px] font-bold rounded-full hover:bg-[#033A6B] transition-colors">
                Connect
              </button>
            </div>

            <div className="p-5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#022C4F]/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E0E5E9] rounded-lg flex items-center justify-center font-bold text-[#022C4F]">P</div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Procore</h4>
                  <p className="text-[12px] text-gray-500">Sync issues and RFIs with Procore construction management.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#022C4F] text-white text-[12px] font-bold rounded-full hover:bg-[#033A6B] transition-colors">
                Connect
              </button>
            </div>
            
            <div className="p-5 border border-gray-200 rounded-xl flex items-center justify-between hover:border-[#022C4F]/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#E0E5E9] rounded-lg flex items-center justify-center font-bold text-[#022C4F]">A</div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#022C4F]">Asana</h4>
                  <p className="text-[12px] text-gray-500">Track and manage project tasks directly inside Asana.</p>
                </div>
              </div>
              <button className="px-4 py-2 bg-[#022C4F] text-white text-[12px] font-bold rounded-full hover:bg-[#033A6B] transition-colors">
                Connect
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
