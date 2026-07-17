"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";

interface MenteeQualificationsProps {
  onNext: () => void;
}

export const MenteeQualifications: React.FC<MenteeQualificationsProps> = ({ onNext }) => {
  const [certFile, setCertFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [academicFile, setAcademicFile] = useState<File | null>(null);
  const [membershipFile, setMembershipFile] = useState<File | null>(null);

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
                num <= 2 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Verify Your Qualifications
      </h1>
      <p className="text-gray-700 text-sm mb-10">
        Upload certifications, licenses, and mentee credentials that demonstrate your expertise.
      </p>

      {/* Form Fields - Upload Grid */}
      <div className="grid grid-cols-1 gap-y-8 mb-6">
        
        {/* Mentee Certifications */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Mentee Certifications</label>
          <FileUploadDropzone
            onFileSelect={(file) => setCertFile(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        {/* Industry Licenses */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Industry Licenses</label>
          <FileUploadDropzone
            onFileSelect={(file) => setLicenseFile(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        {/* Academic Qualifications */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Academic Qualifications</label>
          <FileUploadDropzone
            onFileSelect={(file) => setAcademicFile(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        {/* Membership Certificates */}
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Membership Certificates</label>
          <FileUploadDropzone
            onFileSelect={(file) => setMembershipFile(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

      </div>

      <div className="flex justify-between mt-2 mb-10 text-[11px] sm:text-xs text-gray-400 font-medium px-1 w-full">
        <span>File Supported in jpeg, png, pdf</span>
        <span>Maximum Size: 5MB</span>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8">
        <p className="text-xs font-medium text-gray-800">
          Verified credentials help clients evaluate your qualifications and experience.
        </p>
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
