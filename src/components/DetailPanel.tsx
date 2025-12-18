// src/components/DetailPanel.tsx
import { Slider, Input } from 'antd';
import { useModelStore } from '@/store/modelStore';
import * as THREE from 'three';

export default function DetailPanel() {
  const { layers, selectedLayerId, updateLayer } = useModelStore();
  const selected = layers.find(l => l.id === selectedLayerId);

  if (!selected) {
    return (
      <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-6 tl--text-center tl--text-gray-500">
        請在左側場景或圖層列表中選取一個物件
      </div>
    );
  }

  const isLight = selected.type === 'light';

  return (
    <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-6 tl--space-y-6">
      <h3 className="tl--text-xl tl--font-bold">編輯：{selected.name}</h3>

      {/* 位置控制（通用） */}
      <div className="tl--space-y-3">
        <label className="tl--block tl--text-sm tl--font-medium">位置</label>
        {(['X', 'Y', 'Z'] as const).map((axis, i) => (
          <Input
            key={axis}
            addonBefore={axis}
            type="number"
            step={0.5}
            value={selected.object.position.toArray()[i].toFixed(2)}
            onChange={(e) => {
              const pos = selected.object.position.toArray() as [number, number, number];
              pos[i] = Number(e.target.value);
              updateLayer(selected.id, { position: pos });
            }}
          />
        ))}
      </div>

      {isLight ? (
        <>
          <div>
            <label className="tl--block tl--text-sm tl--font-medium tl--mb-2">強度</label>
            <Slider
  value={selected.intensity ?? 3}  // ← 預設值
  onChange={(v) => updateLayer(selected.id, { intensity: v })}
/>
          </div>
          <div>
            <label className="tl--block tl--text-sm tl--font-medium tl--mb-2">顏色</label>
            <Input
  type="color"
  value={selected.color || '#ffffff'}  // ← 確保有值
  onChange={(e) => updateLayer(selected.id, { color: e.target.value })}
/>
          </div>
        </>
      ) : (
        <>
          {/* 模型專屬：旋轉 + 縮放 */}
          <div className="tl--space-y-3">
            <label className="tl--block tl--text-sm tl--font-medium">旋轉（度）</label>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <Input
                key={axis}
                addonBefore={axis}
                type="number"
                step={15}
                value={Math.round(THREE.MathUtils.radToDeg(selected.object.rotation.toArray()[i] as number))}
                onChange={(e) => {
                  const rot = selected.object.rotation.toArray().slice(0, 3) as [number, number, number];
                  rot[i] = THREE.MathUtils.degToRad(Number(e.target.value));
                  updateLayer(selected.id, { rotation: rot });
                }}
              />
            ))}
          </div>
          <div>
            <label className="tl--block tl--text-sm tl--font-medium tl--mb-2">縮放</label>
            <Slider
              min={0.1}
              max={10}
              step={0.1}
              value={selected.object.scale.x}
              onChange={(v) => updateLayer(selected.id, { scale: v })}
            />
          </div>
        </>
      )}
    </div>
  );
}