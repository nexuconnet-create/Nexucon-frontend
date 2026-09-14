"use client";

import React, { useState, useEffect } from "react";
import { getNotifications, Notification } from "@/services/notifications";

interface UrgentNotificationsProps {
  onReviewClick?: () => void;
  onApproveClick?: () => void;
}

export default function UrgentNotifications({ onReviewClick, onApproveClick }: UrgentNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    getNotifications()
      .then((data) => {
        if (!cancelled) {
          // Only genuinely urgent, unread notifications are surfaced here.
          const urgent = (Array.isArray(data) ? data : [])
            .filter((n) => !n.is_read && (n.priority === "Critical" || n.priority === "High"))
            .slice(0, 4);
          setNotifications(urgent);
        }
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const formatDate = (value?: string) => {
    if (!value) return "";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-[#022C4F] flex flex-col shadow-sm h-full">
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center py-12 text-[11px] font-semibold text-gray-400 animate-pulse">
          Loading notifications…
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12 text-[11px] font-medium text-gray-500 text-center px-4">
          No urgent notifications right now
        </div>
      ) : (
        <div className="space-y-6 flex-1">
          {notifications.map((notification, index) => (
            <div key={notification.id} className={index < notifications.length - 1 ? "pb-6 border-b border-gray-200" : ""}>
              <span className={`inline-block text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2 ${notification.priority === "Critical" ? "bg-red-500" : "bg-orange-500"}`}>
                {notification.priority}
              </span>
              <p className="text-sm font-bold text-[#0F181F] mb-1">
                {notification.title}
              </p>
              {notification.message && (
                <p className="text-xs text-gray-500 font-medium mb-2 line-clamp-3">
                  {notification.message}
                </p>
              )}
              {notification.created_at && (
                <p className="text-[11px] text-gray-400 font-medium mb-4">
                  {formatDate(notification.created_at)}
                </p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={onReviewClick}
                  className="px-5 py-3 border-2 border-gray-200 text-gray-600 rounded-full text-xs font-bold hover:bg-gray-50 transition-colors"
                >
                  Review Document
                </button>
                <button
                  onClick={onApproveClick}
                  className="px-5 py-3 bg-[#022C4F] text-white rounded-full text-xs font-bold hover:bg-[#022C4F]/90 transition-colors"
                >
                  Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
