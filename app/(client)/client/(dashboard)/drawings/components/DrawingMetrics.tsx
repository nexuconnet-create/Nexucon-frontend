import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function DrawingMetrics() {
  const metrics = [
    { label: 'Total Drawings', value: '86' },
    { label: 'Approved Drawings', value: '52' },
    { label: 'Under Review', value: '18' },
    { label: 'Pending Approval', value: '9' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map((metric, index) => (
        <div key={index} className="bg-white rounded-2xl border border-[#022C4F] p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <span className="text-[13px] font-extrabold text-[#022C4F]">{metric.label}</span>
            <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] group-hover:bg-[#022C4F] group-hover:text-white transition-colors">
              <ArrowUpRight size={16} strokeWidth={2.5} />
            </div>
          </div>
          <span className="text-[32px] font-extrabold text-[#0F181F]">{metric.value}</span>
        </div>
      ))}
    </div>
  );
}
