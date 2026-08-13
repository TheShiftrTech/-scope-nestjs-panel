import { registerAs } from "@nestjs/config";

function resolveAdminPanelEnabled(nodeEnv: string): boolean {
  if (process.env.ADMIN_PANEL_ENABLED === "true") {
    return true;
  }
  if (process.env.ADMIN_PANEL_ENABLED === "false") {
    return false;
  }
  return nodeEnv !== "production";
}

/** Operational admin settings from env. UI theme is configured in main.ts via AdminPanel. */
export interface AdminPanelConfig {
  enabled: boolean;
  path: string;
  username: string;
  password: string;
  secret: string;
}

export const adminPanelConfig = registerAs(
  "adminPanel",
  (): AdminPanelConfig => {
    const nodeEnv = process.env.NODE_ENV ?? "development";

    return {
      enabled: resolveAdminPanelEnabled(nodeEnv),
      path: process.env.ADMIN_PANEL_PATH ?? "admin",
      username: process.env.ADMIN_PANEL_USERNAME ?? "admin",
      password: process.env.ADMIN_PANEL_PASSWORD ?? "admin",
      secret: process.env.ADMIN_PANEL_SECRET ?? "change-me-in-production",
    };
  },
);
