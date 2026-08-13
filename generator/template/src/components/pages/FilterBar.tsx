import { useEffect, useMemo, useState } from 'react';
import type { PanelFilterMeta } from '@/generated/manifest.types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface FilterBarProps {
  filters: PanelFilterMeta[];
  values: Record<string, string>;
  onChange: (values: Record<string, string>) => void;
}

const SEARCH_DEBOUNCE_MS = 300;

export function FilterBar({ filters, values, onChange }: FilterBarProps) {
  const [draft, setDraft] = useState<Record<string, string>>(values);

  useEffect(() => {
    setDraft(values);
  }, [values]);

  const searchParams = useMemo(
    () => filters.filter((f) => f.type === 'search').map((f) => f.param),
    [filters],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const next = { ...values };
      let changed = false;

      for (const param of searchParams) {
        const draftValue = draft[param] ?? '';
        if ((next[param] ?? '') !== draftValue) {
          if (draftValue) {
            next[param] = draftValue;
          } else {
            delete next[param];
          }
          changed = true;
        }
      }

      if (changed) {
        onChange(next);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [draft, onChange, searchParams, values]);

  function setImmediate(param: string, value: string) {
    setDraft((prev) => ({ ...prev, [param]: value }));
    const next = { ...values };
    if (value) {
      next[param] = value;
    } else {
      delete next[param];
    }
    onChange(next);
  }

  function clearAll() {
    setDraft({});
    onChange({});
  }

  const hasValues = Object.values(values).some((v) => v.trim().length > 0);

  if (filters.length === 0) {
    return null;
  }

  return (
    <div className="mb-4 flex flex-wrap items-end gap-3 rounded-md border bg-muted/30 p-3">
      {filters.map((filter) => {
        const value = draft[filter.param] ?? '';
        const label = filter.label ?? filter.field;

        return (
          <div key={filter.param} className="min-w-[160px] flex-1 space-y-1.5">
            <Label htmlFor={`filter-${filter.param}`}>{label}</Label>
            {filter.type === 'select' ? (
              <select
                id={`filter-${filter.param}`}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={value}
                onChange={(e) => setImmediate(filter.param, e.target.value)}
              >
                <option value="">All</option>
                {(filter.options ?? []).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={`filter-${filter.param}`}
                value={value}
                placeholder={filter.placeholder ?? `Filter ${label}`}
                onChange={(e) => {
                  const nextValue = e.target.value;
                  setDraft((prev) => ({ ...prev, [filter.param]: nextValue }));
                  if (filter.type !== 'search') {
                    setImmediate(filter.param, nextValue);
                  }
                }}
              />
            )}
          </div>
        );
      })}
      {hasValues && (
        <Button type="button" variant="outline" onClick={clearAll}>
          Clear
        </Button>
      )}
    </div>
  );
}
