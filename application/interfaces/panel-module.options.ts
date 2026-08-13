/** Controller-level page layout for the admin panel */
export type PanelPageType = "list" | "info" | "dashboard" | "custom";

/**
 * Declarative page chrome for a module.
 * When omitted, defaults are inferred from `pageType` and discovered `@PanelAction`s.
 */
export interface PanelStructureOptions {
  /** Render the data table (list pages) */
  table?: boolean;
  /** Render the filter bar when filters are configured on `@PanelApi` */
  filters?: boolean;
  /** Render pagination controls */
  pagination?: boolean;
  /** Allow create toolbar actions */
  create?: boolean;
  /** Allow edit row actions */
  update?: boolean;
  /** Allow delete row actions */
  delete?: boolean;
  /** Allow view row actions */
  view?: boolean;
}

export interface PanelModuleOptions {
  /** Display name in the admin sidebar */
  title: string;
  /** Lucide icon name (e.g. "users", "settings") */
  icon?: string;
  /** Sort order in the sidebar (lower = higher) */
  order?: number;
  /**
   * Page layout for this module.
   * - `list` — table with pagination, toolbar + row actions (modals)
   * - `info` — read-only detail / status page
   * - `dashboard` — overview with summary cards and charts
   * - `custom` — reserved for custom components
   */
  pageType?: PanelPageType;
  /** Page chrome flags (table, filters, pagination, CRUD) */
  structure?: PanelStructureOptions;
  /** Hide this module from the admin panel */
  hidden?: boolean;
  /** Short description shown on the page header */
  description?: string;
}
