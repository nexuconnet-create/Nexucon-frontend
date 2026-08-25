"use client";

import React, { useState } from 'react';
import { X, UserCheck, User, Building2 } from 'lucide-react';
import { ApprovalRequest, assignReviewer } from '@/services/approvals';

interface AssignApprovalReviewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ApprovalRequest | null;
  onSuccess?: () => void;
}

export default function AssignApprovalReviewerModal({
  isOpen,
  onClose,
  request,
  onSuccess
}: AssignApprovalReviewerModalProps) {
  const [reviewerName, setReviewerName] = useState('Engr. Babatunde Jinadu (Lead Structural Reviewer)');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const defaultReviewers = [
    'Engr. Babatunde Jinadu (Lead Structural Reviewer)',
    'Arch. Funke Adeyemi (Chief Architect - LASBCA)',
    'Engr. David Adeleke (MEP Services Lead)',
    'Barr. Ngozi Okonjo (Legal & Statutory Clearance Officer)',
    'HSE Director Mustapha Ibrahim (Safety Directorate)'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await assignReviewer(request.id, { reviewer_name: reviewerName });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Reviewer assigned: "${reviewerName}" for ${request.request_reference}!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to assign reviewer';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserCheck size={22} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Assign Reviewing Official</h3>
              <p className="text-xs text-slate-500 font-mono">{request.request_reference}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1">
            <p className="font-bold text-slate-800">{request.title}</p>
            <p className="text-slate-500">Discipline: <span className="font-semibold text-slate-700">{request.discipline}</span></p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Official Reviewer <span className="text-red-500">*</span>
            </label>
            <select
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {defaultReviewers.map((rev, i) => (
                <option key={i} value={rev}>{rev}</option>
              ))}
            </select>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <UserCheck size={15} />
              <span>{isSubmitting ? 'Assigning...' : 'Assign Reviewer'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
