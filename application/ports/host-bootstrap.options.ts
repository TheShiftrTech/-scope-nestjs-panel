/**
 * Host application values required to mount the admin SPA.
 * Supplied by the consuming Nest app (typically from AppConfig).
 */
export interface HostBootstrapOptions {
  /** Global API prefix without leading/trailing slashes (e.g. "api") */
  apiPrefix: string;
  /** HTTP listen port — used only for the startup log URL */
  port: number;
  /**
   * Absolute or cwd-relative path to the built SPA (`index.html` + assets).
   * Defaults to `{cwd}/admin/dist`.
   */
  distPath?: string;
}
