'use client';

import React, { use } from 'react';
import { Mail, Phone, MapPin, Briefcase, Award, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TeamMemberProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  
  // Mock data based on the ID
  const memberData: Record<string, any> = {
    'michael-adeyemi': {
      name: 'Michael Adeyemi',
      role: 'Structural Engineer',
      imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png",
      expertise: ['Structural Analysis', 'BIM Modeling', 'AutoCAD', 'Revit'],
    },
    'sarah-okafor': {
      name: 'Sarah Okafor',
      role: 'Lead Architect',
      imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444892/Download_free_image_of_Black_female_engineer_with_a_tablet_about_african_engineer_black_female_engineer_nigerian_female_engineers_female_engineer_and_woman_engineer_1236838_1_vydw0s.png",
      expertise: ['Architectural Design', '3D Rendering', 'Urban Planning', 'Sustainability'],
    },
    'james-ibrahim': {
      name: 'James Ibrahim',
      role: 'MEP Consultant',
      imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444890/Download_free_image_of_African_American_engineer_at_a_construction_site_about_african_construction_worker_black_male_engineer_construction_worker_worker_and_african_worker_2190011_1_m5f0qf.png",
      expertise: ['HVAC Design', 'Electrical Systems', 'Plumbing', 'Energy Efficiency'],
    },
    'david-bello': {
      name: 'David Bello',
      role: 'Client Representative',
      imageUrl: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png",
      expertise: ['Project Management', 'Stakeholder Communication', 'Budget Oversight', 'Quality Assurance'],
    }
  };

  const member = memberData[resolvedParams.id] || memberData['michael-adeyemi'];

  return (
    <div className="max-w-5xl mx-auto py-8 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-[#022C4F] font-bold mb-6 hover:bg-gray-100 px-4 py-2 rounded-xl transition-colors w-fit"
      >
        <ArrowLeft size={18} />
        Back to Team
      </button>

      <div className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100 flex flex-col">
        {/* Header Cover */}
        <div className="h-64 bg-[#022C4F] relative shrink-0">
          {/* Abstract architectural pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#022C4F] to-transparent"></div>
          
          <div className="absolute -bottom-16 left-12 flex items-end gap-8 z-10 w-full pr-16">
            <div className="w-40 h-40 rounded-3xl border-[6px] border-white bg-white shadow-xl overflow-hidden shrink-0 relative group">
              <img 
                src={member.imageUrl} 
                alt={member.name} 
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute bottom-3 right-3 w-5 h-5 bg-green-500 border-4 border-white rounded-full shadow-sm"></div>
            </div>
            
            <div className="mb-20 text-white flex-1">
              <div className="flex justify-between items-start w-full">
                <div>
                  <h2 className="text-[36px] font-extrabold tracking-tight drop-shadow-md">{member.name}</h2>
                  <p className="text-base font-medium text-blue-200 drop-shadow flex items-center gap-3 mt-1.5">
                    {member.role} 
                    <span className="w-1.5 h-1.5 rounded-full bg-white/50"></span>
                    <span className="text-white/80">Joined 2024</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-[11px] font-bold text-white shadow-sm flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div> Available
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-24 px-12 pb-12">
          {/* Action Buttons */}
          <div className="flex gap-4 mb-12 border-b border-gray-100 pb-10">
            <button 
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} 
              className="py-4 px-8 bg-[#022C4F] text-white rounded-2xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <Mail size={18} /> Send Direct Message
            </button>
            <button className="py-4 px-8 border border-gray-200 text-gray-700 bg-gray-50 rounded-2xl text-[13px] font-bold hover:bg-gray-100 transition-colors shadow-sm flex items-center justify-center gap-2">
              <Phone size={18} /> Schedule Call
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
            <div className="flex flex-col gap-12">
              <div>
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5 flex items-center gap-2">
                  Contact Information
                </h4>
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-4 text-[15px] text-gray-700 font-medium">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Mail size={16} className="text-[#022C4F]" />
                    </div>
                    <span>{member.name.toLowerCase().replace(' ', '.')}@nexucon.com</span>
                  </div>
                  <div className="flex items-center gap-4 text-[15px] text-gray-700 font-medium">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <Phone size={16} className="text-[#022C4F]" />
                    </div>
                    <span>+234 800 123 4567</span>
                  </div>
                  <div className="flex items-center gap-4 text-[15px] text-gray-700 font-medium">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <MapPin size={16} className="text-[#022C4F]" />
                    </div>
                    <span>Lagos, Nigeria HQ</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5">Core Expertise</h4>
                <div className="flex flex-wrap gap-3">
                  {member.expertise.map((skill: string, index: number) => (
                    <span key={index} className="px-4 py-2 bg-gray-50 text-[#0F181F] rounded-xl text-[13px] font-bold border border-gray-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-12">
              <div>
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5">Current Assignment</h4>
                <div className="bg-[#022C4F]/5 border border-[#022C4F]/10 rounded-3xl p-6 flex items-start gap-5 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                    <Briefcase size={20} className="text-[#022C4F]" />
                  </div>
                  <div>
                    <h5 className="text-[16px] font-bold text-[#0F181F]">Nexucon Towers (Phase 1)</h5>
                    <p className="text-[14px] text-gray-600 mt-2 leading-relaxed">Lead {member.role.toLowerCase()} responsible for the core {member.role.split(' ')[0].toLowerCase()} deliverables and quality assurance.</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[12px] font-bold text-gray-400 uppercase tracking-widest mb-5">Licenses & Certifications</h4>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4 text-[14px] text-gray-700 font-bold bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <Award size={20} className="text-[#D4AC0D]" />
                    <span>Licensed Professional Engineer (PE)</span>
                  </div>
                  <div className="flex items-center gap-4 text-[14px] text-gray-700 font-bold bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <Award size={20} className="text-[#D4AC0D]" />
                    <span>LEED Accredited Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Recent Contributions Section */}
          <div className="mt-16 pt-12 border-t border-gray-100">
             <h4 className="text-[16px] font-bold text-[#022C4F] mb-8 flex items-center gap-2">
                Recent Contributions
             </h4>
             <div className="flex flex-col gap-6 relative before:absolute before:inset-y-0 before:left-[19px] before:w-0.5 before:bg-gray-100">
                <div className="flex gap-8 relative">
                   <div className="w-10 h-10 rounded-full bg-blue-100 border-[5px] border-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                   </div>
                   <div className="flex-1 pb-4">
                      <p className="text-[15px] font-bold text-[#0F181F]">Uploaded new Architectural Floor Plan</p>
                      <p className="text-[13px] text-gray-500 mt-1">2 hours ago in Design Workspace</p>
                   </div>
                </div>
                <div className="flex gap-8 relative">
                   <div className="w-10 h-10 rounded-full bg-green-100 border-[5px] border-white flex items-center justify-center shrink-0 z-10 shadow-sm">
                      <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                   </div>
                   <div className="flex-1 pb-4">
                      <p className="text-[15px] font-bold text-[#0F181F]">Approved MEP Coordination Changes</p>
                      <p className="text-[13px] text-gray-500 mt-1">Yesterday at 4:30 PM</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
