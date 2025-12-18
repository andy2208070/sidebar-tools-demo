// src/components/LayerPanel.tsx
import { useState } from 'react';
import { Button, Select, Input } from 'antd';
import { Eye, EyeOff, Trash2 } from 'lucide-react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  type DragEndEvent 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useModelStore, type LayerItem } from '@/store/modelStore';

function SortableLayerItem({ layer }: { layer: LayerItem }) {
  const { selectedLayerId, selectLayer, toggleVisible, removeLayer, updateLayer } = useModelStore();
  const [editingName, setEditingName] = useState(false);
  const [tempName, setTempName] = useState(layer.name);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: layer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleRename = () => {
    if (tempName.trim() && tempName !== layer.name) {
      updateLayer(layer.id, { name: tempName.trim() });
    }
    setEditingName(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`tl--flex tl--items-center tl--justify-between tl--px-4 tl--py-3 tl--rounded-lg tl--cursor-pointer transition-all ${
        selectedLayerId === layer.id ? 'tl--bg-blue-100 tl--border tl--border-blue-500' : 'tl--bg-gray-50 hover:tl--bg-gray-100'
      }`}
      onClick={() => selectLayer(layer.id)}
    >
      <div className="tl--flex tl--items-center tl--gap-3 tl--flex-1 tl--min-w-0" {...attributes} {...listeners}>
        <span className="tl--text-gray-400 tl--select-none">⋮⋮</span>
        {editingName ? (
          <Input
            size="small"
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleRename}
            onPressEnter={handleRename}
            onKeyDown={(e) => e.key === 'Escape' && setEditingName(false)}
            autoFocus
            className="tl--w-40"
          />
        ) : (
          <span
            className="tl--text-sm tl--font-medium tl--truncate"
            onDoubleClick={() => {
              setTempName(layer.name);
              setEditingName(true);
            }}
          >
            {layer.type === 'light' ? '💡' : '🗿'} {layer.name}
          </span>
        )}
      </div>

      <div className="tl--flex tl--gap-2" onClick={(e) => e.stopPropagation()}>
        <Button type="text" size="small" icon={layer.visible ? <Eye size={16} /> : <EyeOff size={16} />} onClick={() => toggleVisible(layer.id)} />
        {layer.type === 'light' && <Button type="text" size="small" danger icon={<Trash2 size={16} />} onClick={() => removeLayer(layer.id)} />}
      </div>
    </div>
  );
}

export default function LayerPanel() {
  const { layers, addLight, reorderLayers } = useModelStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = layers.findIndex(l => l.id === active.id);
      const newIndex = layers.findIndex(l => l.id === over!.id);
      const newOrder = arrayMove(layers, oldIndex, newIndex);
      reorderLayers(newOrder);
    }
  };

  return (
    <div className="tl--bg-white tl--rounded-xl tl--shadow-lg tl--p-6 tl--space-y-4">
      <div className="tl--flex tl--items-center tl--justify-between">
        <h3 className="tl--text-xl tl--font-bold">圖層管理</h3>
        <Select placeholder="新增燈光" style={{ width: 140 }} onChange={(v) => addLight(v as any)} options={[
          { value: 'directional', label: '主燈光' },
          { value: 'point', label: '點光源' },
          { value: 'spot', label: '聚光燈' },
        ]} />
      </div>

      {layers.length === 0 ? (
        <div className="tl--text-center tl--py-6 tl--text-gray-500">尚未有圖層</div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={layers.map(l => l.id)} strategy={verticalListSortingStrategy}>
            {layers.map((layer) => (
              <SortableLayerItem key={layer.id} layer={layer} />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}