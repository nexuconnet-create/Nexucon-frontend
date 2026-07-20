'use client';

import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import ExecutionHandoffModal from '@/components/dashboard/ExecutionHandoffModal';

export default function ConstructionHandoff() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const packages = [
    { name: 'Architectural Drawings', status: 'approved' },
    { name: 'Structural Drawings', status: 'approved' },
    { name: 'MEP Drawings', status: 'pending' },
    { name: 'Electrical Drawings', status: 'pending' },
    { name: 'Plumbing Drawings', status: 'pending' },
  ];

  return (
    <div className="bg-white rounded-[32px] border border-[#022C4F] p-8 shadow-sm flex flex-col">
      <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-1">Construction Handoff Package</h3>
      <p className="text-[13px] text-gray-500 font-medium mb-8">Approved Drawing Package</p>

      <div className="flex flex-col gap-5">
        {packages.map((pkg, index) => (
          <div key={index} className="flex items-center gap-3">
            {pkg.status === 'approved' ? (
              <div className="w-5 h-5 rounded-md bg-[#4CAF50] flex items-center justify-center text-white shrink-0 shadow-sm">
                <CheckCircle size={14} strokeWidth={3} />
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-[#FFD54F] shadow-sm"></div>
              </div>
            )}
            <span className="text-[12px] font-bold text-[#0F181F]">{pkg.name}</span>
          </div>
        ))}
      </div>

      <div className="mt-10 mb-8">
        <div className="flex justify-between items-end mb-3">
          <h4 className="text-[15px] font-extrabold text-[#022C4F]">Readiness Status</h4>
          <span className="text-[10px] font-bold text-gray-500">84%</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
          <div className="h-full bg-[#8BC34A] w-[84%] rounded-full shadow-sm"></div>
        </div>
        <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase tracking-widest">In Progress</p>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Generate Drawing Package executed successfully!', type: 'success' } })); }} className="flex-1 py-3.5 border border-[#022C4F] text-[#022C4F] rounded-xl text-[11px] font-bold hover:bg-gray-50 transition-colors shadow-sm text-center">
          Generate Drawing Package
        </button>
        <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsModalOpen(true); }} className="flex-1 py-3.5 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm text-center">
          Export for Construction
        </button>
      </div>

      <ExecutionHandoffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
