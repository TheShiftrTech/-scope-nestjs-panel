export interface AdminPanelTheme {
  primaryColor?: string;
  sidebarColor?: string;
  accentColor?: string;
  fontFamily?: string;
  radius?: string;
  logoUrl?: string;
  logoIcon?: string;
  subtitle?: string;
}

/** Defaults applied when configuring `new AdminPanel({ theme })` in main.ts */
export const DEFAULT_ADMIN_PANEL_THEME: Required<
  Omit<AdminPanelTheme, "logoUrl">
> & { logoUrl?: string } = {
  primaryColor: "#6366f1",
  sidebarColor: "#0f172a",
  accentColor: "#e2e8f0",
  fontFamily: "Inter, system-ui, sans-serif",
  radius: "0.5rem",
  logoIcon: "LayoutDashboard",
  subtitle: "Administration",
};
