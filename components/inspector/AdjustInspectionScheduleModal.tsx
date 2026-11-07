"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  X,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Building2,
  FileText,
  MapPin,
  Sparkles,
} from "lucide-react";
import { rescheduleInspectorInspection } from "@/services/inspector";
import { notify } from "@/lib/api";

interface AdjustInspectionScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: {
    id: string;
    inspection_reference?: string;
    project_name?: string;
    project_location?: string;
    inspection_type?: string;
    scheduled_date?: string | null;
  } | null;
  onScheduleUpdated?: (updated: any) => void;
}

export default function AdjustInspectionScheduleModal({
  isOpen,
  onClose,
  inspection,
  onScheduleUpdated,
}: AdjustInspectionScheduleModalProps) {
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (inspection?.scheduled_date) {
      try {
        const d = new Date(inspection.scheduled_date);
        // Format to YYYY-MM-DDTHH:mm for datetime-local input
        const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
          .toISOString()
          .slice(0, 16);
        setScheduledDate(localIso);
      } catch {
        setScheduledDate("");
      }
    } else {
      // Default to tomorrow 09:00 AM
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(9, 0, 0, 0);
      const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setScheduledDate(localIso);
    }
    setReason("");
    setError(null);
  }, [inspection, isOpen]);

  if (!isOpen || !inspection) return null;

  const handleApplyPreset = (hoursFromNow: number, setTimeHours?: number) => {
    const target = new Date();
    if (setTimeHours !== undefined) {
      target.setDate(target.getDate() + (hoursFromNow / 24));
      target.setHours(setTimeHours, 0, 0, 0);
    } else {
      target.setHours(target.getHours() + hoursFromNow);
    }
    const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setScheduledDate(localIso);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduledDate) {
      setError("Please select a new date and time.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const isoDate = new Date(scheduledDate).toISOString();
      const updated = await rescheduleInspectorInspection(inspection.id, {
        scheduled_date: isoDate,
        reason: reason.trim() || undefined,
      });

      notify("Inspection schedule adjusted successfully!", "success");
      if (onScheduleUpdated) {
        onScheduleUpdated(updated);
      }
      onClose();
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.detail ||
        err?.message ||
        "Could not adjust the inspection schedule.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-[#022C4F] to-[#04487F] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
              <Calendar size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold leading-snug">
                Adjust Inspection Schedule
              </h3>
              <p className="text-xs text-blue-100/80">
                {inspection.inspection_reference || "Assigned Field Visit"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Target Inspection Context Card */}
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#022C4F] flex items-center gap-1.5">
                <Building2 size={13} className="text-slate-400" />
                {inspection.project_name || "Assigned Project Site"}
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-blue-100/60 text-blue-800">
                {inspection.inspection_type || "Structural Review"}
              </span>
            </div>
            {inspection.project_location && (
              <p className="text-slate-500 flex items-center gap-1">
                <MapPin size={11} className="text-slate-400 shrink-0" />
                <span className="truncate">{inspection.project_location}</span>
              </p>
            )}
            <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600">
              <span>Current Schedule:</span>
              <span className="font-semibold text-slate-800">
                {inspection.scheduled_date
                  ? new Date(inspection.scheduled_date).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Not yet scheduled"}
              </span>
            </div>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Quick Schedule Presets
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleApplyPreset(2)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                +2 Hours
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(24, 9)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Tomorrow 09:00 AM
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(24, 14)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Tomorrow 02:00 PM
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset(48, 10)}
                className="px-2.5 py-1 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                In 2 Days (10:00 AM)
              </button>
            </div>
          </div>

          {/* New Date and Time Input */}
          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
              New Inspection Date & Time <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#022C4F] shadow-xs"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Select the revised field deployment time. This updates the command center calendar and audit trail.
            </p>
          </div>

          {/* Reason for Adjustment */}
          <div>
            <label className="block text-xs font-bold text-[#022C4F] mb-1.5">
              Adjustment Justification / Reason (Optional)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Inclement weather conditions on site, contractor requested concrete cure window..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F] resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-rose-800 text-xs">
              <AlertCircle size={15} className="mt-0.5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !scheduledDate}
              className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Updating Schedule...</span>
                </>
              ) : (
                <>
                  <Clock size={14} />
                  <span>Confirm Schedule Change</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
