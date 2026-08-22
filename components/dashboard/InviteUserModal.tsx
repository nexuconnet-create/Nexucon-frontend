"use client";

import React, { useState } from 'react';
import { X, UserPlus, Mail, ShieldCheck, Building2 } from 'lucide-react';
import { inviteStaffUser } from '@/services/settings';

interface InviteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteUserModal({
  isOpen,
  onClose,
  onSuccess
}: InviteUserModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Reviewer');
  const [department, setDepartment] = useState('Urban Planning');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    setIsSubmitting(true);
    try {
      const generatedTemp = `Nexucon@${Math.random().toString(36).substring(2, 6).toUpperCase()}2026!`;

      // 1. Cache temp credentials on device for resilient instant login
      if (typeof window !== 'undefined') {
        localStorage.setItem(`nexucon_user_credentials_${email.trim().toLowerCase()}`, JSON.stringify({
          email: email.trim(),
          password: generatedTemp,
          name: name.trim(),
          role
        }));
      }

      // 2. Send via Next.js Resend route
      fetch('/api/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.trim(),
          name: name.trim(),
          role,
          department,
          temp_password: generatedTemp
        })
      }).catch(e => console.warn('Email dispatch warning:', e));

      // 2. Persist in database
      await inviteStaffUser({
        name,
        email,
        role,
        department
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: `Official invitation email dispatched to ${email} for role ${role}!`, type: 'success' } 
      }));
      onClose();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: err.response?.data?.error || err.message || 'Failed to send invitation', type: 'error' } 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-[#022C4F]">Invite Government Staff</h3>
              <p className="text-xs text-slate-500">Internal Agency Officer Provisioning</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Engr. Folake Balogun"
              required
              className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Official Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="folake.b@dud.city.gov"
                required
                className="w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Government Agency Head">🏛️ Government Agency Head / Director</option>
                <option value="Lead Field Building Inspector">🔍 Field Building Inspector</option>
                <option value="Technical Reviewer">📐 Technical Reviewer / Plan Examiner</option>
                <option value="Compliance Officer">⚖️ Compliance & Enforcement Officer</option>
                <option value="City Planner">🗺️ City & Urban Planner</option>
                <option value="System Administrator">🛡️ System Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-3 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-medium"
              >
                <option value="Urban Planning">Urban Planning</option>
                <option value="Structural Engineering">Structural Engineering</option>
                <option value="Environmental Planning">Environmental Planning</option>
                <option value="IT / Operations">IT / Operations</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
            >
              {isSubmitting ? 'Sending Invite...' : 'Send Invitation'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
