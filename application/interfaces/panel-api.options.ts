/**
 * Marks the primary data endpoint for a panel page.
 * For `pageType: 'list'` — the paginated list GET.
 * For `pageType: 'info'` — the read-only info GET.
 * For `pageType: 'dashboard'` — the overview metrics GET.
 */

export type PanelColumnType = "text" | "badge" | "datetime" | "boolean";

export interface PanelColumnOptions {
  /** Response field name */
  field: string;
  /** Column header label (defaults to field) */
  label?: string;
  /** Cell render hint */
  type?: PanelColumnType;
  /** Allow clicking the header to sort */
  sortable?: boolean;
}

export type PanelFilterType = "search" | "text" | "select";

export interface PanelFilterOptions {
  /** Entity / response field this filter relates to */
  field: string;
  /** Control type in the filter bar */
  type: PanelFilterType;
  /** Filter label */
  label?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Options for `select` filters */
  options?: string[];
  /** Query-string key (defaults to `field`) */
  param?: string;
}

export interface PanelPaginationOptions {
  /** Enable page/limit query params and UI controls */
  enabled?: boolean;
  /** Default page size */
  pageSize?: number;
  /** Page-size choices in the UI */
  pageSizeOptions?: number[];
}

export interface PanelSortOptions {
  field: string;
  order?: "ASC" | "DESC";
}

export interface PanelApiOptions {
  /** Page title shown in the admin UI */
  title: string;
  /** Short description for the page header */
  description?: string;
  /**
   * Columns to show in the table (list) or fields (info).
   * Accepts rich column objects or legacy string field names.
   */
  columns?: Array<string | PanelColumnOptions>;
  /** Filter bar controls (list only) */
  filters?: PanelFilterOptions[];
  /**
   * Pagination config.
   * Legacy: `pagination?: boolean` and top-level `pageSize?: number` are still accepted.
   */
  pagination?: boolean | PanelPaginationOptions;
  /** @deprecated Prefer `pagination.pageSize` — kept for backward compatibility */
  pageSize?: number;
  /** Default sort applied by the UI when none is selected */
  defaultSort?: PanelSortOptions;
  /** Hide this endpoint from the admin panel */
  hidden?: boolean;
  /** Custom page component name (for pageType: 'custom') */
  component?: string;
}
