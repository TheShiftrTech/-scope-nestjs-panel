import type { AdminManifest } from '@/generated/manifest.types';

type Theme = AdminManifest['theme'];

export function hexToHsl(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    return null;
  }
  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function setHslVar(name: string, hex: string | undefined, fallback?: string) {
  const value = hex ? hexToHsl(hex) : null;
  if (value) {
    document.documentElement.style.setProperty(name, value);
  } else if (fallback) {
    document.documentElement.style.setProperty(name, fallback);
  }
}

/**
 * Applies manifest theme tokens as CSS variables on :root.
 * Safe to call on login and authenticated routes.
 */
export function applyTheme(theme: Theme) {
  setHslVar('--primary', theme.primaryColor, '239 84% 67%');
  setHslVar('--ring', theme.primaryColor, '239 84% 67%');
  setHslVar('--sidebar', theme.sidebarColor, '224 71% 4%');
  // Keep sidebar text readable on dark sidebar backgrounds
  document.documentElement.style.setProperty(
    '--sidebar-foreground',
    '213 31% 91%',
  );
  setHslVar('--accent', theme.accentColor, '220 14% 96%');
  setHslVar('--secondary', theme.accentColor, '220 14% 96%');
  setHslVar('--muted', theme.accentColor, '220 14% 96%');

  if (theme.radius) {
    document.documentElement.style.setProperty('--radius', theme.radius);
  }

  if (theme.fontFamily) {
    document.documentElement.style.setProperty(
      '--font-family',
      theme.fontFamily,
    );
    document.body.style.fontFamily = theme.fontFamily;
  }
}
