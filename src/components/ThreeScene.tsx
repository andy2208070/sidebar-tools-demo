// src/components/ThreeScene.tsx
import { Suspense, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, TransformControls, Grid, Environment } from '@react-three/drei';
import { useModelStore, type LayerItem } from '@/store/modelStore';
import * as THREE from 'three';

function SceneContent() {
  const { layers, selectedLayerId, selectLayer, updateLayer } = useModelStore();
  const { camera, gl } = useThree();

  // 點擊選取物件（燈光、helper 或模型）
  useEffect(() => {
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const handleClick = (event: MouseEvent) => {
      // 計算滑鼠在 NDC 的位置
      pointer.x = (event.clientX / gl.domElement.clientWidth) * 2 - 1;
      pointer.y = -(event.clientY / gl.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(pointer, camera);

      // 收集所有可點擊的物件（object + helper），過濾掉 undefined
      const allObjects: THREE.Object3D[] = layers
        .flatMap((l) => [l.object, l.helper])
        .filter((obj): obj is THREE.Object3D => obj !== undefined);

      const intersects = raycaster.intersectObjects(allObjects, true);

      if (intersects.length > 0) {
        const hitObject = intersects[0].object;

        // 找出被點到的 layer
        const foundLayer = layers.find((layer) => {
          return layer.object === hitObject || layer.helper === hitObject;
        });

        if (foundLayer) {
          selectLayer(foundLayer.id);
          return;
        }

        // 如果點到模型的子物件（常見於 glb/gltf）
        const parentLayer = layers.find((layer) =>
          layer.object.traverseAncestors((ancestor) => ancestor === hitObject)
        );
        if (parentLayer) {
          selectLayer(parentLayer.id);
        }
      } else {
        selectLayer(null);
      }
    };

    gl.domElement.addEventListener('click', handleClick);
    return () => gl.domElement.removeEventListener('click', handleClick);
  }, [layers, camera, gl, selectLayer]);

  return (
    <>
      <ambientLight intensity={0.2} />

      {/* 渲染所有圖層 */}
      {layers.map((layer: LayerItem) => (
        <group key={layer.id}>
          <primitive object={layer.object} visible={layer.visible} />
          {layer.helper && <primitive object={layer.helper} visible={layer.visible} />}
          
          {/* 選中時顯示 TransformControls */}
          {selectedLayerId === layer.id && (
            <TransformControls
              object={layer.object}
              mode="translate" // 可改成 "rotate" 或 "scale"，或之後加切換按鈕
              onChange={() => {
                updateLayer(layer.id, {
                  position: layer.object.position.toArray() as [number, number, number],
                  rotation: [
                    layer.object.rotation.x,
                    layer.object.rotation.y,
                    layer.object.rotation.z,
                  ] as [number, number, number],
                  scale: layer.object.scale.x,
                });
              }}
            />
          )}
        </group>
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
    return () => setMounted(false);
  }, []);

  if (!mounted) {
    return (
      <div className="tl--h-full tl--bg-gray-900 tl--flex tl--items-center tl--justify-center tl--text-white">
        Loading 3D Engine...
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="tl--h-full tl--bg-gray-900 tl--flex tl--items-center tl--justify-center tl--text-white tl--text-xl">
          Loading Scene...
        </div>
      }
    >
      <Canvas
        shadows
        camera={{ position: [10, 10, 10], fov: 45 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => gl.setClearColor('#111111')}
      >
        <SceneContent />
      </Canvas>
    </Suspense>
  );
}