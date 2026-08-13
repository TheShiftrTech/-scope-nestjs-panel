import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDatetime, formatValue } from '@/lib/utils';
import type { PanelColumnMeta, PanelModuleMeta } from '@/generated/manifest.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface InfoPageProps {
  module: PanelModuleMeta;
}

function toColumns(
  configured: PanelColumnMeta[],
  data: Record<string, unknown> | null,
): PanelColumnMeta[] {
  if (configured.length > 0) {
    return configured;
  }
  return Object.keys(data ?? {}).map((field) => ({
    field,
    label: field,
    type: field === 'status' ? 'badge' : 'text',
    sortable: false,
  }));
}

function renderValue(column: PanelColumnMeta, value: unknown) {
  if (column.type === 'badge' || column.field === 'status') {
    return <Badge variant="secondary">{formatValue(value)}</Badge>;
  }
  if (column.type === 'datetime') {
    return formatDatetime(value);
  }
  return formatValue(value);
}

export function InfoPage({ module }: InfoPageProps) {
  const list = module.list;
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!list) {
      return;
    }

    api
      .get<Record<string, unknown>>(list.path)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [list]);

  if (!list) {
    return <p className="text-muted-foreground">No info endpoint configured.</p>;
  }

  const columns = toColumns(list.columns, data);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{list.title}</CardTitle>
        {(list.description || module.description) && (
          <CardDescription>{list.description ?? module.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        {loading && <p className="text-muted-foreground">Loading...</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !error && data && (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {columns.map((col) => (
              <div key={col.field} className="rounded-lg border p-4">
                <dt className="text-xs font-medium uppercase text-muted-foreground">
                  {col.label}
                </dt>
                <dd className="mt-1 text-sm font-medium">
                  {renderValue(col, data[col.field])}
                </dd>
              </div>
            ))}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
