"use client";

import React from "react";
import InspectorAppShell from "@/components/inspector/InspectorAppShell";
import Toast from "@/components/Toast";

export default function InspectorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // <Toast /> mounts the `show-toast` listener that notify() from
  // services/lib dispatches to. Without it every notification raised anywhere
  // under /inspector was dispatched into an empty room and silently dropped —
  // the client, government and professional dashboards all mount it; the
  // inspector dashboard was the one that did not.
  return (
    <InspectorAppShell>
      {children}
      <Toast />
    </InspectorAppShell>
  );
}
