import React from "react";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Button from "@/components/ui/Button";

export default function HireProfessionals() {
  const professionals = [
    {
      id: 1,
      name: "Michael Adeyemi",
      role: "Architect",
      status: "Available",
      statusColor: "bg-green-500",
      image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444885/8_Contract_Clauses_Every_Homeowner_Should_Understand_achlab_1_qvvl2s.png",
    },
    {
      id: 2,
      name: "Michael Adeyemi", // The design has the same name twice
      role: "Civil Engineer",
      status: "Busy",
      statusColor: "bg-red-500",
      image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png",
    }
  ];

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#022C4F] flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[#0F181F] font-extrabold text-sm">Hire Top Professionals</h3>
        <div className="w-8 h-8 rounded-full border border-[#022C4F] flex items-center justify-center shrink-0 cursor-pointer hover:bg-gray-50 transition-colors">
          <ArrowUpRight size={18} className="text-[#022C4F]" />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 h-full">
        {professionals.map((pro) => (
          <div key={pro.id} className="flex-1 border border-[#022C4F] rounded-2xl p-4 flex flex-col items-center justify-between hover:shadow-md transition-shadow">
            <div className="w-full flex justify-end mb-2">
              <span className={`inline-block w-8 h-3 rounded-full ${pro.statusColor}`}></span>
            </div>

            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-100 mb-3 relative">
              <Image
                src={pro.image}
                alt={pro.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="text-center mb-4">
              <p className="text-xs font-bold text-[#0F181F] whitespace-nowrap">{pro.name}</p>
              <p className="text-[10px] font-medium text-gray-500">{pro.role}</p>
            </div>

            <Button variant="outline" className="w-full h-[36px]">
              Hire for Project
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
