export type PanelActionType = "create" | "edit" | "delete" | "view" | "custom";

export type PanelActionMode = "modal" | "confirm";

export type PanelActionPlacement = "toolbar" | "row";

export type PanelActionVariant = "default" | "destructive" | "outline";

/**
 * Marks an endpoint as an admin panel action.
 * Create → toolbar button + modal form.
 * Edit / View → row action + modal.
 * Delete → row action + confirm dialog.
 */
export interface PanelActionOptions {
  /** Action kind — drives default UI behaviour */
  type: PanelActionType;
  /** Button / menu label */
  label: string;
  /**
   * UI mode.
   * Defaults: create/edit/view → modal, delete → confirm
   */
  mode?: PanelActionMode;
  /**
   * Where the action appears.
   * Defaults: create → toolbar, others → row
   */
  placement?: PanelActionPlacement;
  /** DTO class for modal forms (create / edit) */
  dto?: new (...args: unknown[]) => unknown;
  /** Fields to include in the form (defaults to all @ApiProperty on dto) */
  fields?: string[];
  /** Confirm dialog message (delete / confirm mode) */
  confirmMessage?: string;
  /** Sort order among sibling actions */
  order?: number;
  /** Button visual variant */
  variant?: PanelActionVariant;
  /** Lucide icon name */
  icon?: string;
  /** Hide this action */
  hidden?: boolean;
}
