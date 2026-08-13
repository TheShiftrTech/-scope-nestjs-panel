import {
  AdminPanelTheme,
  DEFAULT_ADMIN_PANEL_THEME,
} from "./admin-panel-theme";

export interface AdminPanelRootUser {
  username: string;
  password: string;
}

export interface AdminPanelOptions {
  /** Enable the admin panel (default: true in dev) */
  enabled?: boolean;
  /** URL path segment (default: "admin") */
  path?: string;
  /** Panel title shown in the sidebar header */
  title?: string;
  /** Theme / branding overrides (configure in main.ts — not via .env) */
  theme?: AdminPanelTheme;
  /** Root admin credentials for panel login */
  rootUser?: AdminPanelRootUser;
  /** Secret for admin session tokens */
  secret?: string;
}

/**
 * Configuration model for the generated admin panel.
 * Pass an instance to `setupAdminPanel()` in main.ts.
 *
 * @example
 * setupAdminPanel(
 *   app,
 *   new AdminPanel({
 *     title: 'My Admin',
 *     rootUser: { username: 'admin', password: 'changeme' },
 *     theme: {
 *       primaryColor: '#0ea5e9',
 *       sidebarColor: '#0c4a6e',
 *       logoIcon: 'Shield',
 *       subtitle: 'Control Center',
 *       radius: '0.75rem',
 *     },
 *   }),
 *   { apiPrefix: 'api', port: 3000 },
 * );
 */
export class AdminPanel {
  readonly enabled: boolean;
  readonly path: string;
  readonly title: string;
  readonly theme: Required<Omit<AdminPanelTheme, "logoUrl">> &
    Pick<AdminPanelTheme, "logoUrl">;
  readonly rootUser: AdminPanelRootUser;
  readonly secret: string;

  constructor(options: AdminPanelOptions = {}) {
    this.enabled = options.enabled ?? true;
    this.path = options.path ?? "admin";
    this.title = options.title ?? "Admin Panel";
    this.theme = {
      ...DEFAULT_ADMIN_PANEL_THEME,
      ...options.theme,
      logoUrl: options.theme?.logoUrl || undefined,
    };
    this.rootUser = options.rootUser ?? {
      username: "admin",
      password: "admin",
    };
    this.secret = options.secret ?? "change-me-in-production";
  }
}
