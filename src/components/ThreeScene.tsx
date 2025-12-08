// src/components/ThreeScene.tsx
import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment } from '@react-three/drei';
import { useModelStore, type ModelLayer } from '@/store/modelStore';
import * as THREE from 'three';

function SceneContent() {
  const { models, lights, selectedLightId } = useModelStore();

  return (
    <>
      <ambientLight intensity={0.2} />

      {/* 渲染所有燈光 */}
      {lights.map((light) => (
        <group key={light.id}>
          <primitive object={light.lightObj} />
          {light.helper && <primitive object={light.helper} />}
        </group>
      ))}

      {/* 模型 */}
      {models.map((layer) => (
        <primitive
          key={layer.id}
          object={layer.object}
          visible={layer.visible}
        />
      ))}

      <OrbitControls makeDefault />
      <Grid args={[20, 20]} />
      <Environment preset="city" />
    </>
  );
}

export default function ThreeScene() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="tl--w-full tl--h-full tl--bg-gray-900 tl--flex tl--items-center tl--justify-center">
        <div className="tl--text-white tl--text-lg">Loading 3D Engine...</div>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="tl--w-full tl--h-full tl--bg-gray-900 tl--flex tl--items-center tl--justify-center">
          <div className="tl--text-white tl--text-xl">Loading Scene...</div>
        </div>
      }
    >
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 45 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#1a1a1a')}
      >
        <SceneContent />
      </Canvas>
    </Suspense>
  );
}
