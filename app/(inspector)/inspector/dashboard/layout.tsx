"use client";

import React from "react";
import InspectorAppShell from "@/components/inspector/InspectorAppShell";

export default function InspectorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <InspectorAppShell>{children}</InspectorAppShell>;
}
