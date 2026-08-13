import { SetMetadata } from "@nestjs/common";
import { PANEL_API_KEY } from "../../domain/constants/metadata-keys";
import { PanelApiOptions } from "../interfaces/panel-api.options";

/**
 * Marks the primary data endpoint for a panel module
 * (list GET with pagination, or info GET).
 */
export const PanelApi = (options: PanelApiOptions): MethodDecorator =>
  SetMetadata(PANEL_API_KEY, options);
