"use client";

import React, { useState } from "react";
import Image from "next/image";

interface MenteeReferencesProps {
  onNext: () => void;
}

export const MenteeReferences: React.FC<MenteeReferencesProps> = ({ onNext }) => {
  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [company, setCompany] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

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
                num <= 5 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Mentee References
      </h1>
      <p className="text-gray-700 text-sm mb-10">
        Provide references that can help validate your mentee experience.
      </p>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8 mb-10">
        
        {/* Full Name */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
          <input 
            type="text" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Position</label>
          <input 
            type="text" 
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Company */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Company</label>
          <input 
            type="text" 
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
          <input 
            type="email" 
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        {/* Phone Number */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
          <input 
            type="tel" 
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
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
