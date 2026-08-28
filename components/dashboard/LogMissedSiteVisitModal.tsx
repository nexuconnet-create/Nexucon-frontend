"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, AlertTriangle, Calendar, Building2, User, 
  ShieldAlert, CloudRain, Lock, AlertOctagon, 
  Wrench, Zap, UserX, FileText, CheckCircle2, UploadCloud, Trash2
} from 'lucide-react';
import { createMissedSiteVisit, MissedSiteVisitRecord } from '@/services/monitoring';
import { getProjects, Project } from '@/services/projects';
import { CustomSelect } from '@/components/CustomSelect';

interface LogMissedSiteVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (record?: MissedSiteVisitRecord) => void;
  defaultProjectId?: string;
}

const REASON_OPTIONS = [
  { value: 'ADVERSE_WEATHER', label: '🌧️ Adverse Weather / Heavy Downpour', icon: CloudRain },
  { value: 'ACCESS_DENIED', label: '🔒 Site Access Denied by Developer / Contractor', icon: Lock },
  { value: 'SITE_INACCESSIBLE', label: '🌊 Flooded / Inaccessible Approach Road', icon: AlertTriangle },
  { value: 'SECURITY_CONCERN', label: '⚠️ Safety Hazard / Site Unrest / Security Incident', icon: ShieldAlert },
  { value: 'EQUIPMENT_BREAKDOWN', label: '🔧 Vehicle / GNSS Rover / Device Hardware Failure', icon: Wrench },
  { value: 'EMERGENCY_REASSIGNMENT', label: '🚨 Reassigned to Emergency Structural Audit', icon: Zap },
  { value: 'DEVELOPER_UNAVAILABLE', label: '👤 Key Site Personnel / Resident Engineer Absent', icon: UserX },
  { value: 'ILLNESS_LEAVE', label: '🏥 Inspector Official Medical / Duty Leave', icon: User },
  { value: 'OTHER', label: '📝 Other Documented Operational Justification', icon: FileText },
];

const INSPECTOR_ROSTER = [
  { name: 'Engr. Abdulwahab Onike', badge: 'LASG-INSP-STR-042', role: 'Lead Structural Inspector' },
  { name: 'Insp. Sunkanmi Olowonishaye', badge: 'LASG-INSP-CIV-108', role: 'Civil & Cadastral Officer' },
  { name: 'Engr. Tunde Balogun', badge: 'LASG-INSP-MEP-019', role: 'MEP & Environmental Inspector' },
  { name: 'Arch. Folashade Adeleke', badge: 'LASG-INSP-ARC-055', role: 'Architectural Compliance Lead' },
  { name: 'Engr. Chukwuma Obi', badge: 'LASG-INSP-GEO-027', role: 'Geotechnical Specialist' },
];

export default function LogMissedSiteVisitModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId
}: LogMissedSiteVisitModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState(defaultProjectId || '');
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [selectedInspector, setSelectedInspector] = useState(INSPECTOR_ROSTER[0].name);
  const [inspectorBadge, setInspectorBadge] = useState(INSPECTOR_ROSTER[0].badge);
  const [reasonCategory, setReasonCategory] = useState('ADVERSE_WEATHER');
  const [justificationNotes, setJustificationNotes] = useState('');
  const [evidencePhotos, setEvidencePhotos] = useState<string[]>([]);
  const [photoInputUrl, setPhotoInputUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    getProjects()
      .then(res => {
        const list = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(list);
        if (list.length > 0 && !selectedProjectId) {
          const defaultProj = list.find((p: Project) => p.id === defaultProjectId) || list[0];
          setSelectedProjectId(defaultProj.id);
        }
      })
      .catch(err => console.error("Failed to load projects", err));
  }, [isOpen, defaultProjectId]);

  const handleInspectorChange = (name: string) => {
    setSelectedInspector(name);
    const found = INSPECTOR_ROSTER.find(i => i.name === name);
    if (found) setInspectorBadge(found.badge);
  };

  const handleAddPhoto = () => {
    if (!photoInputUrl.trim()) return;
    setEvidencePhotos(prev => [...prev, photoInputUrl.trim()]);
    setPhotoInputUrl('');
  };

  const handleRemovePhoto = (idx: number) => {
    setEvidencePhotos(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please select a construction project', type: 'error' } }));
      return;
    }
    if (!justificationNotes.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Please provide a justification explanation', type: 'error' } }));
      return;
    }

    setIsSubmitting(true);
    try {
      const record = await createMissedSiteVisit({
        project: selectedProjectId,
        inspector_name: selectedInspector,
        inspector_badge: inspectorBadge,
        scheduled_date: scheduledDate,
        reason_category: reasonCategory,
        justification_notes: justificationNotes.trim(),
        evidence_photos: evidencePhotos,
        status: 'SUBMITTED'
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Non-visitation justification logged successfully to Internal Control Roster', type: 'success' }
      }));
      onClose();
      if (onSuccess) onSuccess(record);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to record missed site visit';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-[#0F181F]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-amber-900 via-amber-800 to-[#022C4F] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 text-amber-300">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-wider">Document Missed Site Visit</h2>
              <p className="text-xs text-white/70">Internal Control Justification &amp; Field Worker Performance Audit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 overflow-y-auto space-y-5">
          
          {/* Notice Banner */}
          <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block mb-0.5">Government Internal Control Policy</span>
              <span>All unfulfilled site visits require an auditable reason to monitor field worker attendance, resolve developer access blockers, and maintain regulatory compliance integrity.</span>
            </div>
          </div>

          {/* Project Selection with Search */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Target Construction Project <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={selectedProjectId}
              onChange={(val) => setSelectedProjectId(val)}
              options={projects.map(p => ({
                value: p.id,
                label: `${p.name} (${p.reference_number || p.id.slice(0, 8)}) • ${p.lga || 'Lagos'}`
              }))}
              placeholder="Search and select project..."
              searchable={true}
            />
          </div>

          {/* Date & Inspector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Scheduled Calendar Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Assigned Field Inspector <span className="text-red-500">*</span>
              </label>
              <CustomSelect
                value={selectedInspector}
                onChange={handleInspectorChange}
                options={INSPECTOR_ROSTER.map(i => ({
                  value: i.name,
                  label: `${i.name} (${i.badge})`
                }))}
                placeholder="Select inspector..."
              />
            </div>
          </div>

          {/* Reason Category Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Reason for Non-Attendance / Missed Update <span className="text-red-500">*</span>
            </label>
            <CustomSelect
              value={reasonCategory}
              onChange={(val) => setReasonCategory(val)}
              options={REASON_OPTIONS.map(r => ({
                value: r.value,
                label: r.label
              }))}
              placeholder="Select reason category..."
            />
          </div>

          {/* Justification Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Detailed Justification &amp; Site Observations <span className="text-red-500">*</span>
            </label>
            <textarea
              value={justificationNotes}
              onChange={(e) => setJustificationNotes(e.target.value)}
              rows={4}
              required
              placeholder="Provide a detailed explanation of why the scheduled visit could not occur (e.g. road submerged after rain, contractor security refused access due to active crane lift, urgent re-routing to structural defect)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Supporting Evidence Photos */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Supporting Evidence Photos (Optional)
              </label>
              <span className="text-[11px] font-bold text-slate-500">{evidencePhotos.length} Attached</span>
            </div>

            <div className="flex gap-2">
              <input
                type="url"
                value={photoInputUrl}
                onChange={(e) => setPhotoInputUrl(e.target.value)}
                placeholder="Paste photo URL (e.g. locked gate, flooded access road)..."
                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddPhoto}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
            </div>

            {evidencePhotos.length > 0 && (
              <div className="grid grid-cols-2 gap-2 pt-2">
                {evidencePhotos.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-slate-200 aspect-video group bg-black/5">
                    <img src={url} alt="Evidence" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-black uppercase tracking-wider transition-colors shadow-lg shadow-amber-600/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Submitting Record...</>
              ) : (
                <>
                  <CheckCircle2 size={15} /> Document Non-Attendance
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
