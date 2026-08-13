/**
 * Public API for @theshiftrtech/nestjs-panel.
 * Host applications should import only from this barrel.
 */

// Domain
export { AdminPanel } from "./domain/model/admin-panel";
export type {
  AdminPanelOptions,
  AdminPanelRootUser,
} from "./domain/model/admin-panel";
export type { AdminPanelTheme } from "./domain/model/admin-panel-theme";
export { DEFAULT_ADMIN_PANEL_THEME } from "./domain/model/admin-panel-theme";
export { ADMIN_PANEL } from "./domain/constants/tokens";

// Application — host ports & panel metadata contracts
export type { HostBootstrapOptions } from "./application/ports/host-bootstrap.options";
export { PanelModule, PanelApi, PanelAction } from "./application/decorators";
export type {
  PanelModuleOptions,
  PanelPageType,
  PanelStructureOptions,
} from "./application/interfaces/panel-module.options";
export type {
  PanelApiOptions,
  PanelColumnOptions,
  PanelColumnType,
  PanelFilterOptions,
  PanelFilterType,
  PanelPaginationOptions,
  PanelSortOptions,
} from "./application/interfaces/panel-api.options";
export type {
  PanelActionOptions,
  PanelActionType,
  PanelActionMode,
  PanelActionPlacement,
  PanelActionVariant,
} from "./application/interfaces/panel-action.options";
export { PaginationQueryDto } from "./application/dto/pagination-query.dto";
export { ListQueryDto } from "./application/dto/list-query.dto";
export {
  PaginatedResponseDto,
  paginated,
} from "./application/dto/paginated-response.dto";

// Infrastructure
export {
  adminPanelConfig,
  type AdminPanelConfig,
} from "./infrastructure/config/admin-panel.config";
export {
  setupAdminPanel,
  type AdminPanelPublicConfig,
} from "./infrastructure/http/setup-admin-panel";

// Presentation
export { AdminPanelModule } from "./presentation/admin-panel.module";
