import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

interface AdminLayoutProps {
  onLogout: () => void;
}

export function AdminLayout({ onLogout }: AdminLayoutProps) {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar onLogout={onLogout} />
      <main className="min-w-0 flex-1 overflow-y-auto bg-muted/40">
        <div className="mx-auto max-w-6xl p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
