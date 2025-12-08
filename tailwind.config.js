/** @type {import('tailwindcss').Config} */
export default {
  // 將 prefix 設為 tw-，避免與 antd 樣式衝突
  // 這樣所有 tailwind 的 class 都必須是 tl--開頭，例如 tl--flex
  prefix: 'tl--',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
};
