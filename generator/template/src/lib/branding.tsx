import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { manifest } from '@/generated/manifest';
import type { AdminManifest } from '@/generated/manifest.types';
import { api } from '@/lib/api';
import { applyTheme } from '@/lib/theme';

export type AdminBranding = {
  title: string;
  theme: AdminManifest['theme'];
};

const BrandingContext = createContext<AdminBranding>({
  title: manifest.title,
  theme: manifest.theme,
});

export function useBranding(): AdminBranding {
  return useContext(BrandingContext);
}

interface BrandingProviderProps {
  children: ReactNode;
}

export function BrandingProvider({ children }: BrandingProviderProps) {
  const [branding, setBranding] = useState<AdminBranding>({
    title: manifest.title,
    theme: manifest.theme,
  });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    api
      .getConfig()
      .then((cfg) => {
        if (cancelled) {
          return;
        }
        setBranding(cfg);
        applyTheme(cfg.theme);
        document.title = cfg.title;
      })
      .catch(() => {
        if (cancelled) {
          return;
        }
        applyTheme(manifest.theme);
        document.title = manifest.title;
      })
      .finally(() => {
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
}
