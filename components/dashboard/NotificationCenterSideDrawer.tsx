import React, { useState } from 'react';
import { Check, MessageSquare, FileText, Users } from 'lucide-react';
import Link from 'next/link';

export default function NotificationCenterSideDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [activeTab, setActiveTab] = useState('Today');

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      icon: <Check className="w-5 h-5 text-white stroke-[3]" />,
      iconBg: "bg-[#22C55E]",
      title: "Architectural Design Package Approved",
      description: "The Lead Architect has approved Architectural Design Package V4.0. The project is now ready for the next review stage.",
      tab: 'Today'
    },
    {
      id: 2,
      icon: <MessageSquare className="w-5 h-5 text-white" fill="currentColor" />,
      iconBg: "bg-[#0F181F]",
      title: "New Review Topic Assigned",
      description: "You have been assigned to review Structural Beam Reinforcement Coordination.",
      tab: 'Today'
    },
    {
      id: 3,
      icon: <FileText className="w-5 h-5 text-[#EF4444]" />,
      iconBg: "bg-red-50",
      title: "BIM Model Updated",
      description: "A new version (V4.0) of the federated BIM model has been published.",
      tab: 'Today'
    },
    {
      id: 4,
      icon: <Users className="w-5 h-5 text-white" fill="currentColor" />,
      iconBg: "bg-[#0F181F]",
      title: "New Team Member Joined",
      description: "Grace Nwosu has accepted the invitation and joined the project as QA/QC Engineer.",
      tab: 'Today'
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100] animate-in fade-in duration-300"
        onClick={onClose}
      />
      <div className="fixed right-4 top-4 bottom-4 w-full max-w-[650px] bg-white rounded-[32px] p-10 shadow-2xl flex flex-col z-[101] animate-in slide-in-from-right-8 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-[28px] font-extrabold text-[#022C4F] tracking-tight">
            Notification Center
          </h2>
          <Link href="/professional/dashboard/notifications" className="text-[12px] font-bold text-gray-500 hover:text-[#022C4F] transition-colors" onClick={onClose}>
            View All Notifications
          </Link>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center w-full bg-gray-200/50 p-1.5 rounded-xl mb-10">
          {['Today', 'This Week', 'Earlier'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-[13px] font-bold rounded-lg transition-all ${
                activeTab === tab 
                  ? "bg-white text-[#0F181F] shadow-sm" 
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto pr-4 -mr-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex flex-col gap-6">
            {notifications.filter(n => n.tab === activeTab).map((notification) => (
              <div key={notification.id} className="flex gap-5 border-b border-gray-200 pb-6 last:border-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${notification.iconBg}`}>
                  {notification.icon}
                </div>
                <div className="flex flex-col gap-1 mt-1">
                  <h4 className="text-[12px] font-extrabold text-[#022C4F]">
                    {notification.title}
                  </h4>
                  <p className="text-[13px] text-gray-600 leading-relaxed mt-1">
                    {notification.description}
                  </p>
                </div>
              </div>
            ))}
            {notifications.filter(n => n.tab === activeTab).length === 0 && (
              <div className="text-center text-gray-400 py-10 text-[13px]">
                No notifications for {activeTab.toLowerCase()}.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
