'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ShieldCheck, Clock, Star, Building2, Map, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Button from '@/components/ui/Button';

interface ExecutionHandoffModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExecutionHandoffModal({ isOpen, onClose }: ExecutionHandoffModalProps) {
  const [selectedContractor, setSelectedContractor] = useState<number | null>(null);

  const contractors = [
    {
      id: 1,
      name: "BuildCo Ltd",
      trade: "General Contractor",
      image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg",
      successRate: "98%",
      completionTime: "-5% Time",
      satisfaction: 4.9,
      insurance: "Fully Bonded",
      isRecommended: true
    },
    {
      id: 2,
      name: "Apex Structures",
      trade: "Civil & Structural",
      image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png",
      successRate: "95%",
      completionTime: "+2 Days",
      satisfaction: 4.6,
      insurance: "Insured",
      isRecommended: false
    }
  ];

  const protocolItems = [
    { id: 'site_cond', title: "Site Conditions", desc: "Soil test completed, hazards cleared, utilities marked." },
    { id: 'structures', title: "Existing Structures", desc: "Demolition permits approved, structural integrity verified." },
    { id: 'boundaries', title: "Boundaries", desc: "Property lines staked out, temporary fencing installed." },
    { id: 'access', title: "Access Points", desc: "Heavy machinery route established, traffic plan active." }
  ];

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = protocolItems.every(item => checkedItems[item.id]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F181F]/60 backdrop-blur-sm px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white w-full max-w-6xl rounded-[32px] shadow-2xl flex flex-col h-full max-h-[90vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 lg:px-10 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <div>
              <h2 className="text-[24px] font-extrabold text-[#022C4F] flex items-center gap-3">
                <Building2 size={28} className="text-[#022C4F]" />
                Execution Readiness & Handoff
              </h2>
              <p className="text-[13px] text-gray-500 font-medium mt-1">Select a vetted contractor and complete the site handover protocol.</p>
            </div>
            <button 
              onClick={onClose}
              className="p-3 bg-white rounded-full text-gray-400 hover:text-gray-800 border border-gray-200 hover:border-gray-300 transition-all shadow-sm"
            >
              <X size={20} strokeWidth={2.5} />
            </button>
          </div>

          <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
            {/* Left Pane: Contractor Comparison Cards */}
            <div className="w-full lg:w-[60%] border-r border-gray-100 bg-white flex flex-col overflow-y-auto p-6 lg:p-10">
              <h3 className="text-[18px] font-extrabold text-[#0F181F] mb-6 flex items-center gap-2">
                Recommended Contractors
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {contractors.map((contractor) => (
                  <div 
                    key={contractor.id} 
                    onClick={() => setSelectedContractor(contractor.id)}
                    className={`border-2 rounded-[24px] p-6 cursor-pointer transition-all duration-300 relative ${selectedContractor === contractor.id ? 'border-[#022C4F] shadow-lg bg-[#022C4F]/[0.02]' : 'border-gray-100 hover:border-gray-300 hover:shadow-md bg-white'}`}
                  >
                    {contractor.isRecommended && (
                      <div className="absolute -top-3 right-6 bg-[#8BC34A] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                        Top Match
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mb-6">
                      <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-gray-100 shrink-0">
                        <Image src={contractor.image} alt={contractor.name} fill className="object-cover" />
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0F181F] leading-tight">{contractor.name}</h4>
                        <span className="text-[12px] font-bold text-[#022C4F] bg-[#022C4F]/10 px-2.5 py-0.5 rounded-full mt-1 inline-block">{contractor.trade}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Success Rate */}
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><CheckCircle size={14} className="text-[#8BC34A]"/> Success Rate</span>
                        <span className="text-[14px] font-bold text-[#0F181F]">{contractor.successRate}</span>
                      </div>
                      
                      {/* Completion Time */}
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><Clock size={14} className="text-blue-500"/> Est. Completion</span>
                        <span className="text-[13px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{contractor.completionTime}</span>
                      </div>
                      
                      {/* Satisfaction */}
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><Star size={14} className="text-[#FFD54F]"/> Client Satisfaction</span>
                        <div className="flex items-center gap-1">
                          <span className="text-[14px] font-bold text-[#0F181F]">{contractor.satisfaction}</span>
                          <span className="text-[11px] text-gray-400">/ 5.0</span>
                        </div>
                      </div>

                      {/* Insurance */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><ShieldCheck size={14} className="text-purple-500"/> Compliance</span>
                        <span className="text-[12px] font-bold text-[#0F181F]">{contractor.insurance}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className={`w-full py-3 rounded-xl text-[12px] font-bold text-center transition-colors ${selectedContractor === contractor.id ? 'bg-[#022C4F] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {selectedContractor === contractor.id ? 'Contractor Selected' : 'Select Contractor'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Pane: Site Handover Protocol */}
            <div className="w-full lg:w-[40%] bg-gray-50/50 flex flex-col overflow-y-auto p-6 lg:p-10">
              <h3 className="text-[18px] font-extrabold text-[#0F181F] mb-2 flex items-center gap-2">
                Site Handover Protocol
              </h3>
              <p className="text-[12px] text-gray-500 font-medium mb-8">Complete this checklist before transferring site possession.</p>

              <div className="flex flex-col gap-4 flex-1">
                {protocolItems.map((item) => {
                  const isChecked = checkedItems[item.id];
                  return (
                    <div 
                      key={item.id} 
                      onClick={() => toggleCheck(item.id)}
                      className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${isChecked ? 'bg-white border-[#8BC34A] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked ? 'border-[#8BC34A] bg-[#8BC34A] text-white' : 'border-gray-300'}`}>
                        {isChecked && <CheckCircle size={14} strokeWidth={3} />}
                      </div>
                      <div>
                        <h4 className={`text-[14px] font-bold transition-colors ${isChecked ? 'text-[#0F181F]' : 'text-gray-700'}`}>{item.title}</h4>
                        <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="mt-8 pt-6 border-t border-gray-200">
                {!allChecked && (
                  <div className="flex items-center gap-2 text-[11px] font-bold text-[#FF9800] mb-4 bg-[#FF9800]/10 p-3 rounded-xl">
                    <AlertTriangle size={14} />
                    Complete all protocol items to unlock handover.
                  </div>
                )}
                <div className="flex justify-center w-full">
                  <Button 
                    variant="success"
                    disabled={!allChecked || selectedContractor === null}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Site Successfully Handed Over!', type: 'success' } })); onClose(); }}
                  >
                    <Map size={18} className="mr-2" /> Approve & Execute Handoff
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
