import React, { useEffect, useState } from 'react';
import { X, Check, Clock } from 'lucide-react';
import Button from '@/components/ui/Button';
import { getProjects, Project } from '@/services/projects';
import { getDocuments, getDocumentApprovals, Document, DocumentApproval } from '@/services/documents';

interface FinalApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
}

export default function FinalApprovalDrawer({ isOpen, onClose, onApprove }: FinalApprovalDrawerProps) {
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  // Real project, documents and approval records — no fabricated workflow
  // stages or completion claims.
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [approvals, setApprovals] = useState<DocumentApproval[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    const load = async () => {
      setIsLoading(true);
      try {
        const [projects, docs, approvalRecords] = await Promise.all([
          getProjects().catch(() => [] as Project[]),
          getDocuments().catch(() => [] as Document[]),
          getDocumentApprovals().catch(() => [] as DocumentApproval[]),
        ]);
        if (cancelled) return;
        const latest = [...projects].sort(
          (a, b) => new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
        )[0] ?? null;
        setProject(latest);
        setDocuments(latest ? docs.filter((d) => d.project === latest.id) : docs);
        setApprovals(approvalRecords);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const checklistItems = [
    "All required drawings have been submitted",
    "Peer review comments have been resolved",
    "Design revisions have been incorporated",
    "Cost estimates have been reviewed",
    "Technical specifications are complete",
    "Documentation package is complete",
    "Project is ready for execution planning"
  ];

  const toggleCheck = (index: number) => {
    setCheckedItems(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const approvedDocs = documents.filter((d) => d.status === 'APPROVED').length;
  const completion = documents.length > 0 ? Math.round((approvedDocs / documents.length) * 100) : null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#022C4F]/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-lg bg-white h-full sm:h-[calc(100vh-32px)] sm:my-4 sm:mr-4 rounded-[32px] shadow-2xl flex flex-col animate-in slide-in-from-right duration-500 ease-out z-10 overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors z-20"
        >
          <X size={16} />
        </button>

        <div className="flex-1 overflow-y-auto flex flex-col p-6 lg:p-8">
          <h2 className="text-[20px] font-extrabold text-[#022C4F] mb-2 pr-8 shrink-0">Final Drawing Approval</h2>
          <p className="text-[11px] text-gray-500 font-medium leading-relaxed mb-8 shrink-0">
            Review the completed design package and provide final approval before the project moves to the execution planning and contractor selection stage.
          </p>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0">Project Information</h3>

          {isLoading ? (
            <p className="text-[11px] text-gray-500 font-medium mb-8">Loading project information…</p>
          ) : (
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 shrink-0">
              <div>
                <p className="text-[10px] font-bold text-[#0F181F] mb-1">Project</p>
                <p className="text-[11px] text-gray-600 font-medium">{project?.name || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0F181F] mb-1">Project Status</p>
                <p className="text-[11px] text-gray-600 font-medium">{project?.status || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0F181F] mb-1">Documents Recorded</p>
                <p className="text-[11px] text-gray-600 font-medium">{documents.length || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#0F181F] mb-1">Approved Documents</p>
                <p className="text-[11px] text-gray-600 font-medium">
                  {documents.length > 0 ? `${approvedDocs} of ${documents.length} (${completion}%)` : '—'}
                </p>
              </div>
            </div>
          )}

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0">Before Approving</h3>

          <div className="flex flex-col gap-4 flex-1">
            {checklistItems.map((item, index) => (
              <label key={index} className="flex items-center gap-4 cursor-pointer group">
                <div
                  className={`w-5 h-5 flex items-center justify-center rounded transition-all duration-200 border-2 ${
                    checkedItems[index]
                      ? 'bg-black border-black text-white'
                      : 'border-black text-transparent hover:border-gray-600'
                  }`}
                  onClick={() => toggleCheck(index)}
                >
                  <Check size={14} className="stroke-[3]" />
                </div>
                <span className="text-[11px] font-medium text-gray-600 group-hover:text-[#0F181F] transition-colors">{item}</span>
              </label>
            ))}
          </div>

          <h3 className="text-[13px] font-extrabold text-[#022C4F] mb-4 shrink-0 mt-6">Approval Workflow</h3>
          {approvals.length === 0 ? (
            <div className="flex flex-col gap-3 flex-1 mb-8 border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-2">
                <Clock size={14} className="text-gray-500 mt-0.5 shrink-0" />
                <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  No approval records yet. Approvals recorded on the platform will appear here before your final sign-off.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 flex-1 mb-8">
              {approvals.slice(0, 6).map((approval, index) => (
                <div
                  key={approval.id}
                  className={`flex items-center justify-between p-3 rounded-xl border ${
                    approval.status === 'APPROVED' ? 'border-[#4CAF50] bg-[#4CAF50]/5' :
                    approval.status === 'REJECTED' ? 'border-rose-200 bg-rose-50/60' :
                    'border-[#022C4F] bg-[#022C4F]/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                      approval.status === 'APPROVED' ? 'bg-[#4CAF50]' :
                      approval.status === 'REJECTED' ? 'bg-rose-500' : 'bg-[#022C4F]'
                    }`}>
                      {approval.status === 'APPROVED' ? <Check size={14} strokeWidth={3} /> : <span className="text-[12px] font-bold">{index + 1}</span>}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#0F181F]">{approval.approved_by_name || 'Approver'}</p>
                      <p className="text-[9px] text-gray-500 line-clamp-1">{approval.document_title || approval.approval_reference}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    approval.status === 'APPROVED' ? 'text-[#4CAF50]' :
                    approval.status === 'REJECTED' ? 'text-rose-600' : 'text-[#FF9800]'
                  }`}>{approval.status === 'PENDING' ? 'Pending' : approval.status.charAt(0) + approval.status.slice(1).toLowerCase()}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col items-center gap-3 shrink-0">
            <Button
              variant="primary"
              onClick={onApprove}
              className="w-full h-[50px] flex items-center justify-center text-[12px] uppercase tracking-wider"
            >
              Provide Final Client Approval
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="w-full h-[50px] flex items-center justify-center text-[12px] uppercase tracking-wider"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
