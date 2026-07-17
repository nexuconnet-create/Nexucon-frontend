"use client";

import React, { useState } from "react";
import Image from "next/image";
import { FileUploadDropzone } from "@/components/FileUploadDropzone";

interface PortfolioAndWorkSamplesProps {
  onNext: () => void;
}

export const PortfolioAndWorkSamples: React.FC<PortfolioAndWorkSamplesProps> = ({ onNext }) => {
  const [projectImages, setProjectImages] = useState<File | null>(null);
  const [projectReports, setProjectReports] = useState<File | null>(null);
  const [drawings, setDrawings] = useState<File | null>(null);
  const [caseStudies, setCaseStudies] = useState<File | null>(null);
  const [beforeAfter, setBeforeAfter] = useState<File | null>(null);
  const [completionCertificates, setCompletionCertificates] = useState<File | null>(null);

  const [projectName, setProjectName] = useState("");
  const [clientOrg, setClientOrg] = useState("");
  const [projectLocation, setProjectLocation] = useState("");
  const [projectDescription, setProjectDescription] = useState("");

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
                num <= 3 ? "bg-[#022C4F] text-white" : "bg-gray-400 text-white"
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] mb-3">
        Showcase Your Work
      </h1>
      <p className="text-gray-700 text-sm mb-10">
        Help clients understand your capabilities by sharing previous projects and work samples.
      </p>

      {/* Form Fields - Upload Grid */}
      <div className="grid grid-cols-1 gap-y-8 mb-10">
        
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Project Images</label>
          <FileUploadDropzone
            onFileSelect={(file) => setProjectImages(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Project Reports</label>
          <FileUploadDropzone
            onFileSelect={(file) => setProjectReports(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Drawings & Designs</label>
          <FileUploadDropzone
            onFileSelect={(file) => setDrawings(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Case Studies</label>
          <FileUploadDropzone
            onFileSelect={(file) => setCaseStudies(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Before & After Photos</label>
          <FileUploadDropzone
            onFileSelect={(file) => setBeforeAfter(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-3">Project Completion Certificates</label>
          <FileUploadDropzone
            onFileSelect={(file) => setCompletionCertificates(file)}
            accept=".jpeg,.jpg,.png,.pdf"
            maxSizeMB={5}
          />
        </div>
      </div>

      {/* Additional Fields */}
      <h3 className="text-[#022C4F] font-bold text-base mb-6">Additional Fields</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-12">
        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Project Name</label>
          <input 
            type="text" 
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Client/Organization (Optional)</label>
          <input 
            type="text" 
            value={clientOrg}
            onChange={(e) => setClientOrg(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Project Location</label>
          <input 
            type="text" 
            value={projectLocation}
            onChange={(e) => setProjectLocation(e.target.value)}
            className="w-full border border-gray-400 rounded-md p-3.5 text-sm focus:outline-none focus:border-[#022C4F]"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-900 mb-2">Project Description</label>
          <input 
            type="text" 
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
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
