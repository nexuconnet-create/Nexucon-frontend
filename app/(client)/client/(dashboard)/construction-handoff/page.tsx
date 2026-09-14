'use client';

import React, { useEffect, useState } from 'react';
import { ArrowUpRight, CheckCircle, Hourglass, Check, ShieldCheck, Clock, Star, Map, AlertTriangle, Square } from 'lucide-react';
import Button from '@/components/ui/Button';
import GeneratePackageDrawer from '@/components/dashboard/GeneratePackageDrawer';
import { getProjects, Project } from '@/services/projects';
import { getDocuments, Document } from '@/services/documents';
import { getContractors, Contractor } from '@/services/stakeholders';

const initialsFromName = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

export default function ConstructionHandoffPage() {
  const [isGenerateDrawerOpen, setIsGenerateDrawerOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Real project, document and contractor records — no fabricated handoff data.
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getProjects().catch(() => [] as Project[]),
      getDocuments().catch(() => [] as Document[]),
      getContractors().catch(() => [] as Contractor[]),
    ]).then(([projects, docs, cons]) => {
      if (cancelled) return;
      const latest = [...(projects || [])].sort(
        (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
      )[0] ?? null;
      setProject(latest);
      setDocuments(Array.isArray(docs) ? docs : []);
      setContractors(Array.isArray(cons) ? cons : []);
    }).finally(() => {
      if (!cancelled) setIsLoading(false);
    });
    return () => { cancelled = true; };
  }, []);

  const protocolItems = [
    { id: 'site_cond', title: "Site Conditions", desc: "Soil test completed, hazards cleared, utilities marked." },
    { id: 'structures', title: "Existing Structures", desc: "Demolition permits approved, structural integrity verified." },
    { id: 'boundaries', title: "Boundaries", desc: "Property lines staked out, temporary fencing installed." },
    { id: 'access', title: "Access Points", desc: "Heavy machinery route established, traffic plan active." }
  ];

  const toggleCheck = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const allChecked = protocolItems.every(item => checkedItems[item.id]);

  // Readiness statuses are derived from real project/document records.
  // "Not recorded" is shown where no real source exists.
  const drawings = documents.filter(
    (doc) => doc.document_type === 'DRAWING' || doc.document_type === 'SUBMITTED_DRAWING'
  );
  const approvedDocs = documents.filter((doc) => doc.status === 'APPROVED').length;
  const reviewCount = documents.reduce((total, doc) => total + (doc.reviews?.length || 0), 0);

  const permitStatus = !project?.permit_status
    ? 'Not recorded'
    : /approv/i.test(project.permit_status)
      ? 'Complete'
      : 'Pending';

  const checklist = [
    {
      requirement: 'All drawings approved for construction',
      status: drawings.length > 0
        ? (drawings.every((doc) => doc.status === 'APPROVED') ? 'Complete' : 'Pending')
        : 'Not recorded'
    },
    { requirement: 'BOQ finalized and signed', status: 'Not recorded' },
    { requirement: 'Permits obtained', status: permitStatus },
    { requirement: 'Contractor selected', status: selectedContractor !== null ? 'Complete' : 'Pending' },
    { requirement: 'Contract signed', status: 'Not recorded' },
    { requirement: 'Insurance/bonds verified', status: 'Not recorded' },
    { requirement: 'Site handover date confirmed', status: 'Not recorded' },
    { requirement: 'Kickoff meeting scheduled', status: 'Not recorded' },
  ];

  const allChecklistComplete = checklist.every(item => item.status === 'Complete');

  const statusIcon = (status: string) => {
    if (status === 'Complete') return <CheckCircle size={16} className="text-[#8BC34A]" />;
    if (status === 'Pending') return <Hourglass size={16} className="text-[#FF9800]" />;
    return <Square size={14} className="text-gray-400" />;
  };

  // Real professionals recorded against the latest project.
  const personnel = (project?.professionals || []).map((professional) => ({
    role: professional.role,
    name: professional.name,
  }));

  const stats = [
    { label: 'Project', value: isLoading ? '…' : (project?.name || '—') },
    { label: 'Design Completion', value: isLoading ? '…' : (project?.progress != null ? `${project.progress}%` : '—') },
    { label: 'Peer Reviews', value: isLoading ? '…' : (reviewCount > 0 ? `${reviewCount} recorded` : 'None recorded') },
    { label: 'Documentation Status', value: isLoading ? '…' : (documents.length > 0 ? `${approvedDocs} of ${documents.length} approved` : 'No documents yet') },
  ];

  return (
    <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out fill-mode-both pb-10">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-6">
        <div>
          <h1 className="text-[28px] md:text-[32px] font-extrabold text-[#022C4F] mb-3">
            Construction Handoff Package
          </h1>
          <p className="text-[12px] md:text-[13px] text-gray-600 font-medium max-w-2xl leading-relaxed">
            Prepare and transfer approved design deliverables, technical documentation, and project requirements to contractors and execution teams for seamless project delivery.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <Button variant="outline" onClick={() => setIsGenerateDrawerOpen(true)}>
            Generate Construction Package
          </Button>
          <Button variant="primary">
            Hire A Contractor
          </Button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-[#022C4F] rounded-[32px] p-6 flex flex-col justify-between min-h-[140px] shadow-sm relative group hover:shadow-md transition-shadow">
            <h4 className="text-[12px] font-bold text-[#022C4F]">{stat.label}</h4>
            <p className="text-[16px] font-extrabold text-[#022C4F] leading-tight mt-4 pr-10">
              {stat.value}
            </p>
            <div className="absolute top-6 right-6 w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 group-hover:bg-gray-50 group-hover:text-[#022C4F] transition-colors cursor-pointer">
              <ArrowUpRight size={16} />
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Left Column */}
        <div className="w-full lg:w-[55%] flex flex-col gap-6">
          {/* Readiness Checklist */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Construction Readiness Checklist</h3>

            <div className="bg-[#022C4F] text-white rounded-[24px] px-8 py-5 flex justify-between items-center mb-4">
              <span className="text-[11px] font-bold tracking-wider uppercase">Requirement</span>
              <span className="text-[11px] font-bold tracking-wider uppercase w-28 pl-2">Status</span>
            </div>

            <div className="flex flex-col">
              {checklist.map((item, index) => (
                <div
                  key={index}
                  className={`flex justify-between items-center px-8 py-5 ${index !== checklist.length - 1 ? 'border-b border-gray-100' : ''}`}
                >
                  <span className="text-[13px] text-[#0F181F] font-medium">{index + 1}. {item.requirement}</span>
                  <div className="flex items-center gap-2 w-28 pl-2">
                    {statusIcon(item.status)}
                    <span className={`text-[12px] font-bold ${item.status === 'Complete' ? 'text-[#8BC34A]' : item.status === 'Pending' ? 'text-[#FF9800]' : 'text-gray-400'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
              <Button
                variant="primary"
                className={`!w-full h-[48px] ${!allChecklistComplete ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={!allChecklistComplete}
              >
                Transfer to SiteSupervise
              </Button>
            </div>
          </div>

          {/* Site Handover Protocol */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm flex flex-col">
          <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-2 flex items-center gap-2">
            Site Handover Protocol
          </h3>
          <p className="text-[12px] text-gray-500 font-medium mb-8">Complete this checklist before transferring site possession.</p>

          <div className="flex flex-col gap-4 flex-1">
            {protocolItems.map((item) => {
              const isChecked = checkedItems[item.id];
              return (
                <div
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-colors ${isChecked ? 'bg-white border-[#8BC34A] shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'}`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors ${isChecked ? 'border-[#8BC34A] bg-[#8BC34A] text-white' : 'border-gray-300'}`}>
                    {isChecked && <CheckCircle size={14} strokeWidth={3} />}
                  </div>
                  <div>
                    <h4 className={`text-[14px] font-bold transition-colors ${isChecked ? 'text-[#0F181F]' : 'text-gray-700'}`}>{item.title}</h4>
                    <p className="text-[12px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
            {!allChecked && (
              <div className="flex items-center gap-2 text-[11px] font-bold text-[#FF9800] mb-4 bg-[#FF9800]/10 p-3 rounded-xl w-full justify-center">
                <AlertTriangle size={14} />
                Complete all protocol items to unlock handover.
              </div>
            )}
            <Button
              variant="success"
              disabled={!allChecked || selectedContractor === null}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Site Successfully Handed Over!', type: 'success' } })); }}
            >
              <Map size={18} className="mr-2" /> Approve & Execute Handoff
            </Button>
          </div>
          </div>
        </div>

        {/* Right Column: Cards */}
        <div className="w-full lg:w-[45%] flex flex-col gap-6">

          {/* Card 1: Selected Required Personnel */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Selected Required Personnel</h3>

            {isLoading ? (
              <p className="text-[12px] text-gray-500 font-medium animate-pulse mb-8">Loading project personnel…</p>
            ) : personnel.length === 0 ? (
              <p className="text-[12px] text-gray-500 font-medium mb-8">No personnel recorded on this project yet.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-5 gap-x-2 mb-8">
                {personnel.map((person, idx) => (
                  <div key={`${person.name}-${idx}`} className="flex items-center gap-3 cursor-default group">
                    <div className="w-5 h-5 rounded flex items-center justify-center border bg-[#0F181F] border-[#0F181F]">
                      <Check size={14} className="text-white" strokeWidth={3} />
                    </div>
                    <span className="text-[11px] text-gray-600 font-medium group-hover:text-gray-900 transition-colors whitespace-nowrap">
                      {person.role}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <Button variant="outline" className="flex-1 w-full sm:w-auto">
                Find Professionals
              </Button>
              <Button variant="primary" className="flex-1 w-full sm:w-auto">
                Hire Contractor
              </Button>
            </div>
          </div>

          {/* Card 2: Contractor Selection Options */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6">Contractor Selection Options</h3>
            <h4 className="text-[15px] font-bold text-[#0F181F] mb-2">Full Contractor Delivery</h4>
            <p className="text-[12px] text-gray-500 font-medium mb-6 leading-relaxed">
              A verified contractor takes responsibility for project execution, team management, scheduling, and construction delivery.
            </p>

            <div className="mb-6">
              <h5 className="text-[10px] font-bold text-[#022C4F] uppercase tracking-wider mb-4">Benefits</h5>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  'Single Point of Responsibility',
                  'Faster Project Mobilization',
                  'Reduced Client Oversight'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#8BC34A]/20 flex items-center justify-center text-[#8BC34A] shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] font-medium text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button variant="primary">
                Hire Contractor
              </Button>
            </div>
          </div>

          {/* Card 3: Build Your Own Execution Team */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-2">Build Your Own Execution Team</h3>
            <p className="text-[12px] text-gray-500 font-medium mb-6 leading-relaxed">
              Select individual professionals and maintain direct oversight of construction activities.
            </p>

            <div className="mb-6">
              <h5 className="text-[10px] font-bold text-[#022C4F] uppercase tracking-wider mb-4">Benefits</h5>
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {[
                  'Greater Cost Control',
                  'Direct Team Management',
                  'Flexible Resource Selection'
                ].map((benefit, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-[#8BC34A]/20 flex items-center justify-center text-[#8BC34A] shrink-0">
                      <Check size={10} strokeWidth={3} />
                    </div>
                    <span className="text-[12px] font-medium text-gray-600">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8">
              <Button variant="primary">
                Find Professionals
              </Button>
            </div>
          </div>

          {/* Contractor Selection — real contractor records */}
          <div className="bg-white border border-[#022C4F] rounded-[32px] p-8 shadow-sm">
            <h3 className="text-[18px] font-extrabold text-[#022C4F] mb-6 flex items-center gap-2">
              Contractors
            </h3>

            {isLoading ? (
              <p className="text-[12px] text-gray-500 font-medium animate-pulse">Loading contractors…</p>
            ) : contractors.length === 0 ? (
              <p className="text-[12px] text-gray-500 font-medium">No contractors available yet.</p>
            ) : (
              <div className="flex flex-col gap-6">
                {contractors.map((contractor) => (
                  <div
                    key={contractor.id}
                    onClick={() => setSelectedContractor(contractor.id)}
                    className={`border-2 rounded-[24px] p-6 cursor-pointer transition-all duration-300 relative ${selectedContractor === contractor.id ? 'border-[#022C4F] shadow-lg bg-[#022C4F]/[0.02]' : 'border-gray-100 hover:border-gray-300 hover:shadow-md bg-white'}`}
                  >
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-full bg-[#022C4F]/10 border-2 border-gray-100 flex items-center justify-center shrink-0">
                        <span className="text-[15px] font-extrabold text-[#022C4F]">{initialsFromName(contractor.name)}</span>
                      </div>
                      <div>
                        <h4 className="text-[16px] font-bold text-[#0F181F] leading-tight">{contractor.name}</h4>
                        <span className="text-[12px] font-bold text-[#022C4F] bg-[#022C4F]/10 px-2.5 py-0.5 rounded-full mt-1 inline-block">{contractor.contractor_type || '—'}</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><CheckCircle size={14} className="text-[#8BC34A]"/> Compliance Score</span>
                        <span className="text-[14px] font-bold text-[#0F181F]">{contractor.compliance_score != null ? `${contractor.compliance_score}%` : '—'}</span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><Clock size={14} className="text-blue-500"/> Active Permits</span>
                        <span className="text-[13px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{contractor.active_permits != null ? contractor.active_permits : '—'}</span>
                      </div>

                      {contractor.specialties?.length ? (
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><Star size={14} className="text-[#FFD54F]"/> Specialties</span>
                          <span className="text-[12px] font-bold text-[#0F181F] text-right">{contractor.specialties.join(', ')}</span>
                        </div>
                      ) : null}

                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-[12px] text-gray-500 font-medium flex items-center gap-2"><ShieldCheck size={14} className="text-purple-500"/> License Status</span>
                        <span className="text-[12px] font-bold text-[#0F181F]">{contractor.license_status || '—'}</span>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className={`w-full py-3 rounded-xl text-[12px] font-bold text-center transition-colors ${selectedContractor === contractor.id ? 'bg-[#022C4F] text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {selectedContractor === contractor.id ? 'Contractor Selected' : 'Select Contractor'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <GeneratePackageDrawer
        isOpen={isGenerateDrawerOpen}
        onClose={() => setIsGenerateDrawerOpen(false)}
      />
    </div>
  );
}
