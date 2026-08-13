export interface PanelFieldMeta {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  example?: unknown;
  enum?: string[];
  format?: string;
}

export interface PanelActionMeta {
  type: string;
  label: string;
  mode: string;
  placement: string;
  method: string;
  path: string;
  fields?: string[];
  dtoName?: string;
  fieldMeta: PanelFieldMeta[];
  confirmMessage?: string;
  order: number;
  variant?: string;
  icon?: string;
}

export interface PanelColumnMeta {
  field: string;
  label: string;
  type: 'text' | 'badge' | 'datetime' | 'boolean';
  sortable: boolean;
}

export interface PanelFilterMeta {
  field: string;
  type: 'search' | 'text' | 'select';
  label?: string;
  placeholder?: string;
  options?: string[];
  /** Query-string key */
  param: string;
}

export interface PanelPaginationMeta {
  enabled: boolean;
  pageSize: number;
  pageSizeOptions: number[];
}

export interface PanelSortMeta {
  field: string;
  order: 'ASC' | 'DESC';
}

export interface PanelStructureMeta {
  table: boolean;
  filters: boolean;
  pagination: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  view: boolean;
}

export interface PanelListMeta {
  title: string;
  description?: string;
  method: string;
  path: string;
  columns: PanelColumnMeta[];
  filters: PanelFilterMeta[];
  pagination: PanelPaginationMeta;
  defaultSort?: PanelSortMeta;
  component?: string;
}

export interface PanelModuleMeta {
  id: string;
  title: string;
  icon?: string;
  order: number;
  description?: string;
  pageType: string;
  basePath: string;
  structure: PanelStructureMeta;
  list?: PanelListMeta;
  actions: PanelActionMeta[];
}

export interface AdminManifest {
  generatedAt: string;
  title: string;
  apiPrefix: string;
  adminPath: string;
  theme: {
    primaryColor: string;
    sidebarColor?: string;
    accentColor?: string;
    fontFamily?: string;
    radius?: string;
    logoUrl?: string;
    logoIcon?: string;
    subtitle?: string;
  };
  modules: PanelModuleMeta[];
}
