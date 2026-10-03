import React from "react";
import { AuthModalProvider } from "@/components/AuthModalContext";
import { LandingPageShell } from "@/components/LandingPageShell";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthModalProvider>
      <LandingPageShell>
        {children}
      </LandingPageShell>
    </AuthModalProvider>
  );
}
