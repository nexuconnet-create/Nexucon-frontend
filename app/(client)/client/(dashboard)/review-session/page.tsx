'use client';

import React, { useEffect, useState } from 'react';
import { MicOff, Video, MonitorUp, Phone, Volume2, MoreHorizontal, CheckSquare, FileText } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getMeetings, StakeholderMeeting } from '@/services/stakeholders';
import { getProjects, Project } from '@/services/projects';
import { getDocuments, Document } from '@/services/documents';

const initialsFromName = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

const formatDate = (value?: string | null): string => {
  if (!value) return '—';
  const dt = new Date(value);
  return Number.isNaN(dt.getTime()) ? value : dt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function ReviewSessionPage() {
  const [checkedTopics, setCheckedTopics] = useState<Record<string, boolean>>({});

  // Real meeting, project and document records — no fabricated session data.
  const [meeting, setMeeting] = useState<StakeholderMeeting | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getMeetings().catch(() => [] as StakeholderMeeting[]),
      getProjects().catch(() => [] as Project[]),
      getDocuments().catch(() => [] as Document[]),
    ]).then(([meetings, projects, docs]) => {
      if (cancelled) return;
      const latestMeeting = [...(meetings || [])].sort((a, b) => {
        const ta = new Date(a.created_at ?? a.date ?? 0).getTime();
        const tb = new Date(b.created_at ?? b.date ?? 0).getTime();
        return tb - ta;
      })[0] ?? null;
      setMeeting(latestMeeting);
      const latestProject = [...(projects || [])].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0] ?? null;
      setProject(latestProject);
      setDocuments(Array.isArray(docs) ? docs : []);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const toggleTopic = (topic: string) => {
    setCheckedTopics(prev => ({ ...prev, [topic]: !prev[topic] }));
  };

  // Agenda lines come from the real meeting record's agenda text.
  const topics = (meeting?.agenda || '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  const participants = meeting?.participants || [];

  // Real documents currently going through review.
  const reviewItems = documents
    .filter((doc) => doc.status === 'PENDING_REVIEW' || doc.status === 'UNDER_REVIEW' || doc.status === 'CHANGES_REQUESTED')
    .sort((a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime())
    .map((doc) => ({
      id: doc.id,
      title: doc.title,
      type: [doc.file_format, doc.file_size].filter(Boolean).join(' • ') || '—'
    }));

  const isLive = meeting?.status === 'In Progress';

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Left Column (Main Stage) */}
        <div className="w-full lg:w-[65%] flex flex-col">
          <div className="mb-8">
            <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
              Live Session
            </h1>
            <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-2xl leading-relaxed">
              Conduct structured collaborative review sessions for drawings, reports, specifications, and project deliverables. Gather technical feedback, discuss findings, resolve issues, and record recommendations before approval.
            </p>
          </div>

          {/* Main Video Player */}
          <div className="relative w-full h-[400px] md:h-[500px] rounded-[32px] overflow-hidden mb-4 shadow-sm bg-gray-900">
            {/* Honest placeholder — no fabricated stock footage. Real session video renders here. */}
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[14px] font-bold text-white/80">
                {isLoading ? 'Loading session…' : (meeting ? meeting.title : 'No session recorded yet')}
              </p>
              <p className="text-[11px] text-white/50 font-medium leading-relaxed">
                {isLoading
                  ? 'Fetching meeting details…'
                  : 'Live video streams appear here once a session is joined.'}
              </p>
            </div>

            {/* Live / Status Badge */}
            {meeting && !isLoading && (
              <div className="absolute top-6 left-6 bg-[#0F181F]/80 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center gap-2 border border-white/10">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider">{isLive ? 'Live' : meeting.status}</span>
                {isLive && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>}
              </div>
            )}

            {/* Volume Control */}
            <div className="absolute top-1/2 -translate-y-1/2 right-6 w-8 h-32 bg-[#0F181F]/80 backdrop-blur-md rounded-full flex flex-col items-center justify-between p-2 border border-white/10">
              <div className="w-1 h-[70px] bg-white/20 rounded-full relative mt-2">
                <div className="absolute bottom-0 w-full h-[40px] bg-blue-400 rounded-full"></div>
              </div>
              <Volume2 size={16} className="text-white mb-1" />
            </div>

            {/* Video Controls Pill */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-[#0F181F]/90 backdrop-blur-md rounded-full p-2 flex items-center gap-2 shadow-2xl border border-white/10">
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <MicOff size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <Video size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#022C4F] text-white flex items-center justify-center hover:bg-[#033A6B] transition-colors">
                <MonitorUp size={20} />
              </button>
              <button className="w-12 h-12 rounded-full bg-[#E53935] text-white flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg">
                <Phone size={20} className="rotate-[135deg]" />
              </button>
            </div>
          </div>

          {/* Participant Thumbnails */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {isLoading ? (
              <div className="col-span-2 md:col-span-4 aspect-video rounded-[16px] bg-gray-900 shadow-sm flex items-center justify-center">
                <p className="text-[11px] font-semibold text-white/50 animate-pulse">Loading participants…</p>
              </div>
            ) : participants.length === 0 ? (
              <div className="col-span-2 md:col-span-4 aspect-video rounded-[16px] bg-gray-900 shadow-sm flex items-center justify-center">
                <p className="text-[11px] font-medium text-white/50">No participants recorded yet.</p>
              </div>
            ) : (
              participants.map((participant, index) => (
                <div key={`${participant.name}-${index}`} className="relative aspect-video rounded-[16px] overflow-hidden bg-gray-900 shadow-sm">
                  {/* Initials avatar — no stock photos */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[28px] font-extrabold text-white/30">{initialsFromName(participant.name)}</span>
                  </div>

                  {/* Overlay gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>

                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                    <div>
                      <p className="text-[11px] font-bold text-white leading-tight">{participant.name}</p>
                      <p className="text-[9px] font-medium text-gray-300">{participant.role || participant.status}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Active Review Items */}
          <div>
            <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Active Review Items</h3>
            {isLoading ? (
              <p className="text-[12px] text-gray-500 font-medium animate-pulse">Loading review items…</p>
            ) : reviewItems.length === 0 ? (
              <p className="text-[12px] text-gray-500 font-medium">No documents under review yet.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {reviewItems.map((item) => (
                  <div key={item.id} className="w-full bg-[#022C4F] rounded-2xl h-[72px] px-6 flex items-center justify-between hover:bg-[#033A6B] transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-[13px] font-bold text-white group-hover:text-blue-100 transition-colors">{item.title}</h4>
                        <p className="text-[11px] text-white/60">{item.type}</p>
                      </div>
                    </div>
                    <button className="text-white/60 hover:text-white transition-colors">
                      <MoreHorizontal size={24} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (Session Overview) */}
        <div className="w-full lg:w-[35%] flex flex-col">
          <div className="bg-white border border-gray-200 rounded-[32px] p-8 shadow-sm flex flex-col h-full sticky top-4">
            <h2 className="text-[22px] font-extrabold text-[#022C4F] mb-8">Session Overview</h2>

            {/* Grid details */}
            <div className="grid grid-cols-2 gap-y-8 gap-x-4 mb-12">
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Session Title</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.title || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Project</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.project_name || project?.name || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Meeting Reference</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.meeting_reference || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Session Type</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.meeting_type || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Status</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.status || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Date</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : formatDate(meeting?.date)}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Time</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : (meeting?.time_slot || '—')}</span>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-[#022C4F] mb-1.5">Duration</span>
                <span className="text-[11px] font-medium text-gray-500 leading-snug block">{isLoading ? '…' : '—'}</span>
              </div>
            </div>

            {/* Session Agenda */}
            <div className="flex-1">
              <h3 className="text-[16px] font-extrabold text-[#022C4F] mb-4">Session Agenda</h3>
              <h4 className="text-[12px] font-bold text-[#0F181F] mb-4">Discussion Topics</h4>

              {isLoading ? (
                <p className="text-[11px] text-gray-500 font-medium animate-pulse">Loading agenda…</p>
              ) : topics.length === 0 ? (
                <p className="text-[11px] text-gray-500 font-medium">No agenda recorded yet.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {topics.map(topic => (
                    <div key={topic} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleTopic(topic)}>
                      <div className={`w-[14px] h-[14px] border flex items-center justify-center transition-colors ${checkedTopics[topic] ? 'border-[#0F181F] bg-[#0F181F]' : 'border-gray-300 border-2'}`}>
                        {checkedTopics[topic] && <CheckSquare size={10} className="text-white" />}
                      </div>
                      <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900">{topic}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-12 flex flex-col gap-3">
              <Button variant="primary" className="!w-full h-[48px]">
                End Review Session
              </Button>
              <Button variant="outline" className="!w-full h-[48px] bg-black text-white hover:bg-gray-900 border-none">
                Leave Session
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
