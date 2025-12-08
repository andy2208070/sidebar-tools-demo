// src/components/MainLayout.tsx
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Button } from 'antd';

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const menuItems = [
    { path: '/upload', label: 'Model Upload', key: 'upload' },
    { path: '/sketchfab', label: 'Sketchfab Models', key: 'sketchfab' },
    { path: '/hdr', label: 'HDR Environment', key: 'hdr' },
  ];

  return (
    <div className="tl--relative tl--min-h-screen tl--flex tl--bg-gray-50">
      {/* 側邊欄 */}
      <aside
        className={`
          tl--fixed tl--inset-y-0 tl--left-0 tl--z-40 tl--w-64 tl--bg-white 
          tl--border-r tl--border-gray-200 tl--shadow-lg
          tl--transition-transform tl--duration-300 tl--ease-in-out
          ${collapsed ? '-tl--translate-x-full' : 'tl--translate-x-0'}
        `}
      >
        <div className="tl--flex tl--flex-col tl--h-full">
          {/* Tools 標題 */}
          <div className="tl--h-16 tl--flex tl--items-center tl--px-6 tl--border-b tl--border-gray-200">
            <h1 className="tl--w-full tl--text-xl tl--text-center tl--font-bold tl--text-gray-800 tl--m-0">
              Tools
            </h1>
          </div>

          {/* 導覽選單 */}
          <nav className="tl--flex-1 tl--p-4 tl--overflow-y-auto">
            {menuItems.map((item) => {
              const isActive =
                location.pathname === item.path ||
                (location.pathname === '/' && item.path === '/upload');

              return (
                <Link
                  key={item.key}
                  to={item.path}
                  onClick={() => window.innerWidth < 768 && setCollapsed(true)}
                  className={`
                    tl--block tl--px-4 tl--py-3 tl--rounded-lg tl--mb-2 tl--transition-colors
                    tl--no-underline focus:tl--outline-none
                    ${
                      isActive
                        ? 'tl--bg-blue-600 tl--text-white tl--font-medium tl--shadow-sm'
                        : 'tl--text-gray-700 hover:tl--bg-gray-100'
                    }
                  `}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* 主內容區 */}
      <div
        className={`
          tl--flex-1 tl--transition-all tl--duration-300
          ${collapsed ? 'tl--pl-0' : 'tl--pl-0 md:tl--pl-64'}
        `}
      >
        {/* 浮動展開/收合按鈕（永遠顯示在左上角） */}
        <Button
          type="text"
          size="large"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="
            tl--fixed tl--top-4 tl--left-4 tl--z-50 
            tl--bg-white tl--shadow-md hover:tl--shadow-lg
            tl--rounded-lg tl--w-12 tl--h-12 tl--flex tl--items-center tl--justify-center
          "
        />

        {/* 頁面內容 */}
        <main className="tl--pt-20 tl--px-4 md:tl--px-8 tl--pb-8">
          <Outlet />
        </main>
      </div>

      {/* 手機板點擊外部關閉側邊欄的遮罩 */}
      {!collapsed && window.innerWidth < 768 && (
        <div
          className="tl--fixed tl--inset-0 tl--bg-black tl--bg-opacity-50 tl--z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    </div>
  );
}
