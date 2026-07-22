"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import { CustomSelect } from "@/components/CustomSelect";
import ProfilePill from "@/components/ui/ProfilePill";

export default function NewProjectPage() {
  const router = useRouter();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isFinalModalOpen, setIsFinalModalOpen] = useState(false);

  const [projectType, setProjectType] = useState("");
  const [country, setCountry] = useState("");
  const [numFloors, setNumFloors] = useState("");
  const [numReviewers, setNumReviewers] = useState("");

  return (
    <div className={`relative w-full ${step === 10 ? 'min-h-[calc(100dvh-140px)]' : 'space-y-6 pb-12'}`}>

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out fill-mode-both">
        <div>
          <h1 className="text-3xl font-extrabold text-[#022C4F] mb-2">
            {step === 10 ? "Smart AI Design Assistant" : "Create a New Design Project"}
          </h1>
          <p className="text-[13px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
            {step === 10 
              ? "Need Help Defining Your Project?" 
              : "Launch a new design or pre-construction project, collaborate with architects and engineers, manage reviews, and prepare project documentation for successful execution."}
          </p>
        </div>

        {/* Top Right Utilities */}
        <div className="hidden lg:flex items-center justify-end w-auto gap-4">
          <button className="w-10 h-10 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0">
            <Search size={18} />
          </button>
          <button
            onClick={() => setIsNotificationOpen(true)}
            className="w-10 h-10 rounded-full border border-[#022C4F] flex items-center justify-center text-[#022C4F] hover:bg-gray-50 transition-colors shrink-0 relative"
          >
            <Bell size={18} />
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#022C4F] rounded-full"></span>
          </button>
          <ProfilePill />
        </div>
      </div>

      {/* Main Form Area */}
      <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150 ease-out fill-mode-both">

        {step === 1 && (
          <>
            {/* Project Information */}
            <div className="mb-10">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Project Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Title */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0">Project Title</label>
                  <input
                    type="text"
                    placeholder="Enter Project Name"
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                  />
                </div>

                {/* Type */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-36 shrink-0">Select Project Type</label>
                  <div className="relative flex-1 z-50">
                    <CustomSelect
                      options={[
                        { value: "residential", label: "Residential" },
                        { value: "commercial", label: "Commercial" },
                        { value: "infrastructure", label: "Infrastructure" }
                      ]}
                      value={projectType}
                      onChange={setProjectType}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="flex flex-col md:flex-row gap-2 md:gap-6 md:col-span-2">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0 pt-3">Project Description</label>
                  <textarea
                    placeholder="Describe your project vision, objectives, requirements, and expected deliverables."
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F] min-h-[160px] resize-none"
                  ></textarea>
                </div>

              </div>
            </div>

            {/* Project Location */}
            <div className="mb-12">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Project Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

                {/* Address */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0">Project Site Address</label>
                  <input
                    type="text"
                    placeholder="Enter project location"
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                  />
                </div>

                {/* Country */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-36 shrink-0 md:text-right">Country</label>
                  <div className="relative flex-1 z-40">
                    <CustomSelect
                      options={[
                        { value: "NG", label: "Nigeria" },
                        { value: "US", label: "United States" },
                        { value: "UK", label: "United Kingdom" }
                      ]}
                      value={country}
                      onChange={setCountry}
                      placeholder="Select Country"
                      searchable={true}
                    />
                  </div>
                </div>

                {/* State / Region */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0">State / Region</label>
                  <input
                    type="text"
                    placeholder="Select State"
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                  />
                </div>

                {/* City */}
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-36 shrink-0 md:text-right">City</label>
                  <input
                    type="text"
                    placeholder="Enter City"
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                  />
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            {/* Design Requirements */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Design Requirements</h2>

              <div className="flex flex-col gap-8">

                {/* Services Needed */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0 pt-1">Services Needed</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-6 gap-x-6 flex-1">
                    {[
                      "Architectural Design", "Structural Design", "Civil Engineering Design",
                      "Mechanical Engineering Design", "Structural Engineer", "Electrical Engineering Design",
                      "Plumbing Design", "Quantity Surveying", "Interior Design", "Landscape Design",
                      "BIM Modeling", "Project Planning", "Construction Documentation"
                    ].map((service) => (
                      <label key={service} className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-xs font-medium text-[#0F181F] leading-tight">{service}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Project Objectives */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6">
                  <label className="text-sm font-medium text-[#022C4F] md:w-32 shrink-0 pt-3">Project Objectives</label>
                  <textarea
                    placeholder="What are the key goals for this project?"
                    className="flex-1 px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F] min-h-[260px] resize-none"
                  ></textarea>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(3)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            {/* Building Information */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Building Information</h2>

              <div className="flex flex-col gap-10 max-w-3xl">

                {/* Estimated Project Size */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Estimated Project Size</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {["Small Project", "Medium Project", "Large Project", "Enterprise Scale"].map((size) => (
                      <label key={size} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Number of Floors */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0">Number of Floors</label>
                  <div className="relative flex-1 max-w-md z-30">
                    <CustomSelect
                      options={[
                        { value: "1", label: "1 Floor" },
                        { value: "2", label: "2 Floors" },
                        { value: "3", label: "3 Floors" },
                        { value: "4+", label: "4+ Floors" }
                      ]}
                      value={numFloors}
                      onChange={setNumFloors}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Estimated Building Area */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0">Estimated Building Area</label>
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Enter square meters (m²)"
                      className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                    />
                  </div>
                </div>

                {/* Expected Occupancy */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0">Expected Occupancy</label>
                  <div className="flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Enter expected number of occupants"
                      className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-[#022C4F]"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(4)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            {/* Design Deliverables */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Design Deliverables</h2>

              <div className="flex flex-col gap-10 max-w-3xl">

                {/* Required Deliverables */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Required Deliverables</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {[
                      "Architectural Drawings", "Structural Drawings", "MEP Drawings",
                      "BOQ (Bill of Quantities)", "Cost Estimates", "Construction Specifications",
                      "Tender Documentation", "Design Review Reports", "Approval Documentation",
                      "Construction-Ready Package"
                    ].map((deliverable) => (
                      <label key={deliverable} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{deliverable}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(5)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 5 && (
          <>
            {/* Collaboration & Peer Review */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Collaboration & Peer Review</h2>

              <div className="flex flex-col gap-10 max-w-3xl">

                {/* Review Requirements */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Review Requirements</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {[
                      "Internal Design Review", "External Peer Review", "Client Approval Review",
                      "Consultant Endorsement", "Cost Estimates", "Regulatory Compliance Review"
                    ].map((req) => (
                      <label key={req} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{req}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Number of Reviewers Needed */}
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0">Number of Reviewers Needed</label>
                  <div className="relative flex-1 max-w-md z-20">
                    <CustomSelect
                      options={[
                        { value: "1", label: "1 Reviewer" },
                        { value: "2", label: "2 Reviewers" },
                        { value: "3", label: "3 Reviewers" },
                        { value: "4+", label: "4+ Reviewers" }
                      ]}
                      value={numReviewers}
                      onChange={setNumReviewers}
                      placeholder=""
                    />
                  </div>
                </div>

                {/* Collaborative Review Access */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Collaborative Review Access</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {[
                      "Allow invited reviewers to comment on drawings",
                      "Allow document annotations",
                      "Allow shared review sessions",
                      "Track review history"
                    ].map((access) => (
                      <label key={access} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{access}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(6)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 6 && (
          <>
            {/* Team Requirements */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Team Requirements</h2>

              <div className="flex flex-col gap-10 max-w-3xl">

                {/* Professionals Needed */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Professionals Needed</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {[
                      "Architect", "Structural Engineer", "Civil Engineer",
                      "Mechanical Engineer", "Electrical Engineer", "Quantity Surveyor"
                    ].map((prof) => (
                      <label key={prof} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-[3px] group-hover:border-[#033A6B] transition-colors">
                          <input type="checkbox" className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-3 h-3 bg-[#022C4F] rounded-[1px]"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{prof}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Hiring Preference */}
                <div className="flex flex-col md:flex-row gap-4 md:gap-12">
                  <label className="text-sm font-medium text-[#022C4F] md:w-48 shrink-0 pt-1">Hiring Preference</label>
                  <div className="flex flex-col gap-5 flex-1">
                    {[
                      "Hire Individual Professionals",
                      "Build a Design Team",
                      "Let Nexucon Recommend Professionals"
                    ].map((pref, idx) => (
                      <label key={pref} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-full group-hover:border-[#033A6B] transition-colors">
                          <input type="radio" name="hiring_preference" defaultChecked={idx === 2} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#022C4F] rounded-full"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(7)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 7 && (
          <>
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">

              {/* Timeline Section */}
              <div className="mb-12">
                <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Timeline</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 max-w-4xl">

                  {/* Project Start Date */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#022C4F] pl-1">Project Start Date</label>
                    <div className="relative">
                      <input type="date" className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F] cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#022C4F]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Design Completion Target */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#022C4F] pl-1">Design Completion Target</label>
                    <div className="relative">
                      <input type="date" className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F] cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#022C4F]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* First Review Session */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#022C4F] pl-1">First Review Session</label>
                    <div className="relative">
                      <input type="date" className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F] cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#022C4F]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Final Approval Target */}
                  <div className="flex flex-col gap-2">
                    <label className="text-[13px] font-medium text-[#022C4F] pl-1">Final Approval Target</label>
                    <div className="relative">
                      <input type="date" className="w-full px-4 py-3 border border-[#022C4F] rounded-lg text-sm text-[#0F181F] bg-white focus:outline-none focus:ring-1 focus:ring-[#022C4F] cursor-pointer appearance-none [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full" />
                      <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-[#022C4F]">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Budget & Engagement Model Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10 max-w-4xl">

                {/* Budget */}
                <div>
                  <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Budget</h2>
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-12">
                    <label className="text-sm font-medium text-[#022C4F] sm:w-32 shrink-0 pt-1">Design Budget Range</label>
                    <div className="flex flex-col gap-5">
                      {[
                        "Under ₦500,000",
                        "₦500,000 - ₦2 Million",
                        "₦2 Million - ₦5 Million",
                        "₦5 Million - ₦20 Million",
                        "Above ₦20 Million"
                      ].map((range, idx) => (
                        <label key={range} className="flex items-center gap-4 cursor-pointer group w-fit">
                          <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-full group-hover:border-[#033A6B] transition-colors">
                            <input type="radio" name="budget_range" defaultChecked={idx === 2} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                            <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#022C4F] rounded-full"></div>
                          </div>
                          <span className="text-[13px] font-medium text-[#022C4F]">{range}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Professional Engagement Model */}
                <div>
                  <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Professional Engagement Model</h2>
                  <div className="flex flex-col gap-5">
                    {[
                      "Fixed Price",
                      "Milestone-Based",
                      "Hourly",
                      "Consultation-Based"
                    ].map((model, idx) => (
                      <label key={model} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-full group-hover:border-[#033A6B] transition-colors">
                          <input type="radio" name="engagement_model" defaultChecked={idx === 2} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#022C4F] rounded-full"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{model}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setStep(8)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Continue
              </button>
            </div>
          </>
        )}

        {step === 9 && (
          <>
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              
              {/* Execution Planning */}
              <div className="mb-12">
                <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Execution Planning</h2>
                
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[13px] text-[#022C4F] font-medium">After Design Completion</span>
                    <span className="text-xs text-[#0F181F]">What would you like to do once the design phase is approved?</span>
                  </div>
                  
                  <div className="flex flex-col gap-5 mt-2">
                    {[
                      "Hire a Contractor to Execute the Project",
                      "Build My Own Execution Team",
                      "Receive Guidance from Nexucon Experts",
                      "Decide Later"
                    ].map((plan, idx) => (
                      <label key={plan} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-full group-hover:border-[#033A6B] transition-colors">
                          <input type="radio" name="execution_planning" defaultChecked={idx === 2} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#022C4F] rounded-full"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{plan}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Project Visibility */}
              <div className="mb-8">
                <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Project Visibility</h2>
                
                <div className="flex flex-col gap-6">
                  <span className="text-[13px] text-[#022C4F] font-medium pt-1">Who Can Access This Project?</span>
                  
                  <div className="flex flex-col gap-5 mt-2">
                    {[
                      "Private",
                      "Invited Team Members Only",
                      "Approved Professionals Only"
                    ].map((visibility, idx) => (
                      <label key={visibility} className="flex items-center gap-4 cursor-pointer group w-fit">
                        <div className="relative flex items-center justify-center w-5 h-5 border-2 border-[#022C4F] rounded-full group-hover:border-[#033A6B] transition-colors">
                          <input type="radio" name="project_visibility" defaultChecked={idx === 2} className="absolute opacity-0 w-full h-full cursor-pointer peer" />
                          <div className="hidden peer-checked:block w-2.5 h-2.5 bg-[#022C4F] rounded-full"></div>
                        </div>
                        <span className="text-[13px] font-medium text-[#022C4F]">{visibility}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setStep(10)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Complete Setup
              </button>
            </div>
          </>
        )}

        {step === 8 && (
          <>
            {/* Document Uploads */}
            <div className="mb-10 animate-in fade-in slide-in-from-right-8 duration-500">
              <h2 className="text-xl font-extrabold text-[#022C4F] mb-6">Document Uploads</h2>

              <div className="mb-4">
                <span className="text-[13px] font-medium text-[#022C4F]">Initial Project Files</span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6 max-w-5xl mt-8">

                {/* Left Column */}
                <div className="flex flex-col gap-8">
                  {/* Site Survey */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Site Survey</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>

                  {/* Existing Drawings */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Existing Drawings</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>

                  {/* Client Brief */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Client Brief</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>

                  {/* Concept Sketches */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Concept Sketches</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>

                  {/* Land Documents */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Land Documents</label>
                    <div className="w-full max-w-[500px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-8">
                  {/* Reference Images */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-center">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0">Reference Images</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>

                  {/* Requirements Document */}
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 sm:items-start pt-1">
                    <label className="text-[13px] font-medium text-[#022C4F] sm:w-32 shrink-0 leading-tight">Requirements<br />Document</label>
                    <div className="w-full max-w-[550px] h-[54px] border border-dashed border-[#022C4F] rounded-lg flex justify-center items-center cursor-pointer hover:bg-gray-50 transition-colors -mt-1">
                      <span className="text-[10px] text-[#0F181F] font-medium">Drag and Drop Files here or <span className="text-[#022C4F] underline">Choose File</span></span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end pt-4">
              <button 
                onClick={() => setIsSuccessModalOpen(true)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-sm font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out min-w-[160px]"
              >
                Upload Files
              </button>
            </div>
          </>
        )}

        {step === 10 && (
          <>
            {/* Bottom Prompt Box */}
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-r from-[#022C4F] to-[#0F181F] rounded-[24px] p-6 lg:p-8 animate-in slide-in-from-bottom-8 duration-700 shadow-xl">
              <p className="text-[10px] text-gray-300 mb-6 pl-1 font-medium">
                Generate a professional project brief, identify required specialists, recommend deliverables, and create an initial design workflow.
              </p>
              
              <div className="bg-white rounded-2xl p-6 w-full flex flex-col">
                <span className="text-[13px] font-extrabold text-[#a3a3a3] mb-6">Smart AI Design Assistant</span>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="hidden sm:block w-0.5 h-8 bg-gray-300 rounded-full shrink-0"></div>
                  <input 
                    type="text" 
                    placeholder="Type Your Project Brief" 
                    className="flex-1 w-full bg-transparent text-[#0F181F] text-[13px] font-medium focus:outline-none placeholder-[#a3a3a3]"
                  />
                  <button 
                    onClick={() => setStep(11)}
                    className="w-full sm:w-auto px-10 py-3.5 rounded-full border-[1.5px] border-[#022C4F] text-[#022C4F] font-bold text-[13px] hover:bg-gray-50 transition-colors sm:ml-auto"
                  >
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {step === 11 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-4xl pt-4">
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-6">Review and Submit</h2>
            <p className="text-[13px] font-medium text-[#022C4F] mb-8">Project Readiness Checklist</p>

            <div className="flex flex-col gap-6 mb-12">
              {[
                "Project Description Added",
                "Design Requirements Defined",
                "Deliverables Selected",
                "Review Process Configured",
                "Timeline Established"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-[18px] h-[18px] border-[1.5px] border-[#0F181F] flex items-center justify-center shrink-0 p-[2px]">
                    <div className="w-full h-full bg-[#0F181F]"></div>
                  </div>
                  <span className="text-[13px] font-medium text-[#022C4F]">{item}</span>
                </div>
              ))}
            </div>

            {/* Footer Actions */}
            <div className="flex justify-end gap-4 pt-10">
              <button className="px-10 py-3.5 bg-white border border-[#0F181F] text-[#0F181F] text-[13px] font-bold rounded-lg hover:bg-gray-50 transition-colors">
                Save as Draft
              </button>
              <button 
                onClick={() => setIsFinalModalOpen(true)}
                className="px-10 py-3.5 bg-[#022C4F] text-white text-[13px] font-bold rounded-lg shadow-md hover:bg-[#033A6B] hover:shadow-lg transition-all duration-300 ease-out"
              >
                Create Design Project
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022C4F]/30 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-[90%] max-w-[850px] min-h-[550px] shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 relative px-10 py-16">
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-6">File Uploaded Successfully</h2>
            <p className="text-[13px] font-medium text-[#0F181F] mb-16 max-w-lg leading-relaxed">
              The uploaded documents are now stored in the project repository and can be shared with team members, consultants, and external reviewers.
            </p>
            
            <div className="w-[130px] h-[130px] rounded-full border-[5px] border-[#4CAF50] flex items-center justify-center mb-24 p-3">
              <div className="w-full h-full bg-[#4CAF50] rounded-full flex items-center justify-center">
                <Check size={60} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <button 
              onClick={() => {
                setIsSuccessModalOpen(false);
                setStep(9);
              }}
              className="w-full max-w-[480px] py-4 bg-[#022C4F] text-white text-sm font-bold rounded-xl hover:bg-[#033A6B] transition-all duration-300 ease-out shadow-md hover:shadow-lg"
            >
              Proceed
            </button>
          </div>
        </div>
      )}

      {/* Final Success Modal */}
      {isFinalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#022C4F]/30 backdrop-blur-[2px] animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-[90%] max-w-[850px] min-h-[550px] shadow-2xl flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300 relative px-10 py-16">
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-6">Design Project Created Successfully</h2>
            <p className="text-[13px] font-medium text-[#0F181F] mb-12 max-w-lg leading-relaxed">
              Your project workspace is ready. You can now invite professionals, upload drawings, schedule review sessions, and collaborate with stakeholders throughout the design and pre-construction process.
            </p>
            
            <div className="w-[130px] h-[130px] rounded-full border-[5px] border-[#4CAF50] flex items-center justify-center mb-16 p-3">
              <div className="w-full h-full bg-[#4CAF50] rounded-full flex items-center justify-center">
                <Check size={60} className="text-white" strokeWidth={3} />
              </div>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-[480px]">
              <button 
                onClick={() => router.push('/client/dashboard')}
                className="w-full py-4 bg-[#022C4F] text-white text-[13px] font-bold rounded-xl hover:bg-[#033A6B] transition-all duration-300 ease-out shadow-sm"
              >
                Open Project Workspace
              </button>
              <button 
                onClick={() => router.push('/client/dashboard')}
                className="w-full py-4 bg-[#121A21] text-white text-[13px] font-bold rounded-xl hover:bg-[#1a252f] transition-all duration-300 ease-out shadow-sm"
              >
                Invite Team Members
              </button>
              <button 
                onClick={() => router.push('/client/dashboard')}
                className="w-full py-4 bg-[#004F8C] text-white text-[13px] font-bold rounded-xl hover:bg-[#005a9e] transition-all duration-300 ease-out shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationCenter
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
      />
    </div>
  );
}
