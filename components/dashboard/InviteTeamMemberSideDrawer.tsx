import React from "react";
import { X } from "lucide-react";

interface InviteTeamMemberSideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteTeamMemberSideDrawer({ isOpen, onClose, onSuccess }: InviteTeamMemberSideDrawerProps) {
  if (!isOpen) return null;

  const handleSend = () => {
    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        className={`fixed top-0 right-0 w-full max-w-xl h-full bg-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? "translate-x-0" : "translate-x-full"
          } shadow-2xl flex flex-col`}
      >
        {/* Header */}
        <div className="flex flex-col gap-2 p-8 border-b border-gray-100 shrink-0 relative">
          <button
            onClick={onClose}
            className="absolute top-8 right-8 text-gray-400 hover:text-[#022C4F] transition-colors"
          >
            <X size={24} />
          </button>
          <h2 className="text-[24px] font-extrabold text-[#022C4F]">
            Invite Team Member
          </h2>
          <p className="text-[12px] text-gray-500 font-medium leading-relaxed max-w-[90%]">
            Invite internal team members, external consultants, clients, or project stakeholders to collaborate on this project.
            Assign their role, discipline, permissions, and access level before sending the invitation.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 no-scrollbar">

          <div className="flex flex-col gap-6">
            <h3 className="text-[14px] font-extrabold text-[#022C4F]">Member Information</h3>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Full Name</label>
              <input
                type="text"
                className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Email Address</label>
              <input
                type="email"
                className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Company / Organization</label>
              <input
                type="text"
                className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Phone Number (Optional)</label>
              <input
                type="tel"
                className="w-full h-12 rounded-lg border border-gray-300 px-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[12px] font-bold text-[#0F181F]">Message (Optional)</label>
              <textarea
                className="w-full h-32 rounded-lg border border-gray-300 p-4 focus:outline-none focus:ring-1 focus:ring-[#022C4F] text-[12px] text-[#0F181F] resize-none"
              />
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray-100 shrink-0">
          <button 
            onClick={handleSend}
            className="w-full bg-[#022C4F] text-white h-12 rounded-xl text-[13px] font-bold hover:bg-[#033A6B] transition-colors shadow-sm"
          >
            Send Invitation
          </button>
        </div>
      </div>
    </>
  );
}
