import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// 匯入佈局元件和頁面
import MainLayout from './components/MainLayout';
import ModelUploadPage from './pages/ModelUploadPage';
import SketchfabPage from './pages/SketchfabPage';
import HDREnvironmentPage from './pages/HDREnvironmentPage';

// 匯入 Antd 的樣式，確保樣式正確載入
import 'antd/dist/reset.css';

const App: React.FC = () => {
  return (
    // 使用 BrowserRouter 包裹整個應用程式
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<ModelUploadPage />} />
          <Route path="upload" element={<ModelUploadPage />} />
          <Route path="sketchfab" element={<SketchfabPage />} />
          <Route path="hdr" element={<HDREnvironmentPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
