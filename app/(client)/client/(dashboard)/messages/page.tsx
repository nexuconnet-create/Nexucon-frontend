"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Search, ChevronDown, Phone, Paperclip, Send } from "lucide-react";

// Mock Data
const contacts = [
  {
    id: 1,
    name: "Michael Adeyemi",
    time: "12m",
    preview: "I've completed the engineering review. No major issues identified. The drawings can proceed to client review.",
    role: "Project Manager",
    project: "Victoria Heights Estate",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444885/8_Contract_Clauses_Every_Homeowner_Should_Understand_achlab_1_qvvl2s.png",
    online: true,
  },
  {
    id: 2,
    name: "Sarah Okafor",
    time: "12m",
    preview: "Good morning everyone. The updated structural drawings have been uploaded to the shared drawings section for review.",
    role: "Civil Engineer",
    project: "Green Valley Apartments",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png",
    online: false,
  },
  {
    id: 3,
    name: "PrimeBuild Contractors",
    time: "12m",
    preview: "We are available to discuss project mobilization and execution planning.",
    role: "Contractor",
    project: "Lekki Commercial Plaza",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444891/Download_free_image_of_Dark_skinned_female_construction_worker_portrait_hardhat_helmet__about_african_construction_worker_african_engineer_black_female_engineer_female_construction_worker_and_african_worker_12921744_1_gk870e.png",
    online: false,
  },
  {
    id: 4,
    name: "APEX Architects",
    time: "12m",
    preview: "We've revised the floor plans based on your feedback.",
    role: "Project Manager",
    project: "Victoria Heights Estate",
    image: "https://res.cloudinary.com/depeqzb6z/image/upload/v1784444885/8_Contract_Clauses_Every_Homeowner_Should_Understand_achlab_1_qvvl2s.png",
    online: false,
  }
];

export default function MessagesPage() {
  const [selectedContactId, setSelectedContactId] = useState(1);
  const selectedContact = contacts.find(c => c.id === selectedContactId) || contacts[0];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)] lg:h-full w-full bg-white rounded-2xl overflow-hidden shadow-sm animate-in fade-in duration-500">
      
      {/* LEFT COLUMN: CONTACTS SIDEBAR */}
      <div className="w-full lg:w-[350px] flex-shrink-0 border-r border-gray-100 flex flex-col bg-white">
        
        {/* Header */}
        <div className="px-6 py-5 flex items-center gap-3">
          <h2 className="text-[16px] font-extrabold text-[#0F181F] flex items-center gap-2">
            Team Messages <ChevronDown size={16} className="text-gray-500" />
          </h2>
          <div className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            10
          </div>
        </div>

        {/* Search */}
        <div className="px-6 mb-4">
          <div className="bg-gray-50 rounded-xl flex items-center px-4 py-2.5">
            <input 
              type="text" 
              placeholder="Search messages" 
              className="bg-transparent border-none outline-none w-full text-xs text-[#0F181F] placeholder-gray-400 font-medium"
            />
          </div>
        </div>

        {/* Contact List */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              onClick={() => setSelectedContactId(contact.id)}
              className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-colors ${
                selectedContactId === contact.id ? "bg-white shadow-sm border border-gray-100" : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="relative shrink-0">
                <Image 
                  src={contact.image}
                  alt={contact.name}
                  width={40}
                  height={40}
                  className="rounded-full object-cover w-10 h-10 border border-gray-100"
                />
                {contact.online && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                  <h3 className="text-xs font-bold text-[#0F181F] truncate">{contact.name}</h3>
                  <span className="text-[10px] font-medium text-gray-400 shrink-0">{contact.time}</span>
                </div>
                <p className="text-[10px] text-gray-500 leading-snug line-clamp-3 mb-2">
                  {contact.preview}
                </p>
                <div className="flex gap-2 items-center flex-wrap">
                  <span className="bg-orange-50 text-orange-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {contact.role}
                  </span>
                  <span className="bg-green-50 text-green-600 text-[8px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                    {contact.project}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: CHAT INTERFACE */}
      <div className="flex-1 flex flex-col bg-[#FAFAFA] relative">
        
        {/* Chat Header */}
        <div className="px-6 py-4 bg-white border-b border-gray-100 flex justify-between items-center z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <Image 
                src={selectedContact.image}
                alt={selectedContact.name}
                width={40}
                height={40}
                className="rounded-full object-cover w-10 h-10 border border-gray-100"
              />
              {selectedContact.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0F181F]">{selectedContact.name}</h3>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${selectedContact.online ? "bg-green-500" : "bg-gray-300"}`}></span>
                <span className="text-[10px] font-medium text-gray-500">{selectedContact.online ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
          
          <button className="flex items-center gap-2 px-4 py-2 bg-[#F4F6F8] hover:bg-gray-200 text-[#022C4F] rounded-xl transition-colors">
            <Phone size={14} className="fill-current" />
            <span className="text-xs font-bold">Call</span>
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Received Message */}
          <div className="flex gap-3 max-w-[80%]">
            <Image 
              src={selectedContact.image}
              alt={selectedContact.name}
              width={32}
              height={32}
              className="rounded-full object-cover w-8 h-8 shrink-0 border border-gray-100 mt-1"
            />
            <div className="bg-[#F4F6F8] px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
              <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
                I've completed the engineering review. No major issues identified. The drawings can proceed to client review.
              </p>
            </div>
          </div>

          {/* Sent Message */}
          <div className="flex gap-3 justify-end">
            <div className="bg-[#022C4F] px-5 py-3.5 rounded-2xl rounded-tr-sm shadow-md max-w-[80%]">
              <p className="text-[12px] text-white font-medium leading-relaxed">
                Thank you. I'll review the drawings and cost estimates this afternoon.
              </p>
            </div>
            <div className="w-8 h-8 shrink-0 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600 mt-1">
              JD
            </div>
          </div>

          {/* Received Message */}
          <div className="flex gap-3 max-w-[80%]">
            <Image 
              src={selectedContact.image}
              alt={selectedContact.name}
              width={32}
              height={32}
              className="rounded-full object-cover w-8 h-8 shrink-0 border border-gray-100 mt-1"
            />
            <div className="bg-[#F4F6F8] px-5 py-3.5 rounded-2xl rounded-tl-sm shadow-sm border border-gray-100">
              <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
                Perfect. Please let me know if you require any additional documentation or clarification.
              </p>
            </div>
          </div>

          {/* Received Message */}
          <div className="flex gap-3 max-w-[80%]">
            <div className="w-8 shrink-0"></div> {/* Spacer for avatar alignment */}
            <div className="bg-[#F4F6F8] px-5 py-3.5 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-[12px] text-[#0F181F] font-medium leading-relaxed">
                I've also attached updated site progress photos from this week's activities.
              </p>
            </div>
          </div>
          
        </div>

        {/* Input Area */}
        <div className="p-6 bg-[#FAFAFA]">
          <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex items-center gap-4 shadow-sm">
            <button className="text-gray-400 hover:text-[#0F181F] transition-colors shrink-0">
              <Paperclip size={20} />
            </button>
            <input 
              type="text" 
              placeholder="Type a message" 
              className="flex-1 bg-transparent border-none outline-none text-xs font-medium text-[#0F181F] placeholder-gray-400"
            />
            <button className="text-[#022C4F] hover:scale-110 transition-transform shrink-0">
              <Send size={20} className="fill-current" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
