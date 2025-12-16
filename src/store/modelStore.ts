// src/store/modelStore.ts
import { create } from 'zustand';
import * as THREE from 'three';

export type LayerType = 'model' | 'light';

export type LayerItem = {
  id: string;
  name: string;
  type: LayerType;
  visible: boolean;
  object: THREE.Object3D;

  // 燈光專屬
  lightType?: 'directional' | 'point' | 'spot';
  color?: string;
  intensity?: number;
  distance?: number;
  decay?: number;
  angle?: number;
  penumbra?: number;
  helper?: THREE.Object3D;
};

type Store = {
  layers: LayerItem[];
  selectedLayerId: string | null;

  addLayer: (item: LayerItem) => void;
  removeLayer: (id: string) => void;
  toggleVisible: (id: string) => void;
  selectLayer: (id: string | null) => void;
  updateLayer: (id: string, updates: {
    position?: [number, number, number];
    rotation?: [number, number, number];
    scale?: number;
    intensity?: number;
    color?: string;
    visible?: boolean;
  }) => void;

  addLight: (lightType: 'directional' | 'point' | 'spot') => void;
};

export const useModelStore = create<Store>((set, get) => ({
  layers: [],
  selectedLayerId: null,

  addLayer: (item) =>
    set((state) => ({
      layers: [...state.layers, item],
      selectedLayerId: item.id,
    })),

  removeLayer: (id) =>
    set((state) => ({
      layers: state.layers.filter((l) => l.id !== id),
      selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
    })),

  toggleVisible: (id) =>
    set((state) => ({
      layers: state.layers.map((l) =>
        l.id === id
          ? {
              ...l,
              visible: !l.visible,
              object: Object.assign(l.object, { visible: !l.visible }),
            }
          : l
      ),
    })),

  selectLayer: (id) => set({ selectedLayerId: id }),

  updateLayer: (id, updates) =>
    set((state) => ({
      layers: state.layers.map((l) => {
        if (l.id !== id) return l;

        if (updates.position) l.object.position.set(...updates.position);
        if (updates.rotation) l.object.rotation.set(...updates.rotation);
        if (updates.scale !== undefined) l.object.scale.setScalar(updates.scale);
        if (updates.intensity !== undefined && l.type === 'light') (l.object as THREE.Light).intensity = updates.intensity;
        if (updates.color && l.type === 'light') (l.object as THREE.Light).color.set(updates.color);
        if (updates.visible !== undefined) {
          l.object.visible = updates.visible;
          if (l.helper) l.helper.visible = updates.visible;
        }

        if (l.helper) (l.helper as any).update?.();

        return { ...l };
      }),
    })),

  addLight: (lightType) => {
    const id = crypto.randomUUID();
    let light: THREE.Light;
    let helper: THREE.Object3D | undefined;

    switch (lightType) {
      case 'directional':
        light = new THREE.DirectionalLight('#ffffff', 3);
        light.position.set(5, 10, 7.5);
        helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 2);
        break;
      case 'point':
        light = new THREE.PointLight('#ffffff', 5, 20, 2);
        light.position.set(0, 5, 0);
        helper = new THREE.PointLightHelper(light as THREE.PointLight, 1);
        break;
      case 'spot':
        light = new THREE.SpotLight('#ffffff', 8, 30, Math.PI / 6, 0.3);
        light.position.set(0, 10, 0);
        helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
        break;
    }

    const item: LayerItem = {
      id,
      name: `${lightType === 'directional' ? '主燈光' : lightType === 'point' ? '點光源' : '聚光燈'} ${get().layers.filter(l => l.type === 'light').length + 1}`,
      type: 'light',
      visible: true,
      object: light,
      lightType,
      color: '#ffffff',
      intensity: light.intensity,
      helper,
    };

    get().addLayer(item);
  },
}));

// 頁面載入時自動加一盞主燈
useModelStore.getState().addLight('directional');