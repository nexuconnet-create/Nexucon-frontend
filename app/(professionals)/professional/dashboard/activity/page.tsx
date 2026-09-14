"use client";

import React, { useState, useEffect } from "react";
import { Search, Bell, ArrowUpRight, Filter } from "lucide-react";
import ExportActivityLogModal from "@/components/dashboard/ExportActivityLogModal";
import TopRightControls from "@/components/dashboard/TopRightControls";
import CommentOnDocumentModal from "@/components/dashboard/CommentOnDocumentModal";
import ActivityAlertsModal from "@/components/dashboard/ActivityAlertsModal";
import { getAuditEvents, AuditEvent, formatActionTitle, formatResourceTitle } from "@/services/audit";
import { useAuth } from "@/context/AuthContext";

const formatRelativeTime = (iso?: string): string => {
  if (!iso) return "—";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} minute${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
};

export default function Activity() {
  const { user } = useAuth();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);

  // Real audit events. The audit API may not be accessible to professional
  // accounts — in that case the fetch fails and we honestly show an empty
  // state rather than fabricated activity.
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setLoadFailed(false);
    getAuditEvents()
      .then((rows) => {
        if (cancelled) return;
        setEvents(
          [...rows].sort(
            (a, b) => new Date(b.timestamp ?? 0).getTime() - new Date(a.timestamp ?? 0).getTime()
          )
        );
      })
      .catch((err) => {
        console.error("Failed to load activity events", err);
        if (!cancelled) {
          setEvents([]);
          setLoadFailed(true);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfWeek = startOfToday - 6 * 24 * 60 * 60 * 1000;

  const eventsToday = events.filter((e) => {
    const t = new Date(e.timestamp ?? 0).getTime();
    return !Number.isNaN(t) && t >= startOfToday;
  });
  const eventsThisWeek = events.filter((e) => {
    const t = new Date(e.timestamp ?? 0).getTime();
    return !Number.isNaN(t) && t >= startOfWeek;
  });

  const metricCards = [
    { title: "Total Activities", value: isLoading ? "—" : String(events.length) },
    { title: "Today", value: isLoading ? "—" : String(eventsToday.length) },
    { title: "This Week", value: isLoading ? "—" : String(eventsThisWeek.length) },
    { title: "Latest Update", value: events[0] ? formatRelativeTime(events[0].timestamp) : "—" },
  ];

  const liveActivityFeed = events.slice(0, 3).map((e) => ({
    title: `${e.user_name || "Unknown user"} — ${formatActionTitle(e.action)}`,
    quote: null as string | null,
    details: [
      { label: "Category", value: formatResourceTitle(e.resource_type) },
      { label: "Project", value: e.project_name || "—" },
      { label: "Time", value: formatRelativeTime(e.timestamp) },
    ],
    buttonText: "View Details",
  }));

  // "My" activities: audit events attributable to the signed-in user.
  const currentUserName = user ? `${user.first_name} ${user.last_name}`.trim() : "";
  const myRecentActivities = currentUserName
    ? events
        .filter((e) => (e.user_name || "").trim() === currentUserName)
        .slice(0, 6)
        .map((e) => ({
          activity: formatActionTitle(e.action),
          project: e.project_name || "—",
          date: formatRelativeTime(e.timestamp),
          status: e.severity || "—",
        }))
    : [];

  // Team activity summary: real event counts grouped by the resource that was
  // acted upon — no invented per-category totals.
  const summaryByResource = events.reduce<Array<{ label: string; value: string }>>((acc, e) => {
    const label = formatResourceTitle(e.resource_type);
    const existing = acc.find((a) => a.label === label);
    if (existing) {
      existing.value = String(Number(existing.value) + 1);
    } else {
      acc.push({ label, value: "1" });
    }
    return acc;
  }, []);

  return (
    <div className="h-full flex flex-col pt-2 pb-12 overflow-y-auto">
      {/* Top Bar */}
      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
        <div className="max-w-3xl">
          <h1 className="text-[40px] font-bold text-[#022C4F] leading-tight mb-4">
            Activity
          </h1>
          <p className="text-gray-600 text-[13px] leading-relaxed max-w-3xl">
            Monitor all project activities in one place. Track uploads, reviews, approvals, comments, task updates, meetings, releases, and team collaboration with a complete project activity timeline.
          </p>
        </div>

        <TopRightControls />
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <button
          onClick={() => setIsAlertsModalOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm flex items-center gap-2"
        >
          <Bell size={16} /> Set Activity Alerts
        </button>
        <button
          onClick={() => setIsExportModalOpen(true)}
          className="bg-white border border-[#022C4F] text-[#022C4F] hover:bg-gray-50 px-10 py-3.5 rounded-full font-medium transition-colors text-[13px] shadow-sm"
        >
          Export Activity Log
        </button>
        <button
          onClick={() => setIsCommentModalOpen(true)}
          className="bg-[#022C4F] hover:bg-[#033A6B] text-white px-10 py-3.5 rounded-full font-medium transition-colors shadow-sm text-[13px]"
        >
          Comment on Document
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {metricCards.map((card, idx) => (
          <div key={idx} className="bg-white rounded-[24px] p-6 border border-gray-200 shadow-sm relative group hover:shadow-md transition-all">
            <h3 className="text-[#022C4F] font-bold text-[12px] mb-6">{card.title}</h3>
            <p className="text-[32px] font-extrabold text-[#022C4F] leading-none">{card.value}</p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center group-hover:bg-[#022C4F] group-hover:border-[#022C4F] transition-colors cursor-pointer">
              <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {/* Search Activity */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-4">Search Activity</h2>
      <div className="flex items-center gap-4 mb-10">
        <div className="flex-1 relative">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by user, document, drawing, task, or keyword..."
            className="w-full h-[52px] bg-white rounded-full border border-gray-300 pl-14 pr-6 text-[13px] focus:outline-none focus:border-[#022C4F] focus:ring-1 focus:ring-[#022C4F] shadow-sm"
          />
        </div>
        <button className="h-[52px] px-8 bg-white rounded-full border border-gray-300 flex items-center gap-3 text-[13px] font-bold text-[#022C4F] hover:bg-gray-50 shadow-sm shrink-0">
          All Activities
          <Filter className="w-4 h-4" />
        </button>
      </div>

      {/* Live Activity Feed */}
      <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-6">Live Activity Feed</h2>
      {isLoading ? (
        <div className="bg-white rounded-[32px] border border-gray-200 p-12 mb-10 text-center text-[13px] text-gray-400 font-medium">
          Loading activity...
        </div>
      ) : liveActivityFeed.length === 0 ? (
        <div className="bg-white rounded-[32px] border border-dashed border-gray-300 p-12 mb-10 flex flex-col items-center text-center gap-3">
          <Bell className="w-8 h-8 text-gray-300" />
          <p className="text-[14px] font-bold text-[#022C4F]">No activity recorded yet</p>
          <p className="text-[12px] text-gray-500 max-w-[420px]">
            {loadFailed
              ? "Activity records could not be loaded for your account."
              : "Project activity will appear here as uploads, reviews, approvals, and comments are recorded."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {liveActivityFeed.map((item, idx) => (
            <div key={idx} className="bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
              <h3 className="text-[14px] font-extrabold text-[#022C4F] mb-4 leading-relaxed">
                {item.title}
              </h3>

              {item.quote && (
                <p className="text-[12px] text-gray-500 italic mb-4">
                  {item.quote}
                </p>
              )}

              <div className="flex flex-col gap-5 flex-1 mb-8">
                {item.details.map((detail, dIdx) => (
                  <div key={dIdx}>
                    <h4 className="text-[11px] font-extrabold text-[#022C4F] mb-1">{detail.label}</h4>
                    <p className="text-[12px] text-gray-500">{detail.value}</p>
                  </div>
                ))}
              </div>

              <button className="w-[140px] bg-[#022C4F] hover:bg-[#033A6B] text-white py-3 rounded-lg font-bold transition-colors text-[11px] shadow-sm mt-auto">
                {item.buttonText}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* My Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[22px] font-extrabold text-[#022C4F]">My Recent Activities</h2>
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-1.5">
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{"<"}</span>
              <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-[#022C4F] shadow-sm">1</span>
              <span className="text-xs font-bold text-gray-400">...</span>
              <span className="text-xs font-bold cursor-pointer text-gray-500 hover:text-gray-800">{">"}</span>
            </div>
          </div>

          <div className="w-full">
            <div className="bg-[#022C4F] rounded-full flex px-8 py-4 mb-4">
              <div className="flex-[2] text-[12px] font-bold text-white">Activity</div>
              <div className="flex-1 text-[12px] font-bold text-white">Project</div>
              <div className="w-[120px] text-[12px] font-bold text-white">Date</div>
              <div className="w-[120px] text-[12px] font-bold text-white">Status</div>
            </div>

            <div className="flex flex-col">
              {isLoading ? (
                <div className="py-12 text-center text-[12px] text-gray-400 font-medium">Loading activities...</div>
              ) : myRecentActivities.length === 0 ? (
                <div className="py-12 text-center text-[12px] text-gray-500 font-medium">
                  No activities recorded yet
                </div>
              ) : (
                myRecentActivities.map((item, idx) => (
                  <div key={idx} className="flex px-8 py-5 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <div className="flex-[2] text-[12px] text-gray-600 font-medium pr-4">{item.activity}</div>
                    <div className="flex-1 text-[12px] text-gray-500 pr-4">{item.project}</div>
                    <div className="w-[120px] text-[12px] text-gray-500">{item.date}</div>
                    <div className="w-[120px] text-[12px] text-gray-500">{item.status}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Team Activity Summary */}
        <div className="lg:col-span-1 bg-white rounded-[32px] p-8 border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow">
          <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Team Activity Summary</h2>

          <div className="grid grid-cols-2 gap-y-8 gap-x-4">
            {isLoading ? (
              <p className="col-span-2 text-[12px] text-gray-400 font-medium">Loading summary...</p>
            ) : summaryByResource.length === 0 ? (
              <p className="col-span-2 text-[12px] text-gray-500 font-medium">No activity recorded yet</p>
            ) : (
              summaryByResource.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <h4 className="text-[11px] font-extrabold text-[#022C4F]">{item.label}</h4>
                  <span className="text-[12px] text-gray-500">{item.value}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Export Activity Log Modal */}
      <ExportActivityLogModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />

      {/* Comment on Document Modal */}
      <CommentOnDocumentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
      />

      {/* Activity Alerts Modal */}
      <ActivityAlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
      />
    </div>
  );
}
