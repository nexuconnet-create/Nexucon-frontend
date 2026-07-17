"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { CustomSelect } from "@/components/CustomSelect";
import { Country, State, City } from "country-state-city";

export default function ClientOnboarding() {
  const [step, setStep] = useState(0); // 0 = Welcome Screen, 1 = Role & Intent
  const router = useRouter();

  // State for Step 1
  const [projectIntent, setProjectIntent] = useState("build_new");
  const [projectType, setProjectType] = useState("residential");
  const [requiredProfessional, setRequiredProfessional] = useState("contractors");
  const [requiredProfessional2, setRequiredProfessional2] = useState("quantity_surveyors");
  const [projectScale, setProjectScale] = useState("small");
  const [budgetRange, setBudgetRange] = useState("under_5m");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [timeline, setTimeline] = useState("immediately");
  const [collaborationPreference, setCollaborationPreference] = useState("fully_managed");
  const [workspaceFocus, setWorkspaceFocus] = useState("matching");
  const [nextAction, setNextAction] = useState("post_project");
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useEffect(() => {
    setStateRegion("");
    setCity("");
  }, [country]);

  useEffect(() => {
    setCity("");
  }, [stateRegion]);

  const countryOptions = Country.getAllCountries().map(c => ({ value: c.isoCode, label: c.name }));
  const stateOptions = country ? State.getStatesOfCountry(country).map(s => ({ value: s.isoCode, label: s.name })) : [];
  const cityOptions = (country && stateRegion) ? City.getCitiesOfState(country, stateRegion).map(c => ({ value: c.name, label: c.name })) : [];

  const leftSideVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" as const, staggerChildren: 0.1 } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
  };

  const itemVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Left Side - Dynamic Content */}
      <div className="w-full md:w-1/2 flex flex-col p-8 sm:p-12 md:p-16 lg:px-24 py-12 relative overflow-y-auto min-h-screen">
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div 
              key="step0"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full justify-center md:justify-start"
            >
              {/* Logo */}
              <motion.div variants={itemVariants} className="mb-8 md:mb-auto flex justify-center md:justify-start">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-10 sm:h-12 w-auto object-contain"
                />
              </motion.div>

              {/* Center Content */}
              <div className="max-w-[480px] md:my-auto py-10 mx-auto text-center md:text-left md:mx-0">
                <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] mb-5 leading-tight tracking-tight">
                  Welcome to Nexucon
                </motion.h1>
                <motion.p variants={itemVariants} className="text-[#4b5563] text-base md:text-lg mb-10 leading-[1.6] font-medium pr-0 md:pr-4 mx-auto">
                  Let's understand your construction needs so we can connect you with the right professionals and streamline your project delivery.
                </motion.p>
                <motion.button
                  variants={itemVariants}
                  onClick={() => setStep(1)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-[10px] font-medium transition-all active:scale-[0.98] shadow-sm text-base w-full sm:w-auto"
                >
                  Get Started
                </motion.button>
              </div>

              {/* Empty spacer */}
              <div className="hidden md:block mt-auto"></div>
            </motion.div>
          )}

          {step === 1 && (
            <motion.div 
              key="step1"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">2/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Your Role & Project Intent
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  What Are You Looking to Do?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Tell us your primary goal on Nexucon.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setProjectIntent("build_new")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectIntent === "build_new" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectIntent === "build_new" ? 'border-white' : 'border-gray-400'}`}>
                        {projectIntent === "build_new" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">I want to build a new project</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setProjectIntent("renovate")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectIntent === "renovate" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectIntent === "renovate" ? 'border-white' : 'border-gray-400'}`}>
                        {projectIntent === "renovate" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">I want to renovate or upgrade an existing structure</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setProjectIntent("consultation")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectIntent === "consultation" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectIntent === "consultation" ? 'border-white' : 'border-gray-400'}`}>
                        {projectIntent === "consultation" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">I need professional consultation only</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setProjectIntent("manage_multiple")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectIntent === "manage_multiple" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectIntent === "manage_multiple" ? 'border-white' : 'border-gray-400'}`}>
                        {projectIntent === "manage_multiple" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">I am managing multiple construction projects</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(0)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">3/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Project Type Selection
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  What Type of Project Are You Managing?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Select the category that best describes your construction project.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setProjectType("residential")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectType === "residential" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectType === "residential" ? 'border-white' : 'border-gray-400'}`}>
                        {projectType === "residential" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Residential Building (Houses, Apartments)</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setProjectType("commercial")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectType === "commercial" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectType === "commercial" ? 'border-white' : 'border-gray-400'}`}>
                        {projectType === "commercial" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Commercial Development (Offices, Shops, Malls)</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setProjectType("infrastructure")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectType === "infrastructure" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectType === "infrastructure" ? 'border-white' : 'border-gray-400'}`}>
                        {projectType === "infrastructure" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Infrastructure Projects (Roads, Bridges, Utilities)</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setProjectType("industrial")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectType === "industrial" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectType === "industrial" ? 'border-white' : 'border-gray-400'}`}>
                        {projectType === "industrial" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Industrial Projects (Factories, Warehouses)</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(1)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">4/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Required Professionals
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Who Do You Need for This Project?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Select the professionals you expect to hire.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setRequiredProfessional("contractors")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional === "contractors" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional === "contractors" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional === "contractors" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Contractors</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setRequiredProfessional("architects")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional === "architects" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional === "architects" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional === "architects" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Architects</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setRequiredProfessional("civil_engineers")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional === "civil_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional === "civil_engineers" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional === "civil_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Civil Engineers</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setRequiredProfessional("structural_engineers")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional === "structural_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional === "structural_engineers" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional === "structural_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Structural Engineers</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(2)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div 
              key="step4"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">4/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Required Professionals
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Who Do You Need for This Project?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Select the professionals you expect to hire.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setRequiredProfessional2("quantity_surveyors")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional2 === "quantity_surveyors" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional2 === "quantity_surveyors" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional2 === "quantity_surveyors" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Quantity Surveyors</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setRequiredProfessional2("mep_engineers")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional2 === "mep_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional2 === "mep_engineers" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional2 === "mep_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">MEP Engineers</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setRequiredProfessional2("civil_engineers")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional2 === "civil_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional2 === "civil_engineers" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional2 === "civil_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Civil Engineers</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setRequiredProfessional2("project_managers")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${requiredProfessional2 === "project_managers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${requiredProfessional2 === "project_managers" ? 'border-white' : 'border-gray-400'}`}>
                        {requiredProfessional2 === "project_managers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Project Managers</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(3)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div 
              key="step5"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">5/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Project Scale & Budget
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Tell Us About Your Project Size (Project Scale)
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Help us understand the scale of your construction work.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setProjectScale("small")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScale === "small" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScale === "small" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScale === "small" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Small</span>
                      <span>(Residential /</span>
                      <span>Minor Renovation)</span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setProjectScale("medium")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScale === "medium" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScale === "medium" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScale === "medium" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Medium</span>
                      <span>(Multi-unit</span>
                      <span>or</span>
                      <span>commercial spaces)</span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setProjectScale("large")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScale === "large" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScale === "large" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScale === "large" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Large</span>
                      <span>(Industrial</span>
                      <span>or</span>
                      <span>complex structures)</span>
                    </div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setProjectScale("enterprise")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScale === "enterprise" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScale === "enterprise" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScale === "enterprise" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Enterprise /</span>
                      <span>Government-scale</span>
                      <span>projects</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(4)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 6 && (
            <motion.div 
              key="step6"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">5/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Project Scale & Budget
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Tell Us About Your Project Size (Budget Range)
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Help us understand the scale of your construction work.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setBudgetRange("under_5m")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${budgetRange === "under_5m" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${budgetRange === "under_5m" ? 'border-white' : 'border-gray-400'}`}>
                        {budgetRange === "under_5m" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Under ₦5M</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setBudgetRange("5m_to_20m")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${budgetRange === "5m_to_20m" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${budgetRange === "5m_to_20m" ? 'border-white' : 'border-gray-400'}`}>
                        {budgetRange === "5m_to_20m" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">₦5M – ₦20M</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setBudgetRange("20m_to_100m")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${budgetRange === "20m_to_100m" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${budgetRange === "20m_to_100m" ? 'border-white' : 'border-gray-400'}`}>
                        {budgetRange === "20m_to_100m" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">₦20M – ₦100M</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setBudgetRange("100m_plus")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${budgetRange === "100m_plus" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${budgetRange === "100m_plus" ? 'border-white' : 'border-gray-400'}`}>
                        {budgetRange === "100m_plus" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">₦100M+</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(5)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(7)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 7 && (
            <motion.div 
              key="step7"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">6/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Location & Site Details
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Where Is Your Project Located?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  We use location data to match you with nearby professionals.
                </p>
              </motion.div>

              {/* Location Form */}
              <motion.div variants={itemVariants} className="flex flex-col gap-10 w-full mt-2 mb-8 pr-4">
                {/* Country & State Row */}
                <div className="flex flex-col sm:flex-row gap-6 sm:gap-10 w-full">
                  <div className="w-full">
                    <CustomSelect
                      value={country}
                      onChange={setCountry}
                      options={countryOptions}
                      placeholder="Country*"
                      searchable={true}
                      variant="underline"
                    />
                  </div>
                  
                  <div className="w-full">
                    <CustomSelect
                      value={stateRegion}
                      onChange={setStateRegion}
                      options={stateOptions}
                      placeholder="State/Region*"
                      searchable={true}
                      variant="underline"
                    />
                  </div>
                </div>

                {/* City */}
                <div className="w-full">
                  <CustomSelect
                    value={city}
                    onChange={setCity}
                    options={cityOptions}
                    placeholder="City*"
                    searchable={true}
                    variant="underline"
                  />
                </div>

                {/* Project Site Address */}
                <div className="w-full mt-4">
                  <input 
                    type="text" 
                    placeholder="Project Site Address"
                    className="w-full bg-transparent border-b border-[#022C4F] pb-2 text-sm text-[#022C4F] placeholder-gray-500 focus:outline-none focus:border-[#022C4F]"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                  <input 
                    type="text" 
                    className="w-full bg-transparent border-b border-[#022C4F] pb-2 text-sm text-[#022C4F] focus:outline-none focus:border-[#022C4F] mt-10"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                  />
                </div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(6)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(8)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 8 && (
            <motion.div 
              key="step8"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">7/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Timeline & Urgency
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  When Do You Want to Start?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Set your expected project timeline.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setTimeline("immediately")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${timeline === "immediately" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${timeline === "immediately" ? 'border-white' : 'border-gray-400'}`}>
                        {timeline === "immediately" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Immediately</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setTimeline("within_1_month")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${timeline === "within_1_month" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${timeline === "within_1_month" ? 'border-white' : 'border-gray-400'}`}>
                        {timeline === "within_1_month" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Within 1 month</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setTimeline("1_to_3_months")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${timeline === "1_to_3_months" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${timeline === "1_to_3_months" ? 'border-white' : 'border-gray-400'}`}>
                        {timeline === "1_to_3_months" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">1–3 months</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setTimeline("3_to_6_months")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${timeline === "3_to_6_months" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${timeline === "3_to_6_months" ? 'border-white' : 'border-gray-400'}`}>
                        {timeline === "3_to_6_months" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">3–6 months</div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(7)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(9)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 9 && (
            <motion.div 
              key="step9"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">8/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Collaboration Preferences
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  How Do You Want to Work With Professionals?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Choose your preferred project management style.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setCollaborationPreference("fully_managed")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${collaborationPreference === "fully_managed" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${collaborationPreference === "fully_managed" ? 'border-white' : 'border-gray-400'}`}>
                        {collaborationPreference === "fully_managed" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Fully managed</span>
                      <span>through</span>
                      <span>Nexucon platform</span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setCollaborationPreference("hybrid")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${collaborationPreference === "hybrid" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${collaborationPreference === "hybrid" ? 'border-white' : 'border-gray-400'}`}>
                        {collaborationPreference === "hybrid" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Hybrid (platform</span>
                      <span>+ external</span>
                      <span>communication)</span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setCollaborationPreference("direct")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${collaborationPreference === "direct" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${collaborationPreference === "direct" ? 'border-white' : 'border-gray-400'}`}>
                        {collaborationPreference === "direct" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Direct coordination</span>
                      <span>with professionals</span>
                    </div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setCollaborationPreference("advisory")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${collaborationPreference === "advisory" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${collaborationPreference === "advisory" ? 'border-white' : 'border-gray-400'}`}>
                        {collaborationPreference === "advisory" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>I need</span>
                      <span>advisory support</span>
                      <span>only</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(8)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(10)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 10 && (
            <motion.div 
              key="step10"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">9/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Personalization Summary
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  We're Setting Up Your Workspace
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Based on your answers, Nexucon is preparing your personalized professional network.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setWorkspaceFocus("matching")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${workspaceFocus === "matching" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${workspaceFocus === "matching" ? 'border-white' : 'border-gray-400'}`}>
                        {workspaceFocus === "matching" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Matching you</span>
                      <span>with relevant</span>
                      <span>professionals</span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setWorkspaceFocus("dashboard")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${workspaceFocus === "dashboard" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${workspaceFocus === "dashboard" ? 'border-white' : 'border-gray-400'}`}>
                        {workspaceFocus === "dashboard" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Setting your project</span>
                      <span>dashboard</span>
                      <span>preferences</span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setWorkspaceFocus("feed")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${workspaceFocus === "feed" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${workspaceFocus === "feed" ? 'border-white' : 'border-gray-400'}`}>
                        {workspaceFocus === "feed" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Prioritizing your</span>
                      <span>project category</span>
                      <span>feed</span>
                    </div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setWorkspaceFocus("engine")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${workspaceFocus === "engine" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${workspaceFocus === "engine" ? 'border-white' : 'border-gray-400'}`}>
                        {workspaceFocus === "engine" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Preparing</span>
                      <span>recommendation</span>
                      <span>engine</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(9)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(11)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}

          {step === 11 && (
            <motion.div 
              key="step11"
              variants={leftSideVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="flex flex-col h-full w-full max-w-none lg:max-w-[800px] xl:max-w-[900px] mx-auto md:mx-0"
            >
              {/* Logo & Progress */}
              <motion.div variants={itemVariants} className="mb-10">
                <Image
                  src="https://res.cloudinary.com/depeqzb6z/image/upload/v1779869368/Artboard_5_2_wsumkf.png"
                  alt="Nexucon Logo"
                  width={200}
                  height={60}
                  priority
                  className="h-8 sm:h-10 w-auto object-contain mb-8"
                />
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                  <div className="h-2 w-10 bg-[#022C4F] rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">10/10</div>
              </motion.div>

              {/* Header */}
              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Completion
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  You're Ready to Start
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Your Nexucon client account is now fully set up and personalized for your construction needs.
                </p>
              </motion.div>

              {/* Selection Cards */}
              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
                  {/* Option 1 */}
                  <div 
                    onClick={() => setNextAction("post_project")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${nextAction === "post_project" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${nextAction === "post_project" ? 'border-white' : 'border-gray-400'}`}>
                        {nextAction === "post_project" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Post Your</span>
                      <span>First Project</span>
                    </div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setNextAction("find_professionals")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${nextAction === "find_professionals" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${nextAction === "find_professionals" ? 'border-white' : 'border-gray-400'}`}>
                        {nextAction === "find_professionals" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>Find Professionals</span>
                    </div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setNextAction("view_dashboard")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${nextAction === "view_dashboard" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${nextAction === "view_dashboard" ? 'border-white' : 'border-gray-400'}`}>
                        {nextAction === "view_dashboard" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center gap-1">
                      <span>View Dashboard</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Dots indicator (mocking design) */}
              <motion.div variants={itemVariants} className="flex justify-center gap-2 mb-10">
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#111827]"></div>
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
              </motion.div>

              {/* Actions */}
              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(10)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Finish Onboarding
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right Side - Static Image (Doesn't re-render/animate out on step change) */}
      <div className="w-full md:w-1/2 min-h-[400px] md:min-h-screen relative p-4 md:p-6 lg:p-8 hidden md:block">
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative w-full h-full overflow-hidden rounded-[24px] lg:rounded-[32px] shadow-sm"
        >
          <Image
            src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784162099/Design_this_background_with_relevant_202605261402_2_fceaqe.png"
            alt="Construction Site"
            fill
            priority
            className="object-cover"
          />
          {/* Overlay of #022C4F */}
          <div className="absolute inset-0 bg-[#022C4F]/40" />
        </motion.div>
      </div>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowCompletionModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-3xl p-8 sm:p-10 w-full max-w-md shadow-2xl overflow-hidden flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-[#111827] mb-3">Onboarding Complete!</h2>
              <p className="text-gray-500 mb-8">
                Your client account has been successfully set up. We're ready to start building together.
              </p>
              <button
                onClick={() => router.push('/client/dashboard')}
                className="w-full py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98]"
              >
                Go to Dashboard
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
