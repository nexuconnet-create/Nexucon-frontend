"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CustomSelect } from "@/components/CustomSelect";
import { Country, State, City } from "country-state-city";
import { CheckCircle2 } from "lucide-react";

export default function GovernmentOnboarding() {
  const [step, setStep] = useState(0);
  const router = useRouter();

  // State for onboarding steps
  const [primaryRole, setPrimaryRole] = useState("plan_review");
  const [jurisdictionLevel, setJurisdictionLevel] = useState("municipal");
  const [projectScaleFocus, setProjectScaleFocus] = useState("residential");
  const [country, setCountry] = useState("");
  const [stateRegion, setStateRegion] = useState("");
  const [city, setCity] = useState("");
  const [department, setDepartment] = useState("");
  const [collaborationPreference, setCollaborationPreference] = useState("hybrid");
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

  const completeOnboarding = () => {
    localStorage.setItem('verification_status', 'completed');
    setShowCompletionModal(true);
    setTimeout(() => {
      router.push("/government/dashboard");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row overflow-hidden">
      {/* Dynamic Content */}
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

              <div className="max-w-[480px] md:my-auto py-10 mx-auto text-center md:text-left md:mx-0">
                <motion.h1 variants={itemVariants} className="text-3xl sm:text-4xl md:text-[38px] font-extrabold text-[#111827] mb-5 leading-tight tracking-tight">
                  Welcome to Nexucon
                </motion.h1>
                <motion.p variants={itemVariants} className="text-[#4b5563] text-base md:text-lg mb-10 leading-[1.6] font-medium pr-0 md:pr-4 mx-auto">
                  Let's set up your agency profile to streamline project compliance, permit issuance, and project reviews across your jurisdiction.
                </motion.p>
                <motion.button
                  variants={itemVariants}
                  onClick={() => setStep(1)}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-[10px] font-medium transition-all active:scale-[0.98] shadow-sm text-base w-full sm:w-auto"
                >
                  Get Started
                </motion.button>
              </div>

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
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">1/5</div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Primary Role
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  What is your primary function?
                </h3>
                <p className="text-gray-500 text-sm font-medium">
                  Select the main activity your department handles.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  <div 
                    onClick={() => setPrimaryRole("plan_review")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${primaryRole === "plan_review" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${primaryRole === "plan_review" ? 'border-white' : 'border-gray-400'}`}>
                        {primaryRole === "plan_review" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Plan Review & Approval</div>
                  </div>

                  <div 
                    onClick={() => setPrimaryRole("permit_issuance")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${primaryRole === "permit_issuance" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${primaryRole === "permit_issuance" ? 'border-white' : 'border-gray-400'}`}>
                        {primaryRole === "permit_issuance" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Permit Issuance</div>
                  </div>

                  <div 
                    onClick={() => setPrimaryRole("site_inspection")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${primaryRole === "site_inspection" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${primaryRole === "site_inspection" ? 'border-white' : 'border-gray-400'}`}>
                        {primaryRole === "site_inspection" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Site Inspections & Audits</div>
                  </div>

                  <div 
                    onClick={() => setPrimaryRole("comprehensive_oversight")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${primaryRole === "comprehensive_oversight" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${primaryRole === "comprehensive_oversight" ? 'border-white' : 'border-gray-400'}`}>
                        {primaryRole === "comprehensive_oversight" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Comprehensive Oversight</div>
                  </div>
                </div>
              </motion.div>

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
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">2/5</div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Jurisdiction Level
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  What level of government do you represent?
                </h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  <div 
                    onClick={() => setJurisdictionLevel("municipal")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${jurisdictionLevel === "municipal" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${jurisdictionLevel === "municipal" ? 'border-white' : 'border-gray-400'}`}>
                        {jurisdictionLevel === "municipal" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Municipal / City</div>
                  </div>

                  <div 
                    onClick={() => setJurisdictionLevel("county")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${jurisdictionLevel === "county" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${jurisdictionLevel === "county" ? 'border-white' : 'border-gray-400'}`}>
                        {jurisdictionLevel === "county" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">County / Regional</div>
                  </div>

                  <div 
                    onClick={() => setJurisdictionLevel("state")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${jurisdictionLevel === "state" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${jurisdictionLevel === "state" ? 'border-white' : 'border-gray-400'}`}>
                        {jurisdictionLevel === "state" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">State / Provincial</div>
                  </div>

                  <div 
                    onClick={() => setJurisdictionLevel("federal")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${jurisdictionLevel === "federal" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${jurisdictionLevel === "federal" ? 'border-white' : 'border-gray-400'}`}>
                        {jurisdictionLevel === "federal" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Federal / National</div>
                  </div>
                </div>
              </motion.div>

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
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">3/5</div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Project Scale Focus
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  What scale of projects do you primarily oversee?
                </h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 xl:gap-6">
                  <div 
                    onClick={() => setProjectScaleFocus("residential")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScaleFocus === "residential" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScaleFocus === "residential" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScaleFocus === "residential" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Residential / Small</div>
                  </div>

                  <div 
                    onClick={() => setProjectScaleFocus("commercial")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScaleFocus === "commercial" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScaleFocus === "commercial" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScaleFocus === "commercial" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Commercial / Medium</div>
                  </div>

                  <div 
                    onClick={() => setProjectScaleFocus("industrial")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScaleFocus === "industrial" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScaleFocus === "industrial" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScaleFocus === "industrial" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Industrial / Large</div>
                  </div>

                  <div 
                    onClick={() => setProjectScaleFocus("infrastructure")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${projectScaleFocus === "infrastructure" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${projectScaleFocus === "infrastructure" ? 'border-white' : 'border-gray-400'}`}>
                        {projectScaleFocus === "infrastructure" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Infrastructure / Enterprise</div>
                  </div>
                </div>
              </motion.div>

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
                  <div className="h-2 w-10 bg-gray-300 rounded-full"></div>
                </div>
                <div className="text-sm font-bold text-[#022C4F]">4/5</div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Location & Department
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  Where are you based?
                </h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 lg:p-8 rounded-3xl mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-8 max-w-4xl mx-auto">
                  <div className="flex flex-col gap-2 relative z-50">
                    <label className="text-sm font-bold text-[#022C4F]">Country</label>
                    <CustomSelect
                      value={country}
                      onChange={(val) => setCountry(val)}
                      options={countryOptions}
                      placeholder="Select Country"
                      searchable={true}
                    />
                  </div>

                  <div className="flex flex-col gap-2 relative z-40">
                    <label className="text-sm font-bold text-[#022C4F]">State / Region</label>
                    <CustomSelect
                      value={stateRegion}
                      onChange={(val) => setStateRegion(val)}
                      options={stateOptions}
                      placeholder="Select State"
                      searchable={true}
                      disabled={!country}
                    />
                  </div>

                  <div className="flex flex-col gap-2 relative z-30">
                    <label className="text-sm font-bold text-[#022C4F]">City</label>
                    <CustomSelect
                      value={city}
                      onChange={(val) => setCity(val)}
                      options={cityOptions}
                      placeholder="Select City"
                      searchable={true}
                      disabled={!stateRegion}
                    />
                  </div>

                  <div className="flex flex-col gap-2 relative z-20">
                    <label className="text-sm font-bold text-[#022C4F]">Department Name</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium"
                      placeholder="e.g. Department of Buildings"
                    />
                  </div>
                </div>
              </motion.div>

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
                <div className="text-sm font-bold text-[#022C4F]">5/5</div>
              </motion.div>

              <motion.div variants={itemVariants} className="mb-8">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mb-6">
                  Collaboration Preference
                </h2>
                <h3 className="text-xl font-bold text-[#022C4F] mb-2">
                  How do you prefer to interact with project owners?
                </h3>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-[#E5E7EB] p-4 sm:p-6 rounded-3xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 xl:gap-6">
                  <div 
                    onClick={() => setCollaborationPreference("formal")}
                    className={`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      ${collaborationPreference === "formal" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        ${collaborationPreference === "formal" ? 'border-white' : 'border-gray-400'}`}>
                        {collaborationPreference === "formal" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Formal Submissions Only</div>
                  </div>

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
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Hybrid (Formal & Direct)</div>
                  </div>

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
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Direct Messaging Available</div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={() => setStep(4)}
                  className="px-10 py-3.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={completeOnboarding}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Complete Setup
                </button>
              </motion.div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Right Side - Static Background Image */}
      <div 
        className="hidden md:block w-1/2 bg-cover bg-center bg-no-repeat relative h-screen"
        style={{
          backgroundImage: `url('https://res.cloudinary.com/depeqzb6z/image/upload/v1784137456/Want_to_build_your_dream_business_or_investment_property__%EF%B8%8F_1_bsoz7j.png')`,
        }}
      >
        <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]"></div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl p-10 max-w-md w-full text-center flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-[#022C4F] mb-3">Setup Complete!</h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your government agency profile has been configured successfully. We're redirecting you to your dashboard...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div 
                className="bg-[#022C4F] h-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.2, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
