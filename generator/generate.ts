import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { join } from "path";
import { execSync } from "child_process";
import { extractMetadata } from "./extract-metadata";

/** Host Nest application root. */
const ROOT = process.cwd();
/** SPA template shipped inside this package. */
const TEMPLATE_DIR = join(__dirname, "template");
/** Generated SPA output lives on the host (not inside this package). */
const ADMIN_DIR = join(ROOT, "admin");
const GENERATED_DIR = join(ADMIN_DIR, "src", "generated");

function syncTemplate(): void {
  if (existsSync(ADMIN_DIR)) {
    for (const entry of [
      "src",
      "public",
      "index.html",
      "package.json",
      "vite.config.ts",
      "tsconfig.json",
      "tsconfig.node.json",
      "tailwind.config.js",
      "postcss.config.js",
      "components.json",
    ]) {
      const target = join(ADMIN_DIR, entry);
      if (existsSync(target)) {
        rmSync(target, { recursive: true, force: true });
      }
    }
  }

  cpSync(TEMPLATE_DIR, ADMIN_DIR, { recursive: true });
}

function writeManifest(): void {
  const raw = extractMetadata();
  const manifest = {
    generatedAt: raw.generatedAt,
    title: raw.title,
    apiPrefix: raw.apiPrefix,
    adminPath: raw.adminPath,
    theme: raw.theme,
    modules: raw.modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      icon: mod.icon,
      order: mod.order,
      description: mod.description,
      pageType: mod.pageType,
      basePath: mod.basePath,
      structure: mod.structure,
      list: mod.list,
      actions: mod.actions,
    })),
  };

  mkdirSync(GENERATED_DIR, { recursive: true });
  writeFileSync(
    join(GENERATED_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8",
  );

  writeFileSync(
    join(GENERATED_DIR, "manifest.ts"),
    `// Auto-generated — do not edit\nimport type { AdminManifest } from './manifest.types';\n\nexport const manifest = ${JSON.stringify(manifest, null, 2)} as AdminManifest;\n`,
    "utf8",
  );

  console.log(`[admin-panel] Found ${manifest.modules.length} module(s):`);
  for (const mod of manifest.modules) {
    console.log(
      `  - ${mod.title} [${mod.pageType}] (${mod.actions.length} actions)`,
    );
  }
}

function writeEnvFile(): void {
  const port = readEnv("APP_PORT", "3000");
  const apiPrefix = readEnv("APP_API_PREFIX", "api");
  const adminPath = readEnv("ADMIN_PANEL_PATH", "admin");

  const envContent = `VITE_API_BASE_URL=http://localhost:${port}/${apiPrefix}
VITE_ADMIN_PATH=/${adminPath}
`;

  writeFileSync(join(ADMIN_DIR, ".env"), envContent, "utf8");
}

function readEnv(key: string, fallback: string): string {
  const envPath = join(ROOT, ".env");
  if (!existsSync(envPath)) {
    return process.env[key] ?? fallback;
  }
  const content = readFileSync(envPath, "utf8");
  const match = content.match(new RegExp(`^${key}=(.*)$`, "m"));
  if (match?.[1]) {
    return match[1].replace(/^['"]|['"]$/g, "");
  }
  return process.env[key] ?? fallback;
}

function buildAdmin(): void {
  console.log("[admin-panel] Installing admin dependencies...");
  execSync("npm install", { cwd: ADMIN_DIR, stdio: "inherit" });

  console.log("[admin-panel] Building admin panel...");
  execSync("npm run build", { cwd: ADMIN_DIR, stdio: "inherit" });
}

function main(): void {
  console.log("[admin-panel] Generating admin panel...");
  syncTemplate();
  writeManifest();
  writeEnvFile();
  buildAdmin();
  console.log("[admin-panel] Done.");
}

main();
