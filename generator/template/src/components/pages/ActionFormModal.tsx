import { type FormEvent, useEffect, useState } from 'react';
import type { PanelActionMeta, PanelFieldMeta } from '@/generated/manifest.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatValue } from '@/lib/utils';

interface ActionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: PanelActionMeta;
  initialValues?: Record<string, unknown>;
  readOnly?: boolean;
  onSubmit?: (values: Record<string, string>) => Promise<void>;
}

export function ActionFormModal({
  open,
  onOpenChange,
  action,
  initialValues,
  readOnly = false,
  onSubmit,
}: ActionFormModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      return;
    }
    const next: Record<string, string> = {};
    for (const field of action.fieldMeta) {
      const raw = initialValues?.[field.name];
      next[field.name] = raw === undefined || raw === null ? '' : String(raw);
    }
    setValues(next);
    setError('');
  }, [open, action.fieldMeta, initialValues]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (readOnly || !onSubmit) {
      onOpenChange(false);
      return;
    }

    setSaving(true);
    setError('');
    try {
      const body: Record<string, string> = {};
      for (const field of action.fieldMeta) {
        if (values[field.name] !== undefined && values[field.name] !== '') {
          body[field.name] = values[field.name];
        }
      }
      await onSubmit(body);
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{action.label}</DialogTitle>
          <DialogDescription>
            {readOnly ? 'Record details' : 'Fill in the fields below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {action.fieldMeta.length === 0 && initialValues ? (
            <dl className="grid gap-3">
              {Object.entries(initialValues).map(([key, value]) => (
                <div key={key} className="rounded-md border p-3">
                  <dt className="text-xs uppercase text-muted-foreground">{key}</dt>
                  <dd className="mt-1 text-sm font-medium">{formatValue(value)}</dd>
                </div>
              ))}
              {!readOnly && (
                <p className="text-sm text-destructive">
                  No editable fields configured for this action.
                </p>
              )}
            </dl>
          ) : (
            action.fieldMeta.map((field) => (
              <FieldInput
                key={field.name}
                field={field}
                value={values[field.name] ?? ''}
                readOnly={readOnly}
                onChange={(v) => setValues((prev) => ({ ...prev, [field.name]: v }))}
              />
            ))
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {readOnly ? 'Close' : 'Cancel'}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldInput({
  field,
  value,
  readOnly,
  onChange,
}: {
  field: PanelFieldMeta;
  value: string;
  readOnly: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.name}>
        {field.name}
        {field.required && !readOnly && <span className="text-destructive"> *</span>}
      </Label>
      {field.enum ? (
        <select
          id={field.name}
          value={value}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
          required={field.required && !readOnly}
        >
          <option value="">Select...</option>
          {field.enum.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <Input
          id={field.name}
          type={
            field.type === 'number'
              ? 'number'
              : field.format === 'email'
                ? 'email'
                : 'text'
          }
          value={value}
          readOnly={readOnly}
          disabled={readOnly}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.example ? String(field.example) : undefined}
          required={field.required && !readOnly}
        />
      )}
    </div>
  );
}
