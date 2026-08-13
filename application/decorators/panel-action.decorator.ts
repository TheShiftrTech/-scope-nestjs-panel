import { SetMetadata } from "@nestjs/common";
import { PANEL_ACTION_KEY } from "../../domain/constants/metadata-keys";
import { PanelActionOptions } from "../interfaces/panel-action.options";

/**
 * Marks an API endpoint as an admin panel action (create / edit / delete / view).
 * Used with `@PanelModule({ pageType: 'list' })` for toolbar + row actions.
 */
export const PanelAction = (options: PanelActionOptions): MethodDecorator =>
  SetMetadata(PANEL_ACTION_KEY, options);
