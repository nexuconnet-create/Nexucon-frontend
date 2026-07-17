import * as fs from 'fs';
import * as path from 'path';

const targetFile = path.resolve(__dirname, '../../app/(auth)/client/register/page.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add CustomSelect component at the bottom of the file
custom_select_code = `
interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
  disabledText?: string;
}

function CustomSelect({ value, onChange, options, placeholder, searchable = false, error, disabled = false, disabledText }: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable 
    ? options.filter(opt => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={\`w-full px-4 py-3.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 cursor-pointer'} flex justify-between items-center\`}
      >
        <span className={value ? (disabled ? 'text-gray-400' : 'text-gray-900') : 'text-gray-400'}>
          {disabled && disabledText ? disabledText : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden flex flex-col">
          {searchable && (
            <div className="p-3 border-b border-gray-100 relative">
              <Search className="w-4 h-4 absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#022C4F] focus:border-[#022C4F]"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
          <div className="max-h-60 overflow-y-auto p-2">
            {filteredOptions.map(opt => (
              <div
                key={opt.value}
                className="px-4 py-2.5 hover:bg-gray-50 cursor-pointer text-sm rounded-lg transition-colors text-gray-700"
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                  setSearchQuery('');
                }}
              >
                {opt.label}
              </div>
            ))}
            {filteredOptions.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">No options found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
`

if (!content.includes("interface CustomSelectProps")) {
    content += "\n" + custom_select_code

// 2. Replace Role Select
role_select_old = `<div className="relative">
                    <select
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-gray-300 focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] transition-all text-sm font-medium appearance-none bg-white text-gray-700 cursor-pointer"
                    >
                      <option value="client">Project Owner</option>
                      <option value="professional">Client Representative</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>`

role_select_new = `<CustomSelect
                    value={formData.role}
                    onChange={(val) => handleInputChange('role', val)}
                    options={[
                      { value: "client", label: "Project Owner" },
                      { value: "professional", label: "Client Representative" }
                    ]}
                    placeholder="Select Role"
                    error={errors.role}
                  />`
content = content.replace(role_select_old, role_select_new)


// 3. Replace Company Size
company_size_old = `<div className="relative">
                      <select
                        value={formData.companySize}
                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className={\`w-full px-4 py-3.5 rounded-xl border ${errors.companySize ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium appearance-none bg-white text-gray-700 cursor-pointer\`}
                      >
                        <option value="" disabled>Select size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201+">201+ employees</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>`
company_size_new = `<CustomSelect
                      value={formData.companySize}
                      onChange={(val) => handleInputChange('companySize', val)}
                      options={[
                        { value: "1-10", label: "1-10 employees" },
                        { value: "11-50", label: "11-50 employees" },
                        { value: "51-200", label: "51-200 employees" },
                        { value: "201+", label: "201+ employees" }
                      ]}
                      placeholder="Select size"
                      error={errors.companySize}
                    />`
content = content.replace(company_size_old, company_size_new)

// 4. Replace Industry
industry_old = `<div className="relative">
                    <select
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className={\`w-full px-4 py-3.5 rounded-xl border ${errors.industry ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium appearance-none bg-white text-gray-700 cursor-pointer\`}
                    >
                      <option value="" disabled>Select sector</option>
                      <option value="residential">Residential Construction</option>
                      <option value="commercial">Commercial Construction</option>
                      <option value="industrial">Industrial Construction</option>
                      <option value="infrastructure">Infrastructure</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>`
industry_new = `<CustomSelect
                    value={formData.industry}
                    onChange={(val) => handleInputChange('industry', val)}
                    options={[
                      { value: "residential", label: "Residential Construction" },
                      { value: "commercial", label: "Commercial Construction" },
                      { value: "industrial", label: "Industrial Construction" },
                      { value: "infrastructure", label: "Infrastructure" }
                    ]}
                    placeholder="Select sector"
                    error={errors.industry}
                  />`
content = content.replace(industry_old, industry_new)

// 5. Replace Business Type
business_old = `<div className="relative">
                    <select
                      value={formData.businessType}
                      onChange={(e) => handleInputChange('businessType', e.target.value)}
                      className={\`w-full px-4 py-3.5 rounded-xl border ${errors.businessType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium appearance-none bg-white text-gray-700 cursor-pointer\`}
                    >
                      <option value="" disabled>Select business type</option>
                      <option value="individual">Individual / Sole Proprietor</option>
                      <option value="corporation">Corporation</option>
                      <option value="llc">LLC</option>
                      <option value="partnership">Partnership</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                      <ChevronDown className="w-5 h-5" />
                    </div>
                  </div>`
business_new = `<CustomSelect
                    value={formData.businessType}
                    onChange={(val) => handleInputChange('businessType', val)}
                    options={[
                      { value: "individual", label: "Individual / Sole Proprietor" },
                      { value: "corporation", label: "Corporation" },
                      { value: "llc", label: "LLC" },
                      { value: "partnership", label: "Partnership" }
                    ]}
                    placeholder="Select business type"
                    error={errors.businessType}
                  />`
content = content.replace(business_old, business_new)

// 6. Replace State/Region
state_old = `<div className="relative">
                      <select
                        value={formData.stateRegion}
                        onChange={(e) => handleInputChange('stateRegion', e.target.value)}
                        className={\`w-full px-4 py-3.5 rounded-xl border ${errors.stateRegion ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium appearance-none bg-white text-gray-700 cursor-pointer disabled:bg-gray-100 disabled:text-gray-400\`}
                        disabled={!formData.country}
                      >
                        <option value="" disabled>{formData.country ? 'Select State/Region' : 'Select Country First'}</option>
                        {formData.country && State.getStatesOfCountry(formData.country).map(state => (
                          <option key={state.isoCode} value={state.isoCode}>{state.name}</option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <ChevronDown className="w-5 h-5" />
                      </div>
                    </div>`
state_new = `<CustomSelect
                      value={formData.stateRegion}
                      onChange={(val) => handleInputChange('stateRegion', val)}
                      options={formData.country ? State.getStatesOfCountry(formData.country).map(state => ({ value: state.isoCode, label: state.name })) : []}
                      placeholder="Select State/Region"
                      searchable={true}
                      error={errors.stateRegion}
                      disabled={!formData.country}
                      disabledText="Select Country First"
                    />`
content = content.replace(state_old, state_new)


}

fs.writeFileSync(targetFile, content, 'utf8');
console.log('Successfully ran refactor.ts');
