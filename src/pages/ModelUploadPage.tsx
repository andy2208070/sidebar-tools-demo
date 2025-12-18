// src/pages/ModelUploadPage.tsx
import { useState } from 'react';
import { Upload, message, Alert } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as THREE from 'three';
import ThreeScene from '@/components/ThreeScene';
import LayerPanel from '@/components/LayerPanel';
import DetailPanel from '@/components/DetailPanel';
import { useModelStore } from '@/store/modelStore';

const { Dragger } = Upload;

export default function ModelUploadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const addLayer = useModelStore((s) => s.addLayer);

  const handleFile = (file: File) => {
    setLoading(true);
    setError(null);

    const url = URL.createObjectURL(file);

    const loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    loader.setDRACOLoader(dracoLoader);

    loader.load(
      url,
      (gltf) => {
        try {
          const group = new THREE.Group();
          gltf.scene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          group.add(gltf.scene);

          // 自動置中 + 縮放
          const box = new THREE.Box3().setFromObject(group);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = maxDim === 0 ? 1 : 5 / maxDim;
          group.scale.multiplyScalar(scale);
          group.position.sub(center.multiplyScalar(scale));

          // 加入到圖層系統
          addLayer({
            id: crypto.randomUUID(),
            name: file.name.replace(/\.(glb|gltf)$/i, ''),
            type: 'model',
            visible: true,
            object: group,
          });

          message.success(`${file.name} 上傳成功`);
        } catch (err) {
          console.error(err);
          message.error('模型處理失敗');
        } finally {
          setLoading(false);
        }
      },
      undefined,
      (err) => {
        console.error(err);
        setError('模型載入失敗，請確認是有效的 .glb 或 .gltf 檔案');
        message.error('載入失敗');
        setLoading(false);
      }
    );

    URL.revokeObjectURL(url);
    return false; // 阻止 antd 自動上傳
  };

  const draggerProps = {
    name: 'file',
    multiple: true,
    beforeUpload: handleFile,
    showUploadList: false,
  };

  return (
    <div className="tl--h-screen tl--flex tl--bg-gray-900">
      {/* 左側 3D 畫面 */}
      <div className="tl--flex-1 tl--relative">
        <ThreeScene />
        {error && (
          <div className="tl--absolute tl--top-4 tl--left-4 tl--z-10">
            <Alert
              message={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
            />
          </div>
        )}
      </div>

      {/* 右側面板 */}
      <div className="tl--w-96 tl--bg-gray-100 tl--p-6 tl--overflow-y-auto tl--space-y-6">
        {/* 上傳區 */}
        <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-8">
          <Dragger {...draggerProps} disabled={loading}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined className="tl--text-6xl tl--text-gray-400" />
            </p>
            <p className="ant-upload-text tl--text-lg tl--font-medium">
              點擊或拖曳 3D 模型到此區域
            </p>
            <p className="ant-upload-hint tl--text-sm tl--text-gray-500">
              支援 .glb、.gltf 格式（可多檔同時上傳）
            </p>
          </Dragger>
        </div>

        {/* 統一圖層管理（燈光 + 模型） */}
        <LayerPanel />

        {/* 選中物件的詳細控制面板 */}
        <DetailPanel />
      </div>
    </div>
  );
}