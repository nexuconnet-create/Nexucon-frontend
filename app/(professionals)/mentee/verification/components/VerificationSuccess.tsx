"use client";

import React from "react";
import Image from "next/image";
import { Check, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export const VerificationSuccess: React.FC = () => {
  const router = useRouter();

  return (
    <div className="w-full h-full flex flex-col px-6 sm:px-12 lg:px-16 xl:px-24 py-8 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      {/* Logo */}
      <div className="mb-10 flex-shrink-0">
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
      <div className="flex items-center w-full max-w-xl mb-12 relative flex-shrink-0">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[2px] bg-[#022C4F] z-0"></div>
        <div className="flex justify-between w-full relative z-10">
          {[1, 2, 3, 4, 5, 6, 7].map((num) => (
            <div 
              key={num} 
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-colors bg-[#022C4F] text-white`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Main Centered Content */}
      <div className="flex-1 flex flex-col items-center text-center w-full">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-4">
          Verification Submitted Successfully
        </h1>
        <p className="text-gray-700 text-sm sm:text-base mb-12 max-w-[460px]">
          Your documents have been received and are currently being reviewed by the Nexucon verification team.
        </p>

        {/* Checkmark Icon */}
        <div className="mb-14 relative flex items-center justify-center w-[120px] h-[120px] flex-shrink-0">
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-[3px] border-[#4CAF50] scale-[1.15]"></div>
          {/* Inner circle */}
          <div className="w-full h-full rounded-full bg-[#4CAF50] flex items-center justify-center shadow-lg">
            <Check strokeWidth={4} className="w-16 h-16 text-white" />
          </div>
        </div>

        {/* What Happens Next */}
        <h2 className="text-xl sm:text-2xl font-bold text-[#022C4F] mb-6">
          What Happens Next?
        </h2>
        
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-4 text-sm sm:text-base text-gray-800 mb-12 max-w-3xl">
          <span>Identity verification review</span>
          <ArrowRight className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          <span>Credential validation</span>
          <ArrowRight className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          <span>Portfolio assessment</span>
          <ArrowRight className="w-5 h-5 text-gray-900" strokeWidth={1.5} />
          <span>Final approval</span>
        </div>

        {/* Estimated Review Time */}
        <h3 className="text-xl sm:text-2xl font-bold text-[#022C4F] mb-4">
          Estimated Review Time
        </h3>
        <p className="text-gray-700 text-sm sm:text-base mb-12">
          1-5 Business Days
        </p>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex justify-center pt-4 pb-8 flex-shrink-0">
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined') {
              localStorage.setItem('verification_status', 'completed');
            }
            router.push("/mentee/dashboard");
          }}
          className="w-full max-w-[480px] py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md active:scale-[0.98]"
        >
          Go to Dashboard
        </button>
      </div>

    </div>
  );
};
