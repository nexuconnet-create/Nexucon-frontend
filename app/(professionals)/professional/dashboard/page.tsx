"use client";

import React, { useState } from "react";
import { Search, Bell, ChevronDown, Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomSelect } from "@/components/CustomSelect";
import TopRightControls from "@/components/dashboard/TopRightControls";

export default function ProfessionalDashboard() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const [projectType, setProjectType] = useState("");
  const [projectCategory, setProjectCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [visibility, setVisibility] = useState("private");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  return (
    <div className="h-full flex flex-col pt-2">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        {/* Left Side: Welcome Text */}
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Welcome Back, John Doe
          </h1>
          <p className="text-gray-600 text-sm leading-relaxed">
            Set up a new design project, define the project scope, invite collaborators, and
            create a centralized workspace for design coordination, document management, peer reviews, and project delivery.
          </p>
        </div>

        {/* Right Side: Actions & Profile */}
        <TopRightControls />
      </div>

      {/* Main Content Area */}
      {!isCreating ? (
        <div className="flex-1 flex flex-col items-center justify-center mt-12 mb-8">
          <h2 className="text-[28px] font-bold text-[#022C4F] mb-8">
            No Project Yet?
          </h2>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-14 py-4 rounded-full text-[17px] transition-colors shadow-lg hover:shadow-xl active:scale-95 font-medium"
          >
            Create New Project
          </button>
        </div>
      ) : (
        <div className="flex-1 mt-12 mb-8 max-w-[1000px] animate-in fade-in slide-in-from-bottom-4 duration-500">
          {step === 1 && (
            <>
              <h2 className="text-2xl font-bold text-[#022C4F] mb-8">Project Information</h2>

          <div className="flex flex-col gap-8">
            {/* Row 1 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] text-[15px]">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter Project Name"
                  className="flex-1 h-12 rounded-lg border border-[#022C4F] px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
                />
              </div>
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[130px] text-[15px]">Project Code</label>
                <input
                  type="text"
                  className="flex-1 h-12 rounded-lg border border-[#022C4F] px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="flex items-start gap-4">
              <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] pt-3 text-[15px]">Project Description</label>
              <textarea
                className="flex-1 h-56 rounded-lg border border-[#022C4F] p-4 resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
              ></textarea>
            </div>

            {/* Row 3 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] text-[15px]">Project Type</label>
                <div className="flex-1 z-50">
                  <CustomSelect
                    value={projectType}
                    onChange={setProjectType}
                    options={[
                      { value: "residential", label: "Residential" },
                      { value: "commercial", label: "Commercial" },
                      { value: "industrial", label: "Industrial" },
                    ]}
                    placeholder="Select Type"
                    variant="form"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[130px] text-[15px]">Project Categories</label>
                <div className="flex-1 z-40">
                  <CustomSelect
                    value={projectCategory}
                    onChange={setProjectCategory}
                    options={[
                      { value: "architecture", label: "Architecture" },
                      { value: "engineering", label: "Engineering" },
                      { value: "construction", label: "Construction" },
                    ]}
                    placeholder="Select Category"
                    variant="form"
                  />
                </div>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-[#022C4F] mt-6 mb-2">Client Information</h2>

            {/* Row 4 */}
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] text-[15px]">Client Name</label>
                <input
                  type="text"
                  className="flex-1 h-12 rounded-lg border border-[#022C4F] px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
                />
              </div>
              <div className="flex items-center gap-4 flex-1">
                <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[130px] text-[15px]">Company</label>
                <input
                  type="text"
                  className="flex-1 h-12 rounded-lg border border-[#022C4F] px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="flex justify-end mt-4">
              <button 
                onClick={() => setStep(2)}
                className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-12 py-3.5 rounded-xl font-medium transition-colors shadow-md active:scale-95 text-[15px]"
              >
                Continue
              </button>
            </div>
            </div>
            </>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#022C4F] mb-8">Client Information</h2>
              
              <div className="flex flex-col gap-8">
                <div className="flex items-start gap-4">
                  <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] pt-3 text-[15px]">Site Address</label>
                  <textarea
                    className="flex-1 h-56 rounded-lg border border-[#022C4F] p-4 resize-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F]"
                  ></textarea>
                </div>

                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                  <div className="flex items-center gap-4 flex-1">
                    <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[150px] text-[15px]">Start Date</label>
                    <div className="flex-1 z-50">
                      <CustomSelect
                        value={startDate}
                        onChange={setStartDate}
                        options={[
                          { value: "immediate", label: "Immediate" },
                          { value: "1_month", label: "In 1 Month" },
                          { value: "3_months", label: "In 3 Months" },
                        ]}
                        placeholder="Select Start Date"
                        variant="form"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-1">
                    <label className="text-[#022C4F] font-medium whitespace-nowrap min-w-[170px] text-[15px]">Target Completion Date</label>
                    <div className="flex-1 z-40">
                      <CustomSelect
                        value={targetDate}
                        onChange={setTargetDate}
                        options={[
                          { value: "3_months", label: "3 Months" },
                          { value: "6_months", label: "6 Months" },
                          { value: "1_year", label: "1 Year" },
                        ]}
                        placeholder="Select Target Date"
                        variant="form"
                      />
                    </div>
                  </div>
                </div>

                <h2 className="text-2xl font-bold text-[#022C4F] mt-6 mb-2">Design Disciplines Required</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 max-w-2xl mt-2">
                  {[
                    "Architecture", "Landscape Architecture",
                    "Structural Engineering", "BIM Coordination",
                    "Civil Engineering", "Fire Protection Engineering",
                    "Mechanical Engineering", "",
                    "Electrical Engineering", "",
                    "Quantity Surveying", "",
                    "Interior Design"
                  ].map((discipline, idx) => (
                    discipline ? (
                      <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-5 h-5 rounded border-2 border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                          <input type="checkbox" className="hidden" />
                          <div className="w-2.5 h-2.5 bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                        </div>
                        <span className="text-sm text-[#0F181F] font-medium">{discipline}</span>
                      </label>
                    ) : <div key={idx} />
                  ))}
                </div>

                <div className="flex justify-end mt-8">
                  <button 
                    onClick={() => setStep(3)}
                    className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-12 py-3.5 rounded-xl font-medium transition-colors shadow-md active:scale-95 text-[15px]"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-2xl font-bold text-[#022C4F] mb-8">Project Visibility</h2>
              
              <div className="flex flex-col gap-6 max-w-lg mb-12">
                {[
                  { id: "private", label: "Private Project" },
                  { id: "organization", label: "Organization Only" },
                  { id: "invite", label: "Invite-Only Collaboration" }
                ].map((option) => (
                  <label key={option.id} className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-6 h-6 rounded-full border-2 border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      <input 
                        type="radio" 
                        name="visibility"
                        value={option.id}
                        checked={visibility === option.id}
                        onChange={(e) => setVisibility(e.target.value)}
                        className="hidden" 
                      />
                      <div className={`w-3 h-3 rounded-full bg-[#022C4F] transition-opacity ${visibility === option.id ? 'opacity-100' : 'opacity-0'}`}></div>
                    </div>
                    <span className="text-[15px] text-[#0F181F]">{option.label}</span>
                  </label>
                ))}
              </div>

              <h2 className="text-2xl font-bold text-[#022C4F] mb-8">Notification Preferences</h2>

              <div className="flex flex-col gap-6 max-w-lg">
                {[
                  "Notify invited team members",
                  "Send project creation confirmation",
                  "Enable project activity notifications"
                ].map((pref, idx) => (
                  <label key={idx} className="flex items-center gap-4 cursor-pointer group">
                    <div className="w-6 h-6 rounded-sm border-2 border-[#022C4F] flex items-center justify-center group-hover:bg-gray-50 transition-colors">
                      <input type="checkbox" className="hidden" defaultChecked />
                      <div className="w-3.5 h-3.5 bg-[#022C4F] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                    </div>
                    <span className="text-[15px] text-[#0F181F]">{pref}</span>
                  </label>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-16">
                <button className="bg-white border-2 border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-12 py-3.5 rounded-xl font-medium transition-colors shadow-sm active:scale-95 text-[15px]">
                  Save as Draft
                </button>
                <button 
                  onClick={() => setShowSuccessModal(true)}
                  className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-12 py-3.5 rounded-xl font-medium transition-colors shadow-md active:scale-95 text-[15px]"
                >
                  Create Project
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm flex items-center justify-center z-[100] p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[24px] p-12 w-full max-w-[700px] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300 relative">
            <button 
              onClick={() => {
                setShowSuccessModal(false);
                setStep(1);
                setIsCreating(false);
              }}
              className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-[28px] font-bold text-[#022C4F] mb-4">
              Project Created Successfully
            </h2>
            <p className="text-gray-600 text-[15px] leading-relaxed max-w-[500px] mb-12">
              Your project workspace has been created successfully. The project folders,
              collaboration tools, and document management system are now ready for your team.
            </p>

            <div className="w-32 h-32 rounded-full border-[6px] border-[#4CAF50] p-2 mb-12 bg-white shadow-sm flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#4CAF50] flex items-center justify-center">
                <Check className="w-14 h-14 text-white" strokeWidth={4} />
              </div>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-[500px]">
              <button className="w-full bg-[#022C4F] hover:bg-[#033A6B] text-white py-4 rounded-xl font-medium transition-colors text-[15px]">
                Upload Project Files
              </button>
              <button className="w-full bg-[#111827] hover:bg-[#1F2937] text-white py-4 rounded-xl font-medium transition-colors text-[15px]">
                Invite Team Members
              </button>
              <button 
                onClick={() => {
                  setShowSuccessModal(false);
                  router.push('/professional/dashboard/explorer');
                }}
                className="w-full bg-[#005B9A] hover:bg-[#004B80] text-white py-4 rounded-xl font-medium transition-colors text-[15px]"
              >
                Go to Project Explorer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
