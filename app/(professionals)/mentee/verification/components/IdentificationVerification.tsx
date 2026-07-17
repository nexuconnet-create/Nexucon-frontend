"use client";

import React, { useState } from "react";
import Image from "next/image";
import { CustomSelect } from "@/components/CustomSelect";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";

interface IdentificationVerificationProps {
  onNext: () => void;
}

export const IdentificationVerification: React.FC<IdentificationVerificationProps> = ({ onNext }) => {
  const [selectedDoc, setSelectedDoc] = useState<string>("");
  const [idType, setIdType] = useState<string>("");
  const [idNumber, setIdNumber] = useState<string>("");
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);

  const acceptedDocs = [
    "National ID Card",
    "International Passport",
    "Driver's License",
    "Voter's Card"
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
                num === 1 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Verify Your Identity
      </h1>
      <p className="text-gray-700 text-sm mb-8">
        Upload a valid government-issued identification document for account verification.
      </p>

      {/* Accepted Documents */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-4">Accepted Documents</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {acceptedDocs.map((doc) => (
            <button
              key={doc}
              type="button"
              onClick={() => setSelectedDoc(doc)}
              className={`py-5 px-4 rounded-md border text-sm font-medium transition-all ${
                selectedDoc === doc 
                  ? "border-[#022C4F] bg-blue-50 text-[#022C4F]" 
                  : "border-gray-400 text-gray-700 hover:border-[#022C4F]"
              }`}
            >
              {doc}
            </button>
          ))}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="relative z-50">
          <label className="block text-sm font-bold text-gray-900 mb-2">ID Type</label>
          <CustomSelect
            value={idType}
            onChange={(val) => setIdType(val)}
            options={acceptedDocs.map(doc => ({ value: doc, label: doc }))}
            placeholder=""
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">ID Number</label>
          <input 
            type="text" 
            value={idNumber}
            onChange={(e) => setIdNumber(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>
      </div>

      {/* File Uploads */}
      <div className="mb-6">
        <label className="block text-sm font-bold text-gray-900 mb-2">Upload Front View</label>
        <FileUploadDropzone
          onFileSelect={(file) => setFrontFile(file)}
          accept=".jpeg,.jpg,.png,.pdf"
          maxSizeMB={5}
        />
      </div>

      <div className="mb-10">
        <label className="block text-sm font-bold text-gray-900 mb-2">Upload Back View</label>
        <FileUploadDropzone
          onFileSelect={(file) => setBackFile(file)}
          accept=".jpeg,.jpg,.png,.pdf"
          maxSizeMB={5}
        />
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 pb-8">
        <p className="text-xs font-bold text-gray-900">
          Your information is securely stored and used only for verification purposes.
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
