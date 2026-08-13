<p align="center">
  <img src="./docs/assets/shftr-logo.webp" alt="SHFTR" width="280" />
</p>

<h1 align="center">@theshiftrtech/nestjs-panel</h1>

<p align="center">
  <strong>NestJS admin panel by <a href="https://shftr.com">SHFTR</a></strong><br />
  Decorator-driven UI · React SPA generator · Static serve · HMAC auth
</p>

<p align="center">
  <a href="./docs/NestJS-Panel-Usage-Guide.pdf"><img src="https://img.shields.io/badge/Download-Usage%20Guide%20(PDF)-0ea5e9?style=for-the-badge&logo=adobeacrobatreader&logoColor=white" alt="Download Usage Guide PDF" /></a>
</p>

<p align="center">
  <a href="./docs/NestJS-Panel-Usage-Guide.pdf"><strong>Click here to open / download the full Usage Guide (PDF)</strong></a>
</p>

---

## Install

```bash
npm install @theshiftrtech/nestjs-panel
```

Peer dependencies (Nest 11, `class-validator`, `class-transformer`, etc.) must be present in your application — the package does not bundle Nest.

---

## Quick start

```bash
# 1. Wire AdminPanelModule + adminPanelConfig (see PDF)
# 2. Annotate controllers with @PanelModule / @PanelApi / @PanelAction
# 3. Generate & run
npm run admin:generate
npm run start:dev
```

Add to your `package.json`:

```json
{
  "scripts": {
    "admin:generate": "nestjs-panel generate"
  }
}
```

| Resource | URL |
|----------|-----|
| Admin UI | `http://localhost:<port>/<ADMIN_PANEL_PATH>` |
| Login | `POST /<apiPrefix>/admin-panel/login` |
| Branding | `GET /<apiPrefix>/admin-panel/config` |

---

## Integration

```ts
import { adminPanelConfig, AdminPanelModule, setupAdminPanel, AdminPanel, ADMIN_PANEL } from "@theshiftrtech/nestjs-panel";

// AppModule
ConfigModule.forRoot({ load: [appConfig, adminPanelConfig] }),
AdminPanelModule.forRootAsync(),

// main.ts
setupAdminPanel(app, new AdminPanel({ title: "Admin Panel", theme: { /* ... */ }, /* ...from env */ }), {
  apiPrefix: appConfig.apiPrefix,
  port: appConfig.port,
});
```

Full step-by-step setup, env reference, decorator catalogue, and CLI docs are in the **[Usage Guide (PDF)](./docs/NestJS-Panel-Usage-Guide.pdf)**.

---

## Documentation

| Doc | Description |
|-----|-------------|
| **[Usage Guide (PDF)](./docs/NestJS-Panel-Usage-Guide.pdf)** | Complete integration handbook |
| **[docs/usage-guide.html](./docs/usage-guide.html)** | PDF source |

---

<p align="center">
  <sub>Built by <strong>SHFTR</strong></sub>
</p>
