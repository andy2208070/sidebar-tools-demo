// src/components/LayerPanel.tsx
import { Button } from 'antd';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { useModelStore, type ModelLayer } from '@/store/modelStore';

export default function LayerPanel() {
  const { models, toggleModelVisible, removeModel } = useModelStore();

  if (models.length === 0) {
    return (
      <div className="tl--text-center tl--py-8 tl--text-gray-500">
        尚未加入任何模型
      </div>
    );
  }

  return (
    <div className="tl--space-y-3">
      {models.map((layer: ModelLayer) => (
        <div
          key={layer.id}
          className="tl--flex tl--items-center tl--justify-between tl--bg-gray-50 tl--border tl--border-gray-200 tl--rounded-lg tl--px-4 tl--py-3 hover:tl--bg-gray-100 transition-all"
        >
          <span className="tl--text-sm tl--font-medium tl--text-gray-800 truncate tl--max-w-48">
            {layer.name}
          </span>

          <div className="tl--flex tl--items-center tl--gap-2">
            <Button
              type="text"
              size="small"
              icon={
                layer.visible ? (
                  <Eye size={18} />
                ) : (
                  <EyeOff size={18} className="tl--text-gray-400" />
                )
              }
              onClick={() => toggleModelVisible(layer.id)}
              className="hover:tl--bg-gray-200"
            />
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 size={18} />}
              onClick={() => removeModel(layer.id)}
              className="hover:tl--bg-red-100"
            />
          </div>
        </div>
      ))}
    </div>
  );
}
