"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ChevronDown, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { CustomDatePicker } from "@/components/CustomDatePicker";
import { CustomSelect } from "@/components/CustomSelect";
import { Country, State } from "country-state-city";
import { motion } from "framer-motion";

const roleOptions = [
  { value: "skipper", label: "Skipper" },
  { value: "navigator", label: "Navigator" },
  { value: "architect", label: "Architect" },
  { value: "structural_engineer", label: "Structural Engineer" },
  { value: "mep_engineer", label: "MEP Engineer" },
  { value: "geotech_engineer", label: "Geotech Engineer" },
  { value: "quantity_surveyor", label: "Quantity Surveyor" },
  { value: "civil_engineer", label: "Civil Engineer" },
  { value: "permit_specialist", label: "Permit Specialist" }
];

const specializationOptions = ["Contractor", "Architect", "Engineer", "Mentor"];

const predefinedSkills = [
  "Project Management", "AutoCAD", "Revit",
  "Quantity Estimation", "Structural Analysis",
  "Site Supervision", "Construction Planning",
  "Contract Administration", "Cost Management",
  "Procurement Management", "Building Information Modeling (BIM)",
  "Risk Management"
];

const experienceOptions = ["Less than 1 Year", "1-3 Years", "4-7 Years", "8-15 Years", "15+ Years"];
const projectsOptions = ["1-5", "6-20", "21-50", "50+"];
const employmentOptions = ["Independent Professional", "Company Employee", "Agency / Firm Owner", "Freelancer / Consultant"];

const countryOptions = Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }));

const availabilityOptions = [
  "Available Immediately",
  "Available Within 2 Weeks",
  "Available Within 1 Month",
  "Available for Future Projects Only"
];

const engagementOptions = ["On-Site Projects", "Remote Consulting", "Hybrid Engagements"];

const opportunitiesOptions = [
  "Find New Projects",
  "Grow My Professional Network",
  "Secure Long-Term Contracts",
  "Offer Consulting Services",
  "Join Large-Scale Projects",
  "Build My Portfolio"
];

export default function ProfessionalRegister() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState<any>({
    firstName: '', 
    lastName: '', 
    email: '', 
    phone: '', 
    dob: '',
    category: '',
    specialization: '',
    skills: [],
    additionalSkills: '',
    yearsOfExperience: '',
    completedProjects: '',
    employmentStatus: '',
    country: '',
    stateRegion: '',
    city: '',
    availability: '',
    engagementType: '',
    bio: '',
    opportunity: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const regionOptions = formData.country 
    ? State.getStatesOfCountry(formData.country).map(s => ({ value: s.name, label: s.name }))
    : [];

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev: any) => {
      const newData = { ...prev, [field]: value };
      if (field === 'country') {
        newData.stateRegion = '';
      }
      return newData;
    });
    if (errors[field]) {
      setErrors((prev: any) => ({ ...prev, [field]: '' }));
    }
  };

  const toggleSkill = (skill: string) => {
    setFormData((prev: any) => {
      const isSelected = prev.skills.includes(skill);
      const newSkills = isSelected 
        ? prev.skills.filter((s: string) => s !== skill)
        : [...prev.skills, skill];
      return { ...prev, skills: newSkills };
    });
    if (errors.skills) {
      setErrors((prev: any) => ({ ...prev, skills: '' }));
    }
  };

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleNextStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First Name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last Name is required";
    if (!formData.email.trim() || !validateEmail(formData.email)) newErrors.email = "Valid Email Address is required";
    if (!formData.phone.trim()) newErrors.phone = "Phone Number is required";
    if (!formData.dob.trim()) newErrors.dob = "Date of Birth is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(2);
    }
  };

  const handleNextStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) newErrors.category = "Category is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(3);
    }
  };

  const handleNextStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.specialization) newErrors.specialization = "Specialization is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(4);
    }
  };

  const handleNextStep4 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.skills || formData.skills.length === 0) {
      newErrors.skills = "Please select at least one skill";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(5);
    }
  };

  const handleNextStep5 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.yearsOfExperience) newErrors.yearsOfExperience = "Years of experience is required";
    if (!formData.completedProjects) newErrors.completedProjects = "Number of completed projects is required";
    if (!formData.employmentStatus) newErrors.employmentStatus = "Employment status is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(6);
    }
  };

  const handleNextStep6 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = "Country is required";
    if (!formData.stateRegion) newErrors.stateRegion = "State/Region is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.availability) newErrors.availability = "Availability status is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(7);
    }
  };

  const handleNextStep7 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.engagementType) newErrors.engagementType = "Engagement type is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(8);
    }
  };

  const handleNextStep8 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.bio || formData.bio.length < 500) {
      newErrors.bio = "Bio must be at least 500 characters";
    }
    if (formData.bio && formData.bio.length > 1000) {
      newErrors.bio = "Bio must not exceed 1000 characters";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(9);
    }
  };

  const handleNextStep9 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.opportunity) newErrors.opportunity = "Please select an opportunity";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    } else {
      setStep(10);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row items-center justify-between font-sans bg-white lg:bg-transparent">
      {/* Background Image with Overlay (Hidden on mobile) */}
      <div
        className="hidden lg:block absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          // Using placeholder background image as in login
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
      </div>

      {/* Left Content Area (Hidden on mobile) */}
      <div className="hidden lg:flex relative z-10 w-1/2 h-full flex-col justify-between p-10 min-h-[calc(100vh)]">
        <div>
          <Link
            href="/home"
            className="inline-flex items-center text-white hover:text-gray-200 transition-colors font-medium text-sm sm:text-base"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back to homepage
          </Link>
        </div>

        <div className="max-w-xl pb-20 pt-0">
          <div className="mb-6">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={220}
              height={70}
              className="h-16 w-auto object-contain brightness-0 invert"
            />
          </div>

          <h1 className="text-[40px] font-extrabold text-[#022C4F] mb-6 leading-tight drop-shadow-sm">
            Join Nexucon as a Construction Professional
          </h1>

          <p className="text-white text-lg font-medium leading-relaxed max-w-lg drop-shadow-md">
            Create your professional profile, showcase your expertise, and connect with clients looking for trusted construction professionals.
          </p>
        </div>
      </div>

      {/* Right Content Area (Registration Form) */}
      <div className="relative z-10 w-full lg:w-1/2 flex justify-center items-center h-full min-h-screen lg:min-h-0 lg:p-10">
        <div className="bg-white lg:rounded-3xl lg:shadow-2xl w-full max-w-[550px] lg:max-w-[627px] lg:w-[627px] p-6 sm:p-8 lg:p-12 flex flex-col h-full min-h-screen lg:min-h-[760px] lg:h-[760px] lg:max-h-[760px] overflow-y-auto">

          {/* Mobile Top Navigation */}
          <div className="flex lg:hidden justify-between items-center w-full mb-12 mt-4">
            <Link
              href="/home"
              className="inline-flex items-center text-gray-700 hover:text-gray-900 transition-colors font-medium text-xs sm:text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to homepage
            </Link>
            <p className="text-[11px] sm:text-xs font-medium text-gray-500">
              Already have an account? <Link href="/professional/login" className="text-[#022C4F] font-semibold hover:underline">Login</Link>
            </p>
          </div>

          {/* Desktop Card Header */}
          <div className="hidden lg:flex justify-between items-start mb-12">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Icon"
              width={40}
              height={40}
              className="h-10 w-auto object-contain"
            />
            <p className="text-sm font-medium text-gray-500 mt-2">
              Don't have an account? <Link href="/professional/login" className="text-[#022C4F] font-semibold hover:underline">Sign up</Link>
            </p>
          </div>

          {/* Mobile Logo */}
          <div className="flex lg:hidden justify-center mb-8">
            <Image
              src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
              alt="Nexucon Logo"
              width={160}
              height={50}
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          {step === 1 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Personal Information</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Let's start with your basic information.
                </p>
              </div>

              {/* Form Fields Step 1 */}
              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.firstName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
                    placeholder=""
                  />
                  {errors.firstName && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.firstName}</span>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.lastName ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
                    placeholder=""
                  />
                  {errors.lastName && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.lastName}</span>}
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
                    placeholder=""
                  />
                  {errors.email && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.email}</span>}
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <div className="flex flex-col gap-2 relative w-full sm:w-1/2">
                    <label className="text-sm font-bold text-[#022C4F]">Phone Number</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-4 py-3.5 rounded-xl border ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
                      placeholder=""
                    />
                    {errors.phone && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.phone}</span>}
                  </div>

                  <div className="flex flex-col gap-2 relative w-full sm:w-1/2">
                    <label className="text-sm font-bold text-[#022C4F]">Date of Birth</label>
                    <CustomDatePicker
                      value={formData.dob}
                      onChange={(val) => handleInputChange('dob', val)}
                      error={errors.dob}
                      placement="top"
                    />
                    {errors.dob && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-20 animate-pulse">{errors.dob}</span>}
                  </div>
                </div>
              </form>

              {/* Action Button Step 1 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => { /* Navigate back or to previous page */ }}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep1}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Professional Category</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Select the role that best describes your expertise.
                </p>
              </div>

              {/* Form Fields Step 2 */}
              <form className="flex flex-col gap-5 mb-10 lg:mb-8">
                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">Categories</label>
                  <div className="relative">
                    <CustomSelect
                      options={roleOptions}
                      value={formData.category}
                      onChange={(val) => handleInputChange('category', val)}
                      placeholder=""
                      error={errors.category}
                      searchable={true}
                    />
                  </div>
                  {errors.category && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.category}</span>}
                </div>
              </form>

              {/* Action Button Step 2 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep2}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Specialization & Services</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Select your areas of specialization.
                </p>
              </div>

              {/* Form Fields Step 3 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10 lg:mb-8 relative">
                {specializationOptions.map((spec) => {
                  const isSelected = formData.specialization === spec;
                  return (
                    <button
                      key={spec}
                      type="button"
                      onClick={() => handleInputChange('specialization', spec)}
                      className={`relative flex items-center justify-center p-8 rounded-xl border transition-all h-36 ${
                        isSelected
                          ? 'bg-[#0f172a] border-[#0f172a] text-white shadow-md'
                          : 'bg-white border-gray-300 hover:border-[#022C4F] text-gray-700'
                      }`}
                    >
                      {/* Custom Radio Button */}
                      <div className={`absolute top-4 right-4 w-4 h-4 rounded-full border-[1.5px] flex items-center justify-center ${
                        isSelected
                          ? 'border-white bg-[#0f172a]'
                          : 'border-gray-300'
                      }`}>
                        {isSelected && (
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                        )}
                      </div>
                      <span className="font-medium text-sm">{spec}</span>
                    </button>
                  );
                })}
                {errors.specialization && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.specialization}</span>}
              </div>

              {/* Action Button Step 3 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep3}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 4 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Highlight your Skills</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Help clients understand your strengths and capabilities.
                </p>
              </div>

              {/* Form Fields Step 4 */}
              <div className="flex flex-col gap-8 mb-10 lg:mb-8">
                <div className="relative">
                  <div className="flex flex-wrap gap-3">
                    {predefinedSkills.map((skill) => {
                      const isSelected = formData.skills.includes(skill);
                      return (
                        <button
                          key={skill}
                          type="button"
                          onClick={() => toggleSkill(skill)}
                          className={`flex items-center gap-3 px-5 py-2.5 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          {skill}
                          <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {errors.skills && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.skills}</span>}
                </div>

                <div className="flex flex-col gap-2">
                  <h3 className="text-lg font-bold text-[#022C4F]">Additional Skills</h3>
                  <input
                    type="text"
                    value={formData.additionalSkills}
                    onChange={(e) => handleInputChange('additionalSkills', e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F] focus:outline-none focus:ring-1 transition-all text-sm font-medium mt-1"
                    placeholder=""
                  />
                </div>
              </div>

              {/* Action Button Step 4 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep4}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 5 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Tell Us About Your Experience</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Share your professional background and years of experience.
                </p>
              </div>

              {/* Form Fields Step 5 */}
              <div className="flex flex-col gap-8 mb-10 lg:mb-8">
                {/* Years of Experience */}
                <div className="relative">
                  <div className="flex flex-wrap gap-3">
                    {experienceOptions.map((opt) => {
                      const isSelected = formData.yearsOfExperience === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('yearsOfExperience', opt)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          {opt}
                          <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {errors.yearsOfExperience && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.yearsOfExperience}</span>}
                </div>

                {/* Number of Completed Projects */}
                <div className="relative">
                  <h3 className="text-lg font-bold text-[#022C4F] mb-3">Number of Completed Projects</h3>
                  <div className="flex flex-wrap gap-3">
                    {projectsOptions.map((opt) => {
                      const isSelected = formData.completedProjects === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('completedProjects', opt)}
                          className={`flex items-center gap-3 px-6 py-3 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          {opt}
                          <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {errors.completedProjects && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.completedProjects}</span>}
                </div>

                {/* Current Employment Status */}
                <div className="relative">
                  <h3 className="text-lg font-bold text-[#022C4F] mb-3">Current Employment Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {employmentOptions.map((opt) => {
                      const isSelected = formData.employmentStatus === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('employmentStatus', opt)}
                          className={`flex items-center justify-between px-6 py-3 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          {opt}
                          <div className={`w-3.5 h-3.5 rounded-full border-[1.5px] shrink-0 ml-3 ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`} />
                        </button>
                      );
                    })}
                  </div>
                  {errors.employmentStatus && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.employmentStatus}</span>}
                </div>
              </div>

              {/* Action Button Step 5 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep5}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 6 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Where Do You Work?</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Help clients discover you based on location and availability.
                </p>
              </div>

              {/* Form Fields Step 6 */}
              <div className="flex flex-col gap-6 mb-10 lg:mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">Country</label>
                    <div className="relative">
                      <CustomSelect
                        options={countryOptions}
                        value={formData.country}
                        onChange={(val) => handleInputChange('country', val)}
                        placeholder=""
                        error={errors.country}
                        searchable={true}
                      />
                    </div>
                    {errors.country && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.country}</span>}
                  </div>
                  <div className="flex flex-col gap-2 relative">
                    <label className="text-sm font-bold text-[#022C4F]">State / Region</label>
                    <div className="relative">
                      <CustomSelect
                        options={regionOptions}
                        value={formData.stateRegion}
                        onChange={(val) => handleInputChange('stateRegion', val)}
                        placeholder=""
                        error={errors.stateRegion}
                        searchable={true}
                      />
                    </div>
                    {errors.stateRegion && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.stateRegion}</span>}
                  </div>
                </div>

                <div className="flex flex-col gap-2 relative">
                  <label className="text-sm font-bold text-[#022C4F]">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`w-full px-4 py-3.5 rounded-xl border ${errors.city ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium`}
                    placeholder=""
                  />
                  {errors.city && <span className="absolute right-0 -top-1 sm:top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm z-10 animate-pulse">{errors.city}</span>}
                </div>

                {/* Availability Status */}
                <div className="relative mt-2">
                  <h3 className="text-lg font-bold text-[#022C4F] mb-3">Availability Status</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availabilityOptions.map((opt) => {
                      const isSelected = formData.availability === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('availability', opt)}
                          className={`flex items-center justify-between px-6 py-3.5 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          <span className="font-medium text-left">{opt}</span>
                          <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full border-[1.5px] ml-3 ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.availability && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.availability}</span>}
                </div>
              </div>

              {/* Action Button Step 6 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(5)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep6}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 7 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Availability Status</h2>
              </div>

              {/* Form Fields Step 7 */}
              <div className="flex flex-col gap-6 mb-10 lg:mb-8">
                <div className="relative mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {engagementOptions.map((opt) => {
                      const isSelected = formData.engagementType === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('engagementType', opt)}
                          className={`flex items-center justify-between px-6 py-3.5 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          <span className="font-medium text-left">{opt}</span>
                          <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full border-[1.5px] ml-3 ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.engagementType && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.engagementType}</span>}
                </div>
              </div>

              {/* Action Button Step 7 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(6)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep7}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 8 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">Professional Summary</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Write a short professional summary that highlights your expertise and experience.
                </p>
              </div>

              {/* Form Fields Step 8 */}
              <div className="flex flex-col gap-6 mb-10 lg:mb-8">
                <div className="relative">
                  <label className="text-sm font-bold text-[#022C4F] mb-3 block">Professional Bio</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    className={`w-full px-5 py-4 rounded-xl border ${errors.bio ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium resize-none min-h-[220px]`}
                    placeholder="Tell clients about your experience, specializations, achievements, and the value you bring to construction projects."
                  />
                  {errors.bio && <span className="absolute right-0 top-0 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.bio}</span>}
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-medium text-gray-500">500-1000 Characters</span>
                    <span className={`text-xs font-medium ${formData.bio.length > 1000 || formData.bio.length < 500 && formData.bio.length > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                      {formData.bio.length} / 1000
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Button Step 8 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(7)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep8}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 9 && (
            <>
              {/* Form Header */}
              <div className="text-left mb-8">
                <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-3">What Opportunities Are You Looking For?</h2>
                <p className="text-xs sm:text-sm font-medium text-gray-500 max-w-sm leading-relaxed">
                  Help us personalize project recommendations.
                </p>
              </div>

              {/* Form Fields Step 9 */}
              <div className="flex flex-col gap-6 mb-10 lg:mb-8">
                <div className="relative mt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {opportunitiesOptions.map((opt) => {
                      const isSelected = formData.opportunity === opt;
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleInputChange('opportunity', opt)}
                          className={`flex items-center justify-between px-6 py-4 rounded-full border text-sm transition-all ${
                            isSelected
                              ? 'bg-[#022C4F] border-[#022C4F] text-white shadow-sm'
                              : 'bg-white border-gray-400 text-gray-600 hover:border-[#022C4F]'
                          }`}
                        >
                          <span className="font-medium text-left">{opt}</span>
                          <div className={`flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full border-[1.5px] ml-3 ${
                            isSelected ? 'border-white' : 'border-gray-400'
                          }`}>
                            {isSelected && (
                              <div className="w-2 h-2 bg-white rounded-full" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {errors.opportunity && <span className="absolute right-0 -top-6 text-[10px] sm:text-xs text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-md border border-red-100 shadow-sm animate-pulse">{errors.opportunity}</span>}
                </div>
              </div>

              {/* Action Button Step 9 */}
              <div className="flex justify-between items-center mt-auto lg:mt-0 mb-6 lg:mb-0">
                <button
                  type="button"
                  onClick={() => setStep(8)}
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto mb-3 sm:mb-0"
                >
                  Back
                  <ChevronLeft className="w-4 h-4 order-first" />
                </button>

                <button
                  onClick={handleNextStep9}
                  type="button"
                  className="flex items-center justify-center gap-2 px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98] w-full sm:w-auto"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}

          {step === 10 && (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-md mx-auto py-4">
              <h2 className="text-2xl sm:text-[28px] font-bold text-[#022C4F] mb-4">Your Professional Profile Is Ready</h2>
              <p className="text-sm font-medium text-gray-500 mb-12 leading-relaxed px-2">
                You've completed the first step. Next, we'll verify your credentials and help you build a trusted professional presence on Nexucon.
              </p>

              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="w-40 h-40 rounded-full border-[3px] border-[#4ade80] flex items-center justify-center mb-24 p-1.5"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                  className="w-full h-full bg-[#4ade80] rounded-full flex items-center justify-center shadow-sm"
                >
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.4 }}
                  >
                    <Check className="w-16 h-16 text-white" strokeWidth={4} />
                  </motion.div>
                </motion.div>
              </motion.div>

              <div className="flex flex-col w-full gap-4 mt-auto">
                <button
                  type="button"
                  onClick={() => router.push('/professional/verification')}
                  className="w-full py-4 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                  Proceed to Verification
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.setItem('verification_status', 'skipped');
                    }
                    router.push('/professional/dashboard');
                  }}
                  className="w-full py-4 bg-[#0f172a] hover:bg-[#0f172a]/90 text-white rounded-xl text-sm font-semibold transition-all shadow-md active:scale-[0.98]"
                >
                  Complete Later
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
