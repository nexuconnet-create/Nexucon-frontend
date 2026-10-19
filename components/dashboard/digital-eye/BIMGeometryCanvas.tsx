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
  /** Whether the model coordinates use IFC Z-up convention. */
  isZUp?: boolean;
}

/** Whole-model bounding box over every element's vertices.
 *  Aligns IFC Z-up coordinates with Three.js Y-up so floor slabs and laydown areas
 *  lie horizontally on the foundation ground plane with authentic 3D depth. */
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
  const spanX = max[0] - min[0];
  const spanY = max[1] - min[1];
  const spanZ = max[2] - min[2];
  const size = Math.max(spanX, spanY, spanZ);
  if (!Number.isFinite(size) || size <= 0) return null;

  // In IFC / Revit world coordinates, +Z is vertical elevation, X is East/West, Y is North/South.
  // In Three.js, +Y is vertical elevation, X is Right, +Z is Depth.
  // Standard building & infrastructure IFCs have Z as elevation (e.g. 200mm slab thickness).
  const isZUp = true;

  const center: [number, number, number] = isZUp
    ? [(min[0] + max[0]) / 2, (min[2] + max[2]) / 2, -((min[1] + max[1]) / 2)]
    : [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, (min[2] + max[2]) / 2];

  const boundsMin: [number, number, number] = isZUp
    ? [min[0], min[2], -max[1]]
    : min;
  const boundsMax: [number, number, number] = isZUp
    ? [max[0], max[2], -min[1]]
    : max;

  return {
    min: boundsMin,
    max: boundsMax,
    center,
    scale: FIT_SIZE / size,
    isZUp,
  };
}

/** Raw-IFC → normalised scene coordinate for a point. */
export function toScene(p: [number, number, number], b: ModelBounds): [number, number, number] {
  const pThree: [number, number, number] = b.isZUp
    ? [p[0], p[2], -p[1]]
    : p;
  return [
    (pThree[0] - b.center[0]) * b.scale,
    (pThree[1] - b.center[1]) * b.scale,
    (pThree[2] - b.center[2]) * b.scale,
  ];
}

function ElementMesh({
  el,
  isSelected,
  onSelect,
  opacity,
  wireframe,
  bounds,
}: {
  el: BIMModelGeometryElement;
  isSelected: boolean;
  onSelect?: (guid: string) => void;
  /** Base opacity of unselected elements. */
  opacity: number;
  /** Render every element as a wireframe (Trimble viewer mode). */
  wireframe: boolean;
  bounds: ModelBounds;
}) {
  const [hovered, setHovered] = React.useState(false);

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const v = el.verts || [];
    const count = v.length;
    const positions = new Float32Array(count);
    if (bounds.isZUp) {
      // Map IFC (X, Y, Z) to Three.js (X, Z, -Y):
      for (let i = 0; i < count; i += 3) {
        positions[i] = v[i];
        positions[i + 1] = v[i + 2];
        positions[i + 2] = -v[i + 1];
      }
    } else {
      positions.set(v);
    }
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    if (el.faces && el.faces.length > 0) {
      g.setIndex(el.faces);
    }
    g.computeVertexNormals();
    return g;
  }, [el, bounds.isZUp]);

  // Clean edge outline for all elements: subtle construction joints for unselected,
  // vivid amber for the selected target element.
  const edges = useMemo(() => new THREE.EdgesGeometry(geometry, 25), [geometry]);

  // Release the GPU buffers when the element unmounts or the mesh changes.
  useEffect(() => () => {
    geometry.dispose();
    edges.dispose();
  }, [geometry, edges]);

  const color = isSelected ? SELECTED_COLOR : (hovered ? '#cbd5e1' : (TYPE_COLORS[el.type] || DEFAULT_COLOR));

  return (
    <>
      <mesh
        geometry={geometry}
        onClick={onSelect && el.guid ? (e) => {
          e.stopPropagation();
          onSelect(el.guid);
        } : undefined}
        onPointerOver={onSelect ? (e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        } : undefined}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'auto';
        }}
      >
        <meshStandardMaterial
          color={color}
          roughness={0.42}
          metalness={0.12}
          transparent={opacity < 0.98}
          opacity={isSelected ? 1.0 : (hovered ? 1.0 : opacity)}
          wireframe={wireframe}
          side={THREE.DoubleSide}
          emissive={isSelected ? '#b45309' : (hovered ? '#1e293b' : '#000000')}
        />
      </mesh>
      {!wireframe && (
        <lineSegments geometry={edges}>
          <lineBasicMaterial
            color={isSelected ? SELECTED_EDGE : '#334155'}
            transparent
            opacity={isSelected ? 1.0 : 0.45}
            linewidth={isSelected ? 2 : 1}
          />
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
  opacity = 0.92,
  wireframe = false,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
  onSelect?: (guid: string) => void;
  opacity?: number;
  wireframe?: boolean;
}) {
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
          opacity={selectedGuid ? (el.guid === selectedGuid ? 1.0 : 0.65) : opacity}
          wireframe={wireframe}
          bounds={bounds}
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

    camera.position.set(c[0] + radius * 2.2, c[1] + radius * 1.6, c[2] + radius * 2.2);
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
  opacity = 0.92,
  wireframe = false,
  autoRotate = false,
  showGrid = true,
  onSceneReady,
}: {
  elements: BIMModelGeometryElement[];
  bounds: ModelBounds;
  selectedGuid?: string | null;
  onSelect?: (guid: string) => void;
  opacity?: number;
  wireframe?: boolean;
  autoRotate?: boolean;
  showGrid?: boolean;
  onSceneReady?: (ctx: {
    gl: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.Camera;
  }) => void;
}) {
  const modelBottomY = (bounds.min[1] - bounds.center[1]) * bounds.scale - 0.05;

  return (
    <Canvas
      camera={{ position: [32, 22, 32], fov: 45, near: 0.1, far: 2000 }}
      gl={{ preserveDrawingBuffer: true, antialias: true }}
    >
      <color attach="background" args={['#090d16']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[25, 40, 18]} intensity={1.2} />
      <directionalLight position={[-25, 20, -18]} intensity={0.5} />
      <directionalLight position={[0, -20, 0]} intensity={0.2} />
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
      {showGrid && (
        <Grid
          infiniteGrid
          position={[0, modelBottomY, 0]}
          fadeDistance={140}
          fadeStrength={1.4}
          sectionColor="#334155"
          cellColor="#1e293b"
          sectionSize={3}
          cellSize={1}
          raycast={() => null}
        />
      )}
    </Canvas>
  );
}
