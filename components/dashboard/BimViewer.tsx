"use client";

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Center } from '@react-three/drei';
import * as THREE from 'three';
import { PLYLoader } from 'three-stdlib';
import { Loader2 } from 'lucide-react';

interface BimViewerProps {
  plyUrl?: string;
  bimUrl?: string;
  /** Opacity of the BIM wireframe overlay, 0–1. */
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

/**
 * Reference wireframe standing in for the BIM model. Uploaded .ifc/.rvt
 * geometry cannot be parsed and rendered in the browser with the current
 * pipeline, so a fixed-size wireframe box is shown at the model's position
 * as a visual anchor for the point-cloud overlay.
 */
function BimWireframe({ opacity }: { opacity: number }) {
  return (
    <Center>
      <mesh>
        <boxGeometry args={[15, 30, 15]} />
        <meshStandardMaterial color="#10b981" wireframe={true} transparent opacity={opacity} />
      </mesh>
    </Center>
  );
}

export default function BimViewer({ plyUrl, bimUrl, bimOpacity = 0.4 }: BimViewerProps) {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);
  const [plyStatus, setPlyStatus] = useState<PlyStatus>('idle');

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

  // Release the last geometry on unmount.
  useEffect(() => () => geometry?.dispose(), [geometry]);

  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [30, 30, 30], fov: 50 }}>
        <color attach="background" args={['#0f172a']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />

        <Suspense fallback={null}>
          {geometry && <PlyPoints geometry={geometry} />}
          {/* The BIM model is represented by a reference wireframe — see
              BimWireframe above for why the real IFC/RVT geometry is not
              rendered in the browser. */}
          {bimUrl && <BimWireframe opacity={bimOpacity} />}
        </Suspense>

        <OrbitControls makeDefault />
        <Grid infiniteGrid fadeDistance={50} sectionColor="#1e293b" cellColor="#334155" />
      </Canvas>

      {bimUrl && (
        <div className="absolute bottom-3 left-3 bg-slate-900/80 text-slate-300 text-[10px] font-mono px-2.5 py-1.5 rounded-lg border border-slate-700 z-10 pointer-events-none">
          BIM shown as reference wireframe — IFC/RVT geometry is not renderable in-browser
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

      {!plyUrl && !bimUrl && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm z-10 pointer-events-none">
          <div className="bg-slate-800 p-4 rounded-xl flex flex-col items-center gap-3 border border-slate-700">
            <span className="text-slate-400 text-sm font-mono">Select a scan to render</span>
          </div>
        </div>
      )}
    </div>
  );
}
