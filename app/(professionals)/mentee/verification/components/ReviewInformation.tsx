"use client";

import React, { useState } from "react";
import Image from "next/image";

interface ReviewInformationProps {
  onNext: () => void;
}

export const ReviewInformation: React.FC<ReviewInformationProps> = ({ onNext }) => {
  const [confirmAccuracy, setConfirmAccuracy] = useState(false);
  const [authorizeVerification, setAuthorizeVerification] = useState(false);

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
                num <= 6 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Review Your Information
      </h1>
      <p className="text-gray-700 text-sm mb-10">
        Please review your submitted information before sending it for verification.
      </p>

      {/* Checkboxes */}
      <div className="flex flex-col gap-6 mb-10 max-w-2xl">
        <label className="flex items-start gap-4 cursor-pointer">
          <input 
            type="checkbox" 
            checked={confirmAccuracy}
            onChange={(e) => setConfirmAccuracy(e.target.checked)}
            className="w-5 h-5 mt-0.5 border-gray-400 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
          />
          <span className="text-sm text-gray-800">
            I confirm that all information provided is accurate and authentic.
          </span>
        </label>

        <label className="flex items-start gap-4 cursor-pointer">
          <input 
            type="checkbox" 
            checked={authorizeVerification}
            onChange={(e) => setAuthorizeVerification(e.target.checked)}
            className="w-5 h-5 mt-0.5 border-gray-400 rounded text-[#022C4F] focus:ring-[#022C4F] cursor-pointer"
          />
          <span className="text-sm text-gray-800">
            I authorize Nexucon to verify submitted information where necessary.
          </span>
        </label>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-center sm:justify-end gap-4 pt-4 pb-8">
        <button
          type="button"
          onClick={onNext}
          disabled={!confirmAccuracy || !authorizeVerification}
          className={`w-full sm:w-[320px] py-4 rounded-xl text-sm font-semibold transition-all shadow-md ${
            confirmAccuracy && authorizeVerification
              ? "bg-[#022C4F] hover:bg-[#022C4F]/90 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          Submit for Verification
        </button>
      </div>

    </div>
  );
};
