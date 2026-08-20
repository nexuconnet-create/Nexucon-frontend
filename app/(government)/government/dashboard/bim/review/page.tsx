"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { 
  FileSearch, MessageSquare, Check, X, 
  Maximize, Minimize, MousePointer2, Ruler, 
  BoxSelect, Camera, MoreHorizontal, Send, RefreshCw, Award
} from "lucide-react";
import { BIMModel, BIMAnnotation, getBIMModels, getBIMAnnotations, createBIMAnnotation, resolveBIMAnnotation, requestBIMChanges } from "@/services/bim";
import CertifyBIMModelModal from "@/components/dashboard/CertifyBIMModelModal";

export default function DesignReview() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTool, setActiveTool] = useState('select');
  const [models, setModels] = useState<BIMModel[]>([]);
  const [activeModel, setActiveModel] = useState<BIMModel | null>(null);
  const [annotations, setAnnotations] = useState<BIMAnnotation[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCertifyModalOpen, setIsCertifyModalOpen] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const modelsData = await getBIMModels();
      setModels(modelsData);
      const current = modelsData.length > 0 ? modelsData[0] : null;
      setActiveModel(current);

      const annotationsData = await getBIMAnnotations(current ? { model: current.id } : undefined);
      setAnnotations(annotationsData);
    } catch (err) {
      console.error("Failed to load review data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !activeModel) return;

    try {
      await createBIMAnnotation({
        model: activeModel.id,
        project: activeModel.project,
        text: newComment,
        author_role: 'Lead Architect',
        priority: 'High',
        status: 'Open'
      });
      setNewComment('');
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Review annotation posted!', type: 'success' } 
      }));
      const updated = await getBIMAnnotations({ model: activeModel.id });
      setAnnotations(updated);
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to post comment', type: 'error' } }));
    }
  };

  const handleResolveComment = async (annId: string) => {
    try {
      await resolveBIMAnnotation(annId, { notes: 'Resolved by review team.' });
      window.dispatchEvent(new CustomEvent('show-toast', { 
        detail: { message: 'Annotation thread marked resolved!', type: 'success' } 
      }));
      if (activeModel) {
        const updated = await getBIMAnnotations({ model: activeModel.id });
        setAnnotations(updated);
      }
    } catch (err) {
      window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Failed to resolve', type: 'error' } }));
    }
  };

  return (
    <div className={`w-full ${isFullscreen ? 'fixed inset-0 z-50 bg-gray-100 flex flex-col' : 'min-h-[calc(100vh-8rem)] flex flex-col'}`}>
      
      {/* Header */}
      <div className={`flex items-center justify-between gap-4 mb-4 ${isFullscreen ? 'p-4 bg-white border-b shadow-sm' : ''}`}>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#022C4F] flex items-center gap-3">
            <FileSearch className="text-blue-500" />
            Design Review: {activeModel ? activeModel.name : 'Model Review'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {activeModel ? `Reviewing ${activeModel.discipline} Model ${activeModel.current_version} (${activeModel.format})` : 'Multi-Disciplinary Model Examination'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsCertifyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-rose-200 text-rose-600 rounded-xl hover:bg-rose-50 transition-colors shadow-sm text-sm font-semibold"
          >
            <X size={16} />
            Request Changes
          </button>
          <button 
            onClick={() => setIsCertifyModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-md text-sm font-semibold"
          >
            <Award size={16} />
            Approve & Certify
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col lg:flex-row gap-6 ${isFullscreen ? 'p-4 overflow-hidden' : ''}`}>
        
        {/* Left: 3D Viewer Area */}
        <div className={`relative flex-1 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-200 shadow-inner overflow-hidden min-h-[400px] flex flex-col`}>
          {/* Viewer Toolbar */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/10 backdrop-blur-md border border-white/20 p-1.5 rounded-xl z-10 shadow-lg">
            {[
              { id: 'select', icon: MousePointer2, label: 'Select' },
              { id: 'measure', icon: Ruler, label: 'Measure' },
              { id: 'section', icon: BoxSelect, label: 'Section Box' },
              { id: 'snapshot', icon: Camera, label: 'Snapshot' },
            ].map(tool => (
              <button 
                key={tool.id}
                onClick={() => {
                  setActiveTool(tool.id);
                  if (tool.id === 'snapshot') {
                    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message: 'Viewpoint snapshot captured with camera orientation coordinates!', type: 'info' } }));
                  }
                }}
                title={tool.label}
                className={`p-2 rounded-lg transition-colors ${
                  activeTool === tool.id ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-white/20 hover:text-white'
                }`}
              >
                <tool.icon size={18} />
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-lg hover:bg-white/20 transition-colors z-10"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          {/* Grid Background */}
          <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" style={{ backgroundSize: '50px' }}></div>
          
          <div className="flex-1 flex items-center justify-center relative z-0">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto border-4 border-blue-500/30 rounded-xl mb-4 animate-pulse flex items-center justify-center bg-blue-500/10 backdrop-blur-sm">
                <FileSearch size={40} className="text-blue-400" />
              </div>
              <p className="text-gray-300 font-bold">{activeModel ? activeModel.name : 'Interactive 3D WebGL Viewer'}</p>
              <p className="text-xs text-gray-400 mt-1">LOD: {activeModel?.lod || 'LOD 300'} • Elements: {activeModel?.element_count || 12450}</p>
            </div>
          </div>

          {/* Context Tool Overlay */}
          {activeTool === 'measure' && (
            <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md border border-white/10 text-white text-xs px-3 py-2 rounded-xl">
              Measurement Tool Active: Snap to vertex to calculate distance & clearance.
            </div>
          )}
        </div>

        {/* Right: Comments / Threads */}
        <div className={`w-full lg:w-[400px] flex flex-col bg-white rounded-2xl border border-gray-100 shadow-sm ${isFullscreen ? 'h-full' : 'h-[600px] lg:h-auto'}`}>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <MessageSquare size={18} className="text-blue-500" />
              Review Comments & BCF
            </h3>
            <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded">
              {annotations.length} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {isLoading ? (
              <div className="py-10 text-center text-slate-400 text-xs">Loading comments...</div>
            ) : annotations.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">
                No review comments yet. Add an observation below.
              </div>
            ) : (
              annotations.map((comment, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  key={comment.id}
                  className={`p-4 rounded-xl border ${
                    comment.status === 'Resolved' ? 'bg-gray-50 border-gray-100 opacity-70' : 'bg-blue-50/30 border-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {comment.author_name ? comment.author_name.charAt(0) : 'R'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-none">{comment.author_name}</p>
                        <p className="text-[10px] text-gray-500 mt-1">{comment.author_role} • {new Date(comment.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      comment.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {comment.priority}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mt-3">{comment.text}</p>
                  
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-100/50">
                    {comment.status === 'Resolved' ? (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded inline-flex">
                        <Check size={12} /> Resolved
                      </div>
                    ) : (
                      <button 
                        onClick={() => handleResolveComment(comment.id)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                      >
                        <Check size={12} /> Mark as Resolved
                      </button>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="relative">
              <textarea 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a review comment or BCF markup..." 
                className="w-full pl-3 pr-10 py-3 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white"
                rows={3}
              ></textarea>
              <button 
                type="submit"
                className="absolute bottom-3 right-3 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Send size={14} />
              </button>
            </div>
          </form>
        </div>
        
      </div>

      <CertifyBIMModelModal
        isOpen={isCertifyModalOpen}
        onClose={() => setIsCertifyModalOpen(false)}
        model={activeModel}
        onSuccess={fetchData}
      />
    </div>
  );
}
