import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(client)/onboarding/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add state for requiredProfessional2
if (!content.includes("const [requiredProfessional2, setRequiredProfessional2] = useState(")) {
  content = content.replace(
    'const [requiredProfessional, setRequiredProfessional] = useState("contractors");',
    'const [requiredProfessional, setRequiredProfessional] = useState("contractors");\n  const [requiredProfessional2, setRequiredProfessional2] = useState("quantity_surveyors");'
  )

  // 2. Update Continue button in step 3 to go to step 4
  content = content.replace(
    `                  onClick={() => {
                    // Go to step 4 when ready
                  }}`,
    `                  onClick={() => setStep(4)}`
  )

  // 3. Add Step 4 component code
  const step_4_code = `
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
                    className={\`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      $\{requiredProfessional2 === "quantity_surveyors" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}\`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={\`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        $\{requiredProfessional2 === "quantity_surveyors" ? 'border-white' : 'border-gray-400'}\`}>
                        {requiredProfessional2 === "quantity_surveyors" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Quantity Surveyors</div>
                  </div>

                  {/* Option 2 */}
                  <div 
                    onClick={() => setRequiredProfessional2("mep_engineers")}
                    className={\`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      $\{requiredProfessional2 === "mep_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}\`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={\`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        $\{requiredProfessional2 === "mep_engineers" ? 'border-white' : 'border-gray-400'}\`}>
                        {requiredProfessional2 === "mep_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">MEP Engineers</div>
                  </div>

                  {/* Option 3 */}
                  <div 
                    onClick={() => setRequiredProfessional2("civil_engineers")}
                    className={\`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      $\{requiredProfessional2 === "civil_engineers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}\`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={\`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        $\{requiredProfessional2 === "civil_engineers" ? 'border-white' : 'border-gray-400'}\`}>
                        {requiredProfessional2 === "civil_engineers" && <div className="w-2 h-2 bg-white rounded-full"></div>}
                      </div>
                    </div>
                    <div className="text-sm font-normal leading-relaxed px-2 w-full text-center flex flex-col items-center justify-center">Civil Engineers</div>
                  </div>

                  {/* Option 4 */}
                  <div 
                    onClick={() => setRequiredProfessional2("project_managers")}
                    className={\`relative cursor-pointer transition-all duration-300 rounded-2xl p-5 flex flex-col justify-center items-center min-h-[280px] text-center
                      $\{requiredProfessional2 === "project_managers" ? 'bg-[#022C4F] text-white shadow-md scale-[1.02]' : 'bg-white text-gray-700 hover:bg-gray-50'}\`}
                  >
                    <div className="absolute top-3 right-3">
                      <div className={\`w-4 h-4 rounded-full border-2 flex items-center justify-center
                        $\{requiredProfessional2 === "project_managers" ? 'border-white' : 'border-gray-400'}\`}>
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
                  onClick={() => {
                    // Go to step 5 when ready
                  }}
                  className="px-10 py-3.5 bg-[#022C4F] hover:bg-[#022C4F]/90 text-white rounded-xl font-medium transition-all active:scale-[0.98] w-full sm:w-auto"
                >
                  Continue
                </button>
              </motion.div>
            </motion.div>
          )}
`

  content = content.replace("        </AnimatePresence>", step_4_code + "        </AnimatePresence>")


}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran add_step4.ts');
