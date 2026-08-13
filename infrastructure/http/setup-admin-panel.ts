import { INestApplication } from "@nestjs/common";
import { NestExpressApplication } from "@nestjs/platform-express";
import { existsSync } from "fs";
import { join, isAbsolute } from "path";
import { AdminPanel } from "../../domain/model/admin-panel";
import { HostBootstrapOptions } from "../../application/ports/host-bootstrap.options";

export interface AdminPanelPublicConfig {
  title: string;
  theme: AdminPanel["theme"];
}

/**
 * Serves the admin SPA and exposes runtime UI config from the AdminPanel instance
 * passed here (title + theme). Configure branding in main.ts — not via .env.
 */
export function setupAdminPanel(
  app: INestApplication,
  adminPanel: AdminPanel,
  host: HostBootstrapOptions,
): void {
  if (!adminPanel.enabled) {
    return;
  }

  const expressApp = app as NestExpressApplication;
  const httpAdapter = expressApp.getHttpAdapter();
  const apiPrefix = host.apiPrefix.replace(/^\/|\/$/g, "");
  const configPath = `/${apiPrefix}/admin-panel/config`;

  // Nest HttpAdapter handler generics conflict with Express Request/Response;
  // cast at the boundary so the host app stays typed via AdminPanelPublicConfig.
  httpAdapter.get(configPath, ((_req, res) => {
    (res as { json: (body: AdminPanelPublicConfig) => void }).json({
      title: adminPanel.title,
      theme: adminPanel.theme,
    });
  }) as Parameters<typeof httpAdapter.get>[1]);

  const adminDist = host.distPath
    ? isAbsolute(host.distPath)
      ? host.distPath
      : join(process.cwd(), host.distPath)
    : join(process.cwd(), "admin", "dist");

  if (!existsSync(adminDist)) {
    console.warn(
      `[AdminPanel] Build not found at ${adminDist}. Run "npm run admin:generate" first.`,
    );
    return;
  }

  const adminPath = `/${adminPanel.path}`;
  const indexHtml = join(adminDist, "index.html");

  expressApp.useStaticAssets(adminDist, {
    prefix: adminPath,
  });

  httpAdapter.get(
    `${adminPath}/*path`,
    ((_req, res) => {
      (res as { sendFile: (path: string) => void }).sendFile(indexHtml);
    }) as Parameters<typeof httpAdapter.get>[1],
  );

  console.log(
    `[AdminPanel] UI available at http://localhost:${host.port}${adminPath}`,
  );
}
