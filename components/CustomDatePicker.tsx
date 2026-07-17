"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CustomDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string) => void;
  error?: string;
  placement?: 'top' | 'bottom';
}

export function CustomDatePicker({ value, onChange, error, placement = 'bottom' }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current value or use today to avoid timezone shifts
  let initialDate = new Date();
  if (value) {
    const [y, m, d] = value.split('-');
    initialDate = new Date(Number(y), Number(m) - 1, Number(d));
  }
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    onChange(`${currentYear}-${formattedMonth}-${formattedDay}`);
    setIsOpen(false);
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  // Generate years for dropdown (100 years back to 10 years forward)
  const currentYearActual = new Date().getFullYear();
  const years = Array.from({ length: 110 }, (_, i) => currentYearActual - 100 + i).reverse();

  // Format display value avoiding UTC shift
  let displayValue = "";
  if (value) {
    const [y, m, d] = value.split('-');
    const localDate = new Date(Number(y), Number(m) - 1, Number(d));
    displayValue = localDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3.5 rounded-xl border ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 hover:border-gray-400'} focus:outline-none focus:ring-1 transition-all text-sm font-medium ${displayValue ? 'text-gray-900' : 'text-gray-400'} bg-white flex justify-between items-center cursor-pointer`}
      >
        <span>{displayValue || "Select Date"}</span>
        <CalendarIcon className="w-5 h-5 text-gray-400" />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === 'top' ? 10 : -10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: placement === 'top' ? 10 : -10, scaleY: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={`absolute z-[100] w-full min-w-[280px] bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden flex flex-col p-4 ${
              placement === 'top' ? 'bottom-full mb-2 origin-bottom' : 'top-full mt-2 origin-top'
            }`}
          >
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-4">
              <button type="button" onClick={handlePrevMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="flex gap-2 font-semibold text-[#022C4F]">
                <select 
                  value={currentMonth}
                  onChange={(e) => setCurrentMonth(Number(e.target.value))}
                  className="bg-transparent appearance-none cursor-pointer outline-none hover:bg-gray-50 rounded px-1"
                >
                  {monthNames.map((m, i) => (
                    <option key={m} value={i}>{m}</option>
                  ))}
                </select>
                <select
                  value={currentYear}
                  onChange={(e) => setCurrentYear(Number(e.target.value))}
                  className="bg-transparent appearance-none cursor-pointer outline-none hover:bg-gray-50 rounded px-1"
                >
                  {years.map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>

              <button type="button" onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center text-xs font-bold text-gray-400 py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateString = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = value === dateString;
                
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => handleDateSelect(day)}
                    className={`h-8 w-full rounded-full text-sm font-medium transition-colors flex items-center justify-center ${isSelected ? 'bg-[#022C4F] text-white shadow-md' : 'text-gray-700 hover:bg-gray-100'}`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
