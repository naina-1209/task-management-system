import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function DashboardLayout({ searchQuery, onSearchChange }: { searchQuery: string; onSearchChange: (q: string) => void }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-app">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-64">
        <Topbar
          onMenuClick={() => setSidebarOpen(true)}
          onSearch={onSearchChange}
          searchQuery={searchQuery}
        />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
