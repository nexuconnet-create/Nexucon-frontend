import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export default function ReviewMetrics() {
  const metrics = [
    { id: 1, title: 'Active Reviews', value: '12' },
    { id: 2, title: 'Pending Reviews', value: '7' },
    { id: 3, title: 'Drawings Awaiting Approval', value: '9' },
    { id: 4, title: 'Open Comments', value: '46' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {metrics.map((metric) => (
        <div 
          key={metric.id} 
          className="bg-white border border-[#022C4F] rounded-3xl p-6 shadow-sm flex flex-col justify-between min-h-[140px] hover:shadow-md transition-shadow cursor-pointer group"
        >
          <div className="flex justify-between items-start mb-6">
            <h4 className="text-[12px] font-extrabold text-[#022C4F] max-w-[80%] leading-tight">{metric.title}</h4>
            <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center shrink-0 group-hover:bg-[#022C4F] group-hover:text-white transition-colors text-[#022C4F]">
              <ArrowUpRight size={16} />
            </div>
          </div>
          <div className="text-[36px] font-extrabold text-[#0F181F] leading-none">
            {metric.value}
          </div>
        </div>
      ))}
    </div>
  );
}
