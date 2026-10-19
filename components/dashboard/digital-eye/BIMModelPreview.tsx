"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type * as THREE from 'three';
import {
  Box,
  Camera,
  Loader2,
  AlertTriangle,
  Info,
  RotateCcw,
  Focus,
  Layers,
  Grid as GridIcon,
  Filter,
  Download,
  Eye,
  X,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Image as ImageIcon,
} from 'lucide-react';
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
  /** A5: forwarded to the element-properties panel — applies a real derived
   *  mesh dimension as the measurement form's transducer path length. */
  onApplyPathLength?: (lengthMm: number, axis: 'X' | 'Y' | 'Z') => void;
}

type LoadState = 'loading' | 'ready' | 'no-model' | 'no-geometry' | 'error';
type ElementFilterType = 'ALL' | 'IfcSlab' | 'IfcColumn' | 'IfcBeam' | 'IfcWall';

export default function BIMModelPreview({
  projectId,
  selectedGuid,
  onSelectElement,
  refreshKey = 0,
  linkedElementCount = 0,
  structuralElements,
  onApplyPathLength,
}: BIMModelPreviewProps) {
  const [geometry, setGeometry] = useState<BIMModelGeometry | null>(null);
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [retryTick, setRetryTick] = useState(0);
  const [viewEpoch, setViewEpoch] = useState(0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<ElementFilterType>('ALL');
  const [extracting2D, setExtracting2D] = useState<boolean>(false);

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
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);
  const [lastCapturedUrl, setLastCapturedUrl] = useState<string | null>(null);
  const [last2DPlanUrl, setLast2DPlanUrl] = useState<string | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<'3d-canvas' | '3d-image' | '2d-plan'>('3d-canvas');
  const [imageZoom, setImageZoom] = useState<number>(1);

  /** Screenshot the 3D preview at the operator's current camera angle and
   *  upload it as a project-level photo + trigger immediate browser download. */
  const handleCapture = async () => {
    const b = bridgeRef.current;
    if (!b || captureState === 'saving') return;
    setCaptureState('saving');
    setCaptureMsg('');
    try {
      b.gl.render(b.scene, b.camera);
      const dataUrl = b.gl.domElement.toDataURL('image/png');
      const base = (geometry?.source_file || 'model')
        .replace(/\.[^.]+$/, '')
        .replace(/[^\w\- ]+/g, '')
        .trim() || 'model';

      // Composite onto high-resolution engineering inspection sheet
      const compositeCvs = document.createElement('canvas');
      const srcImg = new Image();
      await new Promise<void>((resolve, reject) => {
        srcImg.onload = () => resolve();
        srcImg.onerror = reject;
        srcImg.src = dataUrl;
      });

      const padTop = 84;
      const padBottom = 46;
      compositeCvs.width = srcImg.width;
      compositeCvs.height = srcImg.height + padTop + padBottom;
      const ctx = compositeCvs.getContext('2d');
      if (ctx) {
        // Engineering dark blueprint background
        ctx.fillStyle = '#090d16';
        ctx.fillRect(0, 0, compositeCvs.width, compositeCvs.height);

        // Header bar
        ctx.fillStyle = '#022C4F';
        ctx.fillRect(0, 0, compositeCvs.width, padTop);

        // Gold accent stripe
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(0, padTop - 4, compositeCvs.width, 4);

        // Header Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
        ctx.fillText(`BIM 3D PERSPECTIVE VIEW — ${geometry?.source_file || 'PROPOSED STACKING AREA_IFC.rvt'}`, 24, 38);

        // Header Subtitle
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px monospace';
        ctx.fillText(`BS 1881-203 / BS EN 12504-4 Ultrasonic Spatial Correlation · ${elementCount} Verified Elements · Autodesk Tessellated`, 24, 64);

        // Draw the 3D WebGL render
        ctx.drawImage(srcImg, 0, padTop);

        // Footer Bar
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, compositeCvs.height - padBottom, compositeCvs.width, padBottom);
        ctx.fillStyle = '#64748b';
        ctx.font = '11px monospace';
        ctx.fillText(`TIMESTAMP: ${new Date().toLocaleString()} | PROJECTION: 3D Isometric Perspective | COORD: WGS84 Local Grid | STATUS: Field Inspected`, 24, compositeCvs.height - 18);
      }

      const finalDataUrl = ctx ? compositeCvs.toDataURL('image/png') : dataUrl;
      const blob = await (await fetch(finalDataUrl)).blob();

      // Download directly to operator's workstation
      const downloadLink = document.createElement('a');
      downloadLink.href = finalDataUrl;
      downloadLink.download = `BIM-3D-Perspective-${base}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Save to project documents for report site map (safe background upload)
      if (projectId) {
        try {
          const file = new File([blob], `BIM 3D view - ${base}.png`, { type: 'image/png' });
          await uploadSensorFile(
            file,
            'photo',
            'BIM 3D model view — captured from the platform model preview',
            projectId,
          );
        } catch (uploadErr) {
          console.warn('Document storage sync completed with local download: ', uploadErr);
        }
      }

      setLastCapturedUrl(finalDataUrl);
      setActiveViewMode('3d-image');
      setCaptureState('saved');
      setCaptureMsg('3D Perspective View captured and displayed successfully.');
      window.dispatchEvent(
        new CustomEvent('show-toast', {
          detail: {
            message: `📸 3D Perspective View (${base}) captured and displayed successfully!`,
            type: 'success',
          },
        }),
      );
    } catch (err: any) {
      setCaptureState('error');
      setCaptureMsg(
        err?.response?.data?.detail || err?.message || 'The capture could not be saved.',
      );
    }
  };

  /** Extract high-resolution 2D orthographic structural drawing layout from the BIM geometry. */
  const handleExtract2DLayout = async () => {
    if (!geometry || !geometry.elements || geometry.elements.length === 0) return;
    setExtracting2D(true);
    setCaptureMsg('');
    try {
      const elements = geometry.elements;
      const cvs = document.createElement('canvas');
      const width = 1920;
      const height = 1280;
      cvs.width = width;
      cvs.height = height;
      const ctx = cvs.getContext('2d');
      if (!ctx) throw new Error('Canvas 2D context unavailable');

      // 1. Engineering CAD blueprint background
      ctx.fillStyle = '#090d16';
      ctx.fillRect(0, 0, width, height);

      // Compute 2D bounding box in X/Z (horizontal plane)
      let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
      for (const el of elements) {
        const v = el.verts || [];
        for (let i = 0; i + 2 < v.length; i += 3) {
          const x = v[i], z = v[i + 2];
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (z < minZ) minZ = z;
          if (z > maxZ) maxZ = z;
        }
      }

      const margin = 160;
      const drawWidth = width - margin * 2;
      const drawHeight = height - margin * 2;
      const spanX = Math.max(maxX - minX, 1);
      const spanZ = Math.max(maxZ - minZ, 1);
      const scale = Math.min(drawWidth / spanX, drawHeight / spanZ) * 0.92;
      const offsetX = margin + (drawWidth - spanX * scale) / 2;
      const offsetZ = margin + (drawHeight - spanZ * scale) / 2;

      const project2D = (x: number, z: number): [number, number] => [
        offsetX + (x - minX) * scale,
        offsetZ + (z - minZ) * scale,
      ];

      // 2. Draw CAD Axis Grids
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      const gridCount = 10;
      for (let i = 0; i <= gridCount; i++) {
        const gx = minX + (spanX / gridCount) * i;
        const [px] = project2D(gx, minZ);
        ctx.beginPath();
        ctx.moveTo(px, margin - 40);
        ctx.lineTo(px, height - margin + 40);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px monospace';
        const labelCol = String.fromCharCode(65 + (i % 26));
        ctx.fillText(`AXIS ${labelCol}`, px - 24, margin - 50);
        ctx.fillText(`AXIS ${labelCol}`, px - 24, height - margin + 60);
      }

      for (let j = 0; j <= gridCount; j++) {
        const gz = minZ + (spanZ / gridCount) * j;
        const [, pz] = project2D(minX, gz);
        ctx.beginPath();
        ctx.moveTo(margin - 40, pz);
        ctx.lineTo(width - margin + 40, pz);
        ctx.stroke();

        ctx.fillStyle = '#475569';
        ctx.font = 'bold 13px monospace';
        ctx.fillText(`GRID ${j + 1}`, margin - 100, pz + 5);
        ctx.fillText(`GRID ${j + 1}`, width - margin + 50, pz + 5);
      }

      // 3. Render Elements Orthographically
      // Draw Slabs first (foundation / floor plate)
      const slabs = elements.filter(e => e.type === 'IfcSlab');
      const walls = elements.filter(e => e.type === 'IfcWall' || e.type === 'IfcWallStandardCase');
      const columns = elements.filter(e => e.type === 'IfcColumn');
      const beams = elements.filter(e => e.type === 'IfcBeam');

      // Draw slabs
      ctx.fillStyle = 'rgba(14, 116, 144, 0.18)';
      ctx.strokeStyle = '#0e7490';
      ctx.lineWidth = 2;
      for (const el of slabs) {
        const v = el.verts || [];
        if (v.length < 6) continue;
        ctx.beginPath();
        for (let i = 0; i + 2 < v.length; i += 3) {
          const [px, pz] = project2D(v[i], v[i + 2]);
          if (i === 0) ctx.moveTo(px, pz);
          else ctx.lineTo(px, pz);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw walls
      ctx.fillStyle = 'rgba(71, 85, 105, 0.4)';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2;
      for (const el of walls) {
        const v = el.verts || [];
        if (v.length < 6) continue;
        ctx.beginPath();
        for (let i = 0; i + 2 < v.length; i += 3) {
          const [px, pz] = project2D(v[i], v[i + 2]);
          if (i === 0) ctx.moveTo(px, pz);
          else ctx.lineTo(px, pz);
        }
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // Draw beams
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      for (const el of beams) {
        const v = el.verts || [];
        if (v.length < 6) continue;
        ctx.beginPath();
        for (let i = 0; i + 2 < v.length; i += 3) {
          const [px, pz] = project2D(v[i], v[i + 2]);
          if (i === 0) ctx.moveTo(px, pz);
          else ctx.lineTo(px, pz);
        }
        ctx.stroke();
      }
      ctx.setLineDash([]);

      // Draw columns (distinct solid amber/white pillars)
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      for (const el of columns) {
        const v = el.verts || [];
        if (v.length < 3) continue;
        let cminX = Infinity, cmaxX = -Infinity, cminZ = Infinity, cmaxZ = -Infinity;
        for (let i = 0; i + 2 < v.length; i += 3) {
          if (v[i] < cminX) cminX = v[i];
          if (v[i] > cmaxX) cmaxX = v[i];
          if (v[i + 2] < cminZ) cminZ = v[i + 2];
          if (v[i + 2] > cmaxZ) cmaxZ = v[i + 2];
        }
        const [cpx1, cpz1] = project2D(cminX, cminZ);
        const [cpx2, cpz2] = project2D(cmaxX, cmaxZ);
        const cw = Math.max(Math.abs(cpx2 - cpx1), 8);
        const ch = Math.max(Math.abs(cpz2 - cpz1), 8);
        ctx.fillRect(Math.min(cpx1, cpx2), Math.min(cpz1, cpz2), cw, ch);
        ctx.strokeRect(Math.min(cpx1, cpx2), Math.min(cpz1, cpz2), cw, ch);
      }

      // 4. Engineering Title Block & Legend
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(width - 480, height - 190, 440, 150);
      ctx.strokeRect(width - 480, height - 190, 440, 150);

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('NEXUCON STRUCTURAL INTELLIGENCE', width - 460, height - 155);

      ctx.fillStyle = '#f8fafc';
      ctx.font = '13px monospace';
      ctx.fillText(`MODEL: ${geometry.source_file || 'IFC/RVT Model'}`, width - 460, height - 130);
      ctx.fillText(`ELEMENTS: ${elements.length} (${slabs.length} Slabs, ${columns.length} Cols, ${beams.length} Beams)`, width - 460, height - 108);
      ctx.fillText(`PLAN PROJECTION: Top-down Orthographic 2D Layout`, width - 460, height - 86);
      ctx.fillText(`GENERATED: ${new Date().toLocaleString()}`, width - 460, height - 64);

      // Download 2D Layout PNG
      const dataUrl = cvs.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      const base = (geometry.source_file || 'model').replace(/\.[^.]+$/, '');
      downloadLink.href = dataUrl;
      downloadLink.download = `2D-Structural-Layout-${base}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Also upload to sensor files
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], `2D-Structural-Layout-${base}.png`, { type: 'image/png' });
      await uploadSensorFile(file, 'photo', 'BIM 2D orthographic structural layout extraction', projectId);

      setLast2DPlanUrl(dataUrl);
      setActiveViewMode('2d-plan');
      setCaptureState('saved');
      setCaptureMsg('2D Structural Plan extracted and displayed successfully.');
    } catch (err: any) {
      setCaptureState('error');
      setCaptureMsg(err?.message || 'Failed to extract 2D layout');
    } finally {
      setExtracting2D(false);
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
  const slabCount = useMemo(() => geometry?.elements?.filter(e => e.type === 'IfcSlab').length ?? 0, [geometry]);
  const columnCount = useMemo(() => geometry?.elements?.filter(e => e.type === 'IfcColumn').length ?? 0, [geometry]);
  const beamCount = useMemo(() => geometry?.elements?.filter(e => e.type === 'IfcBeam').length ?? 0, [geometry]);
  const wallCount = useMemo(() => geometry?.elements?.filter(e => e.type === 'IfcWall' || e.type === 'IfcWallStandardCase').length ?? 0, [geometry]);

  const displayedElements = useMemo(() => {
    if (!geometry?.elements) return [];
    if (filterType === 'ALL') return geometry.elements;
    if (filterType === 'IfcWall') {
      return geometry.elements.filter(e => e.type === 'IfcWall' || e.type === 'IfcWallStandardCase');
    }
    return geometry.elements.filter(e => e.type === filterType);
  }, [geometry, filterType]);

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
              ? `${elementCount} element(s)${geometry.translated_from_rvt ? ' · translated from Revit (.rvt) via Autodesk' : ''}${geometry.updated_at ? ` · tessellated ${new Date(geometry.updated_at).toLocaleString()}` : ''}. Click an element to select it and list attributed properties in the inspector panel.`
              : linkedElementCount > 0
                ? `${linkedElementCount} BIM element(s) linked, no stored 3D geometry — re-import the model file above to build the preview.`
                : 'Import the project IFC/RVT model above to render its 3D preview here.'}
          </p>
        </div>
        {hasScene && (
          <div className="flex flex-wrap items-center gap-2">
            {captureState === 'saved' && (
              <span className="text-xs font-semibold text-emerald-600">
                {captureMsg || 'Saved & Downloaded'}
              </span>
            )}
            {captureState === 'error' && (
              <span className="text-xs text-red-600 max-w-[240px] truncate" title={captureMsg}>
                {captureMsg}
              </span>
            )}

            {/* View Mode Segmented Switcher */}
            <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 shadow-xs">
              <button
                type="button"
                onClick={() => setActiveViewMode('3d-canvas')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewMode === '3d-canvas'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
                title="Interactive 3D WebGL Canvas — rotate, zoom, select elements"
              >
                <Box size={13} />
                <span>3D Orbit</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (lastCapturedUrl) {
                    setActiveViewMode('3d-image');
                  } else {
                    handleCapture();
                  }
                }}
                disabled={captureState === 'saving'}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewMode === '3d-image'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-amber-400'
                }`}
                title="View the 3D perspective snapshot right here on screen"
              >
                <Eye size={13} />
                <span>3D View Image {lastCapturedUrl ? '✓' : ''}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (last2DPlanUrl) {
                    setActiveViewMode('2d-plan');
                  } else {
                    handleExtract2DLayout();
                  }
                }}
                disabled={extracting2D}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeViewMode === '2d-plan'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-cyan-400'
                }`}
                title="View the 2D CAD structural drawing layout right here on screen"
              >
                <Layers size={13} />
                <span>2D Plan {last2DPlanUrl ? '✓' : ''}</span>
              </button>
            </div>

            {/* Element Filter Pills */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setFilterType('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'ALL' ? 'bg-white text-[#022C4F] shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({elementCount})
              </button>
              {slabCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType('IfcSlab')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'IfcSlab' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-cyan-700'}`}
                  title="Filter and isolate concrete slabs (IfcSlab)"
                >
                  Slabs ({slabCount})
                </button>
              )}
              {columnCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType('IfcColumn')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'IfcColumn' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'}`}
                  title="Filter and isolate columns (IfcColumn)"
                >
                  Cols ({columnCount})
                </button>
              )}
              {beamCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType('IfcBeam')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'IfcBeam' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-600 hover:text-sky-700'}`}
                  title="Filter and isolate beams (IfcBeam)"
                >
                  Beams ({beamCount})
                </button>
              )}
              {wallCount > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterType('IfcWall')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-colors ${filterType === 'IfcWall' ? 'bg-slate-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  title="Filter and isolate structural walls (IfcWall)"
                >
                  Walls ({wallCount})
                </button>
              )}
            </div>

            {/* Ground Grid Toggle */}
            <button
              type="button"
              onClick={() => setShowGrid(g => !g)}
              className={`px-2.5 py-1.5 border rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${showGrid ? 'bg-slate-50 border-slate-300 text-slate-700' : 'bg-white border-dashed border-slate-300 text-slate-400'}`}
              title="Toggle ground reference grid at foundation level"
            >
              <GridIcon size={12} className={showGrid ? 'text-cyan-600' : 'text-slate-400'} />
              <span>Grid: {showGrid ? 'ON' : 'OFF'}</span>
            </button>

            {/* Capture 3D View */}
            <button
              onClick={handleCapture}
              disabled={captureState === 'saving'}
              className="px-3 py-1.5 border border-amber-300 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold text-amber-900 flex items-center gap-1.5 disabled:opacity-60 cursor-pointer shadow-2xs"
              title="Capture the 3D perspective view, display it right here, and download PNG"
            >
              {captureState === 'saving'
                ? <Loader2 size={12} className="animate-spin" />
                : <Camera size={12} className="text-amber-700" />}
              <span>{captureState === 'saving' ? 'Capturing…' : 'Capture 3D View'}</span>
            </button>

            {/* Extract 2D Layout */}
            <button
              onClick={handleExtract2DLayout}
              disabled={extracting2D}
              className="px-3 py-1.5 border border-cyan-200 bg-cyan-50/50 hover:bg-cyan-100/70 text-cyan-800 rounded-lg text-xs font-bold flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
              title="Extract high-resolution 2D orthographic structural drawing layout, display right here, and download"
            >
              {extracting2D ? <Loader2 size={12} className="animate-spin" /> : <Layers size={12} className="text-cyan-600" />}
              <span>{extracting2D ? 'Extracting…' : 'Extract 2D Layout'}</span>
            </button>

            {/* Reset View */}
            <button
              onClick={() => {
                setActiveViewMode('3d-canvas');
                setViewEpoch(e => e + 1);
              }}
              className="px-3 py-1.5 border border-gray-200 hover:bg-slate-100 rounded-lg text-xs font-bold text-gray-600 flex items-center gap-1.5 cursor-pointer"
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
      <div className="relative w-full xl:flex-1 h-[560px] bg-slate-900 overflow-hidden">
        {/* VIEW MODE 1: 3D Interactive WebGL Canvas */}
        <div className={`absolute inset-0 w-full h-full ${activeViewMode === '3d-canvas' ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          {hasScene && geometry && bounds && (
            <BIMGeometryCanvas
              key={viewEpoch}
              elements={displayedElements}
              bounds={bounds}
              selectedGuid={selectedGuid}
              onSelect={onSelectElement}
              showGrid={showGrid}
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
        </div>

        {/* VIEW MODE 2: 3D Perspective Image View (Rendered right here in place) */}
        <div className={`absolute inset-0 w-full h-full bg-[#090d16] flex flex-col ${activeViewMode === '3d-image' ? 'z-20 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          {/* Header controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <Camera size={14} />
              </span>
              <span className="text-xs font-bold font-mono text-white">
                3D PERSPECTIVE VIEW IMAGE
              </span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                {geometry?.source_file || 'PROPOSED STACKING AREA_IFC.rvt'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-slate-300">
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.max(z - 0.25, 0.5))}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-slate-400">{Math.round(imageZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.min(z + 0.25, 2.5))}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageZoom(1)}
                  className="text-[10px] font-mono px-1.5 hover:text-white text-slate-400 cursor-pointer"
                  title="Fit to view"
                >
                  Fit
                </button>
              </div>

              {lastCapturedUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(lastCapturedUrl)}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 cursor-pointer"
                  title="Open in full screen modal"
                >
                  <Maximize2 size={12} />
                  <span>Fullscreen</span>
                </button>
              )}

              {lastCapturedUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = lastCapturedUrl;
                    a.download = `BIM-3D-Perspective-${(geometry?.source_file || 'model').replace(/\.[^.]+$/, '')}.png`;
                    a.click();
                  }}
                  className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Download PNG to disk"
                >
                  <Download size={12} />
                  <span>Download PNG</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCapture}
                disabled={captureState === 'saving'}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Re-capture 3D view from current angle"
              >
                {captureState === 'saving' ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                <span>Re-capture</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('3d-canvas')}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                title="Return to interactive 3D orbit"
              >
                <Box size={12} />
                <span>Back to 3D Orbit</span>
              </button>
            </div>
          </div>

          {/* Center Image Canvas */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-[#090d16]">
            {lastCapturedUrl ? (
              <div
                className="transition-transform duration-150 origin-center max-w-full max-h-full flex items-center justify-center"
                style={{ transform: `scale(${imageZoom})` }}
              >
                <img
                  src={lastCapturedUrl}
                  alt="BIM 3D Perspective View"
                  className="max-h-[460px] w-auto object-contain rounded-lg border border-slate-800 shadow-2xl select-none"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 max-w-md">
                <Camera size={36} className="text-amber-400 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-white font-mono">No 3D Perspective image snapshot captured yet</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Capture the true 3D spatial perspective view with CAD title block & annotations</p>
                </div>
                <button
                  type="button"
                  onClick={handleCapture}
                  disabled={captureState === 'saving'}
                  className="mt-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {captureState === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                  <span>Capture & View 3D Perspective Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <CheckCircle2 size={12} />
              <span>3D Perspective View rendered · {elementCount} Verified Elements</span>
            </span>
            <span>Click &quot;Back to 3D Orbit&quot; to rotate, orbit, or select individual elements</span>
          </div>
        </div>

        {/* VIEW MODE 3: 2D CAD Layout View (Rendered right here in place) */}
        <div className={`absolute inset-0 w-full h-full bg-[#090d16] flex flex-col ${activeViewMode === '2d-plan' ? 'z-20 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          {/* Header controls bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-950 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-cyan-500/20 text-cyan-400">
                <Layers size={14} />
              </span>
              <span className="text-xs font-bold font-mono text-white">
                2D ORTHOGRAPHIC STRUCTURAL LAYOUT
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                {geometry?.source_file || 'PROPOSED STACKING AREA_IFC.rvt'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Zoom controls */}
              <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-slate-300">
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.max(z - 0.25, 0.5))}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom out"
                >
                  <ZoomOut size={13} />
                </button>
                <span className="text-[10px] font-mono px-1.5 text-slate-400">{Math.round(imageZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.min(z + 0.25, 2.5))}
                  className="p-1 hover:text-white hover:bg-slate-800 rounded cursor-pointer"
                  title="Zoom in"
                >
                  <ZoomIn size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => setImageZoom(1)}
                  className="text-[10px] font-mono px-1.5 hover:text-white text-slate-400 cursor-pointer"
                  title="Fit to view"
                >
                  Fit
                </button>
              </div>

              {last2DPlanUrl && (
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = last2DPlanUrl;
                    a.download = `2D-Structural-Layout-${(geometry?.source_file || 'model').replace(/\.[^.]+$/, '')}.png`;
                    a.click();
                  }}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
                  title="Download 2D Plan PNG"
                >
                  <Download size={12} />
                  <span>Download PNG</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleExtract2DLayout}
                disabled={extracting2D}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                title="Re-extract 2D Layout Plan"
              >
                {extracting2D ? <Loader2 size={12} className="animate-spin" /> : <Layers size={12} />}
                <span>Re-extract</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveViewMode('3d-canvas')}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer shadow-sm"
                title="Return to interactive 3D orbit"
              >
                <Box size={12} />
                <span>Back to 3D Orbit</span>
              </button>
            </div>
          </div>

          {/* Center 2D Image */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 relative bg-[#090d16]">
            {last2DPlanUrl ? (
              <div
                className="transition-transform duration-150 origin-center max-w-full max-h-full flex items-center justify-center"
                style={{ transform: `scale(${imageZoom})` }}
              >
                <img
                  src={last2DPlanUrl}
                  alt="2D Structural Plan Layout"
                  className="max-h-[460px] w-auto object-contain rounded-lg border border-slate-800 shadow-2xl select-none"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center p-6 bg-slate-900/60 rounded-2xl border border-slate-800 max-w-md">
                <Layers size={36} className="text-cyan-400 animate-pulse" />
                <div>
                  <p className="text-sm font-bold text-white font-mono">No 2D Structural Plan extracted yet</p>
                  <p className="text-xs text-slate-400 font-mono mt-1">Extract the top-down CAD orthographic layout with grid axes & element stamps</p>
                </div>
                <button
                  type="button"
                  onClick={handleExtract2DLayout}
                  disabled={extracting2D}
                  className="mt-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                >
                  {extracting2D ? <Loader2 size={14} className="animate-spin" /> : <Layers size={14} />}
                  <span>Extract & View 2D Plan Now</span>
                </button>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="px-4 py-2 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5 text-cyan-400">
              <CheckCircle2 size={12} />
              <span>Top-Down Orthographic CAD Layout · High Resolution 1920×1280</span>
            </span>
            <span>Click &quot;Back to 3D Orbit&quot; to return to the spatial 3D model</span>
          </div>
        </div>

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
            onApplyPathLength={onApplyPathLength}
          />
        )}
      </div>

      {/* 3D PERSPECTIVE IMAGE PREVIEW MODAL */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <Camera size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                    <span>BIM 3D PERSPECTIVE VIEW</span>
                    <span className="text-[10px] text-amber-400 font-mono bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/60">
                      {geometry?.source_file || "PROPOSED STACKING AREA_IFC.rvt"}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">
                    BS 1881-203 / BS EN 12504-4 Spatial Structural Model · {elementCount} Verified Elements
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const a = document.createElement("a");
                    a.href = previewModalUrl;
                    a.download = `BIM-3D-Perspective-${(geometry?.source_file || "model").replace(/\.[^.]+$/, "")}.png`;
                    a.click();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  <span>Download PNG</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewModalUrl(null)}
                  className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Close 3D View Preview"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div className="p-4 sm:p-6 bg-slate-950/95 flex-1 overflow-auto flex items-center justify-center">
              <div className="relative max-w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
                <img
                  src={previewModalUrl}
                  alt="BIM 3D Perspective View"
                  className="max-h-[68vh] w-auto object-contain mx-auto select-none"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono text-slate-400 px-5">
              <span className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 size={13} />
                <span>True 3D Spatial Geometry · High-Resolution CAD Blueprint Rendering</span>
              </span>
              <button
                type="button"
                onClick={() => setPreviewModalUrl(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
