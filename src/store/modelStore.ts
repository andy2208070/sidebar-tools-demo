// src/store/modelStore.ts
import { create } from 'zustand';
import * as THREE from 'three';

export type ModelLayer = {
  id: string;
  name: string;
  object: THREE.Group;
  visible: boolean;
};

export type LightType = 'directional' | 'point' | 'spot';

export type LightItem = {
  id: string;
  name: string;
  type: LightType;
  color: string;
  intensity: number;
  position: [number, number, number];
  // 以下僅 point / spot 使用
  distance?: number;
  decay?: number;
  angle?: number;     // spot only
  penumbra?: number;  // spot only
  // Three.js 物件
  lightObj: THREE.Light;
  helper?: THREE.Object3D; // 燈光輔助線（可見位置）
};

type Store = {
  models: ModelLayer[];
  lights: LightItem[];
  selectedLightId: string | null;

  // 模型相關
  addModel: (name: string, object: THREE.Group) => void;
  toggleModelVisible: (id: string) => void;
  removeModel: (id: string) => void;

  // 燈光相關
  addLight: (type: LightType) => void;
  removeLight: (id: string) => void;
  selectLight: (id: string | null) => void;
  updateLight: (id: string, updates: Partial<LightItem>) => void;
};

export const useModelStore = create<Store>((set, get) => ({
  models: [],
  lights: [],
  selectedLightId: null,

  addModel: (name, object) =>
    set((state) => ({
      models: [...state.models, { id: crypto.randomUUID(), name, object, visible: true }],
    })),

  toggleModelVisible: (id) =>
    set((state) => ({
      models: state.models.map((m) =>
        m.id === id ? { ...m, visible: !m.visible } : m
      ),
    })),

  removeModel: (id) =>
    set((state) => ({
      models: state.models.filter((m) => m.id !== id),
    })),

  addLight: (type) => {
    const id = crypto.randomUUID();
    let light: THREE.Light;
    let helper: THREE.Object3D | undefined;

    if (type === 'directional') {
      light = new THREE.DirectionalLight('#ffffff', 3);
      light.position.set(5, 10, 7.5);
      helper = new THREE.DirectionalLightHelper(light as THREE.DirectionalLight, 2, '#ffff00');
    } else if (type === 'point') {
      light = new THREE.PointLight('#ffffff', 5, 20, 2);
      light.position.set(0, 5, 0);
      helper = new THREE.PointLightHelper(light as THREE.PointLight, 1, '#ffff00');
    } else {
      light = new THREE.SpotLight('#ffffff', 8, 30, Math.PI / 6, 0.3);
      light.position.set(0, 10, 0);
      helper = new THREE.SpotLightHelper(light as THREE.SpotLight);
    }

    const newLight: LightItem = {
      id,
      name: `${type === 'directional' ? '主燈光' : type === 'point' ? '點光源' : '聚光燈'} ${get().lights.length + 1}`,
      type,
      color: '#ffffff',
      intensity: light.intensity,
      position: light.position.toArray() as [number, number, number],
      distance: (light as any).distance,
      decay: (light as any).decay,
      angle: (light as any).angle,
      penumbra: (light as any).penumbra,
      lightObj: light,
      helper,
    };

    set((state) => ({
      lights: [...state.lights, newLight],
      selectedLightId: id, // 新增自動選取
    }));
  },

  removeLight: (id) =>
    set((state) => ({
      lights: state.lights.filter((l) => l.id !== id),
      selectedLightId: state.selectedLightId === id ? null : state.selectedLightId,
    })),

  selectLight: (id) => set({ selectedLightId: id }),

  // updateLight: (id, updates) =>
  //   set((state) => ({
  //     lights: state.lights.map((l) =>
  //       l.id === id
  //         ? {
  //             ...l,
  //             ...updates,
  //             lightObj: Object.assign(l.lightObj, updates),
  //             position: updates.position || l.position,
  //             color: updates.color || l.color,
  //             intensity: updates.intensity ?? l.intensity,
  //           }
  //         : l
  //     ),
  //   })),
  updateLight: (id, updates) =>
  set((state) => ({
    lights: state.lights.map((l) => {
      if (l.id !== id) return l;

      // 同步到真正的 Three.js light 物件
      const lightObj = l.lightObj;
      if (updates.color !== undefined) lightObj.color.set(updates.color);
      if (updates.intensity !== undefined) lightObj.intensity = updates.intensity;
      if (updates.position) lightObj.position.set(...updates.position);
      if (updates.distance !== undefined) (lightObj as any).distance = updates.distance;
      if (updates.decay !== undefined) (lightObj as any).decay = updates.decay;
      if (updates.angle !== undefined) (lightObj as THREE.SpotLight).angle = updates.angle;
      if (updates.penumbra !== undefined) (lightObj as THREE.SpotLight).penumbra = updates.penumbra;

      // 更新 helper（如果有的話）
      if (l.helper) {
        if (l.helper instanceof THREE.DirectionalLightHelper) {
          (l.helper as THREE.DirectionalLightHelper).update();
        } else if (l.helper instanceof THREE.PointLightHelper) {
          (l.helper as THREE.PointLightHelper).update();
        } else if (l.helper instanceof THREE.SpotLightHelper) {
          (l.helper as THREE.SpotLightHelper).update();
        }
      }

      return {
        ...l,
        ...updates,
        position: updates.position || l.position,
      };
    }),
  })),
}));

// 一進頁面自動加一盞主燈
useModelStore.getState().addLight('directional');