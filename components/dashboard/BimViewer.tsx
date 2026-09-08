"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three-stdlib';
import { Box, Loader2 } from 'lucide-react';
import {
  BIMModelGeometry,
  getBIMModelGeometry,
} from '@/services/digitalEye';
import { BIMModelScene, computeBounds, ModelBounds } from '@/components/dashboard/digital-eye/BIMGeometryCanvas';

interface BimViewerProps {
  plyUrl?: string;
  /** Kept for callers that still pass a raw BIM file URL — the real model is
   *  now rendered from the project's server-tessellated geometry, so this is
   *  only used to decide whether the BIM half is expected at all. */
  bimUrl?: string;
  /** Project whose imported BIM model overlays the point cloud (B8 — real
   *  tessellated geometry replaces the old placeholder wireframe box). */
  projectId?: string;
  /** Opacity of the BIM overlay, 0–1. */
  bimOpacity?: number;
}

type PlyStatus = 'idle' | 'loading' | 'error';

function PlyPoints({ geometry }: { geometry: THREE.BufferGeometry }) {
  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: geometry.hasAttribute('color'),
      color: geometry.hasAttribute('color') ? 0xffffff : 0x00aaff,
      transparent: true,
      opacity: 0.8,
    });
  }, [geometry]);

  return (
    <Center>
      <points geometry={geometry} material={material} />
    </Center>
  );
}

export default function BimViewer({ plyUrl, bimUrl, projectId, bimOpacity = 0.4 }: BimViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [plyStatus, setPlyStatus] = useState<PlyStatus>('idle');

  // The project's tessellated BIM model — the same geometry the Digital Eye
  // 3D preview renders. 404 / no geometry = no model imported (honest empty
  // state), never a placeholder shape.
  const [bimGeometry, setBimGeometry] = useState<BIMModelGeometry | null>(null);

  const [bimStatus, setBimStatus] = useState<'loading' | 'ready' | 'none'>('none');

  // The point cloud is loaded outside the Canvas so a failed fetch degrades to
  // an overlay message instead of an uncaught loader error that unmounts the page.
  useEffect(() => {
    if (!plyUrl) {
      setGeometry(null);
      setPlyStatus('idle');
      return;
    }

    let cancelled = false;
    setPlyStatus('loading');
    setGeometry((prev) => {
      prev?.dispose();
      return null;
    });

    new PLYLoader().load(
      plyUrl,
      (loaded) => {
        if (cancelled) {
          loaded.dispose();
          return;
        }
        setGeometry(loaded);
        setPlyStatus('idle');
      },
      undefined,
      () => {
        if (!cancelled) {
          setGeometry(null);
          setPlyStatus('error');
        }
      },
    );

    return () => {
      cancelled = true;
    };
  }, [plyUrl]);

  useEffect(() => {
    if (!projectId) {
      setBimGeometry(null);
      setBimStatus('none');
      return;
    }
    let cancelled = false;
    setBimStatus('loading');
    getBIMModelGeometry(projectId)
      .then((data) => {
        if (cancelled) return;
        if (!data || !data.elements || data.elements.length === 0) {
          setBimGeometry(null);
          setBimStatus('none');
          return;
        }
        setBimGeometry(data);
        setBimStatus('ready');
      })
      .catch(() => {
        if (cancelled) return;
        setBimGeometry(null);
        setBimStatus('none');
      });
    return () => { cancelled = true; };
  }, [projectId]);

  // Release the last geometry on unmount.
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const bounds: ModelBounds | null = useMemo(
    () => (bimGeometry ? computeBounds(bimGeometry.elements) : null),
    [bimGeometry],
  );

  const showBim = bimStatus === 'ready' && !!bounds;
  const bimExpected = !!projectId || !!bimUrl;

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [30, 30, 30], fov: 50 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1 } />

        <Suspense fallback={null}>
          {geometry && <PlyPoints geometry={geometry} />}
          {/* The BIM half is the project's real tessellated model, ghosted
              under the point cloud at the operator's chosen opacity. */}
          {showBim && bimGeometry && (
            <BIMModelScene elements={bimGeometry.elements} bounds={bounds} opacity={bimOpacity} />
          )}
        </Suspense>

        <OrbitControls makeDefault />
        <Grid infiniteGrid fadeDistance={50} sectionColor="#1e293b" cellColor="#334155" />
      </Canvas>

      {showBim && (
        <div className="absolute bottom-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none">
          BIM: {bimGeometry!.source_file} — {bimGeometry!.elements.length} element(s) overlaid on the scan
        </div>
      )}

      {bimStatus === 'loading' && (
        <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none flex items-center gap-1.5">
          <Loader2 size={11} className="animate-spin" />
          <span>Loading BIM model geometry…</span>
        </div>
      )}

      {bimExpected && !showBim && bimStatus === 'none' && (
        <div className="absolute top-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none flex items-center gap-1.5">
          <Box size={11} />
          <span>No BIM model imported for this project — showing the scan only</span>
        </div>
      )}

      {plyStatus === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
          <div className="bg-slate-800 p-4 rounded-xl flex items-center gap-3 border border-slate-700">
            <Loader2 size={18} className="animate-spin text-blue-400" />
            <span className="text-slate-300 text-sm font-mono">Loading point cloud…</span>
          </div>
        </div>
      )}

      {plyStatus === 'error' && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
          <div className="bg-slate-800 p-4 rounded-xl border border-red-900/60 max-w-sm text-center">
            <span className="text-amber-400 text-sm font-mono block">
              Point cloud could not be loaded
            </span>
            <span className="text-slate-500 text-xs font-mono block mt-1">
              The file is unavailable in storage for this session.
            </span>
          </div>
        </div>
      )}

      {!plyUrl && !bimExpected && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
          <div className="bg-slate-800 p-4 rounded-xl flex flex-col items-center gap-3 border border-slate-700">
            <span className="text-slate-400 text-sm font-mono">Select a scan to render</span>
          </div>
        </div>
      )}
    </div>
  );
}
