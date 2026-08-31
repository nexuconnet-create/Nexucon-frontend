import React from 'react';
import { Check, Clock, CircleDot, User, UserCheck, ShieldCheck, Users, Briefcase, FileCheck2, type LucideIcon } from 'lucide-react';

interface WorkflowStep {
  id: number;
  role: string;
  action: string;
  status: 'completed' | 'active' | 'pending';
  icon: LucideIcon;
  isOptional?: boolean;
}

export default function ApprovalWorkflowStepper() {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      role: 'Navigator',
      action: 'Conducts Quality Assurance Review',
      status: 'completed',
      icon: ShieldCheck,
    },
    {
      id: 2,
      role: 'Skipper',
      action: 'Certifies Technical Quality',
      status: 'completed',
      icon: Check,
    },
    {
      id: 3,
      role: 'Consultant',
      action: 'Verifies Discipline Coordination',
      status: 'active',
      icon: Users,
    },
    {
      id: 4,
      role: 'Client',
      action: 'Final Commercial Sign-Off',
      status: 'pending',
      icon: Briefcase,
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-[24px] p-6 mb-8 shadow-sm">
      <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-6">Iterative Design Collaboration Progress</h3>
      
      <div className="relative">
        {/* Background line connecting all steps */}
        <div className="absolute left-[20px] top-4 bottom-4 w-[2px] bg-gray-100 z-0"></div>
        
        {/* Active progress line up to current step */}
        <div 
          className="absolute left-[20px] top-4 w-[2px] bg-[#4CAF50] z-0 transition-all duration-1000"
          style={{ height: '85%' }} // Approximation to reach step 7
        ></div>

        <div className="flex flex-col gap-6 relative z-10">
          {steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isActive = step.status === 'active';
            const isPending = step.status === 'pending';
            
            const IconComponent = step.icon;
            
            return (
              <div key={step.id} className={`flex gap-5 items-start ${isPending ? 'opacity-50' : 'opacity-100'}`}>
                
                {/* Step Indicator */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 bg-white ${
                    isCompleted ? 'border-[#4CAF50] text-[#4CAF50]' : 
                    isActive ? 'border-[#022C4F] text-[#022C4F] ring-4 ring-[#022C4F]/10' : 
                    'border-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? <Check size={18} strokeWidth={3} /> : 
                     isActive ? <CircleDot size={18} /> : 
                     <IconComponent size={18} />}
                  </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[13px] font-extrabold ${isActive ? 'text-[#022C4F]' : 'text-[#0F181F]'}`}>
                      {step.role}
                    </span>
                    {step.isOptional && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full border border-gray-200 border-dashed">
                        Optional
                      </span>
                    )}
                  </div>
                  <p className="text-[12px] text-gray-500 font-medium">{step.action}</p>
                  
                  {isActive && (
                    <div className="mt-3 flex items-center gap-2 text-[#FF9800] bg-[#FFF3E0] px-3 py-1.5 rounded-lg w-max border border-[#FF9800]/20">
                      <Clock size={14} />
                      <span className="text-[11px] font-bold">Awaiting Action</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
