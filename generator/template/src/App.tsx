import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import { manifest } from '@/generated/manifest';
import { isAuthenticated } from '@/lib/auth';
import { BrandingProvider } from '@/lib/branding';
import { LoginPage } from '@/components/auth/LoginPage';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { ListPage } from '@/components/pages/ListPage';
import { InfoPage } from '@/components/pages/InfoPage';
import { DashboardPage } from '@/components/pages/DashboardPage';
import type { PanelModuleMeta } from '@/generated/manifest.types';

function useModule(id: string | undefined): PanelModuleMeta | undefined {
  return manifest.modules.find((m) => m.id === id);
}

function ModuleRoute() {
  const { moduleId } = useParams();
  const mod = useModule(moduleId);

  if (!mod) {
    return <p>Module not found</p>;
  }

  if (mod.pageType === 'info') {
    return <InfoPage module={mod} />;
  }

  if (mod.pageType === 'dashboard') {
    return <DashboardPage module={mod} />;
  }

  return <ListPage module={mod} />;
}

function AppRoutes() {
  const [authed, setAuthed] = useState(isAuthenticated());

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  const firstId = manifest.modules[0]?.id ?? '';

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={() => setAuthed(false)} />}>
        <Route
          index
          element={<Navigate to={firstId ? `/modules/${firstId}` : '/'} replace />}
        />
        <Route path="modules/:moduleId" element={<ModuleRoute />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

const adminPath = import.meta.env.VITE_ADMIN_PATH ?? '/admin';

export function App() {
  return (
    <BrowserRouter basename={adminPath}>
      <BrandingProvider>
        <AppRoutes />
      </BrandingProvider>
    </BrowserRouter>
  );
}
