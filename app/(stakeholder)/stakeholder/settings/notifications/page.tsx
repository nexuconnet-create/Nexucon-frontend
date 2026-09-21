"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Bell,
  Mail,
  Smartphone,
  Globe,
  Save,
  CheckCircle2,
  ChevronLeft,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CreditCard,
  Building2,
  RefreshCw,
  FileCheck
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type NotificationItem = {
  id: string;
  label: string;
  description: string;
  inApp: boolean;
  email: boolean;
  sms: boolean;
  locked?: boolean;
};

type NotificationGroup = {
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  items: NotificationItem[];
};

const defaultPreferences: NotificationGroup[] = [
  {
    category: "Stage Inspections & Field Monitoring",
    icon: Building2,
    items: [
      {
        id: "insp_scheduled",
        label: "Inspection Request Confirmation",
        description: "Receive notice when government agency assigns an inspector and inspection window.",
        inApp: true,
        email: true,
        sms: true,
      },
      {
        id: "insp_dispatch",
        label: "Inspector Dispatch & Live ETA",
        description: "Real-time geofence ping when the designated field inspector departs for your site.",
        inApp: true,
        email: false,
        sms: true,
      },
      {
        id: "insp_verdict",
        label: "Stage Inspection Verdict & Report",
        description: "Immediate notification upon submission of foundation, slab, or superstructure sign-off.",
        inApp: true,
        email: true,
        sms: true,
        locked: true, // Crucial regulatory event
      },
      {
        id: "insp_reinspection",
        label: "Re-Inspection Scheduling Reminders",
        description: "Follow-up reminders for rescheduled visits following rectification work.",
        inApp: true,
        email: true,
        sms: false,
      },
    ],
  },
  {
    category: "Non-Conformance Reports (NCR) & Compliance",
    icon: AlertTriangle,
    items: [
      {
        id: "ncr_issued",
        label: "New Non-Conformance Notice Issued",
        description: "Critical alert when structural, MEP, or safety non-conformance is logged by field officers.",
        inApp: true,
        email: true,
        sms: true,
        locked: true,
      },
      {
        id: "ncr_remedy_approved",
        label: "Contractor Remediation Proof Approved",
        description: "Notice when submitted remedial photographic or lab evidence is approved by LASBCA/agency.",
        inApp: true,
        email: true,
        sms: false,
      },
      {
        id: "stop_work",
        label: "Stop-Work Order Advisories",
        description: "High-priority statutory alert when an enforcement stop-work order is registered or lifted.",
        inApp: true,
        email: true,
        sms: true,
        locked: true,
      },
    ],
  },
  {
    category: "Timeline & Stage-Gate Approvals",
    icon: Calendar,
    items: [
      {
        id: "stage_gate_cleared",
        label: "Stage-Gate Clearance Certificate",
        description: "Official confirmation that project has satisfied prerequisite milestones to commence next floor.",
        inApp: true,
        email: true,
        sms: false,
      },
      {
        id: "critical_path_delay",
        label: "Critical Path Slippage Warning",
        description: "AI-generated warning when inspection delays threaten scheduled completion dates.",
        inApp: true,
        email: true,
        sms: false,
      },
    ],
  },
  {
    category: "Financial Activities & Levies",
    icon: CreditCard,
    items: [
      {
        id: "levy_generated",
        label: "Statutory Assessment Notice Generated",
        description: "Electronic invoice for regulatory inspection assessments and development permits.",
        inApp: true,
        email: true,
        sms: false,
      },
      {
        id: "payment_receipt",
        label: "Escrow & Treasury Payment Receipt",
        description: "Cryptographic confirmation receipt of statutory fee settlement.",
        inApp: true,
        email: true,
        sms: true,
      },
    ],
  },
];

export default function StakeholderNotificationSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationGroup[]>(defaultPreferences);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneRecipient, setPhoneRecipient] = useState("+234 802 000 1199");
  const [emailRecipient, setEmailRecipient] = useState(user?.email || "developer@nexucon.net");

  useEffect(() => {
    if (user?.email) {
      setEmailRecipient(user.email);
    }
    const saved = localStorage.getItem("nexucon_stakeholder_notifications");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved notification preferences", e);
      }
    }
  }, [user]);

  const toggleChannel = (catIdx: number, itemIdx: number, channel: "inApp" | "email" | "sms") => {
    setPreferences((prev) => {
      const next = [...prev];
      const item = next[catIdx].items[itemIdx];
      if (item.locked && (channel === "inApp" || channel === "email")) return prev;
      item[channel] = !item[channel];
      return next;
    });
  };

  const handleSave = () => {
    setIsSaving(true);
    localStorage.setItem("nexucon_stakeholder_notifications", JSON.stringify(preferences));
    setTimeout(() => {
      setIsSaving(false);
      window.dispatchEvent(
        new CustomEvent("show-toast", {
          detail: { message: "Notification delivery preferences updated successfully!", type: "success" },
        })
      );
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-500 max-w-5xl mx-auto pb-12">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            href="/stakeholder/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#022C4F] transition-colors mb-2"
          >
            <ChevronLeft size={16} />
            Back to Operational Settings
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
              <Bell size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-[#022C4F]">Notification Preferences</h1>
              <p className="text-xs text-slate-500">Manage channels and event triggers for regulatory updates.</p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#022C4F] text-white font-bold text-xs hover:bg-[#033c69] shadow-sm active:scale-95 transition-all self-start sm:self-auto cursor-pointer"
        >
          {isSaving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
          <span>{isSaving ? "Saving..." : "Save Delivery Rules"}</span>
        </button>
      </div>

      {/* Recipient Channels Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Mail size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Primary Email Delivery</div>
            <div className="text-xs font-bold text-[#022C4F] truncate">{emailRecipient}</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Smartphone size={18} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Emergency SMS Line</div>
            <div className="text-xs font-bold text-[#022C4F] truncate">{phoneRecipient}</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
            Active
          </span>
        </div>
      </div>

      {/* Notification Categories */}
      <div className="space-y-6">
        {preferences.map((cat, catIdx) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.category}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="px-6 py-4 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Icon size={18} className="text-[#022C4F]" />
                  <h2 className="text-sm font-bold text-[#022C4F]">{cat.category}</h2>
                </div>
                <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider pr-2">
                  <span className="w-12 text-center">In-App</span>
                  <span className="w-12 text-center">Email</span>
                  <span className="w-12 text-center">SMS</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {cat.items.map((item, itemIdx) => (
                  <div
                    key={item.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="pr-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">{item.label}</span>
                        {item.locked && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                    </div>

                    <div className="flex items-center gap-6 shrink-0 self-end sm:self-center pr-2">
                      {/* In-App Toggle */}
                      <button
                        onClick={() => toggleChannel(catIdx, itemIdx, "inApp")}
                        disabled={item.locked}
                        className={`w-12 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          item.inApp
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        } ${item.locked ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={item.locked ? "Mandatory channel for compliance" : "Toggle in-app notification"}
                      >
                        <Globe size={14} />
                      </button>

                      {/* Email Toggle */}
                      <button
                        onClick={() => toggleChannel(catIdx, itemIdx, "email")}
                        disabled={item.locked}
                        className={`w-12 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          item.email
                            ? "bg-blue-600 text-white font-bold"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        } ${item.locked ? "opacity-60 cursor-not-allowed" : ""}`}
                        title={item.locked ? "Mandatory channel for compliance" : "Toggle email notification"}
                      >
                        <Mail size={14} />
                      </button>

                      {/* SMS Toggle */}
                      <button
                        onClick={() => toggleChannel(catIdx, itemIdx, "sms")}
                        className={`w-12 h-7 flex items-center justify-center rounded-lg transition-all cursor-pointer ${
                          item.sms
                            ? "bg-purple-600 text-white font-bold"
                            : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                        }`}
                        title="Toggle SMS alert"
                      >
                        <Smartphone size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom info banner */}
      <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 flex items-start gap-3">
        <ShieldCheck size={20} className="text-[#022C4F] shrink-0 mt-0.5" />
        <div className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-[#022C4F]">Statutory Compliance Policy:</strong> Certain critical safety alerts (such as Stop-Work Orders and Official Inspection Pass/Fail verdicts) are mandatory by state building control regulations and cannot be disabled on primary delivery channels.
        </div>
      </div>
    </div>
  );
}
