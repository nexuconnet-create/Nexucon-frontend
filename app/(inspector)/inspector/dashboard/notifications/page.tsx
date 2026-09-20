"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Radio,
  Building2,
  RefreshCw,
  Activity,
} from "lucide-react";
import { getInspectorDashboard } from "@/services/inspector";
import { RecentActivityItem } from "@/services/inspector";
import { dateTimeOr, orDash } from "@/lib/display";

/**
 * The inspector's own field activity, from the audit trail the platform holds.
 *
 * This page used to render three literal notifications — "New Project
 * Assignment: Eko Atlantic Tower D" (15 minutes ago), "Critical Defect Action
 * Overdue" quoting "#FND-88A1" (2 hours ago), and "GPR Radargram Batch
 * Synchronized" claiming 14 files had been hashed — with no fetch, no service
 * import and no state. They were identical for every user on every visit, and
 * they asserted assignments, overdue remediation and completed uploads that had
 * never happened.
 *
 * There is no per-user notification feed exposed to this application:
 * `GET /api/v1/notifications/` is not filtered by recipient, so reading it here
 * would show this inspector other users' notifications. What the platform does
 * expose, scoped to this inspector's projects, is the audit trail on
 * `GET /government/inspectors/me/dashboard/` — the same entries the Command
 * Center shows. That is what this page lists.
 */
export default function InspectorNotificationsPage() {
  const [activity, setActivity] = useState<RecentActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchActivity = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await getInspectorDashboard();
      setActivity(Array.isArray(data?.recent_activity) ? data.recent_activity : []);
    } catch (err: any) {
      setActivity([]);
      setLoadError(
        err?.response?.data?.detail ||
          err?.message ||
          "The activity trail could not be read."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  // Severity is the only recorded classifier on an activity entry; where the
  // record carries none, the row is shown in the neutral style rather than
  // being given one.
  const styleFor = (item: RecentActivityItem) => {
    const severity = (item.severity || "").toUpperCase();
    if (severity === "CRITICAL" || severity === "HIGH") {
      return { icon: AlertTriangle, color: "text-rose-600" };
    }
    if (severity === "MEDIUM" || severity === "WARNING") {
      return { icon: AlertTriangle, color: "text-amber-600" };
    }
    if (item.project) {
      return { icon: Building2, color: "text-emerald-600" };
    }
    return { icon: Activity, color: "text-blue-600" };
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 min-w-0">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#022C4F] flex items-center justify-center text-white shadow-md shrink-0">
            <Bell size={20} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] leading-tight">
              Field Activity &amp; Alerts
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm mt-0.5">
              The audit trail recorded against the projects in your scope.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchActivity}
          className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-[#022C4F] transition-colors cursor-pointer shadow-sm"
          title="Refresh"
        >
          <RefreshCw size={15} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : loadError ? (
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-1">
            The activity trail could not be read
          </h3>
          <p className="text-xs text-amber-800">{loadError}</p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is listed because nothing could be read. This is not a
            statement that no activity has been recorded.
          </p>
        </div>
      ) : activity.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-2xl p-8 shadow-sm">
          <Radio size={32} className="text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800 mb-1">
            No Activity Recorded
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Nothing has been written to the audit trail against the projects in
            your scope yet.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-3">
          {activity.map((item) => {
            const { icon: Icon, color } = styleFor(item);
            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 hover:bg-slate-100/70 transition-all flex items-start gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">
                  <Icon size={18} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-bold text-blue-700 uppercase">
                      {orDash(item.project, "No project recorded")}
                    </span>
                    <span className="text-xs text-slate-400">
                      {dateTimeOr(item.timestamp, "Time not recorded")}
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-[#022C4F] mb-0.5">
                    {orDash(item.event, "Event not described")}
                  </h3>
                  <p className="text-xs text-slate-600 leading-snug">
                    Recorded by {orDash(item.actor, "an unattributed user")}
                    {item.status ? ` • ${item.status}` : ""}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
