import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

interface InviteTeamDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InviteTeamDrawer({ isOpen, onClose, onSuccess }: InviteTeamDrawerProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    company: '',
    role: '',
    discipline: '',
    message: '',
  });

  const [responsibilities, setResponsibilities] = useState({
    uploadDesign: true,
    reviewDrawings: true,
    participatePeer: true,
    commentAnnotate: true,
    manageDocuments: false,
    attendMeetings: true,
    createTasks: true,
    approveDeliverables: true,
    manageTeam: false,
  });

  const [permissions, setPermissions] = useState({
    designWorkspace: true,
    drawingsPlans: true,
    documents: true,
    teamCollaboration: true,
    meetings: false,
    timeline: false,
  });

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-[500px] max-w-[500px] bg-white sm:rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-8 pb-6 border-b border-gray-100 flex items-start justify-between">
              <div className="pr-8">
                <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-2">Invite Team Member</h2>
                <p className="text-[12px] text-gray-500 font-medium leading-relaxed mt-2">
                  Invite internal team members, consultants, or external collaborators to join the project and contribute to design, coordination, reviews, or project management.
                </p>
              </div>
              <button 
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#022C4F] transition-colors shadow-sm shrink-0 -mt-2 -mr-2"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-8 flex flex-col">
              
              {step === 1 ? (
                <>
                  {/* Project Information */}
                  <div className="mb-8">
                    <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Project Information</h3>
                    
                    <div className="grid grid-cols-2 gap-y-6">
                      <div>
                        <p className="text-[12px] font-bold text-[#0F181F] mb-1">Project</p>
                        <p className="text-[11px] text-gray-500 font-medium">Victoria Heights Residential Estate</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0F181F] mb-1">Project Phase</p>
                        <p className="text-[11px] text-gray-500 font-medium">Design Development</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0F181F] mb-1">Current Team Size</p>
                        <p className="text-[11px] text-gray-500 font-medium">18 Members</p>
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-[#0F181F] mb-1">Available Seats</p>
                        <p className="text-[11px] text-gray-500 font-medium">12 Remaining</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full h-[1px] bg-gray-200 mb-8"></div>

                  {/* Form Fields */}
                  <div className="flex flex-col gap-6">
                    <div>
                      <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Full Name</label>
                      <input
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Email Address</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Company / Organization</label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Assign Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => {
                          const val = e.target.value;
                          setFormData({ ...formData, role: val });
                          if (val === 'reviewer') {
                            setResponsibilities({
                              uploadDesign: false,
                              reviewDrawings: true,
                              participatePeer: false,
                              commentAnnotate: true,
                              manageDocuments: false,
                              attendMeetings: true,
                              createTasks: false,
                              approveDeliverables: false,
                              manageTeam: false,
                            });
                            setPermissions({
                              designWorkspace: true,
                              drawingsPlans: true,
                              documents: true,
                              teamCollaboration: true,
                              meetings: true,
                              timeline: false,
                            });
                          }
                        }}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 pr-10 text-[13px] text-[#0F181F] appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm bg-white"
                      >
                        <option value="" disabled></option>
                        <option value="manager">Project Manager</option>
                        <option value="architect">Lead Architect</option>
                        <option value="engineer">Structural Engineer</option>
                        <option value="reviewer">Independent Reviewer</option>
                      </select>
                      <div className="absolute right-4 top-[38px] pointer-events-none text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Discipline</label>
                      <select
                        value={formData.discipline}
                        onChange={(e) => setFormData({ ...formData, discipline: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 pr-10 text-[13px] text-[#0F181F] appearance-none focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm bg-white"
                      >
                        <option value="" disabled></option>
                        <option value="architecture">Architecture</option>
                        <option value="engineering">Engineering</option>
                        <option value="management">Management</option>
                      </select>
                      <div className="absolute right-4 top-[38px] pointer-events-none text-gray-500">
                        <ChevronDown size={16} />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-8 mb-8">
                    {/* Responsibilities */}
                    <div className="flex-1">
                      <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Project Responsibilities</h3>
                      <p className="text-[12px] font-bold text-[#0F181F] mb-4">Assign Responsibilities</p>
                      
                      <div className="flex flex-col gap-3">
                        {[
                          { key: 'uploadDesign', label: 'Upload Design Documents' },
                          { key: 'reviewDrawings', label: 'Review Drawings' },
                          { key: 'participatePeer', label: 'Participate in Peer Reviews' },
                          { key: 'commentAnnotate', label: 'Comment & Annotate Drawings' },
                          { key: 'manageDocuments', label: 'Manage Project Documents' },
                          { key: 'attendMeetings', label: 'Attend Project Meetings' },
                          { key: 'createTasks', label: 'Create Tasks' },
                          { key: 'approveDeliverables', label: 'Approve Deliverables' },
                          { key: 'manageTeam', label: 'Manage Team Members' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center gap-3">
                            <div 
                              className={`w-4 h-4 flex items-center justify-center border transition-colors cursor-pointer ${responsibilities[item.key as keyof typeof responsibilities] ? 'bg-[#0F181F] border-[#0F181F]' : 'border-gray-400 bg-white'}`}
                              onClick={() => setResponsibilities(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof responsibilities] }))}
                            >
                              {responsibilities[item.key as keyof typeof responsibilities] && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Permissions */}
                    <div className="flex-1">
                      <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Access Permissions</h3>
                      <p className="text-[12px] font-bold text-[#0F181F] mb-4">Grant Access To</p>
                      
                      <div className="flex flex-col gap-3">
                        {[
                          { key: 'designWorkspace', label: 'Design Workspace' },
                          { key: 'drawingsPlans', label: 'Drawings & Plans' },
                          { key: 'documents', label: 'Documents' },
                          { key: 'teamCollaboration', label: 'Team Collaboration' },
                          { key: 'meetings', label: 'Meetings' },
                          { key: 'timeline', label: 'Timeline' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center gap-3">
                            <div 
                              className={`w-4 h-4 flex items-center justify-center border transition-colors cursor-pointer ${permissions[item.key as keyof typeof permissions] ? 'bg-[#0F181F] border-[#0F181F]' : 'border-gray-400 bg-white'}`}
                              onClick={() => setPermissions(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof permissions] }))}
                            >
                              {permissions[item.key as keyof typeof permissions] && <svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                            </div>
                            <span className="text-[11px] font-medium text-[#0F181F]">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Invitation Message */}
                  <div>
                    <label className="block text-[12px] font-bold text-[#022C4F] mb-2">Invitation Message</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full h-40 rounded-xl border border-[#022C4F] p-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm resize-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-8 pt-6 border-t border-gray-100 flex flex-col gap-3 mt-auto">
              {step === 1 ? (
                <div className="flex justify-end">
                  <Button 
                    variant="primary" 
                    className="w-32 h-[48px]"
                    onClick={() => setStep(2)}
                  >
                    Next
                  </Button>
                </div>
              ) : (
                <>
                  <Button 
                    variant="primary" 
                    className="!w-full h-[48px]"
                    onClick={() => {
                      handleClose();
                      onSuccess();
                    }}
                  >
                    Send Invitation
                  </Button>
                  <Button 
                    variant="outline" 
                    className="!w-full h-[48px] bg-black text-white hover:bg-black/90 border-none"
                    onClick={handleClose}
                  >
                    Save Draft
                  </Button>
                </>
              )}
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
