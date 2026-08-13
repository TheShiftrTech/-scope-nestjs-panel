import { SetMetadata } from "@nestjs/common";
import { PANEL_MODULE_KEY } from "../../domain/constants/metadata-keys";
import { PanelModuleOptions } from "../interfaces/panel-module.options";

/**
 * Opt-in decorator — only modules/controllers marked with @PanelModule()
 * appear in the generated admin panel sidebar.
 */
export const PanelModule = (options: PanelModuleOptions): ClassDecorator =>
  SetMetadata(PANEL_MODULE_KEY, options);
