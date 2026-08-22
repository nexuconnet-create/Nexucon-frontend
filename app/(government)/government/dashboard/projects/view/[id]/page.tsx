"use client";

import { useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';

export default function ProjectViewRedirectPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const id = params?.id;
    const tab = searchParams.get('tab') || 'overview';
    if (id) {
      router.replace(`/government/dashboard/projects/view/${id}/monitoring?tab=${tab}`);
    }
  }, [params, searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#022C4F]"></div>
    </div>
  );
}
