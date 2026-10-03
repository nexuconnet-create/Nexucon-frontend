import React from 'react';
import type { Metadata } from 'next';
import { LanguageProvider } from '@/components/transparency/LanguageContext';
import { PublicHeader } from '@/components/transparency/PublicHeader';
import { PublicFooter } from '@/components/transparency/PublicFooter';

export const metadata: Metadata = {
  title: 'Nexucon Public Transparency Portal | Verified Building & Planning Registry',
  description:
    'Official open-data public portal for verifying building planning permits, inspecting certified construction milestones, and viewing statutory compliance across Lagos State.',
  openGraph: {
    title: 'Nexucon Public Transparency Portal',
    description:
      'Search approved building projects, verify planning permits, and explore geospatial compliance records.',
    siteName: 'Nexucon Public Transparency Portal',
    locale: 'en_NG',
    type: 'website',
  },
};

export default function TransparencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LanguageProvider>
      <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-600 selection:text-white">
        <PublicHeader />
        <div className="flex-1 flex flex-col">{children}</div>
        <PublicFooter />
      </div>
    </LanguageProvider>
  );
}
