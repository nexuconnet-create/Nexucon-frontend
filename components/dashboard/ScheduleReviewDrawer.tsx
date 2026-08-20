import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ScheduleReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScheduleReviewDrawer({ isOpen, onClose }: ScheduleReviewDrawerProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    priority: '',
    date: '',
    startTime: '',
    endTime: '',
    format: '',
  });

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
          
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 sm:right-4 top-0 sm:top-4 bottom-0 sm:bottom-4 w-full sm:w-[500px] max-w-[500px] bg-white sm:rounded-[32px] shadow-2xl z-[101] flex flex-col overflow-hidden"
          >
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <h2 className="text-[24px] font-extrabold text-[#022C4F] mb-3">Schedule New Review</h2>
              <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-8">
                Create a review session to evaluate drawings, technical documents, design packages, or project deliverables with internal teams, consultants, and external reviewers.
              </p>

              <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Review Information</h3>

              <div className="flex flex-col gap-6">
                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Review Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Review Type</label>
                  <div className="relative">
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm appearance-none bg-white"
                    >
                      <option value=""></option>
                      <option value="design">Design Review</option>
                      <option value="mep">MEP Review</option>
                      <option value="structural">Structural Review</option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-4 pointer-events-none text-[#022C4F]" />
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-3">Review Priority</label>
                  <div className="flex items-center gap-6">
                    {['Standard', 'High Priority', 'Urgent'].map((priority) => (
                      <label key={priority} className="flex items-center gap-2 cursor-pointer">
                        <div 
                          onClick={() => setFormData({ ...formData, priority })}
                          className={`w-5 h-5 rounded-[4px] border ${formData.priority === priority ? 'bg-[#022C4F] border-[#022C4F]' : 'border-[#022C4F]'} flex items-center justify-center transition-colors`}
                        >
                           {formData.priority === priority && <div className="w-2.5 h-2.5 bg-white" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{priority}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Review Date</label>
                  <div className="relative">
                    <select
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm appearance-none bg-white"
                    >
                      <option value=""></option>
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-4 pointer-events-none text-[#022C4F]" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-[#0F181F] mb-2">Start Time</label>
                    <div className="relative">
                      <select
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm appearance-none bg-white"
                      >
                        <option value=""></option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-4 pointer-events-none text-[#022C4F]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="block text-[12px] font-bold text-[#0F181F] mb-2">End Time</label>
                    <div className="relative">
                      <select
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="w-full h-12 rounded-xl border border-[#022C4F] px-4 text-[13px] text-[#0F181F] focus:outline-none focus:ring-1 focus:ring-[#022C4F] shadow-sm appearance-none bg-white"
                      >
                        <option value=""></option>
                      </select>
                      <ChevronDown size={16} className="absolute right-4 top-4 pointer-events-none text-[#022C4F]" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[12px] font-bold text-[#0F181F] mb-3">Review Priority</label>
                  <div className="flex items-center gap-6">
                    {['Virtual Meeting', 'Physical Meeting', 'Hybrid'].map((format) => (
                      <label key={format} className="flex items-center gap-2 cursor-pointer">
                        <div 
                          onClick={() => setFormData({ ...formData, format })}
                          className={`w-5 h-5 rounded-[4px] border ${formData.format === format ? 'bg-[#022C4F] border-[#022C4F]' : 'border-[#022C4F]'} flex items-center justify-center transition-colors`}
                        >
                           {formData.format === format && <div className="w-2.5 h-2.5 bg-white" style={{ clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)' }} />}
                        </div>
                        <span className="text-[11px] font-medium text-gray-700">{format}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 pt-4 border-t border-gray-100">
              <Button 
                variant="primary" 
                className="w-full h-[48px] rounded-xl font-bold"
                onClick={async () => {
                  try {
                    const { scheduleMeeting } = await import('@/services/stakeholders');
                    await scheduleMeeting({
                      title: formData.title || 'Collaborative Design Review',
                      agenda: `Review Type: ${formData.type || 'General'} • Priority: ${formData.priority || 'Standard'} • Format: ${formData.format || 'Virtual Meeting'}`,
                      date: formData.date || 'June 20, 2026',
                      time_slot: formData.startTime ? `${formData.startTime} - ${formData.endTime || 'End'}` : '10:00 AM - 11:30 AM',
                      meeting_type: formData.format?.includes('Physical') ? 'In-Person Council' : 'Video Call',
                      initiator_name: 'Engr. Babatunde Sanwo',
                      initiator_role: 'Agency Head / Director General'
                    });
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Review meeting scheduled successfully!', type: 'success' } }));
                    onClose();
                  } catch (err: any) {
                    const msg = err?.response?.data?.detail || err?.response?.data?.error || 'Only the Agency Head or Director General can schedule official meetings.';
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
                  }
                }}
              >
                Schedule Review
              </Button>
            </div>
            
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
