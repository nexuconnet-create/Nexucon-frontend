"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Badge, Briefcase, UserCheck, Eye, Handshake } from "lucide-react";
import { useRouter } from "next/navigation";
import { IdentificationVerification } from "./components/IdentificationVerification";
import { MentorQualifications } from "./components/MentorQualifications";
import { PortfolioAndWorkSamples } from "./components/PortfolioAndWorkSamples";
import { MentorBackground } from "./components/MentorBackground";
import { MentorReferences } from "./components/MentorReferences";
import { ReviewInformation } from "./components/ReviewInformation";
import { VerificationSuccess } from "./components/VerificationSuccess";

export default function MentorOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white font-sans">

      {/* Left Content Area */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        {step === 0 && (
          <div className="w-full flex flex-col px-6 sm:px-12 lg:px-24 xl:px-32 py-10 lg:py-16 h-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Logo */}
        <div className="mb-16 lg:mb-24">
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
            alt="Nexucon"
            width={60}
            height={60}
            className="w-48 lg:w-30 h-auto object-contain"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="flex-1 flex flex-col justify-center max-w-lg">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#022C4F] mb-4">
            Verify Your Mentor Profile
          </h1>
          <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-10">
            Complete your verification to build trust with clients, unlock project opportunities, and increase your visibility on Nexucon.
          </p>

          {/* Benefits List */}
          <div className="relative mb-12">
            {/* Vertical Line */}
            <div className="absolute left-[15px] top-4 bottom-4 w-[2px] bg-gray-200" />

            <div className="flex flex-col gap-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Badge className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">Earn a Verified Badge</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Briefcase className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">Access More Project Opportunities</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <UserCheck className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">Increase Client Confidence</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Eye className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">Improve Profile Visibility</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-8 h-8 rounded-full bg-[#022C4F] flex items-center justify-center flex-shrink-0 shadow-md">
                  <Handshake className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-medium text-sm sm:text-base">Participate in Bidding & Hiring</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep(1)}
            className="w-full py-4 sm:py-5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md active:scale-[0.98]"
          >
            Start Verification
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                localStorage.setItem('verification_status', 'skipped');
              }
              router.push("/mentors/dashboard");
            }}
            className="w-full mt-4 py-4 sm:py-5 bg-[#0f172a] hover:bg-[#0f172a]/90 text-white rounded-xl text-sm sm:text-base font-semibold transition-all shadow-md active:scale-[0.98]"
          >
            Skip Verification for Later
          </button>
        </div>
        </div>
        )}

        {step === 1 && (
          <IdentificationVerification onNext={() => setStep(2)} />
        )}

        {step === 2 && (
          <MentorQualifications onNext={() => setStep(3)} />
        )}

        {step === 3 && (
          <PortfolioAndWorkSamples onNext={() => setStep(4)} />
        )}

        {step === 4 && (
          <MentorBackground onNext={() => setStep(5)} />
        )}

        {step === 5 && (
          <MentorReferences onNext={() => setStep(6)} />
        )}

        {step === 6 && (
          <ReviewInformation onNext={() => setStep(7)} />
        )}

        {step === 7 && (
          <VerificationSuccess />
        )}
      </div>

      {/* Right Content Area (Image) */}
      <div className="hidden lg:flex w-1/2 p-6 xl:p-8">
        <div
          className="w-full h-full rounded-[2rem] bg-cover bg-center shadow-2xl relative overflow-hidden"
          style={{
            backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784223706/Group_56_gcyfhi.png')`, // Construction crane building image placeholder
          }}
        >
          {/* Subtle overlay to match mockup's slightly muted tone */}
          <div className="absolute inset-0 bg-[#022C4F]/10"></div>
        </div>
      </div>

    </div>
  );
}
