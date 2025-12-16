// src/components/LayerPanel.tsx
import { Button, Select } from 'antd';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useModelStore, type LayerItem } from '@/store/modelStore';

export default function LayerPanel() {
  const { layers, selectedLayerId, addLight, removeLayer, toggleVisible, selectLayer } = useModelStore();

  return (
    <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-6 tl--space-y-4">
      <div className="tl--flex tl--items-center tl--justify-between">
        <h3 className="tl--text-xl tl--font-bold">圖層管理</h3>
        <Select
          placeholder="新增燈光"
          style={{ width: 140 }}
          onChange={(v) => addLight(v as any)}
          options={[
            { value: 'directional', label: '主燈光' },
            { value: 'point', label: '點光源' },
            { value: 'spot', label: '聚光燈' },
          ]}
        />
      </div>

      <div className="tl--space-y-2">
        {layers.length === 0 ? (
          <div className="tl--text-center tl--py-6 tl--text-gray-500">尚未有圖層</div>
        ) : (
          layers.map((layer: LayerItem) => (
            <div
              key={layer.id}
              className={`tl--flex tl--items-center tl--justify-between tl--px-4 tl--py-3 tl--rounded-lg tl--cursor-pointer transition-all ${
                selectedLayerId === layer.id ? 'tl--bg-blue-100 tl--border tl--border-blue-500' : 'tl--bg-gray-50 hover:tl--bg-gray-100'
              }`}
              onClick={() => selectLayer(layer.id)}
            >
              <span className="tl--text-sm tl--font-medium tl--truncate tl--max-w-48">
                {layer.type === 'light' ? '💡' : '🗿'} {layer.name}
              </span>
              <div className="tl--flex tl--gap-2">
                <Button
                  type="text"
                  size="small"
                  icon={layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  onClick={(e) => { e.stopPropagation(); toggleVisible(layer.id); }}
                />
                {layer.type === 'light' && (
                  <Button
                    type="text"
                    size="small"
                    danger
                    icon={<Trash2 size={16} />}
                    onClick={(e) => { e.stopPropagation(); removeLayer(layer.id); }}
                  />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}