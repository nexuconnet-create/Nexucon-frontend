"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Bell, Mail, ShieldCheck, Check, 
  AlertTriangle, Lock, Save, RefreshCw, Smartphone 
} from 'lucide-react';
import { 
  NotificationPreference, 
  getNotificationPreferences, 
  updateNotificationPreferences 
} from '@/services/notifications';

interface NotificationPreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationPreferencesModal({
  isOpen,
  onClose
}: NotificationPreferencesModalProps) {
  const [prefs, setPrefs] = useState<NotificationPreference>({
    in_app_enabled: true,
    email_enabled: true,
    email_applications: true,
    email_inspections: true,
    email_approvals: true,
    email_compliance: true,
    email_emergency: true,
    email_overdue: true,
    email_critical: true,
    email_bim: true,
    email_gpr: true,
    email_documents: true,
    email_milestones: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      getNotificationPreferences()
        .then(res => setPrefs(res))
        .catch(err => console.error("Failed to load preferences", err))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (key: keyof NotificationPreference) => {
    if (key === 'email_emergency') return; // Mandatory
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateNotificationPreferences(prefs);
      setPrefs(updated);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Notification & Email preferences updated successfully!", type: 'success' } 
      }));
      onClose();
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: "Failed to update preferences", type: 'error' } 
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const categories = [
    { key: 'email_applications', label: 'New Permit Applications', desc: 'Alerts when statutory applications or drawings are submitted for review.' },
    { key: 'email_inspections', label: 'Inspection Requests & Walkthroughs', desc: 'Dispatches when field inspections are requested, scheduled, or completed.' },
    { key: 'email_approvals', label: 'Technical Review & Approval Requests', desc: 'High-priority notifications for pending DoA approvals and sign-offs.' },
    { key: 'email_compliance', label: 'Compliance Infractions & NCRs', desc: 'Alerts for non-conformance reports, CAPA tasks, and certificate expirations.' },
    { key: 'email_emergency', label: 'Emergency Alerts & Field Dispatch', desc: 'Immediate emergency incidents and site collapse warnings (Mandatory).', mandatory: true },
    { key: 'email_overdue', label: 'Overdue SLA & Action Reminders', desc: 'Automated warnings when tasks exceed government turnaround targets.' },
    { key: 'email_critical', label: 'Critical Structural Findings', desc: 'Major structural defects requiring immediate stop-work enforcement.' },
    { key: 'email_bim', label: 'BIM 3D Model Clashes & Revisions', desc: 'Interference detection alerts and design review milestones.' },
    { key: 'email_gpr', label: 'Ground Penetrating Radar (GPR) Findings', desc: 'Subsurface voids and geotechnical anomaly survey notifications.' },
    { key: 'email_documents', label: 'Document Revisions & Approvals', desc: 'Vault uploads, stamping, and cryptographic revision changes.' },
    { key: 'email_milestones', label: 'Construction Milestone Gates', desc: 'Progress verification requests and milestone completion gates.' },
  ];

  return (
    <div className="fixed inset-0 z-[140] overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F181F]/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shadow-sm">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Notification &amp; Email Delivery Channels</h3>
              <p className="text-xs text-slate-500">Configure delivery channels and transactional email dispatch settings.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Channels Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Master Channel Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${
              prefs.in_app_enabled ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Bell size={16} className="text-blue-600" />
                  In-App Notification Feed
                </span>
                <input
                  type="checkbox"
                  checked={prefs.in_app_enabled}
                  onChange={() => handleToggle('in_app_enabled')}
                  className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Real-time alerts inside dashboard console</p>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${
              prefs.email_enabled ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-900 flex items-center gap-2">
                  <Mail size={16} className="text-emerald-600" />
                  Transactional Email Delivery
                </span>
                <input
                  type="checkbox"
                  checked={prefs.email_enabled}
                  onChange={() => handleToggle('email_enabled')}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-slate-500">Deliver notifications directly to your inbox</p>
            </div>
          </div>

          {/* Granular Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Email Notifications by Event Type
            </h4>

            <div className="space-y-2.5">
              {categories.map((cat) => {
                const isChecked = (prefs as any)[cat.key];
                return (
                  <div
                    key={cat.key}
                    onClick={() => handleToggle(cat.key as any)}
                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between cursor-pointer ${
                      cat.mandatory 
                        ? 'bg-red-50/40 border-red-200' 
                        : (isChecked ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300' : 'bg-white border-slate-100 opacity-60')
                    }`}
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{cat.label}</span>
                        {cat.mandatory && (
                          <span className="text-[9px] font-black uppercase text-red-600 bg-red-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Lock size={10} /> Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={cat.mandatory}
                      onChange={() => {}}
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md shadow-slate-900/10 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Save size={14} />
            <span>{isSaving ? 'Saving...' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
