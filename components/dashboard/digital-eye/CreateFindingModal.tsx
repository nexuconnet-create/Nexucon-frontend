"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  AlertTriangle, 
  Box, 
  Building2, 
  Radio, 
  Sparkles, 
  CheckCircle2, 
  Plus 
} from "lucide-react";
import { 
  DigitalEyeFinding, 
  FindingTaxonomy, 
  BIMStructuralElement, 
  createDigitalEyeFinding,
  getBIMStructuralElements
} from "@/services/digitalEye";
import { getProjects, Project } from "@/services/projects";

interface CreateFindingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultProjectId?: string;
  defaultElementId?: string;
}

export default function CreateFindingModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
  defaultElementId
}: CreateFindingModalProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [elements, setElements] = useState<BIMStructuralElement[]>([]);
  const [projectId, setProjectId] = useState(defaultProjectId || "");
  const [elementId, setElementId] = useState(defaultElementId || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taxonomy, setTaxonomy] = useState<FindingTaxonomy>("REBAR_SPACING_DEFICIENCY");
  const [severity, setSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [depthMm, setDepthMm] = useState("180");
  const [deviationMm, setDeviationMm] = useState("45");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      getProjects().then(res => {
        const pList = Array.isArray(res) ? res : ((res as any).results || []);
        setProjects(pList);
        if (!projectId && pList.length > 0) setProjectId(pList[0].id);
      });
      getBIMStructuralElements().then(res => {
        setElements(res);
        if (!elementId && res.length > 0) setElementId(res[0].id);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Please fill all required fields.", type: "error" }
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProj = projects.find(p => p.id === projectId);
      const selectedElem = elements.find(el => el.id === elementId);

      await createDigitalEyeFinding({
        project: projectId,
        project_name: selectedProj?.name || "Eko Atlantic Signature Tower",
        structural_element_id: elementId,
        structural_element_name: selectedElem?.name,
        structural_element_guid: selectedElem?.element_guid,
        title,
        description,
        taxonomy,
        severity,
        depth_mm: depthMm ? Number(depthMm) : undefined,
        deviation_mm: deviationMm ? Number(deviationMm) : undefined,
        confidence_score: 95,
        status: "OPEN",
        evidence_photos: [
          "https://images.unsplash.com/photo-1541888946425-d0fbb180c5f5?auto=format&fit=crop&w=800&q=80"
        ]
      });

      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Technical Finding logged and anchored to BIM Element!", type: "success" }
      }));

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: "Failed to create finding", type: "error" }
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#0F181F]/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col justify-between"
        >
          {/* Header */}
          <div className="p-5 bg-[#022C4F] text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-rose-500/20 text-rose-300 rounded-xl border border-rose-400/30">
                <AlertTriangle size={20} />
              </div>
              <h3 className="font-bold text-lg">Log Technical Finding</h3>
            </div>
            <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg text-white/80 cursor-pointer">
              <X size={18} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
            {/* Project & Element Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Project</label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Structural Element</label>
                <select
                  value={elementId}
                  onChange={(e) => setElementId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none"
                  required
                >
                  {elements.map(el => (
                    <option key={el.id} value={el.id}>{el.name} ({el.category})</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Finding Title */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Title / Finding Summary</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Rebar Spacing Discrepancy & Cover Deficiency"
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Taxonomy & Severity */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Taxonomy</label>
                <select
                  value={taxonomy}
                  onChange={(e) => setTaxonomy(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none"
                >
                  <option value="REBAR_SPACING_DEFICIENCY">Rebar Spacing Deficiency</option>
                  <option value="INSUFFICIENT_CONCRETE_COVER">Insufficient Concrete Cover</option>
                  <option value="SUBSURFACE_VOID">Subsurface Void (Honeycomb)</option>
                  <option value="INTER_LAYER_DELAMINATION">Inter-Layer Delamination</option>
                  <option value="LOW_PULSE_VELOCITY_ZONE">Low Pulse Velocity (UPV)</option>
                  <option value="BIM_GEOMETRIC_DEVIATION">BIM Geometric Deviation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 outline-none"
                >
                  <option value="CRITICAL">Critical (Stop-Work Risk)</option>
                  <option value="HIGH">High Severity</option>
                  <option value="MEDIUM">Medium Severity</option>
                  <option value="LOW">Low / Advisory</option>
                </select>
              </div>
            </div>

            {/* Depth & Variance */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Depth (mm)</label>
                <input
                  type="number"
                  value={depthMm}
                  onChange={(e) => setDepthMm(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Variance (mm)</label>
                <input
                  type="number"
                  value={deviationMm}
                  onChange={(e) => setDeviationMm(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Detailed Technical Observation</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Include scan reference, measured readings vs specification, and affected grid intersection."
                className="w-full p-2.5 border border-gray-200 rounded-xl text-xs text-gray-800 outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-900/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Logging..." : "Log Finding"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
