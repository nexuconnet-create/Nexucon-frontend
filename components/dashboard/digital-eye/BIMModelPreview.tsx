"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import { Box, Camera, Loader2, AlertTriangle, Info, RotateCcw, Focus } from 'lucide-react';
import {
  BIMModelGeometry,
  BIMStructuralElement,
  getBIMModelGeometry,
  uploadSensorFile,
} from '@/services/digitalEye';
import BIMGeometryCanvas, {
  computeBounds,
  DEFAULT_COLOR,
  SELECTED_COLOR,
} from './BIMGeometryCanvas';
import BIMElementPropertiesPanel from './BIMElementPropertiesPanel';

interface BIMModelPreviewProps {
  projectId: string;
  /** GUID of the currently selected target element — highlighted amber. */
  selectedGuid?: string | null;
  /** Called when the operator clicks an element in the 3D preview. */
  onSelectElement?: (guid: string) => void;
  /** Bump to force a re-fetch (e.g. after a model re-import). */
  refreshKey?: number;
  /** Count of BIM element mappings already linked to the project — used to
   *  word the empty state honestly when elements exist but no stored
   *  geometry does (models imported before the 3D preview feature). */
  linkedElementCount?: number;
  /** The project's BIM element mapping records (from
   *  /digital-eye/bim-elements/) — matched by GUID to the selected mesh so
   *  the properties panel can list every attribute recorded for it. */
  structuralElements?: BIMStructuralElement[];
}

type LoadState = 'loading' | 'ready' | 'no-model' | 'no-geometry' | 'error';

export default function BIMModelPreview({
  projectId,
  selectedGuid,
  onSelectElement,
  refreshKey = 0,
  linkedElementCount = 0,
  structuralElements,
}: BIMModelPreviewProps) {
  const [geometry, setGeometry] = useState<BIMModelGeometry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  // Internal retry counter (error Retry button) + external refreshKey both
  // re-run the fetch effect.
  const [retryTick, setRetryTick] = useState(0);
  // Canvas remount key — "Reset View" re-frames the whole model.
  const [viewEpoch, setViewEpoch] = useState(0);
  // Live renderer/scene/camera from inside the Canvas (CaptureBridge).
  const bridgeRef = useRef<{
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  } | null>(null);
  const handleBridgeReady = useCallback(
    (ctx: { gl: THREE.WebGLRenderer; scene: THREE.Scene; camera: THREE.Camera }) => {
      bridgeRef.current = ctx;
    },
    [],
  );
  // Screenshot-of-the-preview upload state (used as the report's site map).
  const [captureState, setCaptureState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [captureMsg, setCaptureMsg] = useState<string>('');

  /** Screenshot the 3D preview at the operator's current camera angle and
   *  upload it as a project-level photo — the NDT report's site-map section
   *  embeds the most recent capture. */
  const handleCapture = async () => {
    const b = bridgeRef.current;
    if (!b || captureState === 'saving') return;
    setCaptureState('saving');
    setCaptureMsg('');
    try {
      b.gl.render(b.scene, b.camera);
      const dataUrl = b.gl.domElement.toDataURL('image/png');
      const blob = await (await fetch(dataUrl)).blob();
      const base = (geometry?.source_file || 'model')
        .replace(/\.[^.]+$/, '')
        .replace(/[^\w\- ]+/g, '')
        .trim() || 'model';
      const file = new File([blob], `BIM 3D view - ${base}.png`, { type: 'image/png' });
      await uploadSensorFile(
        file,
        'photo',
        'BIM 3D model view — captured from the platform model preview',
        projectId,
      );
      setCaptureState('saved');
    } catch (err: any) {
      setCaptureState('error');
      setCaptureMsg(
        err?.response?.data?.detail || err?.message || 'The capture could not be saved.',
      );
    }
  };

  useEffect(() => {
    if (!projectId) {
      setGeometry(null);
      setLoadState('no-model');
      return;
    }
    let cancelled = false;
    setLoadState('loading');
    getBIMModelGeometry(projectId)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setGeometry(null);
          setLoadState('no-model');
          return;
        }
        setGeometry(data);
        setLoadState(
          data.element_count === 0 || !data.elements || data.elements.length === 0
            ? 'no-geometry'
            : 'ready');
      })
      .catch((err: any) => {
        if (cancelled) return;
        setGeometry(null);
        setErrorMsg(err?.response?.data?.detail || err?.message || 'The model geometry could not be loaded.');
        // A 404 means no model was imported — the honest empty state, not
        // an error banner.
        if (err?.response?.status === 404) {
          setLoadState('no-model');
        } else {
          setLoadState('error');
        }
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, refreshKey, retryTick]);

  const elementCount = geometry?.elements?.length ?? 0;
  const bounds = useMemo(
    () => (geometry ? computeBounds(geometry.elements) : null),
    [geometry],
  );
  const hasScene = loadState === 'ready' && !!geometry && !!bounds;

  // The selected mesh + its BIM mapping record (matched by IFC GUID) — the
  // two halves of the element-properties panel.
  const selectedGeometryElement = useMemo(
    () => (selectedGuid && geometry ? geometry.elements.find(e => e.guid === selectedGuid) || null : null),
    [selectedGuid, geometry],
  );
  const selectedMapping = useMemo(
    () => (selectedGuid
      ? structuralElements?.find(el => el.element_guid === selectedGuid) || null
      : null),
    [selectedGuid, structuralElements],
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-8 overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
        <div>
          <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
            <Box size={16} className="text-amber-500" />
            <span>BIM Model Preview — {geometry?.source_file || 'No model imported'}</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {geometry?.source_file
              ? `${elementCount} element(s)${geometry.translated_from_rvt ? ' · translated from Revit (.rvt) via Autodesk' : ''}${geometry.updated_at ? ` · tessellated ${new Date(geometry.updated_at).toLocaleString()}` : ''}. The selected target element is highlighted amber and framed by the camera — click an element to select it and list its attributed properties in the panel beside the model.`
              : linkedElementCount > 0
                ? `${linkedElementCount} BIM element(s) linked, no stored 3D geometry — re-import the model file above to build the preview.`
                : 'Import the project IFC/RVT model above to render its 3D preview here.'}
          </p>
        </div>
        {hasScene && (
          <div className="flex items-center gap-2">
            {captureState === 'saved' && (
              <span className="text-xs text-emerald-600">
                Saved — used in the NDT report site map
              </span>
            )}
            {captureState === 'error' && (
              <span className="text-xs text-red-600 max-w-[240px] truncate" title={captureMsg}>
                {captureMsg}
              </span>
            )}
            <button
              onClick={handleCapture}
              disabled={captureState === 'saving'}
              className="px-3 py-1.5 border border-gray-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5 disabled:opacity-60"
              title="Screenshot the 3D preview at this angle and save it as the project's report site map (the most recent capture is used)"
            >
              {captureState === 'saving'
                ? <Loader2 size={12} className="animate-spin" />
                : <Camera size={12} />}
              <span>{captureState === 'saving' ? 'Saving…' : 'Capture 3D View'}</span>
            </button>
            <button
              onClick={() => setViewEpoch(e => e + 1)}
              className="px-3 py-1.5 border border-gray-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5"
              title="Reset the camera to frame the whole model"
            >
              <RotateCcw size={12} />
              <span>Reset View</span>
            </button>
          </div>
        )}
      </div>

      {/* Canvas + element-properties panel side by side on wide screens. */}
      <div className="flex flex-col xl:flex-row">
      <div className="relative w-full xl:flex-1 h-[560px] bg-slate-900">
        {hasScene && geometry && bounds && (
          <BIMGeometryCanvas
            key={viewEpoch}
            elements={geometry.elements}
            bounds={bounds}
            selectedGuid={selectedGuid}
            onSelect={onSelectElement}
            onSceneReady={handleBridgeReady}
          />
        )}

        {/* Permanently visible legend so the highlight is self-explanatory. */}
        {hasScene && (
          <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: SELECTED_COLOR }} />
            <span>Selected target element</span>
            <span className="text-slate-600 mx-1">|</span>
            <span className="inline-block w-2.5 h-2.5 rounded-sm" style={{ background: DEFAULT_COLOR, opacity: 0.45 }} />
            <span>Other elements</span>
          </div>
        )}

        {hasScene && (
          <div className="absolute bottom-3 right-3 bg-slate-900/80 text-slate-400 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none flex items-center gap-1.5">
            <Focus size={11} />
            <span>Drag to orbit · scroll to zoom · click an element to select it</span>
          </div>
        )}

        {loadState === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-3 border border-slate-700">
              <Loader2 size={18} className="animate-spin text-blue-400" />
              <span className="text-slate-300 text-sm font-mono">Loading model geometry…</span>
            </div>
          </div>
        )}

        {loadState === 'no-model' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-slate-800 p-5 rounded-xl flex flex-col items-center gap-2 border border-slate-700 max-w-sm text-center">
              <Info size={20} className="text-slate-400" />
              {linkedElementCount > 0 ? (
                <>
                  <span className="text-slate-300 text-sm font-mono">
                    {linkedElementCount} BIM element(s) linked — 3D preview not built yet
                  </span>
                  <span className="text-slate-500 text-xs font-mono">
                    This model was imported before 3D previews existed, and the source file is not
                    retained. Re-import the same IFC/RVT file above: existing elements are updated
                    (not duplicated) and the 3D preview is built with them.
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-300 text-sm font-mono">No BIM model imported for this project yet</span>
                  <span className="text-slate-500 text-xs font-mono">
                    Use “Import Structural Elements from BIM Model (IFC / Revit RVT)” above — the 3D preview appears here.
                  </span>
                </>
              )}
            </div>
          </div>
        )}

        {loadState === 'no-geometry' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-slate-800 p-5 rounded-xl flex flex-col items-center gap-2 border border-slate-700 max-w-sm text-center">
              <AlertTriangle size={20} className="text-amber-400" />
              <span className="text-slate-300 text-sm font-mono">No 3D geometry could be extracted from this model</span>
              <span className="text-slate-500 text-xs font-mono">
                {geometry?.source_file} imported — element metadata is available, but the model has no tessellable structural geometry.
              </span>
            </div>
          </div>
        )}

        {loadState === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="bg-slate-800 p-5 rounded-xl flex flex-col items-center gap-2 border border-red-900/60 max-w-sm text-center">
              <span className="text-rose-400 text-sm font-mono">Model preview could not be loaded</span>
              <span className="text-slate-500 text-xs font-mono">{errorMsg}</span>
              <button
                onClick={() => setRetryTick(t => t + 1)}
                className="mt-1 px-4 py-1.5 bg-[#022C4F] hover:bg-[#033c6c] text-white rounded-lg text-xs font-bold"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

        {/* Every property attributed to the selected element — shown once
            the model is rendered, with a how-to hint while nothing is
            selected. */}
        {hasScene && (
          <BIMElementPropertiesPanel
            geometryElement={selectedGeometryElement}
            geometry={geometry}
            mapping={selectedMapping}
          />
        )}
      </div>
    </div>
  );
}
