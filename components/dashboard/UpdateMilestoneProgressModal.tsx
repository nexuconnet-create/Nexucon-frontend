"use client";

import React, { useState, useEffect } from 'react';
import { 
  X, Activity, CheckCircle, ShieldCheck, AlertCircle, 
  Upload, FileText, Camera, Plus, Trash2, Clock, Sparkles
} from 'lucide-react';
import { ConstructionMilestone, updateMilestoneProgress, MilestoneDocument } from '@/services/monitoring';

interface UpdateMilestoneProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: ConstructionMilestone | null;
  onSuccess?: (updatedMilestone?: ConstructionMilestone) => void;
}

const SAMPLE_EVIDENCE_TEMPLATES = [
  { name: '28-Day Concrete Cube Compressive Strength Certificate.pdf', category: 'Laboratory Test Report', size: '2.4 MB', file_type: 'PDF' },
  { name: 'Mill Test Certificate - High Yield Deformed Rebar Fe500.pdf', category: 'Material Certificate', size: '1.8 MB', file_type: 'PDF' },
  { name: 'BIM LiDAR Deviation Heatmap & Point Cloud Overlay.pdf', category: 'BIM / Digital Eye', size: '5.2 MB', file_type: 'PDF' },
  { name: 'COREN Registered Structural Engineer Inspection Sign-off.pdf', category: 'Regulatory Seal', size: '1.1 MB', file_type: 'PDF' },
  { name: 'Soil Compaction & Density Field Test Log.pdf', category: 'Geotechnical Report', size: '1.9 MB', file_type: 'PDF' }
];

export default function UpdateMilestoneProgressModal({
  isOpen,
  onClose,
  milestone,
  onSuccess
}: UpdateMilestoneProgressModalProps) {
  const [progress, setProgress] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [selectedDocs, setSelectedDocs] = useState<MilestoneDocument[]>([]);
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Laboratory Test Report');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photosList, setPhotosList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && milestone) {
      setProgress(milestone.progress_percentage || 0);
      setNotes(milestone.physical_progress_notes || '');
      setSelectedDocs((milestone.evidence_documents || []).filter(d => typeof d === 'object' && d !== null) as MilestoneDocument[]);
      setPhotosList(milestone.evidence_photos || []);
    }
  }, [isOpen, milestone]);

  if (!isOpen || !milestone) return null;

  const handleAddTemplateDoc = (tpl: any) => {
    if (selectedDocs.some(d => d.name === tpl.name)) return;
    setSelectedDocs(prev => [
      ...prev,
      {
        name: tpl.name,
        url: `https://assets.nexucon.gov.ng/evidence/${encodeURIComponent(tpl.name)}`,
        category: tpl.category,
        size: tpl.size,
        file_type: tpl.file_type,
        verified: true
      }
    ]);
  };

  const handleAddCustomDoc = () => {
    if (!newDocName.trim()) return;
    setSelectedDocs(prev => [
      ...prev,
      {
        name: newDocName.trim(),
        url: `https://assets.nexucon.gov.ng/uploads/${encodeURIComponent(newDocName.trim())}`,
        category: newDocCategory,
        size: '1.5 MB',
        file_type: 'PDF',
        verified: true
      }
    ]);
    setNewDocName('');
  };

  const handleRemoveDoc = (index: number) => {
    setSelectedDocs(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddPhoto = () => {
    if (!photoUrl.trim()) return;
    setPhotosList(prev => [...prev, photoUrl.trim()]);
    setPhotoUrl('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await updateMilestoneProgress(milestone.id, {
        progress_percentage: progress,
        physical_progress_notes: notes.trim(),
        evidence_documents: selectedDocs,
        evidence_photos: photosList
      });

      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { 
          message: progress === 100 
            ? `Milestone reached 100% and submitted for formal statutory verification review!`
            : `Progress for "${milestone.name}" updated to ${progress}%!`, 
          type: progress === 100 ? 'info' : 'success' 
        } 
      }));

      onClose();
      if (onSuccess) onSuccess(result);
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to update milestone progress';
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: msg, type: 'error' } }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0F181F]/60 backdrop-blur-sm z-[120] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 my-8 overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/30">
              <Activity size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                  {milestone.milestone_code}
                </span>
                <span className="text-xs text-slate-400 font-bold">{milestone.project_name}</span>
              </div>
              <h2 className="text-lg font-black text-[#022C4F] mt-0.5 line-clamp-1">
                Update Physical Progress & Evidence
              </h2>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          
          {/* Milestone Name card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1">
            <p className="text-xs font-black text-[#022C4F]">{milestone.name}</p>
            <div className="flex items-center gap-3 text-[11px] text-slate-500 font-semibold">
              <span>Target Date: {new Date(milestone.target_date).toLocaleDateString()}</span>
              <span>•</span>
              <span>Phase: {milestone.phase}</span>
            </div>
          </div>

          {/* Progress Slider & Input */}
          <div className="space-y-3 p-4 bg-blue-50/50 border border-blue-100 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#022C4F]">Physical Completion Progress</label>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-black text-blue-700">{progress}%</span>
              </div>
            </div>

            <input 
              type="range"
              min="0"
              max="100"
              step="5"
              value={progress}
              onChange={(e) => setProgress(parseInt(e.target.value, 10))}
              className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />

            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>0% (Not Started)</span>
              <span>25%</span>
              <span>50%</span>
              <span>75%</span>
              <span>100% (Submits for Verification)</span>
            </div>
          </div>

          {/* 100% Guardrail Notice */}
          {progress === 100 && (
            <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl flex items-start gap-2.5 text-xs text-indigo-900">
              <ShieldCheck className="text-indigo-600 shrink-0 mt-0.5" size={18} />
              <div>
                <strong className="font-black block">Statutory Gate Rule:</strong>
                Reaching 100% progress submits this milestone to the Building Control Authority as <strong>PENDING VERIFICATION</strong>. Formal regulatory sign-off requires passing mandatory inspection and defect gates.
              </div>
            </div>
          )}

          {/* Physical Notes */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#022C4F]">Field Engineer Work Summary / Progress Log</label>
            <textarea 
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Detail site operations executed, concrete batching data, rebar placement progress..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Evidence Documents Vault */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-[#022C4F] uppercase tracking-wider block">
                Attached Test Reports & Engineering Documents ({selectedDocs.length})
              </label>
            </div>

            {/* Quick Attach Template Pills */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase block">Quick Attach Standard Test Certificates:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_EVIDENCE_TEMPLATES.map((tpl, i) => {
                  const isAttached = selectedDocs.some(d => d.name === tpl.name);
                  return (
                    <button
                      key={i}
                      type="button"
                      disabled={isAttached}
                      onClick={() => handleAddTemplateDoc(tpl)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                        isAttached 
                          ? 'bg-slate-100 text-slate-400 cursor-default' 
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer'
                      }`}
                    >
                      <Plus size={11} /> {tpl.name.split(' ')[0]} {tpl.name.split(' ')[1]}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom doc upload simulation */}
            <div className="flex gap-2">
              <input 
                type="text"
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                placeholder="Attach custom certificate / lab report title..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
              />
              <select
                value={newDocCategory}
                onChange={(e) => setNewDocCategory(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="Laboratory Test Report">Laboratory Test</option>
                <option value="Material Certificate">Material Cert</option>
                <option value="BIM / Digital Eye">BIM Survey</option>
                <option value="Regulatory Seal">COREN Seal</option>
              </select>
              <button
                type="button"
                onClick={handleAddCustomDoc}
                className="px-3 py-2 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
              >
                Attach
              </button>
            </div>

            {/* Current Attached List */}
            {selectedDocs.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {selectedDocs.map((doc, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 truncate">
                      <FileText size={14} className="text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-800 truncate">{doc.name}</span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-slate-200 text-slate-700 shrink-0">
                        {doc.category || 'Test Report'}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDoc(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>Updating Progress...</>
              ) : (
                <>
                  <CheckCircle size={15} /> Save Progress Update
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
