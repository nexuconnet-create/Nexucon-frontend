"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CustomSelect } from "@/components/CustomSelect";

interface MenteeBackgroundProps {
  onNext: () => void;
}

export const MenteeBackground: React.FC<MenteeBackgroundProps> = ({ onNext }) => {
  const [employmentStatus1, setEmploymentStatus1] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [position, setPosition] = useState("");
  const [yearsExperience, setYearsExperience] = useState("");
  const [employmentStatus2, setEmploymentStatus2] = useState("");

  // Since the mockup has two "Employment Status" fields, we'll provide options for the select one
  const statusOptions = [
    { value: "Employed", label: "Employed" },
    { value: "Self-Employed", label: "Self-Employed" },
    { value: "Freelance", label: "Freelance" },
    { value: "Unemployed", label: "Unemployed" }
  ];

  return (
    <div className="w-full h-full flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Logo */}
      <div className="mb-10">
        <Image 
          src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png" 
          alt="Nexucon" 
          width={180} 
          height={48} 
          className="w-40 h-auto object-contain" 
          priority
        />
      </div>

      {/* Step Indicator */}
      <div className="flex items-center w-full max-w-xl mb-12 relative">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-gray-300 z-0"></div>
        <div className="flex justify-between w-full relative z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div 
              key={num} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors ${
                num <= 4 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Mentee Background
      </h1>
      <p className="text-gray-700 text-sm mb-10">
        Tell us about your mentee practice or business.
      </p>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-10">
        
        {/* Employment Status 1 (Text input based on mockup) */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Employment Status</label>
          <input 
            type="text" 
            value={employmentStatus1}
            onChange={(e) => setEmploymentStatus1(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Company/Firm Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Company/Firm Name (Optional)</label>
          <input 
            type="text" 
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Position/Role */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Position/Role</label>
          <input 
            type="text" 
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Years of Mentee Experience</label>
          <input 
            type="text" 
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Employment Status 2 (Select input based on mockup) */}
        <div className="relative z-50">
          <label className="block text-sm font-bold text-gray-900 mb-2">Employment Status</label>
          <CustomSelect
            value={employmentStatus2}
            onChange={(val) => setEmploymentStatus2(val)}
            options={statusOptions}
            placeholder=""
          />
        </div>

      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 pb-8">
        <button
          type="button"
          onClick={onNext}
          className="w-full sm:w-auto px-12 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md"
        >
          Continue
        </button>
      </div>

    </div>
  );
};
