import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { clearToken } from '@/lib/auth';
import { useBranding } from '@/lib/branding';
import { resolveIcon } from '@/lib/icons';
import { manifest } from '@/generated/manifest';
import { BrandMark } from '@/components/layout/BrandMark';

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { title, theme } = useBranding();

  function handleLogout() {
    clearToken();
    onLogout();
  }

  const subtitle = theme.subtitle ?? 'Administration';
  const modules = manifest.modules ?? [];

  return (
    <aside className="sticky top-0 flex h-svh w-64 shrink-0 flex-col self-stretch bg-sidebar text-sidebar-foreground">
      <div className="shrink-0 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <BrandMark className="ring-1 ring-white/20" />
          <div className="min-w-0">
            <h1 className="truncate text-lg font-semibold tracking-tight text-white">
              {title || 'Admin Panel'}
            </h1>
            {subtitle ? (
              <p className="mt-0.5 truncate text-xs text-white/60">{subtitle}</p>
            ) : null}
          </div>
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
        {modules.length === 0 ? (
          <p className="px-3 py-2 text-xs text-white/50">No modules</p>
        ) : (
          modules.map((mod) => {
            const Icon = resolveIcon(mod.icon);

            return (
              <NavLink
                key={mod.id}
                to={`/modules/${mod.id}`}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-white/75 hover:bg-white/10 hover:text-white',
                  )
                }
              >
                <Icon className="h-4 w-4 shrink-0 opacity-90" />
                <span className="truncate">{mod.title}</span>
              </NavLink>
            );
          })
        )}
      </nav>

      <div className="mt-auto shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
