'use client';

import React, { useState } from 'react';
import { Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function AIAssistantPage() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasRecommended, setHasRecommended] = useState(false);

  const handleRecommend = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    // Simulate AI generation delay
    setTimeout(() => {
      setIsGenerating(false);
      setHasRecommended(true);
      setPrompt('');
    }, 1500);
  };

  return (
    <div className="pt-4 h-[calc(100vh-100px)] flex flex-col animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
          Smart AI Execution Team Recommender
        </h1>
        <p className="text-[18px] text-gray-600 font-medium">
          Need Help Finding the Right Team?
        </p>
      </div>

      {/* Main empty area (chat history would go here) */}
      <div className="flex-1 overflow-y-auto pb-4 pr-2 custom-scrollbar">
        {isGenerating && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-4 text-[#022C4F]">
              <Loader2 size={32} className="animate-spin" />
              <p className="text-[14px] font-bold animate-pulse">Analyzing project brief...</p>
            </div>
          </div>
        )}

        {hasRecommended && !isGenerating && (
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-[#022C4F] text-white flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-[18px] font-extrabold text-[#022C4F]">AI Recommendation</h3>
                <p className="text-[12px] text-gray-500 font-medium">Based on your project brief</p>
              </div>
            </div>

            <div className="text-gray-700">
              <p className="mb-6 text-[14px]">Here is the recommended <strong>Team Mapping</strong> process for your transition to execution:</p>
              
              <div className="overflow-x-auto mb-8 border border-gray-200 rounded-xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                <table className="w-full min-w-[600px] text-[13px] border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-[#0F181F] border-b border-gray-200">
                      <th className="p-4 font-extrabold">Nexucon Role</th>
                      <th className="p-4 font-extrabold">SiteSupervise Role</th>
                      <th className="p-4 font-extrabold">Function During Construction</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-bold text-[#022C4F]">Skipper</td>
                      <td className="p-4 font-medium">Technical Lead</td>
                      <td className="p-4">Validation PARTIAL. Reviews inspection reports, approves deviations.</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="p-4 font-bold text-[#022C4F]">Navigator</td>
                      <td className="p-4 font-medium">Young Engineer / QA Engineer</td>
                      <td className="p-4">Conducts AR inspections, verifies compliance.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-bold text-[#022C4F]">Site Engineer</td>
                      <td className="p-4 font-medium">Site Engineer</td>
                      <td className="p-4">On-site verification, daily reporting.</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="bg-[#022C4F]/5 border border-[#022C4F]/10 rounded-xl p-6">
                <h4 className="text-[15px] font-extrabold text-[#022C4F] mb-3 flex items-center gap-2">
                  <ArrowRight size={18} /> Data Transfer Protocol
                </h4>
                <p className="text-[13px] text-gray-700 leading-relaxed m-0">
                  When handoff occurs, these roles must be automatically created in <strong>SiteSupervise</strong> with their contact details and permissions properly mapped to ensure a seamless transition into the execution phase.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Prompt Input Container */}
      <div className="w-full mt-auto mb-10 shadow-2xl rounded-3xl overflow-hidden bg-[#022C4F] shrink-0 border border-gray-200">
        
        {/* Dark Header */}
        <div className="px-6 py-3">
          <p className="text-[9px] text-white/80 font-medium tracking-wide">
            Generate a professional project brief, identify required specialists, recommend deliverables, and create an initial design workflow.
          </p>
        </div>

        {/* White Input Area */}
        <div className="bg-white p-8 pb-6 rounded-3xl">
          <h2 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Smart AI Execution Team Recommender</h2>
          
          <div className="flex flex-col gap-6">
            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gray-300"></div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Type Your Project Brief"
                className="w-full h-16 pl-6 pt-1 text-[16px] text-[#0F181F] placeholder-gray-400 focus:outline-none resize-none bg-transparent"
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                variant="outline" 
                onClick={handleRecommend}
                disabled={!prompt.trim() || isGenerating}
                className="w-40 h-[48px] border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 rounded-full font-bold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? 'Generating...' : 'Recommend'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
