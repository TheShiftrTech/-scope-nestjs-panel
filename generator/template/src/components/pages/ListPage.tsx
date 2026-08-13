import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil, Plus, Trash2, type LucideIcon } from 'lucide-react';
import { api } from '@/lib/api';
import { formatDatetime, formatValue } from '@/lib/utils';
import type {
  PanelActionMeta,
  PanelColumnMeta,
  PanelModuleMeta,
} from '@/generated/manifest.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ActionFormModal } from './ActionFormModal';
import { ConfirmDialog } from './ConfirmDialog';
import { FilterBar } from './FilterBar';

const iconMap: Record<string, LucideIcon> = {
  plus: Plus,
  pencil: Pencil,
  trash: Trash2,
  eye: Eye,
};

interface ListPageProps {
  module: PanelModuleMeta;
}

interface PaginatedResult {
  data: Record<string, unknown>[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function isActionAllowed(
  action: PanelActionMeta,
  structure: PanelModuleMeta['structure'],
): boolean {
  switch (action.type) {
    case 'create':
      return structure.create;
    case 'edit':
      return structure.update;
    case 'delete':
      return structure.delete;
    case 'view':
      return structure.view;
    default:
      return true;
  }
}

function renderCell(column: PanelColumnMeta, value: unknown) {
  if (column.type === 'badge') {
    return <Badge variant="secondary">{formatValue(value)}</Badge>;
  }
  if (column.type === 'datetime') {
    return formatDatetime(value);
  }
  if (column.type === 'boolean') {
    return formatValue(Boolean(value));
  }
  return formatValue(value);
}

export function ListPage({ module }: ListPageProps) {
  const list = module.list;
  const structure = module.structure;
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(list?.pagination.pageSize ?? 20);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [sortField, setSortField] = useState(list?.defaultSort?.field ?? '');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>(
    list?.defaultSort?.order ?? 'DESC',
  );

  const [activeAction, setActiveAction] = useState<PanelActionMeta | null>(null);
  const [activeRow, setActiveRow] = useState<Record<string, unknown> | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const columns = list?.columns ?? [];
  const filters = list?.filters ?? [];
  const paginationEnabled = structure.pagination && (list?.pagination.enabled ?? false);
  const pageSizeOptions = list?.pagination.pageSizeOptions ?? [10, 20, 50];

  const toolbarActions = useMemo(
    () =>
      module.actions.filter(
        (a) => a.placement === 'toolbar' && isActionAllowed(a, structure),
      ),
    [module.actions, structure],
  );
  const rowActions = useMemo(
    () =>
      module.actions.filter(
        (a) => a.placement === 'row' && isActionAllowed(a, structure),
      ),
    [module.actions, structure],
  );

  const load = useCallback(async () => {
    if (!list) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();

      if (paginationEnabled) {
        params.set('page', String(page));
        params.set('limit', String(pageSize));
      }

      if (sortField) {
        params.set('sort', sortField);
        params.set('order', sortOrder);
      }

      for (const [key, value] of Object.entries(filterValues)) {
        if (value.trim()) {
          params.set(key, value.trim());
        }
      }

      const query = params.toString();
      const path = query ? `${list.path}?${query}` : list.path;
      const result = await api.get<PaginatedResult | Record<string, unknown>[]>(path);

      if (Array.isArray(result)) {
        setRows(result);
        setTotal(result.length);
        setTotalPages(1);
      } else {
        setRows(result.data ?? []);
        setTotal(result.total ?? 0);
        setTotalPages(result.totalPages ?? 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [filterValues, list, page, pageSize, paginationEnabled, sortField, sortOrder]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleFiltersChange(next: Record<string, string>) {
    setPage(1);
    setFilterValues(next);
  }

  function toggleSort(column: PanelColumnMeta) {
    if (!column.sortable) {
      return;
    }
    setPage(1);
    if (sortField === column.field) {
      setSortOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
      return;
    }
    setSortField(column.field);
    setSortOrder('ASC');
  }

  async function openAction(action: PanelActionMeta, row?: Record<string, unknown>) {
    if (action.mode === 'confirm') {
      setActiveAction(action);
      setActiveRow(row ?? null);
      setConfirmOpen(true);
      return;
    }

    let initial: Record<string, unknown> | null = row ?? null;

    if (row?.id && (action.type === 'view' || action.type === 'edit')) {
      const viewAction = module.actions.find((a) => a.type === 'view');
      const fetchPath = (action.type === 'view' ? action.path : viewAction?.path)?.replace(
        ':id',
        String(row.id),
      );
      if (fetchPath) {
        try {
          initial = await api.get<Record<string, unknown>>(fetchPath);
        } catch {
          // keep row data
        }
      }
    }

    setActiveAction(action);
    setActiveRow(initial);
    setModalOpen(true);
  }

  async function runAction(
    action: PanelActionMeta,
    row?: Record<string, unknown> | null,
    body?: Record<string, string>,
  ) {
    const id = row?.id !== undefined ? String(row.id) : '';
    const path = action.path.replace(':id', id);

    switch (action.method) {
      case 'POST':
        await api.post(path, body ?? {});
        break;
      case 'PATCH':
      case 'PUT':
        await api.patch(path, body ?? {});
        break;
      case 'DELETE':
        await api.delete(path);
        break;
      case 'GET':
        break;
      default:
        await api.post(path, body ?? {});
    }

    await load();
  }

  async function handleConfirm() {
    if (!activeAction) {
      return;
    }
    setConfirmLoading(true);
    try {
      await runAction(activeAction, activeRow);
      setConfirmOpen(false);
      setActiveAction(null);
      setActiveRow(null);
    } finally {
      setConfirmLoading(false);
    }
  }

  async function handleModalSubmit(values: Record<string, string>) {
    if (!activeAction) {
      return;
    }
    await runAction(activeAction, activeRow, values);
  }

  if (!list) {
    return <p className="text-muted-foreground">No list endpoint configured.</p>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle>{list.title}</CardTitle>
            {(list.description || module.description) && (
              <CardDescription>
                {list.description ?? module.description}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {toolbarActions.map((action) => {
              const Icon = action.icon ? iconMap[action.icon] : Plus;
              return (
                <Button
                  key={`${action.type}-${action.path}`}
                  variant={action.variant === 'destructive' ? 'destructive' : 'default'}
                  onClick={() => openAction(action)}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {action.label}
                </Button>
              );
            })}
          </div>
        </CardHeader>
        <CardContent>
          {structure.filters && filters.length > 0 && (
            <FilterBar
              filters={filters}
              values={filterValues}
              onChange={handleFiltersChange}
            />
          )}

          {loading && <p className="text-muted-foreground">Loading...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!loading && !error && structure.table && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((col) => (
                      <TableHead key={col.field}>
                        {col.sortable ? (
                          <button
                            type="button"
                            className="inline-flex items-center gap-1 hover:text-foreground"
                            onClick={() => toggleSort(col)}
                          >
                            {col.label}
                            {sortField === col.field ? (
                              sortOrder === 'ASC' ? (
                                <ArrowUp className="h-3.5 w-3.5" />
                              ) : (
                                <ArrowDown className="h-3.5 w-3.5" />
                              )
                            ) : (
                              <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                            )}
                          </button>
                        ) : (
                          col.label
                        )}
                      </TableHead>
                    ))}
                    {rowActions.length > 0 && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length + (rowActions.length > 0 ? 1 : 0)}
                        className="text-center text-muted-foreground"
                      >
                        No records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow key={String(row.id)}>
                        {columns.map((col) => (
                          <TableCell key={col.field}>
                            {renderCell(col, row[col.field])}
                          </TableCell>
                        ))}
                        {rowActions.length > 0 && (
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {rowActions.map((action) => {
                                const Icon = action.icon
                                  ? iconMap[action.icon]
                                  : undefined;
                                return (
                                  <Button
                                    key={`${action.type}-${action.path}`}
                                    size="sm"
                                    variant={
                                      action.variant === 'destructive'
                                        ? 'destructive'
                                        : 'outline'
                                    }
                                    title={action.label}
                                    onClick={() => openAction(action, row)}
                                  >
                                    {Icon ? <Icon className="h-3.5 w-3.5" /> : action.label}
                                  </Button>
                                );
                              })}
                            </div>
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {paginationEnabled && (
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                  <span>
                    {total} total · page {page} of {totalPages}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="flex items-center gap-2">
                      <span>Rows</span>
                      <select
                        className="h-8 rounded-md border border-input bg-background px-2 text-sm"
                        value={pageSize}
                        onChange={(e) => {
                          setPage(1);
                          setPageSize(Number(e.target.value));
                        }}
                      >
                        {pageSizeOptions.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {activeAction && (
        <ActionFormModal
          open={modalOpen}
          onOpenChange={setModalOpen}
          action={activeAction}
          readOnly={activeAction.type === 'view'}
          initialValues={
            activeAction.type === 'view' || activeAction.type === 'edit'
              ? activeRow ?? undefined
              : undefined
          }
          onSubmit={
            activeAction.type === 'view' ? undefined : handleModalSubmit
          }
        />
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={activeAction?.label ?? 'Confirm'}
        message={
          activeAction?.confirmMessage ??
          `Are you sure you want to ${activeAction?.label.toLowerCase() ?? 'continue'}?`
        }
        confirmLabel={activeAction?.label ?? 'Confirm'}
        destructive={activeAction?.variant === 'destructive'}
        loading={confirmLoading}
        onConfirm={() => {
          void handleConfirm();
        }}
        onOpenChange={(open) => {
          setConfirmOpen(open);
          if (!open) {
            setActiveAction(null);
            setActiveRow(null);
          }
        }}
      />
    </div>
  );
}
