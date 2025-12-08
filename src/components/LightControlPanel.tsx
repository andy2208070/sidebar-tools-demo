// src/components/LightControlPanel.tsx
import { Button, Slider, Input, Select } from 'antd';
import { Plus, Trash2, Lightbulb } from 'lucide-react';
import { useModelStore, type LightItem } from '@/store/modelStore';

const lightTypes = [
  { value: 'directional', label: '主燈光 (Directional)' },
  { value: 'point', label: '點光源 (Point)' },
  { value: 'spot', label: '聚光燈 (Spot)' },
] as const;

export default function LightControlPanel() {
  const { lights, selectedLightId, addLight, removeLight, selectLight, updateLight } = useModelStore();
  const selected = lights.find((l) => l.id === selectedLightId);

  return (
    <div className="tl--space-y-6">
      {/* 燈光列表 + 新增按鈕 */}
      <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-5">
        <div className="tl--flex tl--items-center tl--justify-between tl--mb-4">
          <h3 className="tl--text-xl tl--font-bold">燈光管理</h3>
          <Button
            type="primary"
            icon={<Plus size={18} />}
            onClick={() => addLight('directional')}
            disabled={lights.length >= 6}
          >
            新增燈光
          </Button>
        </div>

        <div className="tl--space-y-2">
          {lights.map((light) => (
            <div
              key={light.id}
              className={`tl--flex tl--items-center tl--justify-between tl--px-4 tl--py-3 tl--rounded-lg tl--cursor-pointer transition-all ${
                selectedLightId === light.id
                  ? 'tl--bg-blue-100 tl--border tl--border-blue-500'
                  : 'tl--bg-gray-50 hover:tl--bg-gray-100'
              }`}
              onClick={() => selectLight(light.id)}
            >
              <div className="tl--flex tl--items-center tl--gap-3">
                <Lightbulb size={20} className="tl--text-yellow-500" />
                <span className="tl--font-medium">{light.name}</span>
              </div>
              <Button
                danger
                size="small"
                icon={<Trash2 size={16} />}
                onClick={(e) => {
                  e.stopPropagation();
                  removeLight(light.id);
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* 選中燈光的詳細控制 */}
      {selected && (
        <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-6 tl--space-y-5">
          <h3 className="tl--text-lg tl--font-bold tl--text-blue-600">
            編輯：{selected.name}
          </h3>

          <div>
            <label className="tl--block tl--text-sm tl--font-medium tl--mb-2">強度</label>
            <Slider
              min={0}
              max={20}
              step={0.1}
              value={selected.intensity}
              onChange={(v) => updateLight(selected.id, { intensity: v })}
            />
          </div>

          <div>
            <label className="tl--block tl--text-sm tl--font-medium tl--mb-2">顏色</label>
            <Input
              type="color"
              value={selected.color}
              onChange={(e) => updateLight(selected.id, { color: e.target.value })}
              className="tl--w-full tl--h-12"
            />
          </div>

          <div className="tl--space-y-3">
            <label className="tl--block tl--text-sm tl--font-medium">位置</label>
            {(['X', 'Y', 'Z'] as const).map((axis, i) => (
              <Input
                key={axis}
                addonBefore={axis}
                type="number"
                step={0.5}
                value={selected.position[i].toFixed(2)}
                onChange={(e) => {
                  const pos = [...selected.position] as [number, number, number];
                  pos[i] = Number(e.target.value);
                  updateLight(selected.id, { position: pos });
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}