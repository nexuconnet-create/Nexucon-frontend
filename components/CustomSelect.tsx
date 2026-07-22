"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  placeholder: string;
  searchable?: boolean;
  error?: string;
  disabled?: boolean;
  disabledText?: string;
  variant?: 'default' | 'underline' | 'form';
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  searchable = false,
  error,
  disabled = false,
  disabledText,
  variant = 'default'
}: CustomSelectProps) {
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
        className={
          variant === 'underline'
            ? `w-full pb-2 border-b ${error ? 'border-red-500' : 'border-[#022C4F]'} focus:outline-none transition-all text-sm font-medium ${disabled ? 'text-gray-400 cursor-not-allowed' : 'bg-transparent text-[#022C4F] cursor-pointer'} flex justify-between items-center`
            : variant === 'form'
            ? `w-full h-12 rounded-lg border ${error ? 'border-red-500' : 'border-[#022C4F]'} px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-sm text-[#0F181F] flex justify-between items-center ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white cursor-pointer'}`
            : `w-full px-4 py-3.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#022C4F] focus:ring-[#022C4F]'} focus:outline-none focus:ring-1 transition-all text-sm font-medium ${disabled ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 cursor-pointer'} flex justify-between items-center`
        }
      >
        <span className={value ? (disabled ? 'text-gray-400' : (variant === 'underline' ? 'text-[#022C4F]' : 'text-gray-900')) : 'text-gray-400'}>
          {disabled && disabledText ? disabledText : (selectedOption ? selectedOption.label : placeholder)}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && !disabled && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-[100] origin-top w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
