import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, MoreHorizontal, CheckCircle, Hourglass, FileText, Upload, X, ChevronLeft, ChevronRight, Calendar, Clock, MapPin } from "lucide-react";
import NotificationCenter from "@/components/dashboard/NotificationCenter";
import DrawingPreviewModal from "@/components/dashboard/DrawingPreviewModal";
import DocumentPreviewModal from "@/components/dashboard/DocumentPreviewModal";
import DeliverablesDrawer from "@/components/dashboard/DeliverablesDrawer";
import AssignTaskDrawer from "@/components/dashboard/AssignTaskDrawer";


export default function TeamTab() {
  const router = useRouter();
  const [activeDrawer, setActiveDrawer] = useState<any>(null);

  const [activeTaskAssign, setActiveTaskAssign] = useState<any>(null);

  const handleOpenProfile = (e: React.MouseEvent, name: string, role: string, imgUrl: string) => {
    e.preventDefault(); e.stopPropagation();
    const id = name.toLowerCase().replace(' ', '-');
    router.push(`/client/team/${id}`);
  };

  const handleOpenAssignTask = (e: React.MouseEvent, name: string, role: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveTaskAssign({ memberName: name, role: role });
  };

  const mockDeliverables = [
    { id: '1', name: 'Structural Load Calculations.pdf', status: 'Approved', date: 'Oct 12, 2026', size: '2.4 MB' },
    { id: '2', name: 'Foundation Design Drawings.dwg', status: 'Under Review', date: 'Oct 15, 2026', size: '15.8 MB' },
    { id: '3', name: 'Material Specifications.docx', status: 'In Progress', date: 'Oct 20, 2026', size: '1.1 MB' }
  ];

  const handleOpenDeliverables = (e: React.MouseEvent, name: string, role: string) => {
    e.preventDefault(); e.stopPropagation();
    setActiveDrawer({ memberName: name, role: role, deliverables: mockDeliverables });
  };

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both">
      <div className="mb-10">
        <h3 className="text-[26px] font-extrabold text-[#022C4F] mb-3">Project Team & Collaborators</h3>
        <p className="text-[11px] text-[#0F181F] font-medium max-w-2xl leading-relaxed">
          Manage architects, engineers, consultants, reviewers, client representatives, and project stakeholders collaborating on the design and pre-construction phase.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1 */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[280px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-[16px] font-bold text-[#022C4F] mb-2">Michael Adeyemi</h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Role:</span>
                <span className="text-[11px] font-medium text-gray-600">Structural Engineer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Experience:</span>
                <span className="text-[11px] font-medium text-gray-600">12+ Years</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-[#0F181F]">Current Deliverable:</span>
                <span className="text-[11px] font-medium text-gray-600">Structural Design Package</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Workload:</span>
                <span className="text-[11px] font-medium text-gray-600">3 Active Projects</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png" alt="Michael Adeyemi" className="w-14 h-14 rounded-full object-cover shadow-sm" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></div>
                <span className="text-[10px] font-bold text-[#022C4F]">Active</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenProfile(e, 'Michael Adeyemi', 'Structural Engineer', 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png') }} className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View Profile</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Message</button>
            <button onClick={(e) => handleOpenDeliverables(e, "Michael Adeyemi", "Structural Engineer")} className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">View Deliverables</button>
          </div>
        </div>

        {/* Card 2 */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[280px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-[16px] font-bold text-[#022C4F] mb-2">Sarah Okafor</h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Role:</span>
                <span className="text-[11px] font-medium text-gray-600">Lead Architect</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Experience:</span>
                <span className="text-[11px] font-medium text-gray-600">8+ Years</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-[#0F181F]">Current Deliverables:</span>
                <span className="text-[11px] font-medium text-gray-600">Architectural Design Package</span>
              </div>
              <div className="flex flex-col gap-1 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-[#0F181F]">Workload:</span>
                  <span className="text-[11px] font-bold text-[#E53935]">5 Active Projects</span>
                </div>
                <p className="text-[10px] text-[#E53935] font-medium italic">Response may be delayed.</p>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png" alt="Sarah Okafor" className="w-14 h-14 rounded-full object-cover shadow-sm" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></div>
                <span className="text-[10px] font-bold text-[#022C4F]">Active</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-auto">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenProfile(e, 'Sarah Okafor', 'Lead Architect', 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444892/Download_free_image_of_Black_female_engineer_with_a_tablet_about_african_engineer_black_female_engineer_nigerian_female_engineers_female_engineer_and_woman_engineer_1236838_1_vydw0s.png') }} className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View Profile</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Message</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenAssignTask(e, 'Sarah Okafor', 'Lead Architect') }} className="flex-1 py-3 bg-[#0F181F] text-white rounded-xl text-[11px] font-bold hover:bg-black transition-colors shadow-sm">Assign Task</button>
          </div>
        </div>

        {/* Card 3 */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[280px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-[16px] font-bold text-[#022C4F] mb-2">James Ibrahim</h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Role:</span>
                <span className="text-[11px] font-medium text-gray-600">MEP Engineer</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Experience:</span>
                <span className="text-[11px] font-medium text-gray-600">6+ Years</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-[#0F181F]">Current Deliverables:</span>
                <span className="text-[11px] font-medium text-gray-600">MEP Coordination Drawings</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Workload:</span>
                <span className="text-[11px] font-medium text-gray-600">2 Active Projects</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/8_Contract_Clauses_Every_Homeowner_Should_Understand_achlab_1_hmfdz9.png" alt="James Ibrahim" className="w-14 h-14 rounded-full object-cover shadow-sm" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></div>
                <span className="text-[10px] font-bold text-[#022C4F]">Active</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-auto max-w-[65%]">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenProfile(e, 'James Ibrahim', 'MEP Consultant', 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444890/Download_free_image_of_African_American_engineer_at_a_construction_site_about_african_construction_worker_black_male_engineer_construction_worker_worker_and_african_worker_2190011_1_m5f0qf.png') }} className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View Profile</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Message</button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="border border-[#022C4F] rounded-[32px] p-8 flex flex-col shadow-sm min-h-[280px]">
          <div className="flex justify-between items-start mb-8">
            <div className="flex flex-col gap-2">
              <h4 className="text-[16px] font-bold text-[#022C4F] mb-2">David Bello</h4>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Role:</span>
                <span className="text-[11px] font-medium text-gray-600">Quantity Surveyor</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Experience:</span>
                <span className="text-[11px] font-medium text-gray-600">7+ Years</span>
              </div>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-[11px] font-bold text-[#0F181F]">Current Deliverables:</span>
                <span className="text-[11px] font-medium text-gray-600">BOQ & Cost Estimates</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[11px] font-bold text-[#0F181F]">Workload:</span>
                <span className="text-[11px] font-medium text-gray-600">4 Active Projects</span>
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="https://res.cloudinary.com/depeqzb6z/image/upload/v1784489051/8_Contract_Clauses_Every_Homeowner_Should_Understand_achlab_1_hmfdz9.png" alt="David Bello" className="w-14 h-14 rounded-full object-cover shadow-sm" />
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]"></div>
                <span className="text-[10px] font-bold text-[#022C4F]">Active</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-auto max-w-[65%]">
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleOpenProfile(e, 'David Bello', 'Client Representative', 'https://res.cloudinary.com/depeqzb6z/image/upload/v1784444889/Download_free_image_of_African_engineer_man_inspecting_a_building_about_african_engineer_black_male_engineer_african_civil_engineer_black_construction_worker_and_african_american_engineer_12_sh9eqq.png') }} className="flex-1 py-3 border border-gray-300 rounded-xl text-[11px] font-bold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">View Profile</button>
            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); router.push('/client/messages'); }} className="flex-1 py-3 bg-[#022C4F] text-white rounded-xl text-[11px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm">Message</button>
          </div>
        </div>

      </div>

      {/* Team Availability */}
      <div className="mt-12">
        <h4 className="text-[18px] font-bold text-[#022C4F] mb-6">Team Availability Overview</h4>
        <div className="border border-gray-100 bg-white rounded-[32px] p-8 shadow-sm overflow-x-auto">
          <div className="min-w-[700px]">
             {/* Calendar Header */}
             <div className="grid grid-cols-6 gap-2 mb-6">
                <div className="col-span-1"></div>
                <div className="text-center text-[11px] font-bold text-gray-500">Mon, 21st</div>
                <div className="text-center text-[11px] font-bold text-gray-500">Tue, 22nd</div>
                <div className="text-center text-[11px] font-bold text-gray-500">Wed, 23rd</div>
                <div className="text-center text-[11px] font-bold text-gray-500">Thu, 24th</div>
                <div className="text-center text-[11px] font-bold text-gray-500">Fri, 25th</div>
             </div>
             
             {/* Michael */}
             <div className="grid grid-cols-6 gap-2 items-center mb-4">
                <div className="col-span-1 text-[12px] font-bold text-[#022C4F]">Michael Adeyemi</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm">Review Session</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#FFF8E1] border border-[#FFECB3] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#F57F17] font-bold shadow-sm">Site Visit</div>
             </div>
             
             {/* Sarah */}
             <div className="grid grid-cols-6 gap-2 items-center mb-4">
                <div className="col-span-1 text-[12px] font-bold text-[#022C4F]">Sarah Okafor</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm opacity-60">Overloaded</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm opacity-60">Overloaded</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm">Review Session</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm opacity-60">Overloaded</div>
             </div>
             
             {/* James */}
             <div className="grid grid-cols-6 gap-2 items-center mb-4">
                <div className="col-span-1 text-[12px] font-bold text-[#022C4F]">James Ibrahim</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm">Review Session</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
             </div>

             {/* David */}
             <div className="grid grid-cols-6 gap-2 items-center">
                <div className="col-span-1 text-[12px] font-bold text-[#022C4F]">David Bello</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm">Review Session</div>
                <div className="bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#C62828] font-bold shadow-sm opacity-60">Booked</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
                <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl h-12 flex items-center justify-center text-[10px] text-[#2E7D32] font-bold shadow-sm">Available</div>
             </div>
          </div>
        </div>
      </div>

      <DeliverablesDrawer 
        isOpen={!!activeDrawer} 
        onClose={() => setActiveDrawer(null)} 
        memberName={activeDrawer?.memberName || ""}
        role={activeDrawer?.role || ""}
        deliverables={activeDrawer?.deliverables || []}
      />
      
      <AssignTaskDrawer 
        isOpen={!!activeTaskAssign} 
        onClose={() => setActiveTaskAssign(null)} 
        {...activeTaskAssign}
      />
    </div>
  );
}
