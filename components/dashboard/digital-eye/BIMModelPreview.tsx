"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { Box, Camera, Loader2, AlertTriangle, Info, RotateCcw, Focus } from 'lucide-react';
import {
  BIMModelGeometry,
  BIMModelGeometryElement,
  BIMStructuralElement,
  getBIMModelGeometry,
  uploadSensorFile,
} from '@/services/digitalEye';
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

// Element colour by IFC type — a restrained structural palette. Unselected
// elements render ghosted so the selected one stands out.
const TYPE_COLORS: Record<string, string> = {
  IfcColumn: '#94a3b8',
  IfcWall: '#8d9aa8',
  IfcWallStandardCase: '#8d9aa8',
  IfcSlab: '#7c8b9a',
  IfcBeam: '#a3adb8',
  IfcStair: '#8896a4',
  IfcFooting: '#71808f',
  IfcPile: '#71808f',
  IfcRoof: '#9aa5b0',
};
const DEFAULT_COLOR = '#8f9bab';
const SELECTED_COLOR = '#f59e0b'; // amber — matches the platform highlight idiom.
const SELECTED_EDGE = '#fbbf24';

/** Normalised model size — the whole model is scaled so its largest
 *  dimension maps to this many scene units, whatever unit system the IFC
 *  used (Revit exports are typically millimetres). */
const FIT_SIZE = 36;

interface ModelBounds {
  /** Raw IFC-coordinate bounding box. */
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  /** Scene scale applied to the whole model. */
  scale: number;
}

/** Whole-model bounding box over every element's vertices. */
function computeBounds(elements: BIMModelGeometryElement[]): ModelBounds | null {
  const min: [number, number, number] = [Infinity, Infinity, Infinity];
  const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
  let seen = 0;
  for (const el of elements) {
    const v = el.verts || [];
    for (let i = 0; i + 2 < v.length; i += 3) {
      const x = v[i], y = v[i + 1], z = v[i + 2];
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) continue;
      seen++;
      if (x < min[0]) min[0] = x;
      if (y < min[1]) min[1] = y;
      if (z < min[2]) min[2] = z;
      if (x > max[0]) max[0] = x;
      if (y > max[1]) max[1] = y;
      if (z > max[2]) max[2] = z;
    }
  }
  if (seen === 0) return null;
  const size = Math.max(max[0] - min[0], max[1] - min[1], max[2] - min[2]);
  if (!Number.isFinite(size) || size <= 0) return null;
  return {
    min,
    max,
    center: [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2],
    scale: FIT_SIZE / size,
  };
}

/** Raw-IFC → normalised scene coordinate for a point. */
function toScene(p: [number, number, number], b: ModelBounds): [number, number, number] {
  return [
    (p[0] - b.center[0]) * b.scale,
    (p[1] - b.center[1]) * b.scale,
    (p[2] - b.center[2]) * b.scale,
  ];
}

function ElementMesh({
  el,
  isSelected,
  onSelect,
}: {
  el: BIMModelGeometryElement;
  isSelected: boolean;
  onSelect?: (guid: string) => void;
}) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(el.verts, 3));
    if (el.faces && el.faces.length > 0) {
      g.setIndex(el.faces);
    }
    g.computeVertexNormals();
    return g;
  }, [el]);

  // Bright edge outline for the selected element — makes the selection
  // change unmistakable even when the mesh is thin or buried.
  const edges = useMemo(
    () => (isSelected ? new THREE.EdgesGeometry(geometry, 20) : null),
    [geometry, isSelected],
  );

  // Release the GPU buffers when the element unmounts or the mesh changes.
  useEffect(() => () => {
    geometry.dispose();
    edges?.dispose();
  }, [geometry, edges]);

  const color = isSelected ? SELECTED_COLOR : (TYPE_COLORS[el.type] || DEFAULT_COLOR);

  return (
    <>
      <mesh
        geometry={geometry}
        onClick={onSelect && el.guid ? (e) => {
          e.stopPropagation();
          onSelect(el.guid);
        } : undefined}
        onPointerOver={onSelect ? () => {
          document.body.style.cursor = 'pointer';
        } : undefined}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          transparent
          opacity={isSelected ? 1 : 0.22}
          side={THREE.DoubleSide}
          emissive={isSelected ? '#7c3f00' : '#000000'}
        />
      </mesh>
      {edges && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={SELECTED_EDGE} />
        </lineSegments>
      )}
    </>
  );
}

/**
 * Frames the camera on the whole model at mount (model is normalised to
 * FIT_SIZE, so a fixed distance fits every model) and zooms to the selected
 * element whenever the selection CHANGES — picking a new target element in
 * the dropdown visibly snaps the view onto it. "Reset View" remounts the
 * Canvas, which restores the whole-model framing.
 */
function CameraRig({
  elements,
  bounds,
  selectedGuid,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
}) {
  const { camera, controls } = useThree();
  // On mount, the camera already frames the whole model — remember the
  // selection so the zoom only fires on an actual change.
  const lastGuid = useRef<string | null>(selectedGuid ?? null);

  useEffect(() => {
    if (!selectedGuid || lastGuid.current === selectedGuid) return;
    lastGuid.current = selectedGuid;
    const el = elements.find(e => e.guid === selectedGuid);
    if (!el) return;

    // Element bounding box in normalised scene coordinates.
    const min: [number, number, number] = [Infinity, Infinity, Infinity];
    const max: [number, number, number] = [-Infinity, -Infinity, -Infinity];
    const v = el.verts || [];
    for (let i = 0; i + 2 < v.length; i += 3) {
      const p: [number, number, number] = [v[i], v[i + 1], v[i + 2]];
      for (let a = 0; a < 3; a++) {
        if (p[a] < min[a]) min[a] = p[a];
        if (p[a] > max[a]) max[a] = p[a];
      }
    }
    if (!Number.isFinite(min[0])) return;
    const rawCenter: [number, number, number] = [
      (min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2,
    ];
    const c = toScene(rawCenter, bounds);
    const radius = Math.max(
      Math.hypot(max[0] - min[0], max[1] - min[1], max[2] - min[2]) * bounds.scale / 2,
      0.8,
    );

    camera.position.set(c[0] + radius * 2.4, c[1] + radius * 1.8, c[2] + radius * 2.4);
    camera.updateProjectionMatrix();
    const ctr = controls as unknown as { target?: THREE.Vector3; update?: () => void } | null;
    if (ctr?.target) {
      ctr.target.set(c[0], c[1], c[2]);
      ctr.update?.();
    }
  }, [selectedGuid, elements, bounds, camera, controls]);

  return null;
}

/** Exposes the live renderer/scene/camera to the parent (outside the Canvas)
 *  so the "Capture 3D View" button can render a frame and screenshot the
 *  canvas at the exact angle the operator framed. */
function CaptureBridge({
  onReady,
}: {
  onReady: (ctx: {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  }) => void;
}) {
  const { gl, scene, camera } = useThree();
  useEffect(() => {
    onReady({ gl, scene, camera });
  }, [gl, scene, camera, onReady]);
  return null;
}

function ModelScene({
  elements,
  bounds,
  selectedGuid,
  onSelect,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
  onSelect?: (guid: string) => void;
}) {
  // Scale the model to FIT_SIZE scene units and translate its bounding-box
  // centre to the origin, so the fixed camera distance fits every model
  // regardless of the IFC's unit system or world coordinates.
  const groupProps = {
    scale: bounds.scale,
    position: [
      -bounds.center[0] * bounds.scale,
      -bounds.center[1] * bounds.scale,
      -bounds.center[2] * bounds.scale,
    ] as [number, number, number],
  };
  return (
    <group {...groupProps}>
      {elements.map((el, i) => (
        <ElementMesh
          key={`${el.guid}-${i}`}
          el={el}
          isSelected={!!el.guid && el.guid === selectedGuid}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

/**
 * 3D preview of the project's imported BIM model (IFC upload, or RVT
 * translated to IFC via Autodesk). The meshes are tessellated server-side at
 * import time and served from /digital-eye/bim-elements/geometry/ — this
 * component only renders them. The selected target structural element is
 * highlighted amber with an edge outline while the rest of the model
 * ghost-fades, and the camera frames the selected element; clicking an
 * element selects it.
 */
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
          <Canvas
            key={viewEpoch}
            camera={{ position: [44, 33, 44], fov: 50, near: 0.1, far: 2000 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <color attach="background" args={['#0f172a']} />
            <ambientLight intensity={0.6} />
            <directionalLight position={[20, 30, 10]} intensity={1.1} />
            <directionalLight position={[-20, 10, -15]} intensity={0.4} />
            <ModelScene
              elements={geometry.elements}
              bounds={bounds}
              selectedGuid={selectedGuid}
              onSelect={onSelectElement}
            />
            <CameraRig
              elements={geometry.elements}
              bounds={bounds}
              selectedGuid={selectedGuid}
            />
            <CaptureBridge onReady={handleBridgeReady} />
            <OrbitControls makeDefault enableDamping dampingFactor={0.15} />
            <Grid infiniteGrid fadeDistance={120} fadeStrength={1.5} sectionColor="#1e293b" cellColor="#334155" />
          </Canvas>
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
