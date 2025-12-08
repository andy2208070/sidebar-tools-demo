// src/vite-env.d.ts
/// <reference types="vite/client" />

// 讓 TypeScript 認識 @/ 開頭的路徑
/// <reference types="vite/client" />
interface ImportMetaEnv {
  [key: string]: string | undefined;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
