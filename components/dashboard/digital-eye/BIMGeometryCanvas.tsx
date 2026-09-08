"use client";

import React, { useEffect, useMemo, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { BIMModelGeometryElement } from '@/services/digitalEye';

/**
 * Shared renderer for the project's tessellated BIM geometry
 * (/digital-eye/bim-elements/geometry/). Extracted from BIMModelPreview so
 * every model surface on the platform renders the SAME real geometry — the
 * data-collection preview, the Trimble viewer, the scan-to-BIM overlay —
 * instead of each drawing its own placeholder (B8).
 */

// Element colour by IFC type — a restrained structural palette. Unselected
// elements render ghosted so the selected one stands out.
export const TYPE_COLORS: Record<string, string> = {
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
export const DEFAULT_COLOR = '#8f9bab';
export const SELECTED_COLOR = '#f59e0b'; // amber — the platform highlight idiom.
export const SELECTED_EDGE = '#fbbf24';

/** Normalised model size — the whole model is scaled so its largest
 *  dimension maps to this many scene units, whatever unit system the IFC
 *  used (Revit exports are typically millimetres). */
const FIT_SIZE = 36;

export interface ModelBounds {
  /** Raw IFC-coordinate bounding box. */
  min: [number, number, number];
  max: [number, number, number];
  center: [number, number, number];
  /** Scene scale applied to the whole model. */
  scale: number;
}

/** Whole-model bounding box over every element's vertices. */
export function computeBounds(elements: BIMModelGeometryElement[]): ModelBounds | null {
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
export function toScene(p: [number, number, number], b: ModelBounds): [number, number, number] {
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
  opacity,
  wireframe,
}: {
  el: BIMModelGeometryElement;
  isSelected: boolean;
  onSelect?: (guid: string) => void;
  /** Base opacity of unselected elements — 0.22 ghosts the model behind the
   *  amber selection; scan-to-BIM passes the operator's overlay slider. */
  opacity: number;
  /** Render every element as a wireframe (Trimble viewer mode). */
  wireframe: boolean;
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
          opacity={isSelected ? 1 : opacity}
          wireframe={wireframe}
          side={THREE.DoubleSide}
          emissive={isSelected ? '#7c3f00' : '#000000'}
        />
      </mesh>
      {edges && !wireframe && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial color={SELECTED_EDGE} />
        </lineSegments>
      )}
    </>
  );
}

/** The whole model as one scaled, centred group — usable inside any Canvas
 *  (e.g. next to a point-cloud overlay). */
export function BIMModelScene({
  elements,
  bounds,
  selectedGuid,
  onSelect,
  opacity = 0.22,
  wireframe = false,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
  onSelect?: (guid: string) => void;
  opacity?: number;
  wireframe?: boolean;
}) {
  // Scale the model to FIT_SIZE scene units and translate its bounding-box
  // centre to the origin, so a fixed camera distance fits every model
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
          opacity={opacity}
          wireframe={wireframe}
        />
      ))}
    </group>
  );
}

/**
 * Frames the camera on the whole model at mount (model is normalised to
 * FIT_SIZE, so a fixed distance fits every model) and zooms to the selected
 * element whenever the selection CHANGES.
 */
export function CameraRig({
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
 *  so a parent "Capture 3D View" button can render a frame and screenshot
 *  the canvas at the exact angle the operator framed. */
function SceneBridge({
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

/** A complete, self-contained Canvas rendering the tessellated model —
 *  orbit controls, grid, selection highlight and element click-picking. */
export default function BIMGeometryCanvas({
  elements,
  bounds,
  selectedGuid,
  onSelect,
  opacity = 0.22,
  wireframe = false,
  autoRotate = false,
  onSceneReady,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
  onSelect?: (guid: string) => void;
  opacity?: number;
  wireframe?: boolean;
  autoRotate?: boolean;
  onSceneReady?: (ctx: {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  }) => void;
}) {
  return (
    <Canvas
      camera={{ position: [44, 33, 44], fov: 50, near: 0.1, far: 2000 }}
      gl={{ preserveDrawingBuffer: !!onSceneReady }}
    >
      <color attach="background" args={['#0f172a']} />
      <ambientLight intensity={0.6} />
      <directionalLight position={[20, 30, 10]} intensity={1.1} />
      <directionalLight position={[-20, 10, -15]} intensity={0.4} />
      <BIMModelScene
        elements={elements}
        bounds={bounds}
        selectedGuid={selectedGuid}
        onSelect={onSelect}
        opacity={opacity}
        wireframe={wireframe}
      />
      <CameraRig elements={elements} bounds={bounds} selectedGuid={selectedGuid} />
      {onSceneReady && <SceneBridge onReady={onSceneReady} />}
      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.15}
        autoRotate={autoRotate}
        autoRotateSpeed={0.8}
      />
      <Grid infiniteGrid fadeDistance={120} fadeStrength={1.5} sectionColor="#1e293b" cellColor="#334155" />
    </Canvas>
  );
}
