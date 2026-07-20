import React from "react";
import { ArrowUpRight } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
}

export default function MetricCard({ 
  title, 
  value
}: MetricCardProps) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#022C4F] flex flex-col justify-between hover:shadow-md transition-shadow h-[140px]">
      <div className="flex justify-between items-start">
        <h3 className="text-[#0F181F] font-bold text-sm">{title}</h3>
        <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center shrink-0">
          <ArrowUpRight size={18} className="text-[#022C4F]" />
        </div>
      </div>
      <div>
        <p className="text-[40px] leading-none font-extrabold text-[#0F181F]">{value}</p>
      </div>
    </div>
  );
}
