import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users, FileText, ListTodo, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ReviewMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: any | null;
}

export default function ReviewMeetingModal({ isOpen, onClose, event }: ReviewMeetingModalProps) {
  const [isOnSite, setIsOnSite] = React.useState(false);
  const [isCheckedIn, setIsCheckedIn] = React.useState(false);
  const [isGeneratingTasks, setIsGeneratingTasks] = React.useState(false);
  const [tasksGenerated, setTasksGenerated] = React.useState(false);

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden pointer-events-auto flex flex-col"
            >
              <div className={`h-4 ${event.type === 'orange' ? 'bg-[#FEEBCC]' : event.type === 'pink' ? 'bg-[#FFD9DC]' : 'bg-[#D9F1FF]'}`} />
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-[22px] font-extrabold text-[#022C4F] pr-8">{event.title}</h2>
                  <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-[#022C4F] transition-colors shrink-0">
                    <X size={18} />
                  </button>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-4 text-[14px] text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#022C4F] shrink-0 border border-gray-100">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F181F]">Date & Time</p>
                      <p className="text-gray-500 font-medium">June {event.day || '15'}, 2026 • {event.time || '10:00 AM - 11:30 AM'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-[14px] text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#022C4F] shrink-0 border border-gray-100">
                      <MapPin size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-bold text-[#0F181F]">Location / Link</p>
                        <button 
                          onClick={() => setIsOnSite(!isOnSite)}
                          className={`text-[10px] font-bold px-3 py-1 rounded-full border transition-colors ${isOnSite ? 'bg-[#022C4F] text-white border-[#022C4F]' : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'}`}
                        >
                          {isOnSite ? 'Physical Site Visit' : 'Virtual Meeting'}
                        </button>
                      </div>
                      <p className="text-[#287DBB] font-medium hover:underline cursor-pointer">
                        {isOnSite ? 'Victoria Heights Construction Site, Lagos' : (event.location || 'Nexucon Live Collaboration Room')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-[14px] text-gray-700">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#022C4F] shrink-0 border border-gray-100">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F181F]">Agenda</p>
                      <p className="text-gray-500 font-medium leading-relaxed mt-1">
                        {event.description || 'Review the latest drawings and ensure compliance with the overall design architecture. Please review the attached documents prior to the meeting.'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 text-[14px] text-gray-700 mt-2">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#022C4F] shrink-0 border border-gray-100">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#0F181F] mb-2">Attendees ({(event.attendees || []).length || 4})</p>
                      <div className="flex -space-x-2">
                        {[1, 2, 3, 4].map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 overflow-hidden">
                            <img src={`https://res.cloudinary.com/depeqzb6z/image/upload/v1779870104/user_n8222a.jpg`} alt="Attendee" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Post-Meeting Action Items */}
                  <div className="flex items-start gap-4 text-[14px] text-gray-700 mt-2">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-[#022C4F] shrink-0 border border-gray-100">
                      <ListTodo size={18} />
                    </div>
                    <div className="w-full">
                      <div className="flex justify-between items-center mb-2">
                        <p className="font-bold text-[#0F181F]">Post-Meeting Action Items</p>
                        {!tasksGenerated && (
                          <button 
                            onClick={() => {
                              setIsGeneratingTasks(true);
                              setTimeout(() => {
                                setIsGeneratingTasks(false);
                                setTasksGenerated(true);
                              }, 1500);
                            }}
                            disabled={isGeneratingTasks}
                            className="flex items-center gap-1 text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5 transition-colors disabled:opacity-50"
                          >
                            {isGeneratingTasks ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                            {isGeneratingTasks ? 'Extracting...' : 'AI Extract Tasks'}
                          </button>
                        )}
                      </div>
                      
                      {isGeneratingTasks && (
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                          <Loader2 size={16} className="animate-spin text-[#022C4F]" />
                          <span className="text-[12px] font-medium text-gray-600">Analyzing meeting transcript and notes...</span>
                        </div>
                      )}

                      {tasksGenerated && !isGeneratingTasks && (
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <CheckCircle2 size={16} className="text-gray-300 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold text-[#0F181F]">Update Structural Load Calculations</span>
                              <span className="text-[10px] text-gray-500">Assigned to: David Johnson • Due: Tomorrow</span>
                            </div>
                          </div>
                          <div className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                            <CheckCircle2 size={16} className="text-gray-300 shrink-0 mt-0.5" />
                            <div className="flex flex-col">
                              <span className="text-[12px] font-bold text-[#0F181F]">Revise HVAC Routing on Floor 3</span>
                              <span className="text-[10px] text-gray-500">Assigned to: Sarah Chen • Due: In 2 days</span>
                            </div>
                          </div>
                          <button className="text-[11px] font-bold text-[#022C4F] hover:underline mt-1 self-start">
                            + Sync to Task Board
                          </button>
                        </div>
                      )}
                      
                      {!tasksGenerated && !isGeneratingTasks && (
                        <p className="text-[12px] text-gray-500 font-medium">No action items extracted yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 pt-6 border-t border-gray-100">
                  <Button variant="outline" className="flex-1 h-[48px] border-[#022C4F] text-[#022C4F] hover:bg-[#022C4F]/5" onClick={onClose}>
                    Close
                  </Button>
                  {isOnSite ? (
                    <Button 
                      variant="primary" 
                      className={`flex-1 h-[48px] transition-colors ${isCheckedIn ? 'bg-[#4CAF50] hover:bg-[#388E3C] border-[#4CAF50]' : ''}`}
                      onClick={() => setIsCheckedIn(true)}
                    >
                      {isCheckedIn ? 'Checked In (GPS Verified)' : 'GPS Check-In'}
                    </Button>
                  ) : (
                    <Button 
                      variant="primary" 
                      className="flex-1 h-[48px]"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('show-toast', { 
                          detail: { message: `Connecting to ${event.title || 'Meeting Call Room'}...`, type: 'info' } 
                        }));
                        onClose();
                      }}
                    >
                      Join Meeting
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
