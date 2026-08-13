/* eslint-disable @typescript-eslint/no-base-to-string */
import { existsSync, readFileSync } from "fs";
import { join, relative } from "path";
import {
  Project,
  SyntaxKind,
  Node,
  Decorator,
  ClassDeclaration,
} from "ts-morph";
import {
  AdminManifest,
  PanelActionMeta,
  PanelColumnMeta,
  PanelFieldMeta,
  PanelFilterMeta,
  PanelListMeta,
  PanelModuleMeta,
  PanelPaginationMeta,
  PanelSortMeta,
  PanelStructureMeta,
} from "./types";

/** Host application root (the Nest project that consumes this package). */
const ROOT = process.cwd();
const SRC_MODULES = join(ROOT, "src", "modules");

const HTTP_DECORATORS: Record<string, string> = {
  Get: "GET",
  Post: "POST",
  Patch: "PATCH",
  Put: "PUT",
  Delete: "DELETE",
};

const ACTION_STRUCTURE_KEY: Record<string, keyof PanelStructureMeta> = {
  create: "create",
  edit: "update",
  delete: "delete",
  view: "view",
};

function loadEnvValue(key: string, fallback: string): string {
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

function getDecoratorArgObject(
  decorator: Decorator,
): Record<string, unknown> | null {
  const args = decorator.getArguments();
  if (args.length === 0) {
    return {};
  }
  const first = args[0];
  if (Node.isObjectLiteralExpression(first)) {
    return parseObjectLiteral(first);
  }
  return null;
}

function parseObjectLiteral(
  obj: import("ts-morph").ObjectLiteralExpression,
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const prop of obj.getProperties()) {
    if (!Node.isPropertyAssignment(prop)) {
      continue;
    }
    const name = prop.getName();
    const init = prop.getInitializer();
    if (!init) {
      continue;
    }
    result[name] = parseInitializer(init);
  }
  return result;
}

function parseInitializer(init: import("ts-morph").Node): unknown {
  if (
    Node.isStringLiteral(init) ||
    Node.isNoSubstitutionTemplateLiteral(init)
  ) {
    return init.getLiteralText();
  }
  if (Node.isNumericLiteral(init)) {
    return Number(init.getText());
  }
  if (init.getKind() === SyntaxKind.TrueKeyword) {
    return true;
  }
  if (init.getKind() === SyntaxKind.FalseKeyword) {
    return false;
  }
  if (Node.isArrayLiteralExpression(init)) {
    return init.getElements().map((el) => parseInitializer(el));
  }
  if (Node.isIdentifier(init)) {
    return { __identifier: init.getText() };
  }
  if (Node.isPropertyAccessExpression(init)) {
    return { __identifier: init.getText() };
  }
  if (Node.isObjectLiteralExpression(init)) {
    return parseObjectLiteral(init);
  }
  return init.getText();
}

function getDecoratorByName(
  decorators: Decorator[],
  name: string,
): Decorator | undefined {
  return decorators.find((d) => {
    const expr = d.getExpression();
    if (Node.isCallExpression(expr)) {
      return expr.getExpression().getText() === name;
    }
    return expr.getText() === name;
  });
}

function getControllerBasePath(cls: ClassDeclaration): string {
  const controllerDec = getDecoratorByName(cls.getDecorators(), "Controller");
  if (!controllerDec) {
    return "";
  }
  const args = controllerDec.getArguments();
  if (args.length === 0) {
    return "";
  }
  const first = args[0];
  if (Node.isStringLiteral(first)) {
    return first.getLiteralValue();
  }
  return "";
}

function extractOwnDtoFields(
  dtoClass: ClassDeclaration,
  explicitFields?: string[],
): PanelFieldMeta[] {
  const fields: PanelFieldMeta[] = [];
  for (const prop of dtoClass.getProperties()) {
    const name = prop.getName();
    if (explicitFields && !explicitFields.includes(name)) {
      continue;
    }

    const apiProp =
      getDecoratorByName(prop.getDecorators(), "ApiProperty") ??
      getDecoratorByName(prop.getDecorators(), "ApiPropertyOptional");

    const isOptional =
      !!getDecoratorByName(prop.getDecorators(), "ApiPropertyOptional") ||
      prop.hasQuestionToken();

    let description: string | undefined;
    let example: unknown;
    let enumValues: string[] | undefined;
    let format: string | undefined;

    if (apiProp) {
      const opts = getDecoratorArgObject(apiProp);
      if (opts) {
        description = opts.description as string | undefined;
        example = opts.example;
        enumValues = opts.enum as string[] | undefined;
        format = opts.format as string | undefined;
      }
    }

    const typeNode = prop.getTypeNode();
    let type = "string";
    if (typeNode) {
      type = typeNode.getText().replace("!", "").replace("?", "");
    }

    fields.push({
      name,
      type,
      required: !isOptional,
      description,
      example,
      enum: enumValues,
      format,
    });
  }
  return fields;
}

function resolveMappedDtoSource(
  dtoClass: ClassDeclaration,
): { sourceName: string; makeOptional: boolean } | null {
  const extendsExpr = dtoClass.getExtends()?.getExpression();
  if (!extendsExpr || !Node.isCallExpression(extendsExpr)) {
    return null;
  }

  const fnName = extendsExpr.getExpression().getText();
  const isPartial = fnName === "PartialType" || fnName.endsWith(".PartialType");
  if (!isPartial) {
    return null;
  }

  const firstArg = extendsExpr.getArguments()[0];
  if (!firstArg) {
    return null;
  }
  if (Node.isIdentifier(firstArg)) {
    return { sourceName: firstArg.getText(), makeOptional: true };
  }
  return null;
}

function extractDtoFields(
  project: Project,
  dtoIdentifier: string,
  explicitFields?: string[],
): PanelFieldMeta[] {
  for (const sourceFile of project.getSourceFiles()) {
    const dtoClass = sourceFile.getClass(dtoIdentifier);
    if (!dtoClass) {
      continue;
    }

    const ownFields = extractOwnDtoFields(dtoClass, explicitFields);
    if (ownFields.length > 0) {
      return ownFields;
    }

    const mapped = resolveMappedDtoSource(dtoClass);
    if (mapped) {
      const sourceFields = extractDtoFields(
        project,
        mapped.sourceName,
        explicitFields,
      );
      if (mapped.makeOptional) {
        return sourceFields.map((field) => ({ ...field, required: false }));
      }
      return sourceFields;
    }

    return ownFields;
  }
  return [];
}

function resolveDtoName(
  opts: Record<string, unknown>,
  methodParams: import("ts-morph").ParameterDeclaration[],
): string | undefined {
  const dtoOpt = opts.dto;
  if (
    dtoOpt &&
    typeof dtoOpt === "object" &&
    dtoOpt !== null &&
    "__identifier" in dtoOpt
  ) {
    return (dtoOpt as { __identifier: string }).__identifier;
  }

  for (const param of methodParams) {
    const typeNode = param.getTypeNode();
    if (typeNode && Node.isTypeReference(typeNode)) {
      const typeName = typeNode.getTypeName().getText();
      if (
        typeName.endsWith("Dto") &&
        typeName !== "PaginationQueryDto" &&
        typeName !== "ListQueryDto"
      ) {
        return typeName;
      }
    }
  }
  return undefined;
}

function getHttpRoute(methodDec: Decorator): { method: string; path: string } {
  const expr = methodDec.getExpression();
  let name = expr.getText();
  if (Node.isCallExpression(expr)) {
    name = expr.getExpression().getText();
  }
  const httpMethod = HTTP_DECORATORS[name];
  if (!httpMethod) {
    return { method: "GET", path: "" };
  }
  const args = methodDec.getArguments();
  const path =
    args.length > 0 && Node.isStringLiteral(args[0])
      ? args[0].getLiteralValue()
      : "";
  return { method: httpMethod, path };
}

function resolveHttp(methodDecorators: Decorator[]): {
  method: string;
  path: string;
} {
  for (const dec of methodDecorators) {
    const expr = dec.getExpression();
    const exprText = expr.getText();
    if (HTTP_DECORATORS[exprText]) {
      return getHttpRoute(dec);
    }
    if (Node.isCallExpression(expr)) {
      const innerText = expr.getExpression().getText();
      if (HTTP_DECORATORS[innerText]) {
        return getHttpRoute(dec);
      }
    }
  }
  return { method: "GET", path: "" };
}

function buildFullPath(basePath: string, routePath: string): string {
  const base = basePath.replace(/^\//, "").replace(/\/$/, "");
  const route = routePath.replace(/^\//, "");
  if (!base && !route) {
    return "/";
  }
  if (!route) {
    return `/${base}`;
  }
  return `/${base}/${route}`;
}

function moduleIdFromPath(basePath: string, filePath: string): string {
  if (basePath) {
    return basePath.replace(/\//g, "-");
  }
  const rel = relative(SRC_MODULES, filePath);
  return rel.split("/")[0] ?? "unknown";
}

function defaultActionMode(type: string): string {
  return type === "delete" ? "confirm" : "modal";
}

function defaultActionPlacement(type: string): string {
  return type === "create" ? "toolbar" : "row";
}

function humanize(field: string): string {
  return field
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function normalizeColumns(raw: unknown): PanelColumnMeta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): PanelColumnMeta | null => {
      if (typeof item === "string") {
        return {
          field: item,
          label: humanize(item),
          type: item === "status" ? "badge" : "text",
          sortable: false,
        };
      }
      if (item && typeof item === "object") {
        const col = item as Record<string, unknown>;
        const field = String(col.field ?? "");
        if (!field) {
          return null;
        }
        const type = String(col.type ?? "text");
        return {
          field,
          label: String(col.label ?? humanize(field)),
          type:
            type === "badge" || type === "datetime" || type === "boolean"
              ? type
              : "text",
          sortable: col.sortable === true,
        };
      }
      return null;
    })
    .filter((col): col is PanelColumnMeta => col !== null);
}

function normalizeFilters(raw: unknown): PanelFilterMeta[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item): PanelFilterMeta | null => {
      if (!item || typeof item !== "object") {
        return null;
      }
      const filter = item as Record<string, unknown>;
      const field = String(filter.field ?? "");
      if (!field) {
        return null;
      }
      const type = String(filter.type ?? "text");
      return {
        field,
        type:
          type === "search" || type === "select" || type === "text"
            ? type
            : "text",
        label: filter.label ? String(filter.label) : undefined,
        placeholder: filter.placeholder
          ? String(filter.placeholder)
          : undefined,
        options: Array.isArray(filter.options)
          ? filter.options.map(String)
          : undefined,
        param: String(filter.param ?? field),
      };
    })
    .filter((filter): filter is PanelFilterMeta => filter !== null);
}

function normalizePagination(
  apiOpts: Record<string, unknown>,
  pageType: string,
): PanelPaginationMeta {
  const defaults: PanelPaginationMeta = {
    enabled: pageType === "list",
    pageSize: 20,
    pageSizeOptions: [10, 20, 50],
  };

  const legacyPageSize =
    typeof apiOpts.pageSize === "number" ? Number(apiOpts.pageSize) : undefined;

  if (typeof apiOpts.pagination === "boolean") {
    return {
      enabled: apiOpts.pagination && pageType === "list",
      pageSize: legacyPageSize ?? defaults.pageSize,
      pageSizeOptions: defaults.pageSizeOptions,
    };
  }

  if (apiOpts.pagination && typeof apiOpts.pagination === "object") {
    const pagination = apiOpts.pagination as Record<string, unknown>;
    const pageSizeOptions = Array.isArray(pagination.pageSizeOptions)
      ? pagination.pageSizeOptions.map(Number).filter((n) => n > 0)
      : defaults.pageSizeOptions;

    return {
      enabled: pagination.enabled !== false && pageType === "list",
      pageSize: Number(
        pagination.pageSize ?? legacyPageSize ?? defaults.pageSize,
      ),
      pageSizeOptions:
        pageSizeOptions.length > 0 ? pageSizeOptions : defaults.pageSizeOptions,
    };
  }

  return {
    enabled: pageType === "list",
    pageSize: legacyPageSize ?? defaults.pageSize,
    pageSizeOptions: defaults.pageSizeOptions,
  };
}

function normalizeDefaultSort(raw: unknown): PanelSortMeta | undefined {
  if (!raw || typeof raw !== "object") {
    return undefined;
  }
  const sort = raw as Record<string, unknown>;
  const field = String(sort.field ?? "");
  if (!field) {
    return undefined;
  }
  return {
    field,
    order: sort.order === "ASC" ? "ASC" : "DESC",
  };
}

function resolveStructure(
  moduleOpts: Record<string, unknown>,
  pageType: string,
  actions: PanelActionMeta[],
  list?: PanelListMeta,
): PanelStructureMeta {
  const raw =
    moduleOpts.structure && typeof moduleOpts.structure === "object"
      ? (moduleOpts.structure as Record<string, unknown>)
      : {};

  const actionTypes = new Set(actions.map((a) => a.type));
  const isList = pageType === "list";

  const pick = (key: string, inferred: boolean): boolean => {
    if (key in raw) {
      return raw[key] === true;
    }
    return inferred;
  };

  return {
    table: pick("table", isList),
    filters: pick("filters", isList && (list?.filters.length ?? 0) > 0),
    pagination: pick(
      "pagination",
      isList && (list?.pagination.enabled ?? false),
    ),
    create: pick("create", actionTypes.has("create")),
    update: pick("update", actionTypes.has("edit")),
    delete: pick("delete", actionTypes.has("delete")),
    view: pick("view", actionTypes.has("view")),
  };
}

function gateActionsByStructure(
  actions: PanelActionMeta[],
  structure: PanelStructureMeta,
): PanelActionMeta[] {
  return actions.filter((action) => {
    const key = ACTION_STRUCTURE_KEY[action.type];
    if (!key) {
      return true;
    }
    return structure[key];
  });
}

export function extractMetadata(): AdminManifest {
  const project = new Project({
    tsConfigFilePath: join(ROOT, "tsconfig.json"),
    skipAddingFilesFromTsConfig: true,
  });

  project.addSourceFilesAtPaths([
    join(SRC_MODULES, "**", "*.controller.ts"),
    join(SRC_MODULES, "**", "dto", "*.ts"),
  ]);

  const modules: PanelModuleMeta[] = [];

  for (const sourceFile of project.getSourceFiles()) {
    if (!sourceFile.getFilePath().endsWith(".controller.ts")) {
      continue;
    }

    for (const cls of sourceFile.getClasses()) {
      const panelModuleDec = getDecoratorByName(
        cls.getDecorators(),
        "PanelModule",
      );
      if (!panelModuleDec) {
        continue;
      }

      const moduleOpts = getDecoratorArgObject(panelModuleDec) ?? {};
      if (moduleOpts.hidden === true) {
        continue;
      }

      const basePath = getControllerBasePath(cls);
      const moduleId = moduleIdFromPath(basePath, sourceFile.getFilePath());

      const pageType = String(moduleOpts.pageType ?? "list");

      let list: PanelListMeta | undefined;
      const actions: PanelActionMeta[] = [];

      for (const method of cls.getMethods()) {
        const panelApiDec = getDecoratorByName(
          method.getDecorators(),
          "PanelApi",
        );
        const panelActionDec = getDecoratorByName(
          method.getDecorators(),
          "PanelAction",
        );

        const http = resolveHttp(method.getDecorators());
        const fullPath = buildFullPath(basePath, http.path);

        if (panelApiDec) {
          const apiOpts = getDecoratorArgObject(panelApiDec) ?? {};
          if (apiOpts.hidden !== true) {
            list = {
              title: String(apiOpts.title ?? moduleOpts.title ?? moduleId),
              description: apiOpts.description as string | undefined,
              method: http.method,
              path: fullPath,
              columns: normalizeColumns(apiOpts.columns),
              filters: normalizeFilters(apiOpts.filters),
              pagination: normalizePagination(apiOpts, pageType),
              defaultSort: normalizeDefaultSort(apiOpts.defaultSort),
              component: apiOpts.component as string | undefined,
            };
          }
        }

        if (panelActionDec) {
          const actionOpts = getDecoratorArgObject(panelActionDec) ?? {};
          if (actionOpts.hidden === true) {
            continue;
          }

          const type = String(actionOpts.type ?? "custom");
          const dtoName = resolveDtoName(actionOpts, method.getParameters());
          const explicitFields = actionOpts.fields as string[] | undefined;
          const fieldMeta = dtoName
            ? extractDtoFields(project, dtoName, explicitFields)
            : [];

          actions.push({
            type,
            label: String(actionOpts.label ?? type),
            mode: String(actionOpts.mode ?? defaultActionMode(type)),
            placement: String(
              actionOpts.placement ?? defaultActionPlacement(type),
            ),
            method: http.method,
            path: fullPath,
            fields: explicitFields ?? fieldMeta.map((f) => f.name),
            dtoName,
            fieldMeta,
            confirmMessage: actionOpts.confirmMessage as string | undefined,
            order: Number(actionOpts.order ?? 100),
            variant: actionOpts.variant as string | undefined,
            icon: actionOpts.icon as string | undefined,
          });
        }
      }

      actions.sort((a, b) => a.order - b.order);

      const structure = resolveStructure(moduleOpts, pageType, actions, list);
      const gatedActions = gateActionsByStructure(actions, structure);

      modules.push({
        id: moduleId,
        title: String(moduleOpts.title ?? moduleId),
        icon: moduleOpts.icon as string | undefined,
        order: Number(moduleOpts.order ?? 100),
        description: moduleOpts.description as string | undefined,
        pageType,
        basePath,
        structure,
        list,
        actions: gatedActions,
      });
    }
  }

  modules.sort((a, b) => a.order - b.order);

  return {
    generatedAt: new Date().toISOString(),
    // Title/theme are configured at runtime via setupAdminPanel() in main.ts.
    // Manifest values are build-time fallbacks only.
    title: "Admin Panel",
    apiPrefix: loadEnvValue("APP_API_PREFIX", "api"),
    adminPath: loadEnvValue("ADMIN_PANEL_PATH", "admin"),
    theme: {
      primaryColor: "#6366f1",
      sidebarColor: "#0f172a",
      accentColor: "#e2e8f0",
      fontFamily: "Inter, system-ui, sans-serif",
      radius: "0.5rem",
      logoIcon: "LayoutDashboard",
      subtitle: "Administration",
    },
    modules,
  };
}
